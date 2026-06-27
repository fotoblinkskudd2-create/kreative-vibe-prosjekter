#!/usr/bin/env python3
"""
Automatic runner for the massive-run-loop skill.

Drives the Claude API through repeated cycles until the loop reports
"complete" / "budget_exhausted" / "blocked", or the wall-clock time
budget runs out. Each cycle's raw output is appended to log.md, and the
fenced ```json state block in "Updated State" is parsed and written to
state.json so the run can be resumed later.

Usage:
    export ANTHROPIC_API_KEY=...
    python3 runner.py --mission "Bygg 3 nye skills til skill-lager" \
        --hours 24 --memory ./memory.md --run-dir ./runs/2026-06-27-skills

Resume an existing run:
    python3 runner.py --resume ./runs/2026-06-27-skills
"""

import argparse
import json
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("Missing dependency: pip install anthropic")

SKILL_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT_PATH = SKILL_DIR / "system_prompt.md"
DEFAULT_MODEL = "claude-opus-4-8"
MAX_TOKENS = 8000
STOP_STATUSES = {"complete", "budget_exhausted", "blocked"}
JSON_BLOCK_RE = re.compile(r"```json\s*(\{.*?\})\s*```", re.DOTALL)


def load_state(run_dir: Path) -> dict:
    state_path = run_dir / "state.json"
    if state_path.exists():
        return json.loads(state_path.read_text())
    return None


def save_state(run_dir: Path, state: dict) -> None:
    (run_dir / "state.json").write_text(json.dumps(state, indent=2, ensure_ascii=False))


def append_log(run_dir: Path, text: str) -> None:
    log_path = run_dir / "log.md"
    timestamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with log_path.open("a", encoding="utf-8") as f:
        f.write(f"\n\n---\n<!-- {timestamp} -->\n\n{text}\n")


def extract_state_block(cycle_output: str) -> dict | None:
    match = JSON_BLOCK_RE.search(cycle_output)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return None


def build_initial_state(mission: str, hours: float, run_id: str) -> dict:
    return {
        "run_id": run_id,
        "mission": mission,
        "budget_hours": hours,
        "time_elapsed_hours": 0,
        "status": "running",
        "todo_list": [],
        "progress_log": [],
        "artifacts_dir": "./artifacts",
        "log_file": "./log.md",
    }


def run_loop(run_dir: Path, mission: str | None, hours: float | None, memory_path: str | None, model: str):
    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "artifacts").mkdir(exist_ok=True)

    state = load_state(run_dir)
    resuming = state is not None
    if not resuming:
        if not mission or not hours:
            sys.exit("New run requires --mission and --hours")
        state = build_initial_state(mission, hours, run_dir.name)
        save_state(run_dir, state)

    system_prompt = SYSTEM_PROMPT_PATH.read_text()
    memory_text = Path(memory_path).read_text() if memory_path else "(ingen memory.md gitt)"

    client = anthropic.Anthropic()
    messages = []

    if resuming:
        first_user_msg = (
            f"Continue the loop. Resuming from disk.\n\n"
            f"state.json:\n```json\n{json.dumps(state, indent=2, ensure_ascii=False)}\n```\n\n"
            f"memory.md:\n{memory_text}"
        )
    else:
        first_user_msg = (
            f"Start the Massive Run Loop.\n\n"
            f"Mission: {state['mission']}\n"
            f"Time budget: {state['budget_hours']} hours\n\n"
            f"memory.md:\n{memory_text}\n\n"
            f"Initial state.json:\n```json\n{json.dumps(state, indent=2, ensure_ascii=False)}\n```"
        )
    messages.append({"role": "user", "content": first_user_msg})

    cycle = len(state.get("progress_log", [])) + 1
    start_time = time.monotonic()

    while True:
        elapsed_real_hours = (time.monotonic() - start_time) / 3600
        if state["time_elapsed_hours"] >= state["budget_hours"]:
            print(f"[runner] budget exhausted ({state['time_elapsed_hours']}h / {state['budget_hours']}h)")
            break
        if state.get("status") in STOP_STATUSES and cycle > 1:
            print(f"[runner] stopping, status={state['status']}")
            break

        print(f"[runner] cycle {cycle} — calling {model} (wall clock {elapsed_real_hours:.2f}h elapsed)")
        response = client.messages.create(
            model=model,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=messages,
        )
        cycle_output = "".join(block.text for block in response.content if block.type == "text")

        append_log(run_dir, cycle_output)

        parsed_state = extract_state_block(cycle_output)
        if parsed_state:
            state = parsed_state
            save_state(run_dir, state)
        else:
            print(f"[runner] WARNING: no parsable state json block in cycle {cycle} output, state.json not updated")

        messages.append({"role": "assistant", "content": cycle_output})

        if state.get("status") in STOP_STATUSES:
            print(f"[runner] loop reported status={state['status']} at cycle {cycle}")
            break

        messages.append({"role": "user", "content": "Continue the loop."})
        cycle += 1

    print(f"[runner] run finished. See {run_dir / 'log.md'} and {run_dir / 'state.json'}")


def main():
    parser = argparse.ArgumentParser(description="Run the massive-run-loop skill against the Claude API.")
    parser.add_argument("--mission", help="Mission statement for a new run")
    parser.add_argument("--hours", type=float, help="Total time budget in hours for a new run")
    parser.add_argument("--memory", help="Path to memory.md to feed as context")
    parser.add_argument("--run-dir", help="Directory for this run's state.json/log.md/artifacts (default: ./runs/<timestamp>)")
    parser.add_argument("--resume", help="Path to an existing run directory to resume")
    parser.add_argument("--model", default=DEFAULT_MODEL, help=f"Model to use (default: {DEFAULT_MODEL})")
    args = parser.parse_args()

    if args.resume:
        run_dir = Path(args.resume)
        if not (run_dir / "state.json").exists():
            sys.exit(f"No state.json found in {run_dir}")
        run_loop(run_dir, None, None, args.memory, args.model)
    else:
        if not args.mission or not args.hours:
            sys.exit("New run requires --mission and --hours (or use --resume <run-dir>)")
        run_dir = Path(args.run_dir) if args.run_dir else Path("runs") / datetime.now().strftime("%Y-%m-%d-%H%M%S")
        run_loop(run_dir, args.mission, args.hours, args.memory, args.model)


if __name__ == "__main__":
    main()
