#!/usr/bin/env python3
"""
Automatiserer "lim inn forrige cykel, be om neste" mønsteret fra massive-run-loop SKILL.md.

Bruk:
    export ANTHROPIC_API_KEY=...
    python3 runner.py --mission "Bygg 3 nye skills denne runden" --hours 24 --workdir ./run-2026-06-27

Krever: pip install anthropic
"""

import argparse
import json
import sys
import time
from datetime import datetime
from pathlib import Path

try:
    import anthropic
except ImportError:
    sys.exit("Mangler 'anthropic' pakken. Kjør: pip install anthropic")

SYSTEM_PROMPT_TEMPLATE = """Du kjører en Massive Run Loop. Du er IKKE en chatbot som venter på instruksjoner per steg —
du er en autonom executor som finner, gjør og sjekker arbeid mot en mission, cykel for cykel.

MISSION: {mission}
TIDSBUDSJETT: {hours} timer
KONTEKST: {context}

Regler:
1. Hver respons er EN cykel i formatet:
   ## CYCLE [N] - [kort beskrivelse] - Remaining: [X]h [Y]m
   **Reflection:** ...
   **Selected Task:** ...
   **Execution / Deliverable:** ...
   **Self-Critique (score X/10):** ...
   **Commit Action:** ...
   **Updated State:** ...
   **Next Decision:** ...
2. Velg alltid den ENE høyeste-leverage oppgaven for denne cykelen.
3. Lever faktisk arbeid i "Execution / Deliverable", ikke en plan for arbeid.
4. Score deg selv ærlig. Under 8/10 -> fiks det før du går videre, i samme cykel.
5. Oppdater state ved slutten av hver cykel slik at neste cykel kan fortsette uten å miste tråden.
6. Når mission er ferdig eller tidsbudsjettet er brukt opp: skriv en sluttrapport med hva som ble
   levert, hva som gjenstår, og anbefalt neste mission. Avslutt responsen med nøyaktig linjen
   "RUN COMPLETE" på egen linje, og ikke fortsett å finne på arbeid etter det.
7. Hvis du står fast eller mission er uklar: si det i Reflection, still ETT konkret spørsmål,
   og avslutt responsen med nøyaktig linjen "RUN BLOCKED" på egen linje.

Start med CYCLE 1 nå.
"""

DEFAULT_MODEL = "claude-sonnet-4-6"


def load_state(workdir: Path) -> dict:
    state_path = workdir / "state.json"
    if state_path.exists():
        return json.loads(state_path.read_text())
    return {
        "mission": None,
        "hours_budget": None,
        "started_at": None,
        "cycle": 0,
        "progress_log": [],
        "status": "running",
    }


def save_state(workdir: Path, state: dict) -> None:
    (workdir / "state.json").write_text(json.dumps(state, indent=2, ensure_ascii=False))


def append_log(workdir: Path, text: str) -> None:
    with (workdir / "cycles.log").open("a", encoding="utf-8") as f:
        f.write(text + "\n\n" + ("-" * 80) + "\n\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Massive Run Loop auto-continue runner")
    parser.add_argument("--mission", required=True, help="Mission for runden")
    parser.add_argument("--hours", type=float, default=24.0, help="Tidsbudsjett i timer")
    parser.add_argument("--workdir", required=True, help="Mappe for state.json, cycles.log, artifacts/")
    parser.add_argument("--context", default="", help="Ekstra kontekst/memory å gi loopen")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Claude-modell å bruke")
    parser.add_argument("--max-cycles", type=int, default=200, help="Sikkerhetstak på antall cykler")
    parser.add_argument("--cycle-delay-seconds", type=float, default=5.0,
                         help="Pause mellom cykler for å unngå rate limits")
    args = parser.parse_args()

    workdir = Path(args.workdir)
    workdir.mkdir(parents=True, exist_ok=True)
    (workdir / "artifacts").mkdir(exist_ok=True)

    state = load_state(workdir)
    if state["mission"] is None:
        state["mission"] = args.mission
        state["hours_budget"] = args.hours
        state["started_at"] = datetime.now().isoformat()

    client = anthropic.Anthropic()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        mission=state["mission"], hours=state["hours_budget"], context=args.context or "Ingen ekstra kontekst gitt."
    )

    started_at = datetime.fromisoformat(state["started_at"])
    messages = []
    if (workdir / "last_output.txt").exists():
        messages.append({"role": "assistant", "content": (workdir / "last_output.txt").read_text()})
        messages.append({"role": "user", "content": "Continue the loop."})
    else:
        messages.append({"role": "user", "content": "Start massive run loop nå."})

    while True:
        elapsed_hours = (datetime.now() - started_at).total_seconds() / 3600
        if elapsed_hours >= state["hours_budget"]:
            print(f"Tidsbudsjett ({state['hours_budget']}h) brukt opp. Stopper.")
            state["status"] = "time_budget_exhausted"
            save_state(workdir, state)
            break
        if state["cycle"] >= args.max_cycles:
            print(f"Nådde max-cycles ({args.max_cycles}). Stopper.")
            state["status"] = "max_cycles_reached"
            save_state(workdir, state)
            break

        response = client.messages.create(
            model=args.model,
            max_tokens=4096,
            system=system_prompt,
            messages=messages,
        )
        output_text = "".join(block.text for block in response.content if block.type == "text")

        state["cycle"] += 1
        state["progress_log"].append({
            "cycle": state["cycle"],
            "timestamp": datetime.now().isoformat(),
            "elapsed_hours": round(elapsed_hours, 2),
        })
        append_log(workdir, output_text)
        (workdir / "last_output.txt").write_text(output_text)
        save_state(workdir, state)

        print(f"Cycle {state['cycle']} skrevet til {workdir}/cycles.log "
              f"(elapsed {elapsed_hours:.2f}h / {state['hours_budget']}h)")

        if "RUN COMPLETE" in output_text:
            print("Modellen rapporterte RUN COMPLETE. Stopper.")
            state["status"] = "complete"
            save_state(workdir, state)
            break
        if "RUN BLOCKED" in output_text:
            print("Modellen rapporterte RUN BLOCKED. Stopper for manuell input.")
            state["status"] = "blocked"
            save_state(workdir, state)
            break

        messages = [
            {"role": "assistant", "content": output_text},
            {"role": "user", "content": "Continue the loop."},
        ]
        time.sleep(args.cycle_delay_seconds)


if __name__ == "__main__":
    main()
