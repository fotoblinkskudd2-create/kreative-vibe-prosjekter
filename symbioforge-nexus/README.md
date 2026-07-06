# SymbioForge Nexus

**Et autonomt, selv-evoluerende DeSci-økosystem** (Decentralized Science + Agentic AI)
som genererer kunnskap om verdens fem største gruppekriser — og oversetter den
direkte til intervensjoner og policy.

> Spør på norsk → hypotese → kausal modell → digital tvilling-simulering →
> pilotdesign → policy-brief. Med full sporbarhet, equity-vern og borgermedvirkning.

## De fem krisene

| # | Krise | Gruppe | Omfang (2025/26) |
|---|-------|--------|------------------|
| 1 | Sult og akutt underernæring | Barn 0–18 i konflikt-/klimasoner | ~295 mill. i akutt matmangel, 13 hotspots |
| 2 | Ensomhet, multimorbiditet, demens | Eldre, særlig kvinner 65+ | 60+ dobles til 2,1 mrd. innen 2050; 1 av 6 med psykisk lidelse |
| 3 | ADHD/nevrodivergens-barrierer | Gutter (og maskerende jenter) | Kjønnsgap i diagnose, dropout, komorbid angst |
| 4 | Utdannings- og mental helse-krise | Gutter/unge menn | NEET, selvmord, rekruttering i krig |
| 5 | Internaliserende lidelser | Unge jenter/kvinner | 1 av 7 unge globalt; kun 2,4 % av helsebistand til ungdom |

Krisene er koblet: sult forsterker ADHD-symptomer, ADHD driver gutte-dropout,
omsorgsbyrde for eldre faller på kvinner. Nexus modellerer **kryssforbindelsene**
eksplisitt — det er der de superadditive intervensjonene finnes.

## Innhold i dette repoet

```
symbioforge-nexus/
├── dashboard/index.html    Interaktiv konsoll: agent-sverm, digitale tvillinger,
│                           scenariomotor, Discovery-løkke, DAO-styring.
│                           Selvstendig fil — åpne direkte i nettleser.
├── core/                   Kjørbar Python-referanseimplementasjon (kun stdlib)
│   ├── symbioforge/        Meldingsbuss, 7 agenter, 5 digitale tvillinger,
│   │                       orkestrator for Discovery-to-Action-løkka
│   ├── demo.py             python demo.py "Analyser sult + ADHD hos gutter …"
│   └── tests/              10 tester (determinisme, effektmodell, BiasGuard)
└── docs/
    ├── ARKITEKTUR.md       Full 2026-arkitektur med diagrammer og agentkatalog
    ├── VEIKART.md          MVP → global skalering, budsjett, partnere
    └── ETIKK-PERSONVERN.md GDPR+, føderert læring, DAO, BiasGuard-garantier
```

## Kom i gang på 30 sekunder

```bash
# 1. Dashboard — åpne i nettleser
open dashboard/index.html

# 2. Kjør en Discovery-løkke fra terminalen
cd core
python demo.py "Analyser samspill sult + ADHD hos gutter i Norge vs. Sudan"

# 3. Kjør testene
python -m unittest discover -s tests -v
```

## Designprinsipper

1. **Determinisme = reproduserbarhet.** Samme spørsmål gir samme brief og samme
   audit-hash. Referansekjernen har null eksterne avhengigheter.
2. **Equity er kode, ikke intensjon.** BiasGuard-agenten blokkerer generalisering
   til regioner med datadekning under 40 % — hardkodet i løkka.
3. **Berørte grupper er medforskere.** CitizenValidator-steget kan ikke hoppes
   over; i produksjon er det faktiske panelrunder med Impact Tokens og DAO-stemme.
4. **Transparent framfor imponerende.** Tvillingmodellene er enkle
   differanselikninger alle kan ettergå. Kalibrerte modeller kommer via føderert
   læring — grensesnittet er det samme.

## Status

Dette er **prototyp/MVP-fundament** (fase 0 i [veikartet](docs/VEIKART.md)):
arkitekturen, kjerneabstraksjonene og den interaktive konsollen. Tallene i
tvillingmodellene er forankret i offentlige 2025/26-rapporter, men effekt-
størrelser er illustrative inntil kalibrering mot føderert data.
