# Multi-agent system: "Minnevokteren"

Detaljert arkitekturplan for et autonomt multi-agent system som leser brukerens
minne/historikk, lar spesialiserte agenter samarbeide om å analysere den, og
som hver 24. time leverer en ferdig .docx-rapport.

---

## 0. Arkitektur-diagram (tekstformat)

```
                         ┌─────────────────────────────┐
                         │      DATAKILDER (input)      │
                         │  - Samtalehistorikk / chatlogg│
                         │  - Notater / dagbok           │
                         │  - Kalender & oppgaveliste     │
                         │  - Tidligere rapporter (.docx) │
                         └───────────────┬───────────────┘
                                         │  (poll / event)
                                         ▼
                         ┌─────────────────────────────┐
                         │      1. MEMORY-AGENT          │
                         │  Henter, renser og strukturerer│
                         │  rådata fra minnet             │
                         └───────────────┬───────────────┘
                                         │  strukturert datapakke
                                         ▼
                    ┌────────────────────────────────────────┐
                    │        DELT ARBEIDSMINNE (BLACKBOARD)    │
                    │  Sentral meldingskø + delt state-lager   │
                    │  (alle agenter leser/skriver hit)        │
                    └───────┬───────────────┬──────────────┬──┘
                            │               │              │
                 ┌──────────▼───────┐ ┌─────▼──────┐ ┌─────▼───────────┐
                 │ 2. ANALYSE-AGENT  │ │3. KOORDINATOR│ │ 4. SKRIVE-AGENT │
                 │ Finner mønstre,   │◄│  (Orchestrator)│► Formulerer     │
                 │ temaer, sentiment,│ │ Planlegger,   │ │ tekst, kapitler,│
                 │ prioriteringer    │ │ tildeler,     │ │ sammendrag      │
                 │                   │ │ løser konflikt│ │                 │
                 └──────────┬────────┘ └──────┬───────┘ └────────┬────────┘
                            │                  │                  │
                            └────────►  5. KVALITETS-AGENT ◄──────┘
                                       Faktasjekk, konsistens,
                                       tone-of-voice, GDPR-filter
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │  6. EKSPORT-AGENT    │
                                   │  Genererer .docx      │
                                   │  (python-docx)         │
                                   └──────────┬────────────┘
                                              ▼
                                   ┌────────────────────┐
                                   │  Levert rapport      │
                                   │  rapport_YYYY-MM-DD.docx│
                                   └────────────────────┘
```

Alle agentene kjører som uavhengige prosesser/tjenester og kommuniserer
utelukkende via **blackboard-laget** (en meldingskø + delt datastruktur),
aldri direkte med hverandre. Dette gjør systemet løst koblet og enkelt å
skalere eller bytte ut enkeltagenter.

---

## 1. Agent-roller

### 1.1 Memory-agent (Hukommelse-agent)
**Ansvar:** Eneste agent med lese-tilgang til rådatakildene. Henter ny
aktivitet siden forrige kjøring, anonymiserer/renser den, og legger den på
blackboardet som strukturerte "minne-objekter".

- Input: rå tekst/hendelser fra kilder (se kap. 2)
- Output: `MemoryChunk[]` — JSON-objekter med `{timestamp, kilde, type, innhold, metadata}`
- Kjøreregel: kjører inkrementelt (henter kun delta siden `last_sync_token`)
- Feilhåndtering: ved utilgjengelig kilde logges det og agenten fortsetter med de kildene som svarer

### 1.2 Analyse-agent (Innsikt-agent)
**Ansvar:** Leser `MemoryChunk`-strømmen og produserer innsikt:
- Temaklynging (hvilke prosjekter/tema gikk igjen?)
- Sentiment- og energinivå-analyse
- Identifisering av uløste oppgaver, løfter og beslutninger
- Trendsammenligning mot forrige 24-timersperiode

Output: `InsightReport` — strukturert liste med temaer, nøkkelsitater,
prioritert oppgaveliste og en «endring siden i går»-vurdering.

