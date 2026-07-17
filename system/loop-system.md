# Multi-Layer Loop System

Et prompt-basert, iterativt system for å drive hver monster-run. Alle prompts
under er ordrette og kan limes rett inn i en ny Claude-sesjon. Systemet er
selvforsterkende: Layer 4 skriver til `laerdomslogg.md`, som Layer 1 leser ved
neste kjøring.

## Visualisert struktur

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1 · INPUT PRIMING (kjøres én gang per run)            │
│   Les: README, laerdomslogg.md, ideer/INDEX.md              │
│   Sett: dagens hovedmål + suksesskriterier                  │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2 · PROSESS-LOOP (gjentas 3–6 ganger per run)         │
│                                                             │
│   ┌─> [a] Prompt for aksjon (velg neste oppgave fra plan)   │
│   │   [b] Utfør oppgaven (skriv/bygg/committe)              │
│   │   [c] Analyser resultatet mot suksesskriteriet          │
│   │   [d] Juster parametere (omfang, kategori, ambisjon)    │
│   └── [e] Neste iterasjon — eller exit hvis mål nådd        │
│                                                             │
└──────────────────────────┬──────────────────────────────────┘
                           │  (etter HVER iterasjon)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3 · VERDIUTVINNING (kjøres per iterasjon, 2 min)      │
│   Noter: ny innsikt · høyverdi-innsats · mønster/optimering │
│   Skriv som råtekst-bullets nederst i laerdomslogg.md       │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4 · SYNTHESIZE & CREATE (kjøres én gang, på slutten)  │
│   Produser: dagens finale output (commits pushet)           │
│   Dokumenter: rydd Layer 3-bullets til datert loggseksjon   │
│   Lagre: «neste run starter med…» — input til neste Layer 1 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           └────────► neste runs LAYER 1
```

---

## Layer 1 — Input Priming

**Når:** Første prompt i en ny sesjon/run.

**Prompt (lim inn ordrett):**

> Les `README.md`, `system/laerdomslogg.md` og `ideer/INDEX.md` i repoet
> kreative-vibe-prosjekter. Oppsummer i maks 5 punkter: (1) hvor prosjektet
> står, (2) hva forrige run anbefalte som neste steg, (3) hva som er dagens
> hovedmål gitt dette. Formuler deretter ETT hovedmål for dagens run og 3
> målbare suksesskriterier. Ikke start på arbeidet ennå — vent på bekreftelse.

**Output:** Dagens mål + suksesskriterier. Dette er kontrakten resten av
run-en måles mot.

---

## Layer 2 — Prosess-Loop

**Når:** Gjentas per oppgave/iterasjon til dagens mål er nådd (typisk 3–6 runder).

**Prompt [a] — aksjon:**

> Velg neste uferdige oppgave fra dagens plan. Beskriv i 2 setninger hva du
> skal gjøre og hva «ferdig» betyr for akkurat denne iterasjonen. Utfør den
> deretter fullstendig, og commit resultatet med en beskrivende melding.

**Prompt [c] — analyse (etter utført oppgave):**

> Vurder resultatet mot ferdig-kriteriet du satte: nådd, delvis, eller bom?
> Hvis delvis/bom: hva var den konkrete årsaken (for stort omfang, feil
> verktøy, uklar spesifikasjon)?

**Prompt [d] — justering:**

> Basert på analysen: skal neste iterasjon justere (1) omfang opp/ned,
> (2) kategori/fokus, eller (3) ambisjonsnivå? Velg maks ÉN justering og
> begrunn den i én setning. Gå så til neste iterasjon.

**Exit-kriterium:** Alle dagens suksesskriterier fra Layer 1 er oppfylt,
eller tidsbudsjettet er brukt. Aldri mer enn 6 iterasjoner — da er planen
feil, ikke innsatsen.

---

## Layer 3 — Verdiutvinning

**Når:** Umiddelbart etter hver Layer 2-iterasjon. Maks 2 minutter — dette er
notater, ikke prosa.

**Prompt (lim inn etter hver iterasjon):**

> Før du går videre: legg til tre bullets nederst i `system/laerdomslogg.md`
> under «Ubehandlet»:
> - INNSIKT: én ny ting denne iterasjonen lærte oss om prosjektet eller prosessen
> - HØYVERDI: hvilken konkret innsats ga mest resultat per minutt
> - MØNSTER: én ting som bør gjøres annerledes/automatiseres i senere iterasjoner
>
> Hvis en bullet ville vært tom eller banal, skriv «ingen» — ikke dikt opp verdi.

**Output:** Rå bullets som akkumuleres gjennom dagen. De ryddes ikke her —
det er Layer 4 sin jobb.

---

## Layer 4 — Synthesize & Create

**Når:** Én gang, på slutten av run-en.

**Prompt (lim inn ordrett):**

> Dagens run avsluttes. Gjør tre ting:
> 1. FINALT OUTPUT: Verifiser at alle dagens deliverables er committet og
>    pushet. List dem med filsti.
> 2. DOKUMENTER: Flytt bullets fra «Ubehandlet» i `system/laerdomslogg.md`
>    inn i en ny datert seksjon. Slå sammen duplikater, stryk banaliteter,
>    behold maks 5 innsikter, 3 høyverdi-punkter og 3 mønstre.
> 3. LAGRE FOR NESTE RUN: Avslutt loggseksjonen med «Neste run starter med:»
>    og 1–3 konkrete oppgaver, sortert etter verdi/innsats-forhold basert på
>    scorene i `ideer/INDEX.md`.
> Commit og push loggen til slutt.

**Output:** Pushet sluttresultat + oppdatert logg. Loggseksjonens «Neste run
starter med»-punkt er det Layer 1 leser i neste kjøring — det er dette som
gjør systemet til en lukket loop i stedet for en engangsprosess.

---

## Forventet verdiutvinning fra systemet

- **Per iterasjon:** minst én dokumentert innsikt + ett committet resultat.
  En iterasjon uten begge deler er et signal om at omfanget er feil (juster i [d]).
- **Per run:** 3–6 committede deliverables, en kuratert loggseksjon, og en
  ferdigprioritert startliste for neste run.
- **Over tid:** loggens MØNSTER-punkter er kandidater til automatisering
  (maler, skript, skills). Når samme mønster dukker opp i 2+ runs, bygg
  verktøyet — det er slik run-kostnaden faller for hver kjøring.
