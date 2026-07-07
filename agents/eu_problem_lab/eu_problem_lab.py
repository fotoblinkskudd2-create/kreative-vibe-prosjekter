#!/usr/bin/env python3
"""
EU Problem Lab — multi-agent system som angriper ett EU/globalt problem.

Pipeline: Researcher (web-søk) -> Analyst -> Pitcher -> Executor.
Output: Markdown-filer + HTML-rapport i output/<slug>/, og valgfritt en Notion-side.

Bruk:
    export ANTHROPIC_API_KEY=sk-ant-...
    python eu_problem_lab.py "Matsvinn i EU"

Valgfri Notion-eksport:
    export NOTION_TOKEN=ntn_...            (intern integrasjon med skrivetilgang)
    export NOTION_PARENT_PAGE_ID=<page-id> (siden rapporten skal opprettes under)
"""

import os
import re
import sys
from pathlib import Path

import anthropic

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
client = anthropic.Anthropic()

DEFAULT_TOPIC = "Matsvinn i EU – over 59 millioner tonn mat kastes årlig"


def text_of(message) -> str:
    return "".join(b.text for b in message.content if b.type == "text").strip()


def ask(system: str, user: str, max_tokens: int = 32000) -> str:
    """Ett Claude-kall med adaptiv tenking og streaming (lange svar)."""
    with client.messages.stream(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": user}],
    ) as stream:
        return text_of(stream.get_final_message())


# ---------------------------------------------------------------- Agenter

def researcher(topic: str) -> str:
    """Researcher-agent: web-søk (server-side tool) + kildebelagt situasjonsbilde."""
    system = (
        "Du er RESEARCHER i et norsk multi-agent-team. Du graver frem fakta, tall, "
        "aktører, regulering og eksisterende løsninger. Alt på norsk, alltid med kilder."
    )
    prompt = f"""Problem: {topic}

Lag et kildebelagt research-notat i Markdown med disse seksjonene:
# Research: {topic}
## Problemets omfang (tall og trender)
## Hvem rammes og hvem betaler
## Regulering og politikk (EU + nasjonalt)
## Eksisterende løsninger og hvorfor de ikke er nok
## Datahull og åpne spørsmål
Bruk web-søk aktivt. Siter kilder med URL."""

    tools = [{"type": "web_search_20260209", "name": "web_search", "max_uses": 8}]
    messages = [{"role": "user", "content": prompt}]

    for _ in range(6):  # pause_turn-loop for server-side verktøy
        with client.messages.stream(
            model=MODEL,
            max_tokens=32000,
            system=system,
            thinking={"type": "adaptive"},
            tools=tools,
            messages=messages,
        ) as stream:
            resp = stream.get_final_message()
        if resp.stop_reason == "pause_turn":
            messages = [messages[0], {"role": "assistant", "content": resp.content}]
            continue
        return text_of(resp)
    return text_of(resp)


def analyst(topic: str, research: str) -> str:
    system = (
        "Du er ANALYST. Du finner mønstre, rotårsaker og det mest lovende "
        "intervensjonspunktet. Skarp, tallfestet, ærlig om usikkerhet. Norsk."
    )
    return ask(system, f"""Problem: {topic}

Research-notat fra Researcher:
---
{research}
---

Lag en analyse i Markdown:
# Analyse
## Rotårsaker (rangert)
## Intervensjonspunkter (hvor gir 1 krone mest effekt?)
## Anbefalt konsept (velg ETT og begrunn)
## Estimert effekt og ROI (vis regnestykket, oppgi antakelser)
## Største risikoer""")


def pitcher(topic: str, analysis: str) -> str:
    system = (
        "Du er PITCHER. Du gjør analyser om til en pitch som får finansiering: "
        "klar historie, konkret ask, tall som holder. Norsk."
    )
    return ask(system, f"""Problem: {topic}

Analyse fra Analyst:
---
{analysis}
---

Skriv en komplett pitch i Markdown:
# Pitch
## Én-setnings-pitchen
## Problemet (gjør det menneskelig)
## Løsningen
## Marked / målgruppe / betalingsvilje
## Forretningsmodell (evt. finansieringsmodell for ideell variant)
## Traction-plan: første 90 dager
## The ask (hva trengs: penger, partnere, pilot)
## Elevator pitch på 30 sekunder (manus)""")


def executor(topic: str, analysis: str, pitch: str) -> str:
    system = (
        "Du er EXECUTOR. Du gjør planer om til konkrete, daterbare oppgaver "
        "én person kan starte på i morgen. Norsk."
    )
    return ask(system, f"""Problem: {topic}

Analyse:
---
{analysis}
---
Pitch:
---
{pitch}
---

Lag en eksekveringsplan i Markdown:
# Eksekveringsplan
## Uke 1–2: Validering (konkrete oppgaver med sjekklister)
## Uke 3–6: MVP / pilot
## Uke 7–12: Første kunder/partnere
## Verktøy og budsjett (realistiske tall i NOK/EUR)
## KPI-er og målepunkter
## Neste 3 handlinger (kan gjøres i dag, under 1 time hver)""")


# ---------------------------------------------------------------- Output

def slugify(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9æøåÆØÅ ]", "", s).strip().lower()
    return re.sub(r"\s+", "-", s)[:60] or "problem"


