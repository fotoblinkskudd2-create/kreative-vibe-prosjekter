"""Spenningsprotokollen — VIBESMIAs originale seleksjonsmekanisme.

I stedet for å la agentene bli enige (konsensus flater ut kreativitet),
MÅLER vi uenigheten mellom Musen (entusiasme) og Provokatøren (skepsis):

    spenning = |entusiasme - (1 - skepsis)| kombinert med dristighet

Konsepter felles i tre soner:

    for lav spenning  (< GULV) -> "blast" : trygt, blekt, forkastes
    gullsonen [GULV, TAK]      -> videre til Vibe-Vokteren og Smeden
    for hoy spenning  (> TAK)  -> "hybris": spennende men ugjennomforbart

Poenget: det beste kreative arbeidet ligger der Musen og Provokatøren
er *produktivt* uenige — ikke der de er enige.
"""

from __future__ import annotations

from dataclasses import dataclass

GULV = 0.30  # under dette: konseptet er for trygt
TAK = 0.75   # over dette: konseptet er for risikabelt


@dataclass
class SpenningsMaal:
    konsept_navn: str
    entusiasme: float      # Musens tro på konseptet [0, 1]
    skepsis: float         # Provokatørens motstand [0, 1]
    dristighet: float      # hvor langt fra det opplagte konseptet ligger [0, 1]

    @property
    def spenning(self) -> float:
        """Produktiv uenighet: dristighet dratt mot midtpunktet av
        avstanden mellom entusiasme og aksept (1 - skepsis)."""
        uenighet = abs(self.entusiasme - (1.0 - self.skepsis))
        return round(0.6 * self.dristighet + 0.4 * uenighet, 3)

    @property
    def sone(self) -> str:
        s = self.spenning
        if s < GULV:
            return "blast"
        if s > TAK:
            return "hybris"
        return "gullsonen"

    @property
    def i_gullsonen(self) -> bool:
        return self.sone == "gullsonen"


def velg_gullkandidater(maalinger: list[SpenningsMaal]) -> list[SpenningsMaal]:
    """Behold kun konsepter i gullsonen, sortert etter spenning nærmest
    sonens midtpunkt (den mest produktive uenigheten)."""
    midt = (GULV + TAK) / 2
    kandidater = [m for m in maalinger if m.i_gullsonen]
    return sorted(kandidater, key=lambda m: abs(m.spenning - midt))
