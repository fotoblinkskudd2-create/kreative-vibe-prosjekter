"""Agentene i VIBESMIA.

Seks spesialiserte agenter samarbeider under Dirigenten:

    Speideren      — henter trender og research (web-søk i produksjon)
    Musen          — divergent idégenerering, dristige konsepter
    Provokatøren   — angriper hvert konsept: klisjé? ugjennomførbart?
    Vibe-Vokteren  — skårer konsepter mot vibe-profilen i semantisk minne
    Smeden         — smir det vinnende konseptet til en byggbar spesifikasjon
    Arkivaren      — destillerer lærdom til prosedyrisk minne
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .adapters import Hjerne
from .bus import MeldingsBuss
from .memory import VibeMinne
from .tension import SpenningsMaal


@dataclass
class Konsept:
    navn: str
    beskrivelse: str
    vri: str                      # den uventede vrien som gir konseptet kant
    inspirasjon: list[str] = field(default_factory=list)


class Agent:
    navn = "agent"

    def __init__(self, hjerne: Hjerne, minne: VibeMinne, buss: MeldingsBuss) -> None:
        self.hjerne = hjerne
        self.minne = minne
        self.buss = buss

    def si(self, mottaker: str, emne: str, innhold) -> None:
        self.buss.send(self.navn, mottaker, emne, innhold)


class Speideren(Agent):
    navn = "speideren"

    # I produksjon byttes denne ut med ekte web-søk (f.eks. Claude API
    # web_search_20260209). Trend-kortene under er destillert fra research
    # gjennomført under designet av VIBESMIA (juli 2026).
    TRENDKORT = [
        "Orchestrator-subagent er standardmønsteret for multi-agent i 2026",
        "Rytme-synkroniserte musikkvideoer er årets raskest voksende AI-verktøyklasse",
        "Prompt-til-produksjon: idé -> tekst -> stil -> utkast -> feedback -> versjoner",
        "Tre-lags agentminne (episodisk/semantisk/prosedyrisk) er konvergert praksis",
        "78% av skapere bruker AI i videoproduksjon, opp fra 32% i 2025",
        "AI-musikkvideo koster nå $300-1200 mot tidligere $15k-50k",
    ]

    def speid(self, idé: str) -> list[str]:
        for trend in self.TRENDKORT:
            self.minne.lagre_trend(trend, kilde=self.navn)
        relevante = self.TRENDKORT[:4]
        self.si("dirigenten", "trender", relevante)
        return relevante


class Musen(Agent):
    navn = "musen"

    VRIER = [
        "snu maktforholdet: publikum lager, verket kuraterer",
        "gjør prosessen til produktet: vis smiingen, ikke bare sverdet",
        "kryss to sjangre ingen har krysset før",
        "lag det fysisk: en digital idé som ender som ting i hånda",
        "la verket eldes: innholdet endrer seg med tiden og været",
    ]

    def divergér(self, idé: str, trender: list[str], antall: int = 5) -> list[Konsept]:
        konsepter = []
        for i in range(antall):
            vri = self.VRIER[i % len(self.VRIER)]
            navn = f"{idé.split()[0].capitalize()}-konsept {i + 1}"
            beskrivelse = self.hjerne.generer(
                "Musen", f"Konsept for '{idé}' med vrien: {vri}. Inspirert av: {trender[i % len(trender)]}"
            )
            konsepter.append(Konsept(navn=navn, beskrivelse=beskrivelse, vri=vri,
                                     inspirasjon=[trender[i % len(trender)]]))
        self.si("provokatoeren", "konsepter", [k.navn for k in konsepter])
        return konsepter

    def entusiasme(self, konsept: Konsept) -> float:
        return self.hjerne.skaar("Musen", konsept.beskrivelse, "kreativt potensial")


class Provokatoeren(Agent):
    navn = "provokatoeren"

    def angrip(self, konsept: Konsept) -> tuple[float, float]:
        """Returnerer (skepsis, dristighet)."""
        skepsis = self.hjerne.skaar(
            "Provokatøren", konsept.beskrivelse,
            "hvor klisjéfylt eller ugjennomførbart er dette (høyt = verre)"
        )
        dristighet = self.hjerne.skaar(
            "Provokatøren", konsept.vri, "avstand fra det opplagte"
        )
        self.si("dirigenten", "angrep", {"konsept": konsept.navn,
                                         "skepsis": skepsis, "dristighet": dristighet})
        return skepsis, dristighet


class VibeVokteren(Agent):
    navn = "vibe-vokteren"

    def vokt(self, konsept: Konsept) -> float:
        profil = self.minne.hent_vibe_profil()
        kriterium = (f"passer tonen {profil['toneord']} for {profil['maalgruppe']}, "
                     f"unngår {profil['unngaa']}")
        skaar = self.hjerne.skaar("Vibe-Vokteren", konsept.beskrivelse, kriterium)
        self.si("dirigenten", "vibe-skaar", {"konsept": konsept.navn, "skaar": skaar})
        return skaar


class Smeden(Agent):
    navn = "smeden"

    def smi(self, konsept: Konsept, maal: SpenningsMaal, vibe_skaar: float) -> dict:
        oppskrifter = self.minne.hent_oppskrifter(maks=2)
        spesifikasjon = {
            "konsept": konsept.navn,
            "beskrivelse": konsept.beskrivelse,
            "vri": konsept.vri,
            "spenning": maal.spenning,
            "vibe_skaar": vibe_skaar,
            "inspirasjon": konsept.inspirasjon,
            "gjenbrukte_oppskrifter": [o.get("navn") for o in oppskrifter],
            "leveranseplan": [
                "1. Prototyp kjerneopplevelsen på én kveld (minste smibare enhet)",
                "2. Test vibe mot 5 personer i målgruppa, juster vibe-profilen",
                "3. Bygg v1 med gjenbruk av oppskrifter fra prosedyrisk minne",
                "4. Publiser, mål, og la Arkivaren destillere lærdommen",
            ],
        }
        self.si("dirigenten", "spesifikasjon", spesifikasjon["konsept"])
        return spesifikasjon


class Arkivaren(Agent):
    navn = "arkivaren"

    TERSKEL = 0.55  # kun gode smeltinger blir oppskrifter

    def arkiver(self, smelting_id: str, spesifikasjon: dict) -> dict | None:
        samlet = round(0.5 * spesifikasjon["spenning"] + 0.5 * spesifikasjon["vibe_skaar"], 3)
        self.minne.logg_hendelse(smelting_id, "smelting_fullfoert",
                                 {"konsept": spesifikasjon["konsept"], "skaar": samlet},
                                 kilde=self.navn)
        if samlet < self.TERSKEL:
            return None
        oppskrift = {
            "navn": f"oppskrift:{spesifikasjon['konsept']}",
            "vri": spesifikasjon["vri"],
            "skaar": samlet,
            "laerdom": f"Vrien '{spesifikasjon['vri']}' traff gullsonen "
                       f"med spenning {spesifikasjon['spenning']}",
        }
        self.minne.lagre_oppskrift(oppskrift)
        return oppskrift