### 1.3 Koordinator-agent (Orchestrator)
**Ansvar:** Systemets «prosjektleder». Har ingen egen domenekunnskap, men:
- Styrer rekkefølgen agentene aktiveres i (state machine, se kap. 4)
- Tildeler oppgaver via meldinger på blackboardet (`task:analyse`, `task:write`, …)
- Overvåker timeouts — hvis en agent ikke svarer innen fastsatt tid, eskaleres eller kjøres på nytt
- Løser konflikter, f.eks. hvis Analyse-agenten og Skrive-agenten er uenige om prioritet på et tema
- Fører en kjørelogg (audit trail) for hele syklusen

### 1.4 Skrive-agent (Report Writer)
**Ansvar:** Omformer `InsightReport` til sammenhengende, lesbar prosa
strukturert i kapitler (se kap. 5). Tilpasser tone (nøytral/oppsummerende)
og genererer overskrifter, sammendrag og anbefalinger.

### 1.5 Kvalitets-agent (QA / Reviewer)
**Ansvar:** Siste kontrollpunkt før eksport:
- Faktasjekk mot kildedataene (unngå hallusinasjon/oppspinn)
- Konsistenssjekk (motsier rapporten seg selv?)
- Personvernfilter — fjerner sensitive data som ikke skal med i eksportert dokument
- Sender rapporten tilbake til Skrive-agenten med kommentarer dersom noe feiler, maks 2 revisjonsrunder

### 1.6 Eksport-agent (Formatter)
**Ansvar:** Tar den godkjente rapport-teksten og bygger `.docx`-filen
(stiler, innholdsfortegnelse, topptekst/bunntekst, metadata), lagrer den på
disk/skylagring og varsler brukeren.

---

## 2. Input-prosess — hvordan systemet leser fra minnet/historikken

1. **Kildeadaptere**: Hver datakilde (chatlogg, notat-app, kalender,
   tidligere rapporter) har en egen adapter som eksponerer et enhetlig
   grensesnitt: `fetch_since(timestamp) -> RawEvent[]`.
2. **Delta-henting**: Memory-agenten lagrer en `last_sync_token` per kilde i
   en liten tilstandsdatabase (SQLite/JSON), slik at hver kjøring kun henter
   *nye* hendelser — ikke hele historikken på nytt.
3. **Normalisering**: Alle `RawEvent` konverteres til et felles skjema:
   ```json
   {
     "id": "uuid",
     "timestamp": "2026-07-02T08:14:00Z",
     "kilde": "chatlogg | notat | kalender | rapport",
     "type": "melding | hendelse | oppgave | idé",
     "innhold": "...",
     "tags": ["prosjekt-x", "musikk"]
   }
   ```
4. **Rensing og filtrering**: Fjerner duplikater, støy (system-meldinger),
   og maskerer PII (personnummer, passord, adresser) før dataene forlater
   Memory-agenten.
5. **Publisering**: Den ferdige batchen legges på blackboardet med
   meldingstypen `memory.updated`, som trigger neste steg i loopen.

---

## 3. Koordinasjonsmekanisme

**Mønster: Blackboard + meldingskø (pub/sub), styrt av en state machine i
Koordinator-agenten.**

- **Delt blackboard**: Et sentralt lager (f.eks. Redis eller en enkel
  SQLite-tabell) hvor alle mellomresultater lagres med versjon og
  tidsstempel. Ingen agent snakker direkte med en annen — alt går via
  blackboardet, noe som gjør systemet observerbart og lett å feilsøke.
- **Meldingstyper**:
  | Melding | Sendt av | Trigger for |
  |---|---|---|
  | `memory.updated` | Memory-agent | Analyse-agent starter |
  | `insight.ready` | Analyse-agent | Skrive-agent starter |
  | `draft.ready` | Skrive-agent | Kvalitets-agent starter |
  | `qa.approved` / `qa.rejected` | Kvalitets-agent | Eksport-agent starter / Skrive-agent reviderer |
  | `export.done` | Eksport-agent | Loop avsluttes, varsel sendes |
