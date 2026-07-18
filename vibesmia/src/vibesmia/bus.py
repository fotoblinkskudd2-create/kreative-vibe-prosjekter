"""MeldingsBuss — enkel meldingsbuss for agent-til-agent-kommunikasjon.

Alle meldinger logges med avsender, mottaker og tidsstempel slik at
Arkivaren kan skrive full proveniens til episodisk minne etterpå.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass
class Melding:
    avsender: str
    mottaker: str
    emne: str
    innhold: Any
    tidsstempel: float = field(default_factory=time.time)

    def som_dict(self) -> dict:
        return {
            "avsender": self.avsender,
            "mottaker": self.mottaker,
            "emne": self.emne,
            "innhold": self.innhold,
            "tidsstempel": self.tidsstempel,
        }


class MeldingsBuss:
    """Publish/subscribe-buss med full meldingslogg (proveniens)."""

    def __init__(self) -> None:
        self._abonnenter: dict[str, list[Callable[[Melding], None]]] = {}
        self.logg: list[Melding] = []

    def abonner(self, emne: str, handler: Callable[[Melding], None]) -> None:
        self._abonnenter.setdefault(emne, []).append(handler)

    def publiser(self, melding: Melding) -> None:
        self.logg.append(melding)
        for handler in self._abonnenter.get(melding.emne, []):
            handler(melding)

    def send(self, avsender: str, mottaker: str, emne: str, innhold: Any) -> Melding:
        melding = Melding(avsender=avsender, mottaker=mottaker, emne=emne, innhold=innhold)
        self.publiser(melding)
        return melding
