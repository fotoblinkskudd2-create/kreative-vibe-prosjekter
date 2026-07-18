"""VibeMinne — tre-lags hukommelse for VIBESMIA.

Basert på 2026-konsensus for agentminne (episodisk / semantisk / prosedyrisk):

- Episodisk:   hendelseslogg per smelting, med full proveniens
- Semantisk:   vibe-profiler, trend-fakta og lærte preferanser
- Prosedyrisk: "oppskrifter" — destillerte mønstre fra vellykkede smeltinger

Lagres som én JSON-fil slik at minnet overlever mellom kjøringer.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

STANDARD_VIBE_PROFIL = {
    "navn": "kreativ-vibe-standard",
    "toneord": ["leken", "smart", "uventet", "varm", "norsk"],
    "unngaa": ["korporativ sjargong", "klisjé", "AI-slop-estetikk"],
    "maalgruppe": "kreative skapere og indie-utviklere",
}


class VibeMinne:
    def __init__(self, sti: str | Path = "vibeminne.json") -> None:
        self.sti = Path(sti)
        self._data: dict[str, Any] = {
            "episodisk": [],
            "semantisk": {"vibe_profiler": {STANDARD_VIBE_PROFIL["navn"]: STANDARD_VIBE_PROFIL},
                          "trender": [], "preferanser": {}},
            "prosedyrisk": [],
        }
        if self.sti.exists():
            self._data = json.loads(self.sti.read_text(encoding="utf-8"))

    # -- Episodisk ----------------------------------------------------------
    def logg_hendelse(self, smelting_id: str, hendelse: str, detaljer: Any, kilde: str) -> None:
        self._data["episodisk"].append({
            "smelting_id": smelting_id,
            "hendelse": hendelse,
            "detaljer": detaljer,
            "kilde": kilde,
            "tidsstempel": time.time(),
        })

    def hendelser_for(self, smelting_id: str) -> list[dict]:
        return [h for h in self._data["episodisk"] if h["smelting_id"] == smelting_id]

    # -- Semantisk ----------------------------------------------------------
    def hent_vibe_profil(self, navn: str = "kreativ-vibe-standard") -> dict:
        return self._data["semantisk"]["vibe_profiler"].get(navn, STANDARD_VIBE_PROFIL)

    def lagre_vibe_profil(self, profil: dict) -> None:
        self._data["semantisk"]["vibe_profiler"][profil["navn"]] = profil

    def lagre_trend(self, trend: str, kilde: str) -> None:
        self._data["semantisk"]["trender"].append(
            {"trend": trend, "kilde": kilde, "tidsstempel": time.time()}
        )

    def hent_trender(self, maks: int = 10) -> list[dict]:
        return self._data["semantisk"]["trender"][-maks:]

    # -- Prosedyrisk --------------------------------------------------------
    def lagre_oppskrift(self, oppskrift: dict) -> None:
        self._data["prosedyrisk"].append({**oppskrift, "tidsstempel": time.time()})

    def hent_oppskrifter(self, maks: int = 5) -> list[dict]:
        # Nyeste og best skårende oppskrifter først
        return sorted(self._data["prosedyrisk"],
                      key=lambda o: o.get("skaar", 0), reverse=True)[:maks]

    # -- Persistens ---------------------------------------------------------
    def lagre(self) -> None:
        self.sti.write_text(json.dumps(self._data, ensure_ascii=False, indent=2),
                            encoding="utf-8")