- **State machine (Koordinator)**: `IDLE → HENTER_MINNE → ANALYSERER →
  SKRIVER → KVALITETSSIKRER → (REVIDERER)* → EKSPORTERER → FULLFØRT`
- **Timeout & retry**: Hver tilstand har en maks-tid (f.eks. 10 min). Ved
  timeout logges feilen, agenten restartes én gang, deretter eskaleres det
  til en «degradert modus» (rapporten genereres med det som finnes).
- **Konfliktløsning**: Dersom to agenter skriver til samme nøkkel på
  blackboardet, brukes «siste godkjente vinner»-regel, og Koordinatoren
  logger konflikten for manuell gjennomgang senere.

---

## 4. 24-timers loop — detaljert timeline

Systemet kjører **kontinuerlig**, men de fleste agentene er hendelsesdrevne
(reagerer på blackboard-meldinger) mens selve syklusen er tidsstyrt av en
cron-lignende trigger. Eksempel på fast døgnrytme (kan justeres):

| Klokkeslett | Fase | Aktiv agent | Beskrivelse |
|---|---|---|---|
| 00:00–00:10 | **Innhøsting** | Memory-agent | Henter alt av ny aktivitet siden forrige syklus (24t delta) |
| 00:10–00:40 | **Analyse** | Analyse-agent | Temaklynging, sentiment, oppgaveidentifikasjon |
| 00:40–01:10 | **Utkast** | Skrive-agent | Genererer full rapporttekst i kapittelstruktur |
| 01:10–01:30 | **Kvalitetssikring** | Kvalitets-agent | Faktasjekk, konsistens, personvern |
| 01:30–01:40 | **Eksport** | Eksport-agent | Bygger `.docx`, lagrer, varsler bruker |
| 01:40–23:55 | **Kontinuerlig overvåking** | Memory-agent (bakgrunn) | Lytter passivt på nye hendelser i sanntid og mellomlagrer dem, uten å trigge full analyse — holder «varmt» datagrunnlag til neste syklus |
| 23:55–00:00 | **Forberedelse** | Koordinator | Låser dagens datasett, klargjør neste `last_sync_token` |

- Selve *rapport-genereringen* (fase 1–5) tar typisk 60–90 minutter og
  kjøres én gang i døgnet, mens Memory-agenten kan kjøre lette,
  ressursbillige delta-synkroniseringer hyppigere (f.eks. hver time) slik at
  ingenting går tapt.
- Hele syklusen er idempotent: hvis systemet krasjer midtveis, kan
  Koordinatoren gjenoppta fra siste bekreftede tilstand i stedet for å starte
  helt på nytt.

---

## 5. Output-format (.docx-rapport)

**Filnavn:** `Minnerapport_YYYY-MM-DD.docx`

**Struktur:**

1. **Forside**
   - Tittel, dato/periode (f.eks. "2. juli 2026, kl. 00:00–24:00")
   - Automatisk generert av Eksport-agenten (ingen manuelt arbeid)
2. **Sammendrag (1 avsnitt)**
   - 3–5 setninger: hva skjedde, viktigste tema, generell "temperatur" på dagen
3. **Innholdsfortegnelse** (auto-generert med Word-stiler)
4. **Kapittel 1 — Dagens hovedtemaer**
   - Punktliste med de 3–5 mest fremtredende temaene, med korte utdrag/sitater fra kildene
5. **Kapittel 2 — Oppgaver og beslutninger**
   - Tabell: `Oppgave | Status | Kontekst | Foreslått neste steg`
6. **Kapittel 3 — Idéer og kreativt materiale**
   - Relevant for repoets tema (musikkidéer, satireprosjekter, appidéer) — nye idéer fanget opp i historikken
7. **Kapittel 4 — Sentiment- og energitrend**
   - Enkel tekstbeskrivelse + eventuelt en enkel graf/tabell over stemning siste 7 dager
8. **Kapittel 5 — Sammenligning med forrige periode**
   - Hva er nytt, hva har endret seg, hva er uendret
