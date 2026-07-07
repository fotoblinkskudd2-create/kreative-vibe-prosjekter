# Magisk Multi-Agent System — Detaljert Designplan

> Et kontinuerlig kjørende multi-agent system som leser brukerens minne/historikk,
> koordinerer 4 spesialiserte agenter, og leverer en `.docx`-rapport hver 24. time.

**Kodenavn:** `Nattugla` (systemet jobber mens du sover og leverer rapporten om morgenen)

---

## Innholdsfortegnelse

1. [Systemoversikt og arkitektur](#1-systemoversikt-og-arkitektur)
2. [Agent-rollene](#2-agent-rollene)
3. [Input-prosess: lesing fra brukerens minne/historikk](#3-input-prosess-lesing-fra-brukerens-minnehistorikk)
4. [Koordinasjonsmekanisme](#4-koordinasjonsmekanisme)
5. [24-timers loop: detaljert timeline](#5-24-timers-loop-detaljert-timeline)
6. [Output-format: .docx-rapporten](#6-output-format-docx-rapporten)
7. [Eksempel: én full 24-timers syklus](#7-eksempel-én-full-24-timers-syklus)
8. [Teknologivalg og implementasjonsdetaljer](#8-teknologivalg-og-implementasjonsdetaljer)
9. [Feilhåndtering og robusthet](#9-feilhåndtering-og-robusthet)

---

## 1. Systemoversikt og arkitektur

Systemet består av **4 agenter**, en **orkestrator**, et **delt minne (blackboard)**,
og en **eksportmodul**. Alt kjører i en kontinuerlig 24-timers syklus styrt av en
scheduler.

### 1.1 Arkitektur-diagram (tekstformat)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        BRUKERENS MINNE / HISTORIKK                       │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────┐  │
│  │ Samtale-     │ │ Notater &    │ │ Prosjekt-    │ │ Kalender &     │  │
│  │ historikk    │ │ dokumenter   │ │ filer (git)  │ │ aktivitetslogg │  │
│  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘ └───────┬────────┘  │
└─────────┼────────────────┼────────────────┼─────────────────┼───────────┘
          │                │                │                 │
          ▼                ▼                ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AGENT 1: ARKIVAREN (Memory Reader)                    │
│      Leser, normaliserer og indekserer alle kilder → minnepakker         │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ skriver
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     DELT MINNE / BLACKBOARD (SQLite)                     │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────────────┐   │
│   │ raw_memory │  │  insights  │  │   drafts   │  │  agent_messages │   │
│   └────────────┘  └────────────┘  └────────────┘  └─────────────────┘   │
└───────┬───────────────────┬───────────────────┬─────────────────────────┘
        │ leser/skriver     │ leser/skriver     │ leser/skriver
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   AGENT 2:    │   │   AGENT 3:    │   │   AGENT 4:    │
│  ANALYTIKEREN │◄─►│   SKAPEREN    │◄─►│  REDAKTØREN   │
│  (Analyzer)   │   │  (Generator)  │   │ (Editor/QA)   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────┬───────┴───────────────────┘
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    ORKESTRATOR (24-timers scheduler)                     │
│     Styrer fasene: INNSAMLING → ANALYSE → SKAPING → REDIGERING →         │
│     EKSPORT. Overvåker helse, håndterer feil, trigger neste fase.        │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │ kl. 06:00 hver dag
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  EKSPORTMODUL (python-docx)                              │
│     Genererer daglig_rapport_YYYY-MM-DD.docx → output/-mappen            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Dataflyt i korte trekk

1. **Arkivaren** leser brukerens minne/historikk og skriver normaliserte
   «minnepakker» til blackboardet.
2. **Analytikeren** leser minnepakkene og produserer innsikter (mønstre, temaer,
   uferdige tråder).
3. **Skaperen** bruker innsiktene til å generere kreativt innhold (idéer, utkast,
   forslag).
4. **Redaktøren** kvalitetssikrer, prioriterer og strukturerer alt til en
   rapportstruktur.
5. **Eksportmodulen** skriver `.docx`-rapporten kl. 06:00 og syklusen starter på nytt.

---

## 2. Agent-rollene

### 2.1 Agent 1: Arkivaren (Memory Reader Agent)

**Ansvar:** Systemets «øyne bakover i tid». Eneste agent med lesetilgang til
brukerens rådata.

| Egenskap | Verdi |
|---|---|
| Kjører | Kontinuerlig (inkrementell polling hvert 30. minutt) |
| Input | Samtalehistorikk, notater, prosjektfiler, kalender/aktivitetslogg |
| Output | Normaliserte minnepakker i `raw_memory`-tabellen |
| Skriver til | `raw_memory`, `agent_messages` |

**Konkrete oppgaver:**
1. Poll alle konfigurerte kilder for endringer siden forrige lesing (via
   tidsstempel-vannmerke per kilde).
2. Normalisere hvert funn til et standard minnepakke-format (se seksjon 3.3).
3. Deduplisere: hopp over innhold med samme innholds-hash som allerede finnes.
4. Tagge hver pakke med kilde, tidsstempel, og grov emneklassifisering.
5. Sende `NEW_MEMORY_BATCH`-melding til Analytikeren når en batch er klar.

### 2.2 Agent 2: Analytikeren (Analyzer Agent)

**Ansvar:** Finne mening i rådataene — mønstre, temaer, uferdige tråder og
muligheter.

| Egenskap | Verdi |
|---|---|
| Kjører | Trigges av `NEW_MEMORY_BATCH`-meldinger + fast dybdeanalyse kl. 22:00 |
| Input | `raw_memory`-tabellen |
| Output | Strukturerte innsikter i `insights`-tabellen |
| Skriver til | `insights`, `agent_messages` |

**Konkrete oppgaver:**
1. **Temaklynging:** Gruppere minnepakker i temaer (f.eks. «musikkprosjekt X»,
   «satireidé Y»).
2. **Trådsporing:** Identifisere uferdige tråder — ting brukeren begynte på men
   ikke fullførte.
3. **Trendanalyse:** Hva har brukeren brukt mest tid/energi på siste 24t vs.
   siste 7 dager?
4. **Gap-deteksjon:** Hvilke prosjekter har ikke blitt rørt på lenge og trenger
   oppmerksomhet?
5. Gradere hver innsikt med konfidens (0–1) og relevans (lav/middels/høy).

### 2.3 Agent 3: Skaperen (Generator Agent)

**Ansvar:** Den «magiske» delen — omdanne innsikter til nytt kreativt innhold.

| Egenskap | Verdi |
|---|---|
| Kjører | Trigges av `INSIGHTS_READY`-melding, hovedkjøring kl. 23:00–03:00 |
| Input | `insights`-tabellen (kun innsikter med relevans middels/høy) |
| Output | Utkast i `drafts`-tabellen |
| Skriver til | `drafts`, `agent_messages` |

**Konkrete oppgaver:**
1. **Idégenerering:** Nye prosjektidéer basert på brukerens mønstre (f.eks.
   kombinere to temaer brukeren jobber med).
2. **Videreføringsforslag:** Konkrete neste steg for hver uferdig tråd.
3. **Utkastskriving:** Korte utkast (tekstskisser, sangtekst-fragmenter,
   satirekonsepter) der innsikten inviterer til det.
4. **Prioriteringsforslag:** Foreslå topp 3 fokusområder for kommende dag.
5. Merke hvert utkast med hvilke innsikter (ID-er) det bygger på, for sporbarhet.

### 2.4 Agent 4: Redaktøren (Editor/QA Agent)

**Ansvar:** Kvalitetsport og rapportarkitekt. Ingenting når brukeren uten å ha
passert Redaktøren.

| Egenskap | Verdi |
|---|---|
| Kjører | Trigges av `DRAFTS_READY`-melding, hovedkjøring kl. 03:00–05:00 |
| Input | `drafts` + `insights` |
| Output | Godkjent, strukturert rapportinnhold i `report_content` |
| Skriver til | `report_content`, `drafts` (statusendringer), `agent_messages` |

**Konkrete oppgaver:**
1. **Kvalitetssjekk:** Forkaste utkast som er repetitive, tynne eller
   dupliserer gårsdagens rapport.
2. **Faktakontroll mot minnet:** Verifisere at referanser til brukerens
   historikk faktisk stemmer med `raw_memory`.
3. **Revisjonssløyfe:** Sende svake utkast tilbake til Skaperen med konkret
   forbedringsbeskjed (`REVISION_REQUEST`), maks 2 runder per utkast.
4. **Strukturering:** Sortere godkjent innhold inn i rapportens seksjoner
   (se seksjon 6) og skrive sammendraget.
5. Signalisere `REPORT_READY` til orkestratoren når alt er klart.

### 2.5 Orkestratoren (ikke en agent, men dirigenten)

En lettvekts prosess som eier klokka og fasene. Den gjør ikke faglig arbeid selv,
men: starter/stopper faser etter timeplanen, overvåker at agentene svarer
(heartbeat hvert 5. minutt), eskalerer ved feil, og trigger eksportmodulen kl. 06:00.

---

## 3. Input-prosess: lesing fra brukerens minne/historikk

### 3.1 Kilder

| Kilde | Format | Lesemetode | Frekvens |
|---|---|---|---|
| Samtalehistorikk | JSON/JSONL-eksport | Filvokter + inkrementell parsing | Hvert 30. min |
| Notater og dokumenter | Markdown/tekst i mappe | Filsystem-scan med mtime-filter | Hvert 30. min |
| Prosjektfiler | Git-repo | `git log --since=<vannmerke>` + diff | Hver time |
| Kalender/aktivitetslogg | iCal/CSV-eksport | Parsing av nye oppføringer | 2 ganger daglig |

### 3.2 Prinsipper

1. **Kun lesing:** Arkivaren har aldri skrivetilgang til brukerens kilder.
2. **Vannmerker:** Hver kilde har et lagret tidsstempel for «sist lest». Kun nytt
   innhold prosesseres — systemet leser aldri alt på nytt.
3. **Samtykke og avgrensning:** Kildelisten er eksplisitt konfigurert av brukeren
   i `config.yaml`. Ingenting utenfor listen leses. Mapper/filer kan
   ekskluderes med mønstre (f.eks. `private/**`).
4. **Lokal lagring:** Alt minne blir i brukerens eget miljø (lokal SQLite-fil).

### 3.3 Minnepakke-formatet

Alt normaliseres til dette skjemaet før det legges i `raw_memory`:

```json
{
  "id": "mem_2026-07-07_0042",
  "source": "notes",
  "source_ref": "notater/musikk/sommerlaat.md",
  "timestamp": "2026-07-07T14:32:00+02:00",
  "content_hash": "sha256:ab3f…",
  "content": "Idé: sommerlåt med tekst om ferjekø…",
  "topics": ["musikk", "sangtekst"],
  "read_at": "2026-07-07T15:00:12+02:00"
}
```

---

## 4. Koordinasjonsmekanisme

Systemet kombinerer to mønstre: **blackboard** (delt tilstand) og
**meldingskø** (hendelser).

### 4.1 Blackboard: delt SQLite-database

Alle agenter leser og skriver til samme database (`nattugla.db`) med fire
kjernetabeller:

| Tabell | Innhold | Skrives av | Leses av |
|---|---|---|---|
| `raw_memory` | Normaliserte minnepakker | Arkivaren | Analytikeren, Redaktøren |
| `insights` | Innsikter med konfidens/relevans | Analytikeren | Skaperen, Redaktøren |
| `drafts` | Utkast med status (`pending`/`approved`/`rejected`/`revision`) | Skaperen, Redaktøren | Redaktøren, Skaperen |
| `report_content` | Ferdig strukturert rapportinnhold | Redaktøren | Eksportmodulen |

Fordelen: enhver agent kan når som helst se hele systemtilstanden, og alt er
persistent — et krasj mister aldri arbeid.

### 4.2 Meldingskø: hendelsesdrevet trigging

Agenter venter ikke aktivt på hverandre; de trigges av meldinger i
`agent_messages`-tabellen (polling hvert minutt):

```json
{
  "id": 1123,
  "from": "analytikeren",
  "to": "skaperen",
  "type": "INSIGHTS_READY",
  "payload": {"insight_ids": [88, 89, 91], "cycle": "2026-07-07"},
  "created_at": "2026-07-07T23:00:04+02:00",
  "acked_at": null
}
```

**Meldingstyper:**

| Type | Fra → Til | Betydning |
|---|---|---|
| `NEW_MEMORY_BATCH` | Arkivaren → Analytikeren | Nye minnepakker klare |
| `INSIGHTS_READY` | Analytikeren → Skaperen | Innsikter klare for generering |
| `DRAFTS_READY` | Skaperen → Redaktøren | Utkast klare for QA |
| `REVISION_REQUEST` | Redaktøren → Skaperen | Utkast X trenger forbedring: <begrunnelse> |
| `REPORT_READY` | Redaktøren → Orkestratoren | Rapportinnhold komplett |
| `PHASE_START` / `PHASE_END` | Orkestratoren → alle | Fasegrenser i 24t-loopen |
| `HEARTBEAT` | Alle → Orkestratoren | «Jeg lever» hvert 5. minutt |

### 4.3 Samarbeidsregler

1. **Én skriver per tabell-rad:** Kun eieragenten endrer sine rader; andre
   agenter leser. Unntak: Redaktøren kan endre `status`-feltet på drafts.
2. **Ack-plikt:** En melding regnes som levert først når mottaker setter
   `acked_at`. Uacke'de meldinger eldre enn 15 min re-varsles av orkestratoren.
3. **Sporbarhet:** Alle innsikter refererer minnepakke-ID-er; alle utkast
   refererer innsikts-ID-er. Rapporten kan dermed alltid forklare «hvorfor
   foreslår du dette?».
4. **Revisjonstak:** Maks 2 revisjonsrunder per utkast — deretter forkastes det.
   Hindrer evige løkker mellom Skaperen og Redaktøren.
5. **Fasedisiplin:** Utenfor sin hovedfase kjører agenter kun lettvektsarbeid
   (Arkivarens polling); tunge jobber skjer i tildelt tidsvindu.

---

## 5. 24-timers loop: detaljert timeline

Syklusen starter kl. 06:00 (rett etter forrige rapportlevering) og følger denne
timeplanen. Alle tider er lokal tid.

```
06:00 ──► RAPPORT LEVERT — ny syklus starter
   │
06:00–22:00   FASE 1: INNSAMLING (16 timer)
   │   • Arkivaren poller kilder hvert 30. min, bygger dagens raw_memory
   │   • Analytikeren gjør lett løpende analyse per batch (tematagging)
   │   • Skaperen og Redaktøren: i dvale (kun heartbeat)
   │
22:00–23:00   FASE 2: DYBDEANALYSE (1 time)
   │   • Arkivaren gjør siste innsamlingsrunde kl. 22:00, deretter frys
   │   • Analytikeren kjører full analyse over hele døgnets data:
   │     klynging, trådsporing, trender, gap-deteksjon
   │   • Kl. 23:00: INSIGHTS_READY sendes til Skaperen
   │
23:00–03:00   FASE 3: SKAPING (4 timer)
   │   • Skaperen genererer idéer, videreføringsforslag, utkast og
   │     prioriteringsforslag basert på innsiktene
   │   • Leverer i puljer: DRAFTS_READY sendes per pulje (ca. hver time),
   │     slik at Redaktøren kan starte QA parallelt fra kl. 00:00
   │
03:00–05:00   FASE 4: REDIGERING & QA (2 timer)
   │   • Redaktøren fullfører kvalitetssjekk og faktakontroll
   │   • Revisjonssløyfer med Skaperen (maks 2 runder, frist kl. 04:30)
   │   • Strukturering av rapportinnhold + skriving av sammendrag
   │   • Kl. 05:00 (hard frist): REPORT_READY til orkestratoren
   │
05:00–06:00   FASE 5: EKSPORT & VEDLIKEHOLD (1 time)
   │   • 05:00–05:15: Eksportmodulen genererer .docx fra report_content
   │   • 05:15–05:30: Valideringssjekk av dokumentet (åpnes og verifiseres)
   │   • 05:30–05:45: Arkivering: rapport + syklusens data merkes med
   │     syklus-ID; gamle rådata (>30 dager) komprimeres
   │   • 05:45–06:00: Helsesjekk, opprydding i meldingskø, nullstilling
   │     av vannmerker for ny syklus
   ▼
06:00 ──► daglig_rapport_YYYY-MM-DD.docx ligger i output/ — loop repeteres
```

**Sikkerhetsmarginer:** Hver fase har en hard frist. Hvis en fase ikke er ferdig,
går systemet videre med det som finnes («graceful degradation») — en tynnere
rapport kl. 06:00 er alltid bedre enn ingen rapport. Manglende innhold noteres i
rapportens vedlegg.

---

## 6. Output-format: .docx-rapporten

**Filnavn:** `output/daglig_rapport_YYYY-MM-DD.docx`
**Generering:** `python-docx`-biblioteket, fra en mal (`templates/rapportmal.docx`)
med definerte stiler.

### 6.1 Dokumentstruktur

| # | Seksjon | Innhold | Kilde-agent |
|---|---|---|---|
| — | **Forside** | Tittel, dato, syklus-ID, systemversjon | Eksportmodul |
| 1 | **Sammendrag** | 5–10 linjer: dagens viktigste funn og anbefalinger | Redaktøren |
| 2 | **Dagens aktivitet** | Hva brukeren faktisk gjorde: temaer, tidsbruk, antall notater/commits, mest aktive prosjekt | Analytikeren |
| 3 | **Innsikter og mønstre** | 3–7 innsikter med konfidensgrad, hver med referanse til grunnlaget («basert på notatet X og samtalen Y») | Analytikeren |
| 4 | **Uferdige tråder** | Liste over påbegynte-men-ikke-fullførte ting, sortert etter alder og viktighet, med foreslått neste steg per tråd | Analytikeren + Skaperen |
| 5 | **Nye idéer og utkast** | Dagens genererte innhold: prosjektidéer, tekstskisser, konsepter — hvert med kort begrunnelse | Skaperen |
| 6 | **Anbefalt fokus i morgen** | Topp 3 prioriteringer med konkret første handling for hver | Skaperen (godkjent av Redaktøren) |
| 7 | **Trend siste 7 dager** | Mini-tabell: temaaktivitet per dag, oppadgående/nedadgående prosjekter | Analytikeren |
| — | **Vedlegg A: Systemlogg** | Antall minnepakker lest, innsikter generert, utkast godkjent/forkastet, ev. feil/hull i syklusen | Orkestratoren |

### 6.2 Formateringsregler

1. **Stiler:** Heading 1 for seksjoner, Heading 2 for underpunkter, egen
   sitat-stil for utdrag fra brukerens egne notater (alltid tydelig merket).
2. **Tabeller:** Seksjon 2 og 7 bruker docx-tabeller; resten er prosa og
   punktlister.
3. **Sporbarhet:** Hver innsikt/idé slutter med en diskret kildelinje i liten
   grå skrift: `[Grunnlag: mem_2026-07-07_0042, insight_88]`.
4. **Lengde:** Målsetting 4–8 sider. Redaktøren kutter heller enn å fylle.
5. **Metadata:** Dokumentegenskaper (author = «Nattugla», title, created)
   settes programmatisk.

---

## 7. Eksempel: én full 24-timers syklus

**Scenario:** Brukeren driver med kreative prosjekter — musikk, satire og
app-idéer (som i dette repoet). Dato: mandag 7. juli 2026.

### 07:12 — Innsamling pågår
Brukeren skriver et notat: *«Idé: sommerlåt om ferjekø — refreng om å stå
stille mens livet går forbi.»* Ved neste polling (07:30) leser Arkivaren
notatet, lager minnepakke `mem_0042` med topics `["musikk", "sangtekst"]`,
og sender `NEW_MEMORY_BATCH`. Analytikeren tagger den løpende mot det
eksisterende temaet «sommerlåt-prosjektet».

### 10:00–16:00 — Dagen fortsetter
Brukeren gjør tre git-commits i satireprosjektet «Nyhetsvarsleren» og har en
samtale i historikken om Vibe-kort-appens fargepalett. Arkivaren fanger alt:
totalt 14 minnepakker denne dagen (5 notater, 3 commits, 4 samtaleutdrag,
2 kalenderoppføringer).

### 22:00–23:00 — Dybdeanalyse
Analytikeren kjører full analyse og produserer blant annet:

- **Innsikt #88** (konfidens 0.9, høy relevans): «Sommerlåt-prosjektet fikk ny
  tekstidé i dag og har hatt aktivitet 4 av siste 5 dager — dette er ukens
  hovedprosjekt.»
- **Innsikt #89** (konfidens 0.8, høy): «Vibe-kort-appen diskuteres ofte
  (3 samtaler denne uken) men har null commits — gap mellom prat og handling.»
- **Innsikt #91** (konfidens 0.7, middels): «Ferjekø-idéen og satireprosjektet
  deler tone (hverdagsironi) — mulig kryssbruk.»

Kl. 23:00: `INSIGHTS_READY` → Skaperen.

### 23:00–03:00 — Skaping
Skaperen leverer i puljer:

- **Utkast A** (bygger på #88): Et refreng-utkast til ferjekø-låten pluss
  forslag til versstruktur.
- **Utkast B** (bygger på #89): Konkret plan for å komme i gang med Vibe-kort:
  «Lag én skjerm-prototype i morgen, 45 min, start med fargepaletten dere
  allerede diskuterte.»
- **Utkast C** (bygger på #91): Satirekonsept: «Ferjekø-monologen» — sketsj
  som gjenbruker låtens univers.
- **Prioriteringsforslag:** 1) Sommerlåt-refrenget, 2) Vibe-kort-prototype,
  3) Ferjekø-sketsjen.

### 03:00–05:00 — Redigering
Redaktøren godkjenner A og B. Utkast C er for tynt — sender `REVISION_REQUEST`:
*«Konseptet mangler poeng/punchline-retning. Gi 2–3 konkrete scener.»*
Skaperen leverer revidert versjon 03:40; godkjennes 03:55. Redaktøren
faktasjekker at «4 av siste 5 dager» i innsikt #88 stemmer mot `raw_memory`
(det gjør det), strukturerer rapporten, skriver sammendraget, og sender
`REPORT_READY` kl. 04:50 — ti minutter før fristen.

### 05:00–06:00 — Eksport
Eksportmodulen genererer `daglig_rapport_2026-07-07.docx`: 6 sider, alle 7
seksjoner + vedlegg. Valideringen åpner dokumentet og bekrefter at alle
seksjoner finnes og at ingen kildelinje peker på slettede ID-er. Gamle data
arkiveres, vannmerker nullstilles.

### 06:00 — Levering
Rapporten ligger i `output/`. Brukeren våkner til et dokument som blant annet
sier: *«Anbefalt fokus i dag: fullfør ferjekø-refrenget (utkast vedlagt i
seksjon 5) — prosjektet har momentum.»* Ny syklus er allerede i gang.

---

## 8. Teknologivalg og implementasjonsdetaljer

| Komponent | Valg | Begrunnelse |
|---|---|---|
| Språk | Python 3.12 | Modent økosystem for alt under |
| Agent-kjerne | Claude API (`claude-fable-5` for Analytiker/Skaper/Redaktør; `claude-haiku-4-5` for Arkivarens klassifisering) | Tunge resonneringssteg trenger sterk modell; lett tagging kan gå billig |
| Delt minne | SQLite (WAL-modus) | Null drift, transaksjoner, én fil, tåler samtidige lesere |
| Scheduler | APScheduler (cron-triggere) i orkestratorprosessen | Fasene i seksjon 5 mappes direkte til cron-uttrykk |
| .docx-generering | `python-docx` + mal | Full kontroll over stiler og tabeller |
| Prosessmodell | Én prosess, agentene som asyncio-tasks | Enklest mulig drift; blackboardet gjør at det kan splittes til flere prosesser senere uten designendring |
| Konfigurasjon | `config.yaml` | Kilder, tidspunkter, ekskluderingsmønstre, modellvalg |
| Logging | Strukturert JSON-logg per agent → `logs/` | Vedlegg A i rapporten genereres herfra |

**Foreslått mappestruktur:**

```
nattugla/
├── config.yaml
├── orchestrator.py          # scheduler + fasestyring + helse
├── agents/
│   ├── arkivaren.py         # memory reader
│   ├── analytikeren.py      # analyzer
│   ├── skaperen.py          # generator
│   └── redaktoren.py        # editor/QA
├── core/
│   ├── blackboard.py        # SQLite-lag, tabelldefinisjoner
│   ├── messages.py          # meldingstyper + ack-logikk
│   └── memory_pack.py       # normalisering + hashing
├── export/
│   ├── docx_builder.py      # python-docx-generering
│   └── validator.py         # etterkontroll av dokumentet
├── templates/rapportmal.docx
├── output/                  # daglig_rapport_YYYY-MM-DD.docx
└── logs/
```

---

## 9. Feilhåndtering og robusthet

1. **Krasjgjenoppretting:** All tilstand ligger i SQLite. Ved omstart leser
   orkestratoren klokka og gjeldende fase, og gjenopptar der syklusen skal være —
   uferdige meldinger (uten `acked_at`) leveres på nytt.
2. **Harde fasefrister:** En fase som overskrider fristen avbrytes; neste fase
   starter med tilgjengelig innhold. Hullet dokumenteres i Vedlegg A.
3. **Kilde nede:** Hvis en minnekilde ikke kan leses, hopper Arkivaren over den
   (vannmerket flyttes ikke, så ingenting mistes) og noterer det i loggen.
4. **API-feil:** Eksponentiell backoff (2s/4s/8s/16s), deretter degradert modus:
   agenten leverer det den rakk.
5. **Tom dag:** Hvis brukeren har vært inaktiv, produseres en kort rapport med
   seksjon 4 (uferdige tråder) og 7 (trender) som hovedinnhold — systemet finner
   alltid noe meningsfullt i det eksisterende minnet.
6. **Rapportvalidering:** Genereres en ugyldig/tom `.docx`, brukes gårsdagens mal
   med feilmelding på forsiden i stedet for at kl. 06:00-leveringen uteblir.

---

*Dokumentversjon 1.0 — designplan klar for implementasjon.*
