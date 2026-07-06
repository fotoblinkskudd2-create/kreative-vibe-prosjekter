# SymbioForge Nexus

**Et konsept for en desentralisert, agent-drevet forskningsplattform (DeSci + Agentic AI) rettet mot fem gruppe-spesifikke verdensproblemer.**

> ⚠️ **Ærlig merkelapp:** Dette er en *konsept-prototype* og et arkitekturforslag — ikke et fungerende AI-system.
> Alle tall, simuleringer og «agent-aktivitet» i prototypen er **illustrative og simulerte**.
> Påstander som «peer-reviewed paper på 10 minutter» hører hjemme i visjonen, ikke i det som faktisk kan bygges i dag.
> Det som *er* realistisk i 2026: agent-orkestrering over åpne datakilder, federert læring, enkle populasjonsmodeller («digital twins light») og en lukket discovery-til-pilot-sløyfe med mennesker i loopen.

## De fem problemområdene

| # | Gruppe | Problem | Nøkkeltall (FN/WFP/UNICEF/Lancet, 2025–26) |
|---|--------|---------|--------------------------------------------|
| 1 | Barn 0–18 i konflikt-/klimasoner | Sult og akutt underernæring | ~295 mill. i akutt matmangel; 13 hotspots |
| 2 | Eldre, særlig kvinner >65 | Ensomhet, multimorbiditet, demens | 60+-populasjonen dobles til 2,1 mrd innen 2050; 1 av 6 har psykisk lidelse |
| 3 | Gutter med ADHD/nevrodivergens | Skole- og arbeidsbarrierer, kjønnsgap i diagnose | Høyere prevalens hos gutter; jenter maskerer og diagnostiseres sent |
| 4 | Gutter/unge menn | Utdannings- og mental helse-krise, NEET, rekruttering i krig | Lavere skoleprestasjoner, høyere selvmord og dropout |
| 5 | Unge jenter/kvinner | Angst, depresjon, spiseforstyrrelser drevet av sosiale medier | 1 av 7 ungdommer globalt; kun 2,4 % av global helsebistand går til ungdom |

Kryssforbindelsene er selve poenget: sult forverrer ADHD-symptomer, ensomhet forsterker demensrisiko, økonomisk usikkerhet driver både gutte- og jentekrisen. Plattformen er designet for å forske *på tvers* av gruppene, ikke i siloer.

## Hva som ligger i dette prosjektet

```
symbioforge-nexus/
├── README.md            ← du er her
├── docs/
│   └── arkitektur.md    ← full arkitektur med Mermaid-diagrammer (rendres på GitHub)
└── prototype/
    └── index.html       ← interaktiv dashboard-prototype, null avhengigheter — åpne i nettleser
```

### Prototypen (`prototype/index.html`)

Selvstendig HTML-fil uten eksterne avhengigheter. Den demonstrerer:

- **De fem problemområdene** som stat-fliser med nøkkeltall og trend
- **«Spør Nexus»** — en animert demo av Discovery-to-Action-sløyfen (hypotese → data → kausal modell → twin-simulering → pilotdesign → policy-brief)
- **Digital twin-simulator** — velg en twin (HungerTwin, ElderTwin, ADHDTwin, BoyTwin, GirlTwin), juster intervensjonsdekning og intensitet, og se en *illustrativ* fremskrivning 2026–2035
- **Agent-svermen** — statuskort for de sju agentrollene (HypothesisGen, DataHunter, CausalInfer, TwinSimulator, PolicyPilot, BiasGuard, CitizenValidator)

Åpne filen direkte, eller kjør `python3 -m http.server` i `prototype/` og gå til `http://localhost:8000`.

## Kjerneprinsipper

1. **Multi-agent sverm, ikke én modell** — spesialiserte agenter med full sporbarhet, og en dedikert BiasGuard-agent i hver pipeline.
2. **Federert og personvern-først** — data forlater aldri kilden; Norge beholder suverenitet, LMIC-partnere beholder eierskap. GDPR+ og homomorf kryptering som designmål.
3. **Deltakende, ikke ekstraktiv** — berørte grupper bidrar via voice-first app (200+ språk), får Impact Tokens og stemmerett i DAO-styringen. Global South co-design fra dag én.
4. **Lukket sløyfe til handling** — hvert funn skal ende i en pilot, en policy-brief eller en app-prototype, med sanntidsmåling tilbake i systemet.
5. **Mennesker i loopen** — agentene foreslår; forskere, etikere og berørte validerer. Ingen autonom publisering eller autonom intervensjon.

## Realistisk MVP (6 måneder, Norge som testland)

| Fase | Måned | Leveranse |
|------|-------|-----------|
| 0 | 1 | Åpen kjerne på GitHub, etikk-rammeverk med REK/Sikt-avklaring, partnerdialog (FHI, UiO, SINTEF, UNICEF) |
| 1 | 2–3 | RAG-syntese over WHO/FN/GBD-korpus + agent-pipeline for litteratur → hypotese, med sporbarhet |
| 2 | 4–5 | Første «twin light»: åpen populasjonsmodell for ett problemområde (f.eks. gutte-dropout i Vestland) med scenariomotor |
| 3 | 6 | Pilotdesign-modul + policy-brief-generator, evaluert av menneskelig panel; beslutning om skalering |

Estimert kostnad første år: 50–100 mill. NOK (impact-investorer + offentlige FoU-midler; token-finansiering vurderes kun innenfor norsk/EU-regulering).

## Videre lesing

Full arkitektur — komponenter, dataflyt, agentroller, sikkerhets- og etikkmodell — ligger i [`docs/arkitektur.md`](docs/arkitektur.md).