9. **Vedlegg**
   - Rådata-referanser (kilde-ID-er, ikke fullt sensitivt innhold), audit-logg for denne kjøringen
10. **Metadata i dokumentegenskaper**
    - Forfatter: "Minnevokteren – automatisk system", generert-tidspunkt, versjon

**Teknisk generering:** Python med `python-docx`-biblioteket, med en
forhåndsdefinert `.docx`-mal (styles.xml med definerte overskrift- og
brødtekst-stiler) som Eksport-agenten fyller ut programmatisk.

---

## 6. Eksempel — én full 24-timers syklus

**Scenario:** Brukeren har i løpet av dagen chattet om et nytt satireprosjekt,
notert en melodi-idé i notat-appen, og hatt to kalenderavtaler om et
Vibe-kort-app-prosjekt.

1. **00:00** — Memory-agenten våkner, henter delta siden forrige kjøring:
   - 14 chatmeldinger, 1 notat, 2 kalenderoppføringer.
   - Renser og strukturerer til 17 `MemoryChunk`-objekter, publiserer `memory.updated`.
2. **00:12** — Analyse-agenten plukker opp meldingen:
   - Klynger dataene i 3 tema: *"Satireprosjekt X"*, *"Melodi-idé"*, *"Vibe-kort app"*.
   - Oppdager en uløst oppgave: "avklare lisens for satireprosjektet innen fredag".
   - Sentiment: overveiende positivt/engasjert, høy kreativ energi rundt kl. 14–16.
   - Publiserer `insight.ready`.
3. **00:45** — Skrive-agenten genererer utkast:
   - Skriver sammendrag: "Dagen var preget av kreativ aktivitet rundt tre prosjekter…"
   - Fyller ut kapittel 2 med oppgavetabellen, inkludert fristen fredag.
   - Publiserer `draft.ready`.
4. **01:15** — Kvalitets-agenten sjekker:
   - Oppdager at ett sitat i utkastet ikke finnes i kildedataene → sender `qa.rejected` med kommentar.
   - Skrive-agenten retter opp (revisjon 1), sender nytt `draft.ready`.
   - Kvalitets-agenten godkjenner: `qa.approved`.
5. **01:35** — Eksport-agenten bygger `Minnerapport_2026-07-02.docx`, lagrer
   filen, og sender varsel til brukeren (f.eks. e-post eller app-notifikasjon).
6. **01:40–23:55** — Memory-agenten fortsetter å lytte i bakgrunnen. Kl. 14:00
   fanges en ny idé opp ("husk å teste appen med lyd") og mellomlagres — den
   blir en del av *neste* syklus sitt datagrunnlag.
7. **23:58** — Koordinatoren låser dagens datasett og forbereder
   `last_sync_token` for 3. juli, og hele loopen starter på nytt kl. 00:00.

**Resultat:** Brukeren våkner til en ferdig, lesbar `.docx`-rapport som
oppsummerer gårsdagens aktivitet på tvers av alle kildene, uten å ha løftet
en finger selv.

---

## 7. Praktiske implementasjonsnotater

- **Teknologistack (forslag):** Python-orkestrering, Redis eller SQLite som
  blackboard, `python-docx` for eksport, APScheduler/cron for 24-timers
  trigger, hver agent som egen prosess (evt. Docker-container) for isolasjon.
- **Skalering:** Fordi agentene kun kommuniserer via blackboardet, kan hver
  enkelt agent byttes ut eller kjøres flere ganger parallelt (f.eks. flere
  analyse-agenter for ulike datakilder) uten å endre resten av systemet.
- **Personvern:** All maskering/filtrering av sensitive data skjer i
  Memory-agenten og dobbeltsjekkes av Kvalitets-agenten — sensitive rådata
  skal aldri havne uendret i sluttrapporten.
- **Observability:** Koordinatorens audit-logg (kapittel 3) gir full
  sporbarhet for hver 24-timerssyklus — nyttig for feilsøking og for å
  forbedre agentenes prompter/regler over tid.
