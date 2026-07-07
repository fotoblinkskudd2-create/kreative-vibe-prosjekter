#!/usr/bin/env python3
"""
Idea2Proto — tar en idé og genererer en full prototype:
  1. Kjørbar kode (web-app som åpnes rett i nettleser)
  2. Landingsside (index.html med påmeldingsskjema)
  3. Monetiseringsplan (MONETISERING.md)

Bruk:
    export ANTHROPIC_API_KEY=sk-ant-...
    python idea2proto.py "Vibe-kort app der venner sender hverandre daglige stemningskort"

Resultat: prototypes/<slug>/ med app/, landing/ og MONETISERING.md
"""

import os
import re
import sys
from pathlib import Path

import anthropic

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-4-8")
client = anthropic.Anthropic()

FILE_PATTERN = re.compile(r"===FILE: (.+?)===\n(.*?)\n===END===", re.DOTALL)


def ask(system: str, user: str, max_tokens: int = 64000) -> str:
    with client.messages.stream(
        model=MODEL,
        max_tokens=max_tokens,
        system=system,
        thinking={"type": "adaptive"},
        messages=[{"role": "user", "content": user}],
    ) as stream:
        msg = stream.get_final_message()
    return "".join(b.text for b in msg.content if b.type == "text")


def write_files(raw: str, base: Path) -> list[str]:
    """Parser ===FILE: sti=== ... ===END===-blokker og skriver dem til disk."""
    written = []
    for match in FILE_PATTERN.finditer(raw):
        rel, content = match.group(1).strip(), match.group(2)
        # Sikkerhet: aldri skriv utenfor målmappen
        target = (base / rel).resolve()
        if not str(target).startswith(str(base.resolve())):
            print(f"  ! Hoppet over usikker sti: {rel}")
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(content, encoding="utf-8")
        written.append(rel)
    return written


FILE_FORMAT_RULES = """Svar KUN med filer i dette formatet (ingen annen tekst):
===FILE: relativ/sti/filnavn===
<filens fulle innhold>
===END===
"""


def generate_app(idea: str, base: Path) -> list[str]:
    system = (
        "Du er en senior produktutvikler som bygger imponerende, komplette prototyper. "
        "Prototypen skal være en selvstendig web-app (index.html + style.css + app.js, "
        "ev. flere filer) uten byggesteg og uten eksterne CDN-avhengigheter, slik at den "
        "kan åpnes direkte i nettleser. Moderne, lekkert design. Norsk UI-tekst."
    )
    raw = ask(system, f"""Idé: {idea}

Bygg en fungerende prototype av kjerneopplevelsen (bruk localStorage for data).
Inkluder demo-data så appen føles levende ved første åpning.

{FILE_FORMAT_RULES}
Alle filer under app/ (f.eks. app/index.html).""")
    return write_files(raw, base)


def generate_landing(idea: str, base: Path) -> list[str]:
    system = (
        "Du er en konverteringsekspert som lager landingssider som selger. "
        "Én selvstendig HTML-fil med innebygd CSS, ingen eksterne avhengigheter. "
        "Norsk tekst. Hero, problem/løsning, 3 fordeler, sosiale bevis (placeholder), "
        "prisseksjon og e-post-påmeldingsskjema (lagrer til localStorage som demo)."
    )
    raw = ask(system, f"""Idé: {idea}

Lag landingssiden som skal validere betalingsvilje.

{FILE_FORMAT_RULES}
Én fil: landing/index.html""")
    return write_files(raw, base)


def generate_monetization(idea: str, base: Path) -> list[str]:
    system = (
        "Du er forretningsutvikler for indie-produkter. Konkret, tallfestet, "
        "ærlig om usikkerhet. Norsk."
    )
    raw = ask(system, f"""Idé: {idea}

Skriv en monetiseringsplan i Markdown med:
# Monetisering
## Målgruppe og betalingsvilje
## 3 forretningsmodeller (rangert, med anbefaling)
## Prising (konkrete tall i NOK)
## Break-even-regnestykke (vis antakelsene)
## Valideringsplan: 14 dager, budsjett under 2000 kr
## Kanaler for de første 100 brukerne

{FILE_FORMAT_RULES}
Én fil: MONETISERING.md""", max_tokens=16000)
    return write_files(raw, base)


def slugify(s: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9æøåÆØÅ ]", "", s).strip().lower()
    return re.sub(r"\s+", "-", s)[:50] or "ide"


def build_prototype(idea: str, root: Path | None = None) -> Path:
    """Kjør hele pipelinen for én idé. Returnerer mappen prototypen ligger i."""
    base = (root or Path(__file__).parent / "prototypes") / slugify(idea)
    base.mkdir(parents=True, exist_ok=True)

    print(f"💡 Idé: {idea}")
    print("🛠  [1/3] Genererer app-prototype...")
    app_files = generate_app(idea, base)
    print(f"      {len(app_files)} filer: {', '.join(app_files)}")

    print("🎯 [2/3] Genererer landingsside...")
    landing_files = generate_landing(idea, base)
    print(f"      {len(landing_files)} filer")

    print("💰 [3/3] Genererer monetiseringsplan...")
    money_files = generate_monetization(idea, base)
    print(f"      {len(money_files)} filer")

    print(f"\n✅ Prototype klar i {base}/")
    print(f"   open {base / 'app' / 'index.html'}")
    print(f"   open {base / 'landing' / 'index.html'}")
    return base


if __name__ == "__main__":
    idea = " ".join(sys.argv[1:]).strip()
    if not idea:
        print('Bruk: python idea2proto.py "din idé her"')
        sys.exit(1)
    build_prototype(idea)
