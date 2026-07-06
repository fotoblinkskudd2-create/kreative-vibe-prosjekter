# SymbioForge Nexus — arkitektur (2026)

Arkitekturforslag for et desentralisert, agent-drevet forskningsøkosystem.
Diagrammene er skrevet i Mermaid og rendres direkte på GitHub.

> Status-notasjon i dette dokumentet:
> **[2026]** = kan bygges med dagens teknologi · **[FoU]** = krever forskning/modning · **[Visjon]** = retningsgivende mål

---

## 1. Systemoversikt

```mermaid
flowchart TB
    subgraph Kilder["Datakilder (federert — data forlater aldri kilden)"]
        SAT["Satellitt/drone<br/>NDVI, migrasjon [2026]"]
        EHR["Anonymiserte EHR<br/>FHI, LMIC-partnere [2026]"]
        WEAR["Wearables<br/>puls, søvn, stemme [FoU]"]
        APP["Borger-app<br/>voice-first, 200+ språk [2026]"]
        LIT["Litteratur<br/>WHO/FN/GBD/Lancet-korpus [2026]"]
    end

    subgraph Flywheel["Data Flywheel"]
        FED["Federert lærings-lag<br/>modeller reiser, ikke data"]
        VER["Verifisering<br/>signert opphav + samtykke-logg"]
    end

    subgraph Sverm["Multi-Agent Sverm-orkester"]
        ORCH["Orkestrator"]
        HG["HypothesisGen"]
        DH["DataHunter"]
        CI["CausalInfer"]
        TS["TwinSimulator"]
        PP["PolicyPilot"]
        BG["BiasGuard ⛨"]
        CV["CitizenValidator"]
    end

    subgraph Twins["Digital Twins per gruppe [FoU]"]
        T1["HungerTwin"]
        T2["ElderTwin"]
        T3["ADHDTwin"]
        T4["BoyTwin"]
        T5["GirlTwin"]
    end

    subgraph Ut["Discovery-to-Action"]
        PIL["Pilotdesign<br/>med partnere"]
        POL["Policy-brief"]
        PUB["Åpen publisering<br/>full sporbarhet"]
        MEAS["Sanntidsmåling<br/>tilbake i sløyfen"]
    end

    HUM["Menneskelig panel:<br/>forskere + etikere + berørte<br/>(obligatorisk port)"]

    Kilder --> Flywheel
    Flywheel --> Sverm
    ORCH --- HG & DH & CI & TS & PP
    BG -.granskning.-> ORCH
    CV -.deltaker-validering.-> ORCH
    TS <--> Twins
    Sverm --> HUM
    HUM --> Ut
    MEAS --> Flywheel
```

**Nøkkelvalg:** BiasGuard og CitizenValidator sitter *utenfor* produksjonskjeden og gransker den — de kan blokkere, ikke overstyres. Alt som går ut (pilot, policy, publisering) passerer et menneskelig panel. Sløyfen lukkes ved at måledata fra piloter mates tilbake i flywheelet.

---

## 2. Agentroller

| Agent | Rolle | Verktøy | Autonomi |
|---|---|---|---|
| **Orkestrator** | Dekomponerer spørsmål, ruter til agenter, samler svar med sporbarhet | Oppgavegraf, budsjett-/kostkontroll | Kan ikke publisere eller starte piloter |
| **HypothesisGen** | Genererer testbare hypoteser fra litteratur + data-gap | RAG over WHO/FN/GBD-korpus | Forslag merkes alltid som ubekreftet |
| **DataHunter** | Finner og kvalitetsvurderer kilder, forhandler federert tilgang | Katalog over datakilder, samtykke-API | Kun lesetilgang; aldri rådata ut av kilden |
| **CausalInfer** | Bygger kausale grafer (DAG), kjører sensitivitetsanalyser | DoWhy/EconML-aktige verktøy | Usikkerhet rapporteres alltid, aldri skjules |
| **TwinSimulator** | Kjører scenario- og virtuelle RCT-er mot twins | Populasjonsmodeller, scenariomotor | Resultater merkes «simulert» til de er felt-validert |
| **PolicyPilot** | Oversetter funn til pilotdesign og policy-brief med kostnadsanslag | Maler, partnerregister | Utkast kun — mennesker godkjenner |
| **BiasGuard ⛨** | Reviderer hele kjeden for skjevhet, representativitet, equity | Fairness-metrikker, demografisk dekning | Vetorett; logger offentlig |
| **CitizenValidator** | Sjekker funn mot levde erfaringer fra berørte via appen | Panelspørringer, Impact Tokens | Kan flagge og kreve ny runde |

---

## 3. Discovery-to-Action-sløyfen

```mermaid
sequenceDiagram
    actor F as Forsker (spør på norsk)
    participant O as Orkestrator
    participant H as HypothesisGen
    participant D as DataHunter
    participant C as CausalInfer
    participant T as TwinSimulator
    participant B as BiasGuard
    participant P as PolicyPilot
    actor M as Menneskelig panel

    F->>O: «Analyser samspill sult × ADHD hos gutter, Norge vs. Sahel»
    O->>H: Litteratursyntese + hypoteser
    O->>D: Kilder: satellitt-NDVI, FHI, felt-app
    H-->>O: 3 rangerte hypoteser (med kilder)
    D-->>O: Federerte spørringer klare
    O->>C: Kausal DAG + konfundere
    C-->>O: Modell + sensitivitetsanalyse
    O->>T: Virtuell RCT: skolemat + AI-coach
    T-->>O: Simulert effekt m/ usikkerhetsintervall
    B->>B: Granskning: representativitet, equity, drift
    B-->>O: Godkjent / flagget
    O->>P: Pilotdesign + policy-brief-utkast
    P-->>M: Utkast med full sporbarhetskjede
    M-->>F: Godkjent pilot → felt → måledata tilbake i sløyfen
```

