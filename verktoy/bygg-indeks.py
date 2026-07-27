#!/usr/bin/env python3
"""Genererer prosjekter/INDEKS.md fra frontmatter i hver prosjekt.md.

Rangering = verdi / innsats. Høy avkastning per time øverst.
Ingen avhengigheter utover standardbiblioteket.
"""

from __future__ import annotations

import sys
from datetime import date
from pathlib import Path

ROT = Path(__file__).resolve().parent.parent
PROSJEKTER = ROT / "prosjekter"
INDEKS = PROSJEKTER / "INDEKS.md"

FELT = ("navn", "type", "status", "fase", "verdi", "innsats", "neste")
SKJULT_STATUS = {"ferdig", "forkastet"}


def les_frontmatter(sti: Path) -> dict[str, str]:
    """Plukker ut YAML-frontmatteren. Flat nøkkel/verdi, ingen nøsting."""
    linjer = sti.read_text(encoding="utf-8").splitlines()
    if not linjer or linjer[0].strip() != "---":
        return {}
    data: dict[str, str] = {}
    for linje in linjer[1:]:
        if linje.strip() == "---":
            break
        if ":" not in linje:
            continue
        nokkel, _, verdi = linje.partition(":")
        data[nokkel.strip()] = verdi.strip().strip('"').strip("'")
    return data


def tall(data: dict[str, str], nokkel: str) -> int:
    """Leser et 1–5-felt. Faller tilbake til 3 når feltet mangler eller er søppel."""
    try:
        return max(1, min(5, int(data.get(nokkel, "3"))))
    except ValueError:
        return 3


def samle() -> tuple[list[dict], list[str]]:
    rader, advarsler = [], []
    for katalog in sorted(PROSJEKTER.iterdir()):
        if not katalog.is_dir() or katalog.name == "MAL":
            continue
        fil = katalog / "prosjekt.md"
        if not fil.exists():
            advarsler.append(f"{katalog.name}: mangler prosjekt.md")
            continue
        data = les_frontmatter(fil)
        if not data:
            advarsler.append(f"{katalog.name}: mangler frontmatter")
            continue
        for felt in FELT:
            if felt not in data:
                advarsler.append(f"{katalog.name}: mangler feltet '{felt}'")
        verdi, innsats = tall(data, "verdi"), tall(data, "innsats")
        rader.append(
            {
                "slug": katalog.name,
                "navn": data.get("navn", katalog.name),
                "type": data.get("type", "annet"),
                "status": data.get("status", "aktiv"),
                "fase": data.get("fase", "idé"),
                "verdi": verdi,
                "innsats": innsats,
                "score": verdi / innsats,
                "neste": data.get("neste", "—"),
            }
        )
    return rader, advarsler


def tabell(rader: list[dict]) -> list[str]:
    ut = [
        "| # | Prosjekt | Type | Fase | V | I | Score | Neste handling |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for n, r in enumerate(rader, 1):
        lenke = f"[{r['navn']}](./{r['slug']}/prosjekt.md)"
        ut.append(
            f"| {n} | {lenke} | {r['type']} | {r['fase']} | {r['verdi']} | "
            f"{r['innsats']} | {r['score']:.2f} | {r['neste']} |"
        )
    return ut


def main() -> int:
    if not PROSJEKTER.exists():
        print("Fant ikke prosjekter/", file=sys.stderr)
        return 1

    rader, advarsler = samle()
    aktive = sorted(
        (r for r in rader if r["status"] not in SKJULT_STATUS),
        key=lambda r: (-r["score"], -r["verdi"], r["navn"]),
    )
    hvilende = [r for r in rader if r["status"] in SKJULT_STATUS]

    ut = [
        "# Indeks",
        "",
        f"Generert av `verktoy/bygg-indeks.py` {date.today().isoformat()}. "
        "Ikke rediger for hånd.",
        "",
        f"{len(rader)} prosjekter totalt — {len(aktive)} i kø, {len(hvilende)} hvilende.",
        "",
        "## Kø",
        "",
        "Sortert på verdi delt på innsats. Øverste rad er kveldens jobb.",
        "",
    ]
    ut += tabell(aktive) if aktive else ["_Tom. Kjør `verktoy/nytt-prosjekt.sh <slug>`._"]

    if hvilende:
        ut += ["", "## Hvilende", ""]
        ut += [f"- **{r['navn']}** — {r['status']}" for r in hvilende]

    if advarsler:
        ut += ["", "## Avvik", ""]
        ut += [f"- {a}" for a in advarsler]

    INDEKS.write_text("\n".join(ut) + "\n", encoding="utf-8")
    print(f"Skrev {INDEKS.relative_to(ROT)} — {len(aktive)} i kø, {len(advarsler)} avvik.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