HTML_TEMPLATE = """<!doctype html>
<html lang="no"><head><meta charset="utf-8">
<title>{title}</title>
<style>
 body {{ font-family: -apple-system, sans-serif; max-width: 860px; margin: 40px auto;
        padding: 0 20px; line-height: 1.6; color: #1c1c28; }}
 h1 {{ border-bottom: 3px solid #6c5ce7; padding-bottom: 8px; }}
 h2 {{ color: #6c5ce7; margin-top: 2em; }}
 pre {{ background: #f4f4fb; padding: 12px; border-radius: 8px; overflow-x: auto; }}
 .section {{ background: #fafaff; border: 1px solid #e6e6f5; border-radius: 14px;
            padding: 8px 24px; margin: 24px 0; }}
</style></head><body>
<h1>{title}</h1>
<p><em>Generert av EU Problem Lab (Researcher → Analyst → Pitcher → Executor)</em></p>
{sections}
<p style="color:#888;font-size:0.85em">Tips: Skriv ut som PDF med ⌘P → «Lagre som PDF».</p>
</body></html>"""


def markdown_to_html(md: str) -> str:
    """Minimal md->html (nok til rapporten; ingen eksterne avhengigheter)."""
    html_lines = []
    for line in md.splitlines():
        if line.startswith("### "):
            html_lines.append(f"<h3>{line[4:]}</h3>")
        elif line.startswith("## "):
            html_lines.append(f"<h2>{line[3:]}</h2>")
        elif line.startswith("# "):
            html_lines.append(f"<h1>{line[2:]}</h1>")
        elif line.startswith("- "):
            html_lines.append(f"<li>{line[2:]}</li>")
        elif line.strip():
            html_lines.append(f"<p>{line}</p>")
    return "\n".join(html_lines)


def push_to_notion(title: str, markdown_docs: list[tuple[str, str]]) -> str | None:
    """Oppretter en Notion-side hvis NOTION_TOKEN + NOTION_PARENT_PAGE_ID er satt."""
    token = os.environ.get("NOTION_TOKEN")
    parent = os.environ.get("NOTION_PARENT_PAGE_ID")
    if not token or not parent:
        return None

    import requests

    def md_to_blocks(md: str) -> list[dict]:
        blocks = []
        for line in md.splitlines():
            if not line.strip():
                continue
            text = line.lstrip("#- ").strip()[:2000]
            rich = [{"type": "text", "text": {"content": text}}]
            if line.startswith("# "):
                blocks.append({"type": "heading_1", "heading_1": {"rich_text": rich}})
            elif line.startswith("## "):
                blocks.append({"type": "heading_2", "heading_2": {"rich_text": rich}})
            elif line.startswith("### "):
                blocks.append({"type": "heading_3", "heading_3": {"rich_text": rich}})
            elif line.startswith("- "):
                blocks.append({"type": "bulleted_list_item",
                               "bulleted_list_item": {"rich_text": rich}})
            else:
                blocks.append({"type": "paragraph", "paragraph": {"rich_text": rich}})
        return blocks

    all_blocks = []
    for _, md in markdown_docs:
        all_blocks.extend(md_to_blocks(md))

    resp = requests.post(
        "https://api.notion.com/v1/pages",
        headers={
            "Authorization": f"Bearer {token}",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json",
        },
        json={
            "parent": {"page_id": parent},
            "properties": {"title": [{"type": "text", "text": {"content": title}}]},
            "children": all_blocks[:100],  # Notion-API-grense per kall
        },
        timeout=30,
    )
    if resp.ok:
        return resp.json().get("url")
    print(f"  ! Notion-feil {resp.status_code}: {resp.text[:200]}")
    return None


# ---------------------------------------------------------------- Main

def main() -> None:
    topic = " ".join(sys.argv[1:]).strip() or DEFAULT_TOPIC
    out = Path(__file__).parent / "output" / slugify(topic)
    out.mkdir(parents=True, exist_ok=True)

    steps = []
    print(f"🌍 EU Problem Lab: {topic}\n")

    print("🔎 [1/4] Researcher jobber (web-søk)...")
    research = researcher(topic)
    steps.append(("01_research.md", research))

    print("📊 [2/4] Analyst jobber...")
    analysis = analyst(topic, research)
    steps.append(("02_analyse.md", analysis))

    print("🎤 [3/4] Pitcher jobber...")
    pitch = pitcher(topic, analysis)
    steps.append(("03_pitch.md", pitch))

    print("🛠  [4/4] Executor jobber...")
    plan = executor(topic, analysis, pitch)
    steps.append(("04_eksekveringsplan.md", plan))

    for filename, content in steps:
        (out / filename).write_text(content, encoding="utf-8")

    sections = "\n".join(
        f'<div class="section">{markdown_to_html(md)}</div>' for _, md in steps
    )
    (out / "rapport.html").write_text(
        HTML_TEMPLATE.format(title=topic, sections=sections), encoding="utf-8"
    )

    notion_url = push_to_notion(topic, steps)

    print(f"\n✅ Ferdig! Filer i {out}/")
    print("   - 01_research.md, 02_analyse.md, 03_pitch.md, 04_eksekveringsplan.md")
    print("   - rapport.html (åpne i nettleser, ⌘P for PDF)")
    if notion_url:
        print(f"   - Notion: {notion_url}")
    print("\n📦 GitHub: git add agents/eu_problem_lab/output && git commit && git push")


if __name__ == "__main__":
    main()