Tidsmålet er ikke «paper på 10 minutter» — det realistiske målet **[2026]** er at *utkastet* (hypoteser, kausalmodell, simulering, pilotskisse) foreligger på minutter–timer, mens validering, etikk og felt-pilot fortsatt tar den tiden kvalitet krever. Gevinsten er at ventetiden flyttes fra manuelt sammenstillingsarbeid til faktisk vitenskapelig vurdering.

---

## 4. Digital twins per gruppe

```mermaid
flowchart LR
    subgraph Inn["Signaler"]
        s1["Satellitt: NDVI, nedbør, konflikt-events"]
        s2["Helsedata: anonymisert, federert"]
        s3["Borger-app: selvrapport, stemme"]
        s4["Sosioøkonomi: NEET, skoledata"]
    end
    subgraph Twin["Twin (per gruppe × region)"]
        m["Populasjonsmodell<br/>agentbasert + statistisk [FoU]"]
        sc["Scenariomotor<br/>intervensjon × dekning × tid"]
    end
    subgraph UtT["Ut"]
        r1["Fremskrivning 2026–2035<br/>med usikkerhetsbånd"]
        r2["Virtuell RCT<br/>effekt- og kostestimat"]
        r3["Best-buy-rangering<br/>per krone/dollar"]
    end
    Inn --> Twin --> UtT
```

| Twin | Primærindikator | Eksempel på virtuell RCT |
|---|---|---|
| HungerTwin | Andel barn i IPC 3+ | Næringsrik skolemat vs. kontantoverføring |
| ElderTwin | Ensomhetsskår + demensinsidens | AI-kompis-app vs. fysiske besøksordninger |
| ADHDTwin | Skolegjennomføring, symptomtrykk | Wearables + skoletilpasning vs. standard oppfølging |
| BoyTwin | NEET-andel, selvmordsrate | Mentorprogram + praksisplasser vs. basis |
| GirlTwin | Internaliserende symptomer | Sosiale medier-intervensjon + skolebasert DBT vs. basis |

Kryssimuleringer (f.eks. HungerTwin × ADHDTwin) kjøres ved å koble twinnenes utganger: underernæringsbane inn som kovariat i ADHD-modellen.

---

## 5. Personvern, styring og etikk

```mermaid
flowchart TB
    subgraph Data["Datalag"]
        f1["Federert læring — rådata forlater aldri kilden [2026]"]
        f2["Differensielt personvern på aggregater [2026]"]
        f3["Homomorf kryptering for kryssland-spørringer [FoU]"]
    end
    subgraph Styring["Styring"]
        g1["DAO: berørte grupper har stemmerett [FoU]"]
        g2["Impact Tokens for bidrag — innenfor norsk/EU-regulering"]
        g3["Offentlig revisjonslogg for alle agent-beslutninger [2026]"]
    end
    subgraph Etikk["Etikk-porter (kan ikke omgås)"]
        e1["REK/Sikt-godkjenning før enhver pilot"]
        e2["BiasGuard-veto + Global South co-design"]
        e3["Menneskelig panel før publisering/policy"]
    end
    Data --> Styring --> Etikk
```

Prinsipp: **ingen autonom handling mot mennesker.** Agentene produserer utkast og simuleringer; alle intervensjoner, publiseringer og policyråd går gjennom menneskelige porter med logget ansvar.

---

## 6. Teknologivalg (realistisk 2026-stack)

| Lag | Valg | Status |
|---|---|---|
| Agent-orkestrering | Claude Agent SDK / åpne agent-rammeverk, oppgavegraf med sporbarhet | [2026] |
| Kunnskapssyntese | RAG over åpne WHO/FN/GBD/Lancet-korpus, sitatplikt per påstand | [2026] |
| Kausal inferens | DoWhy, EconML, sensitivitetsanalyse som standard | [2026] |
| Twins | Agentbaserte + bayesianske populasjonsmodeller, åpen kildekode | [FoU] |
| Federert læring | Flower/åpne FL-rammeverk hos datapartnere | [2026] |
| Verifisering | Signert dataopphav + append-only revisjonslogg (blockchain valgfritt) | [2026] |
| Borger-app | Voice-first PWA, on-device transkripsjon, samtykke per datapunkt | [2026] |
| VR/AR Empathy Labs | WebXR-scenarier for beslutningstakere | [Visjon] |
| Quantum-inspired optimering | Klassiske heuristikker først; kvante når det faktisk slår dem | [Visjon] |

---

## 7. Grensesnitt mot prototypen

Prototypen i [`../prototype/index.html`](../prototype/index.html) implementerer en *simulert* versjon av:

- Stat-fliser for de fem problemområdene (avsnitt 1-tallene fra README)
- Discovery-to-Action-sløyfen fra avsnitt 3 som animert pipeline
- Twin-scenariomotoren fra avsnitt 4 som interaktiv fremskrivning med justerbar dekning/intensitet
- Agentrollene fra avsnitt 2 som statuskort

Alle tall i prototypen er illustrative. Neste steg mot ekte funksjonalitet er MVP-fase 1 i README-en: RAG-syntese med sporbarhet over åpne korpus.
