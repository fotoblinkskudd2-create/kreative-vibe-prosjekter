"""Demo: kjør en gullsmelting i VIBESMIA.

    cd vibesmia/src && python main.py "din rå idé her"

Kjører offline med den deterministiske HeuristiskHjerne. Bytt til
ClaudeHjerne (se vibesmia/adapters.py) for ekte LLM-drevne agenter.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

from vibesmia import Dirigenten, VibeMinne


def main() -> None:
    idé = " ".join(sys.argv[1:]) or "musikkvideo-generator for indie-artister med vibe-kort"
    minne_sti = Path(__file__).parent / "vibeminne.json"

    dirigent = Dirigenten(minne=VibeMinne(minne_sti))
    rapport = dirigent.smelt(idé)

    print("=" * 72)
    print(f"VIBESMIA — gullsmelting {rapport['smelting_id']}")
    print(f"Rå idé: {idé}")
    print("=" * 72)
    print(json.dumps(rapport, ensure_ascii=False, indent=2))

    if rapport["status"] == "gull":
        print("\n>>> GULL LEVERT. Spesifikasjonen over er klar til bygging.")
        if rapport["ny_oppskrift"]:
            print(">>> Ny oppskrift destillert til prosedyrisk minne — "
                  "neste smelting starter smartere.")
    else:
        print("\n>>> Ingen konsepter i gullsonen denne gangen. "
              "Juster idéen eller kjør igjen med flere konsepter.")


if __name__ == "__main__":
    main()
