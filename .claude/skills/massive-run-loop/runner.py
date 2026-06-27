#!/usr/bin/env python3
"""Standalone runner for the massive-run-loop skill via the Claude API.

Use this when you want cycles to run unattended *outside* a Claude Code
session (e.g. on a server/cron) instead of inside one. It drives the same
cycle format as SKILL.md by calling the Messages API in a loop, keeping the
running transcript and state.json on disk so a crash can be resumed.

Requires: pip install anthropic
Usage:
    ANTHROPIC_API_KEY=... python3 runner.py \
        --mission "Bygg ut README-prosjektene til egne mapper" \
        --cycles 5 \
        --workdir ./run-2026-06-27
"""

import argparse
import json
import pathlib
import sys

import anthropic

SKILL_PATH = pathlib.Path(__file__).parent / "SKILL.md"
MODEL = "claude-sonnet-4-6"


def load_state(workdir: pathlib.Path) -> dict:
    state_path = workdir / "state.json"
    if state_path.exists():
        return json.loads(state_path.read_text())
    template = json.loads((pathlib.Path(__file__).parent / "state.template.json").read_text())
    return template


def save_state(workdir: pathlib.Path, state: dict) -> None:
    (workdir / "state.json").write_text(json.dumps(state, indent=2, ensure_ascii=False))


def main() -> int:
    parser = argparse.ArgumentParser(description="Run massive-run-loop cycles via the Claude API.")
    parser.add_argument("--mission", required=True, help="The mission for this run.")
    parser.add_argument("--cycles", type=int, default=10, help="Max number of cycles to run.")
    parser.add_argument("--workdir", required=True, help="Directory for state.json and transcript.log.")
    args = parser.parse_args()

    workdir = pathlib.Path(args.workdir)
    workdir.mkdir(parents=True, exist_ok=True)

    state = load_state(workdir)
    state["mission"] = args.mission
    state.setdefault("budget", f"{args.cycles} cycles")

    skill_text = SKILL_PATH.read_text()
    client = anthropic.Anthropic()
    transcript_path = workdir / "transcript.log"

    messages = []
    if (workdir / "transcript.json").exists():
        messages = json.loads((workdir / "transcript.json").read_text())
    else:
        messages.append({
            "role": "user",
            "content": (
                f"Du følger denne skillen:\n\n{skill_text}\n\n"
                f"Start massive run loop. Mission: {args.mission}. "
                f"Budsjett: {args.cycles} cycles. Kjør cycle 1 nå med faktisk "
                "leveranse, ikke bare en plan."
            ),
        })

    for i in range(state.get("cycle", 0), args.cycles):
        if state.get("status") != "running":
            break

        response = client.messages.create(
            model=MODEL,
            max_tokens=4096,
            messages=messages,
        )
        reply_text = "".join(block.text for block in response.content if block.type == "text")

        messages.append({"role": "assistant", "content": reply_text})
        with transcript_path.open("a") as f:
            f.write(f"\n\n===== CYCLE {i + 1} =====\n{reply_text}\n")

        state["cycle"] = i + 1
        state["log"].append(f"cycle {i + 1} done")
        save_state(workdir, state)
        (workdir / "transcript.json").write_text(json.dumps(messages, ensure_ascii=False))

        if "SLUTTRAPPORT" in reply_text or "status\": \"done\"" in reply_text:
            state["status"] = "done"
            save_state(workdir, state)
            break

        messages.append({
            "role": "user",
            "content": f"Fortsett loopen. Kjør cycle {i + 2} nå.",
        })

    print(f"Stopped after cycle {state.get('cycle', 0)}. Status: {state.get('status')}.")
    print(f"Transcript: {transcript_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
