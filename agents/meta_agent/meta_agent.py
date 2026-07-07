#!/usr/bin/env python3
"""
Meta-agent — leser alle inputs (notater/ideer i inputs/-mappen), genererer neste
tasks automatisk og KJØRER dem: prototyper delegeres til idea2proto, dokument-tasks
(analyse, pitch, plan, tekst) genereres direkte.

Bruk:
    export ANTHROPIC_API_KEY=sk-ant-...
    mkdir -p inputs && echo "Idé: vibe-kort app for venner" > inputs/ideer.md
    python meta_agent.py            # planlegg + kjør de 3 øverste taskene
    python meta_agent.py --plan     # bare planlegg (skriv tasks.json)
    python meta_agent.py --max 5    # kjør inntil 5 tasks
"""

import argparse
import json
import os
import sys
from datetime import datetime
from pathlib import Path

import anthropic

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
client = anthropic.Anthropic()

HERE = Path(__file__).parent
INPUTS = HERE / "inputs"
OUTPUTS = HERE / "outputs"
TASKS_FILE = HERE / "tasks.json"

# Gjør idea2proto importerbar (søskenmappe)
sys.path.insert(0, str(HERE.parent / "idea_to_prototype"))


def read_inputs() -> str:
    """Leser alle .md/.txt-filer i inputs/ (maks ~50k tegn totalt)."""
    if not INPUTS.exists():
        return ""
    chunks = []
    for p in sorted(INPUTS.rglob("*")):
        if p.is_file() and p.suffix.lower() in {".md", ".txt"}:
            chunks.append(f"--- {p.name} ---\n{p.read_text(encoding='utf-8', errors='ignore')}")
    return "\n\n".join(chunks)[:50000]


TASK_SCHEMA = {
    "type": "object",
    "properties": {
        "tasks": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "type": {"type": "string", "enum": ["prototype", "dokument"]},
                    "tittel": {"type": "string"},
                    "beskrivelse": {"type": "string"},
                    "hvorfor": {"type": "string"},
                    "prioritet": {"type": "integer"},
                },
                "required": ["id", "type", "tittel", "beskrivelse", "hvorfor", "prioritet"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["tasks"],
    "additionalProperties": False,
}


def plan_tasks(inputs_text: str) -> list[dict]:
    """Ber Claude generere en prioritert task-liste fra inputs."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=8000,
        thinking={"type": "adaptive"},
        system=(
            "Du er en meta-agent som styrer en kreativ gründers AI-arbeidsflyt. "
            "Du leser rå notater og ideer, og genererer konkrete tasks andre agenter "
            "kan utføre. type='prototype' betyr at idea2proto-agenten bygger app + "
            "landingsside + monetiseringsplan. type='dokument' betyr at en agent "
            "skriver et leveransedokument (analyse, pitch, plan, tekst). Norsk."
        ),
        messages=[{
            "role": "user",
            "content": f"""Her er alle mine inputs (notater, ideer, halvferdige tanker):

{inputs_text}

Generer 5-10 tasks, prioritert 1 (viktigst) til 3. Velg tasks som gir mest verdi raskest.
beskrivelse skal være selvstendig nok til at en agent kan utføre den uten mer kontekst.""",
        }],
        output_config={"format": {"type": "json_schema", "schema": TASK_SCHEMA}},
    )
    text = next(b.text for b in response.content if b.type == "text")
    tasks = json.loads(text)["tasks"]
    for t in tasks:
        t["status"] = "pending"
    return sorted(tasks, key=lambda t: t["prioritet"])


def run_document_task(task: dict) -> Path:
    """Utfører en dokument-task direkte med Claude."""
    with client.messages.stream(
        model=MODEL,
        max_tokens=32000,
        thinking={"type": "adaptive"},
        system=(
            "Du er en dyktig utførende agent. Lever et komplett, ferdig dokument "
            "i Markdown på norsk – ikke et utkast, ikke spørsmål tilbake."
        ),
        messages=[{
            "role": "user",
            "content": f"Task: {task['tittel']}\n\n{task['beskrivelse']}\n\n"
                       f"Kontekst/hvorfor: {task['hvorfor']}",
        }],
    ) as stream:
        msg = stream.get_final_message()
    text = "".join(b.text for b in msg.content if b.type == "text")

    OUTPUTS.mkdir(exist_ok=True)
    safe = "".join(c if c.isalnum() or c in " -_" else "" for c in task["tittel"])[:50]
    out = OUTPUTS / f"{task['id']}_{safe.strip().replace(' ', '_')}.md"
    out.write_text(text, encoding="utf-8")
    return out


def run_prototype_task(task: dict) -> Path:
    """Delegerer til idea2proto-agenten."""
    from idea2proto import build_prototype
    return build_prototype(task["beskrivelse"], root=OUTPUTS / "prototyper")


def execute(tasks: list[dict], max_tasks: int) -> None:
    done = 0
    for task in tasks:
        if task["status"] == "done" or done >= max_tasks:
            continue
        print(f"\n▶️  [{task['id']}] {task['tittel']} (P{task['prioritet']}, {task['type']})")
        try:
            if task["type"] == "prototype":
                result = run_prototype_task(task)
            else:
                result = run_document_task(task)
            task["status"] = "done"
            task["resultat"] = str(result)
            task["fullfort"] = datetime.now().isoformat()
            print(f"   ✅ {result}")
        except Exception as exc:  # fortsett med neste task ved feil
            task["status"] = "failed"
            task["feil"] = str(exc)
            print(f"   ❌ {exc}")
        done += 1
        TASKS_FILE.write_text(json.dumps(tasks, indent=2, ensure_ascii=False),
                              encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Meta-agent: planlegg og kjør neste tasks")
    parser.add_argument("--plan", action="store_true", help="Bare planlegg, ikke kjør")
    parser.add_argument("--max", type=int, default=3, help="Maks tasks å kjøre (default 3)")
    parser.add_argument("--replan", action="store_true", help="Forkast tasks.json og planlegg på nytt")
    args = parser.parse_args()

    inputs_text = read_inputs()
    if not inputs_text:
        INPUTS.mkdir(exist_ok=True)
        print(f"Ingen inputs funnet. Legg .md/.txt-notater i {INPUTS}/ og kjør igjen.")
        return

    if TASKS_FILE.exists() and not args.replan:
        tasks = json.loads(TASKS_FILE.read_text(encoding="utf-8"))
        print(f"📋 Fant eksisterende tasks.json ({len(tasks)} tasks). Bruk --replan for ny plan.")
    else:
        print("🧠 Meta-agenten leser inputs og planlegger tasks...")
        tasks = plan_tasks(inputs_text)
        TASKS_FILE.write_text(json.dumps(tasks, indent=2, ensure_ascii=False),
                              encoding="utf-8")
        print(f"📋 {len(tasks)} tasks planlagt → {TASKS_FILE}")

    for t in tasks:
        icon = {"pending": "⬜", "done": "✅", "failed": "❌"}.get(t["status"], "⬜")
        print(f"  {icon} P{t['prioritet']} [{t['type']}] {t['tittel']}")

    if args.plan:
        return

    execute(tasks, args.max)
    remaining = sum(1 for t in tasks if t["status"] == "pending")
    print(f"\n🏁 Ferdig for nå. {remaining} tasks gjenstår – kjør scriptet igjen for å fortsette.")


if __name__ == "__main__":
    main()
