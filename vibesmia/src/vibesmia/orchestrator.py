"""Dirigenten — orkestratoren i VIBESMIA.

Kjører Gullsmeltingen, den seks-fasede pipelinen:

    1. SPEIDING     Speideren henter trender
    2. DIVERGENS    Musen genererer konsepter
    3. SPENNING     Provokatøren angriper; Spenningsprotokollen måler
    4. GULLSONEN    kun konsepter med produktiv uenighet overlever
    5. SMIING       Vibe-Vokteren + Smeden lager spesifikasjonen
    6. ARKIVERING   Arkivaren destillerer lærdom til prosedyrisk minne
"""

from __future__ import annotations

import uuid

from .adapters import Hjerne, HeuristiskHjerne
from .agents import Arkivaren, Musen, Provokatoeren, Smeden, Speideren, VibeVokteren
from .bus import MeldingsBuss
from .memory import VibeMinne
from .tension import SpenningsMaal, velg_gullkandidater


class Dirigenten:
    navn = "dirigenten"

    def __init__(self, hjerne: Hjerne | None = None,
                 minne: VibeMinne | None = None) -> None:
        self.hjerne = hjerne or HeuristiskHjerne()
        self.minne = minne or VibeMinne()
        self.buss = MeldingsBuss()
        deler = (self.hjerne, self.minne, self.buss)
        self.speideren = Speideren(*deler)
        self.musen = Musen(*deler)
        self.provokatoeren = Provokatoeren(*deler)
        self.vibe_vokteren = VibeVokteren(*deler)
        self.smeden = Smeden(*deler)
        self.arkivaren = Arkivaren(*deler)

    def smelt(self, idé: str, antall_konsepter: int = 5) -> dict:
        """Kjør en full gullsmelting av en rå idé. Returnerer rapporten."""
        smelting_id = uuid.uuid4().hex[:8]
        logg = lambda h, d: self.minne.logg_hendelse(smelting_id, h, d, kilde=self.navn)
        logg("start", {"idé": idé})

        # 1-2: Speiding og divergens
        trender = self.speideren.speid(idé)
        konsepter = self.musen.divergér(idé, trender, antall=antall_konsepter)
        logg("divergens", [k.navn for k in konsepter])

        # 3: Spenningsmåling — Musen og Provokatøren er bevisst uenige
        maalinger = []
        for konsept in konsepter:
            entusiasme = self.musen.entusiasme(konsept)
            skepsis, dristighet = self.provokatoeren.angrip(konsept)
            maalinger.append(SpenningsMaal(
                konsept_navn=konsept.navn, entusiasme=entusiasme,
                skepsis=skepsis, dristighet=dristighet,
            ))
        logg("spenning", [{"konsept": m.konsept_navn, "spenning": m.spenning,
                           "sone": m.sone} for m in maalinger])

        # 4: Gullsonen
        gull = velg_gullkandidater(maalinger)
        if not gull:
            logg("resultat", "ingen konsepter i gullsonen — smeltingen forkastes")
            self.minne.lagre()
            return {"smelting_id": smelting_id, "status": "forkastet",
                    "maalinger": [m.__dict__ | {"spenning": m.spenning, "sone": m.sone}
                                  for m in maalinger]}

        # 5: Smiing av beste kandidat
        vinner_maal = gull[0]
        vinner = next(k for k in konsepter if k.navn == vinner_maal.konsept_navn)
        vibe_skaar = self.vibe_vokteren.vokt(vinner)
        spesifikasjon = self.smeden.smi(vinner, vinner_maal, vibe_skaar)

        # 6: Arkivering
        oppskrift = self.arkivaren.arkiver(smelting_id, spesifikasjon)
        self.minne.lagre()

        return {
            "smelting_id": smelting_id,
            "status": "gull",
            "vinner": spesifikasjon,
            "ny_oppskrift": oppskrift,
            "forkastede_soner": {m.konsept_navn: m.sone
                                 for m in maalinger if not m.i_gullsonen},
            "antall_meldinger_paa_bussen": len(self.buss.logg),
        }
