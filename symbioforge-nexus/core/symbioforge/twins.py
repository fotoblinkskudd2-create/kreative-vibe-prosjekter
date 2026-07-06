"""Digitale tvillinger for de fem gruppekrisene.

Hver tvilling er en systemdynamisk modell (diskrete årssteg 2026–2035) over
en populasjonsgruppe, med:

  * baseline-indikatorer forankret i 2025/26-tall fra FN, WFP, UNICEF,
    Lancet og GBD (kildene ligger i ``sources``),
  * drivere (konflikt, klima, sosiale medier, aldring ...),
  * intervensjoner med enhetskostnad og evidensbasert effektstørrelse.

Modellene er bevisst enkle og transparente: hvert tall kan følges fra
baseline til projeksjon. I full arkitektur byttes de ut med kalibrerte
modeller over føderert data (satellitt, EHR, wearables) — grensesnittet
``simulate()`` er det samme.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Intervention:
    key: str
    name: str
    # Årlig kostnad i mrd. NOK ved full dekning av målgruppen.
    annual_cost_bnok: float
    # Relativ årlig reduksjon i primærindikatoren ved full dekning (0–1).
    effect: float
    evidence: str


@dataclass
class SimulationResult:
    twin: str
    indicator: str
    unit: str
    years: list[int]
    baseline: list[float]
    intervened: list[float]
    total_cost_bnok: float
    outcome_delta_pct: float  # endring i sluttår vs. baseline, negativ = bedring
    interventions: list[str] = field(default_factory=list)


class DigitalTwin:
    """Basisklasse. Underklasser definerer indikator, drift og intervensjoner."""

    key: str = ""
    name: str = ""
    group: str = ""
    indicator: str = ""
    unit: str = ""
    baseline_2026: float = 0.0
    # Årlig relativ drift i indikatoren uten tiltak (positiv = forverring).
    annual_drift: float = 0.0
    interventions: dict[str, Intervention] = {}
    sources: list[str] = []
    # Datadekning per region (0–1) — brukes av BiasGuard-agenten.
    data_coverage: dict[str, float] = {}

    def simulate(
        self,
        chosen: list[str] | None = None,
        coverage: float = 1.0,
        start: int = 2026,
        end: int = 2035,
    ) -> SimulationResult:
        chosen = chosen or []
        unknown = [c for c in chosen if c not in self.interventions]
        if unknown:
            raise KeyError(f"Ukjent intervensjon for {self.key}: {unknown}")
        coverage = max(0.0, min(1.0, coverage))

        years = list(range(start, end + 1))
        baseline = [self.baseline_2026]
        intervened = [self.baseline_2026]

        # Kombinert effekt: uavhengige reduksjoner multipliseres,
        # så to tiltak à 20 % gir 36 % — ikke 40 %.
        combined = 1.0
        for c in chosen:
            combined *= 1.0 - self.interventions[c].effect * coverage
        for _ in years[1:]:
            baseline.append(baseline[-1] * (1.0 + self.annual_drift))
            intervened.append(intervened[-1] * (1.0 + self.annual_drift) * combined)

        n_years = len(years) - 1
        total_cost = sum(
            self.interventions[c].annual_cost_bnok * coverage * n_years for c in chosen
        )
        delta = (intervened[-1] - baseline[-1]) / baseline[-1] * 100 if baseline[-1] else 0.0
        return SimulationResult(
            twin=self.key,
            indicator=self.indicator,
            unit=self.unit,
            years=years,
            baseline=[round(v, 3) for v in baseline],
            intervened=[round(v, 3) for v in intervened],
            total_cost_bnok=round(total_cost, 2),
            outcome_delta_pct=round(delta, 1),
            interventions=chosen,
        )


class HungerTwin(DigitalTwin):
    key = "hunger"
    name = "HungerTwin"
    group = "Barn 0–18 i konflikt- og klimasoner"
    indicator = "Akutt matusikre barn"
    unit = "millioner"
    baseline_2026 = 295.0          # WFP/FSIN hotspot-estimat
    annual_drift = 0.021           # konflikt + El Niño presser tallet opp
    interventions = {
        "skolemat": Intervention(
            "skolemat", "Næringsrik skolemat i hotspots", 38.0, 0.06,
            "WFP School Meals Coalition: dokumentert effekt på both oppmøte og ernæringsstatus",
        ),
        "kontantstotte": Intervention(
            "kontantstotte", "Kontantoverføringer til husholdninger", 55.0, 0.09,
            "GiveDirectly/Cochrane: kontant slår matvarehjelp på kostnadseffektivitet i de fleste kontekster",
        ),
        "rutf": Intervention(
            "rutf", "RUTF-dekning (terapeutisk ernæring) 90 %", 21.0, 0.05,
            "UNICEF: RUTF kurerer ~90 % av alvorlig akutt underernæring ved full dekning",
        ),
        "varsling": Intervention(
            "varsling", "Satellitt-basert famine-varsling (NDVI + konfliktdata)", 4.0, 0.03,
            "FEWS NET-evalueringer: tidlig varsling flytter respons 3–6 mnd. frem",
        ),
    }
    sources = [
        "WFP/FSIN Global Report on Food Crises 2025",
        "UNICEF Child Nutrition Report 2025",
        "IPC famine-klassifisering, 13 hotspots (Sudan, Jemen, Gaza, Somalia m.fl.)",
    ]
    data_coverage = {"Norge": 0.95, "Europa": 0.9, "Sahel": 0.35, "Sudan": 0.2,
                     "Jemen": 0.25, "Gaza": 0.3, "Somalia": 0.3}


class ElderTwin(DigitalTwin):
    key = "elder"
    name = "ElderTwin"
    group = "Eldre, særlig kvinner over 65"
    indicator = "Eldre med alvorlig ensomhet/psykisk lidelse"
    unit = "millioner"
    baseline_2026 = 190.0          # ~1 av 6 av 60+-populasjonen med psykisk lidelse
    annual_drift = 0.028           # 60+ dobles mot 2,1 mrd. innen 2050
    interventions = {
        "aikompis": Intervention(
            "aikompis", "AI-kompis-app med stemmeanalyse og eskalering", 9.0, 0.05,
            "RCT-er på digitale følgesvenner viser moderat ensomhetsreduksjon; stemme fanger depresjon tidlig",
        ),
        "besok": Intervention(
            "besok", "Organiserte besøksvenner + transport", 26.0, 0.08,
            "Meta-analyser: fysisk sosial kontakt har størst effekt på ensomhet hos eldre",
        ),
        "sentre": Intervention(
            "sentre", "Lokale aktivitetssentre med helsescreening", 34.0, 0.07,
            "Japansk/dansk modell: kombinert sosial + klinisk oppfølging utsetter demens og multimorbiditet",
        ),
        "pensjonsgap": Intervention(
            "pensjonsgap", "Minstepensjon-løft for kvinner med omsorgsgap", 48.0, 0.04,
            "OECD: økonomisk trygghet er sterk prediktor for psykisk helse i alderdom",
        ),
    }
    sources = [
        "WHO Decade of Healthy Ageing, statusrapport 2025",
        "UN World Population Prospects 2024 (60+ → 2,1 mrd. i 2050)",
        "Lancet Healthy Longevity: kjønnsgap i friske leveår",
    ]
    data_coverage = {"Norge": 0.9, "Europa": 0.85, "Øst-Asia": 0.7,
                     "Sør-Asia": 0.35, "Afrika": 0.25}


class ADHDTwin(DigitalTwin):
    key = "adhd"
    name = "ADHDTwin"
    group = "Nevrodivergente barn og unge (kjønnsgap i diagnose)"
    indicator = "Unge med udekket ADHD-/nevrodivergens-behov"
    unit = "millioner"
    baseline_2026 = 84.0           # global prevalens ~5–7 % minus dekket behandling
    annual_drift = 0.012
    interventions = {
        "skoletilpasning": Intervention(
            "skoletilpasning", "Universell skoletilpasning + lærertrening", 18.0, 0.08,
            "Metastudier: klasseromstiltak reduserer symptombelastning og dropout målbart",
        ),
        "wearables": Intervention(
            "wearables", "Wearables + AI-coach for selvregulering", 7.0, 0.05,
            "Pilotstudier: biofeedback bedrer eksekutiv funksjon; effekten er størst kombinert med skole",
        ),
        "jentescreening": Intervention(
            "jentescreening", "Screening som fanger maskerende jenter", 5.0, 0.06,
            "Jenter diagnostiseres i snitt år senere; tidlig diagnose halverer komorbid angst",
        ),
        "ernæring": Intervention(
            "ernæring", "Ernæringsprogram (kobling mot HungerTwin)", 12.0, 0.04,
            "Jernmangel/underernæring forsterker ADHD-symptomer — kryssforbindelsen sult ↔ ADHD",
        ),
    }
    sources = [
        "GBD 2023: nevroutviklingsforstyrrelser, global byrde",
        "Lancet Psychiatry: kjønnsforskjeller i ADHD-diagnostikk",
        "Nordiske registerstudier (NPR/FHI) om dropout og komorbiditet",
    ]
    data_coverage = {"Norge": 0.95, "Europa": 0.8, "Nord-Amerika": 0.85,
                     "Afrika": 0.15, "Sør-Asia": 0.2}


class BoyCrisisTwin(DigitalTwin):
    key = "boycrisis"
    name = "BoyCrisisTwin"
    group = "Gutter og unge menn (utdanning, NEET, selvmord)"
    indicator = "Unge menn i NEET/høyrisiko"
    unit = "millioner"
    baseline_2026 = 145.0          # ILO NEET-estimat, unge menn
    annual_drift = 0.015
    interventions = {
        "mentor": Intervention(
            "mentor", "Mentorprogram med mannlige rollemodeller", 14.0, 0.07,
            "Big Brothers-type programmer: dokumentert effekt på skolegjennomføring og rus",
        ),
        "yrkesfag": Intervention(
            "yrkesfag", "Yrkesfagløft + lærlingegaranti", 41.0, 0.09,
            "Tysk/sveitsisk modell: lærlingesystem gir markant lavere ung-NEET",
        ),
        "selvmordsforebygging": Intervention(
            "selvmordsforebygging", "Lavterskel psykisk helse for menn", 11.0, 0.05,
            "Menn søker hjelp senere; oppsøkende tjenester reduserer selvmordsrate",
        ),
        "rekrutteringsvern": Intervention(
            "rekrutteringsvern", "Vern mot væpnet rekruttering i konfliktsoner", 9.0, 0.04,
            "UNICEF DDR-programmer: reintegrering av barnesoldater og risikoutsatte gutter",
        ),
    }
    sources = [
        "ILO Global Employment Trends for Youth 2024 (NEET)",
        "WHO selvmordsstatistikk, kjønnsfordelt",
        "UNICEF: gutter som ofre i væpnet konflikt",
    ]
    data_coverage = {"Norge": 0.9, "Europa": 0.85, "Latin-Amerika": 0.5,
                     "Midtøsten": 0.3, "Afrika": 0.25}


class GirlMentalTwin(DigitalTwin):
    key = "girlmental"
    name = "GirlMentalTwin"
    group = "Unge jenter og kvinner (internaliserende lidelser)"
    indicator = "Jenter/unge kvinner med angst/depresjon/spiseforstyrrelse"
    unit = "millioner"
    baseline_2026 = 132.0          # ~1 av 7 unge globalt, jenter overrepresentert
    annual_drift = 0.024           # sosiale medier + kroppspress + klimaangst
    interventions = {
        "smregulering": Intervention(
            "smregulering", "Aldersgrenser + algoritme-regulering sosiale medier", 2.0, 0.06,
            "Kvasieksperimenter (bl.a. skoleforbud): målbar effekt på internaliserende symptomer",
        ),
        "skolepsykolog": Intervention(
            "skolepsykolog", "Skolepsykolog-dekning 1:500", 46.0, 0.08,
            "Tidlig intervensjon i skole er mest kostnadseffektive punkt for internaliserende lidelser",
        ),
        "digitalkbt": Intervention(
            "digitalkbt", "Digital KBT på 200+ språk", 6.0, 0.05,
            "Metaanalyser: guidet digital KBT nær ansikt-til-ansikt-effekt, brøkdel av kostnad",
        ),
        "gbvvern": Intervention(
            "gbvvern", "GBV-vern og trygge rom i kriseområder", 13.0, 0.04,
            "IASC-retningslinjer: GBV-eksponering er hoveddriver for PTSD/depresjon hos jenter i krise",
        ),
    }
    sources = [
        "UNICEF State of the World's Children: Mental Health",
        "Lancet Commission on Adolescent Mental Health 2025",
        "Kun 2,4 % av global helsebistand går til ungdoms psykiske helse",
    ]
    data_coverage = {"Norge": 0.9, "Europa": 0.85, "Nord-Amerika": 0.85,
                     "Sør-Asia": 0.3, "Afrika": 0.25, "Midtøsten": 0.3}


TWIN_REGISTRY: dict[str, DigitalTwin] = {
    t.key: t for t in (HungerTwin(), ElderTwin(), ADHDTwin(), BoyCrisisTwin(), GirlMentalTwin())
}

# Kryssforbindelser mellom kriser (retning: kilde forverrer mål).
CROSS_LINKS: list[tuple[str, str, str]] = [
    ("hunger", "adhd", "Underernæring i tidlige år forsterker nevroutviklings-symptomer og stunting av hjerneutvikling"),
    ("hunger", "girlmental", "Matkriser øker GBV-eksponering og internaliserende lidelser hos jenter"),
    ("boycrisis", "girlmental", "Eksternaliserende gutte-kriser og internaliserende jente-kriser deler drivere: sosiale medier, økonomisk usikkerhet"),
    ("adhd", "boycrisis", "Udiagnostisert/ubehandlet ADHD er sterk prediktor for dropout og NEET hos gutter"),
    ("elder", "girlmental", "Omsorgsbyrde for eldre faller uforholdsmessig på kvinner og unge jenter"),
]
