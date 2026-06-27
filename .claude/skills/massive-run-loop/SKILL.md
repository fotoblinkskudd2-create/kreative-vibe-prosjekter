---
name: massive-run-loop
description: "Autonom, lang (timer/dager) loop som finner, gjør og sjekker arbeid selv mot en gitt mission. Brukes når man vil starte en lengre selvstyrt kjøring i stedet for å skrive manuelle prompts for hvert steg. Utløsere: 'massive run loop', 'start lang loop på X', 'kjør autonomt på X', 'lag massive-run-loop', '24h autonomous loop'."
---

# Massive Run Loop

## Overview

Vanlig bruk av Claude Code er ett prompt -> ett svar -> nytt prompt. Denne skillen
bytter det ut med en **selvstyrt loop**: du gir en mission og et tidsbudsjett én gang,
og loopen kjører gjennom flere "cycles" der den selv velger neste høyest-leverage
oppgave, gjør jobben, sjekker den mot kvalitetskrav, og committer resultatet før den
går videre til neste cycle.

Du designer mission og rammer én gang. Loopen gjør resten. Du leser loggen etterpå.

Passer for: bygge ut et prosjekt over mange filer, skrive/redigere en lengre tekst i
flere passeringer, bygge flere relaterte verktøy/skript, eller annet arbeid som er
for stort for én respons men ikke krever menneske-i-loopen for hvert steg.

**Ikke** bruk denne for: noe som krever godkjenning per steg (betalinger, push til
delte branches uten avtale, destruktive operasjoner), eller jobber som er ferdig på
1-2 prompts — da er en vanlig samtale raskere.

## Hvordan loopen faktisk kjører i Claude Code

Det finnes ingen "ekstern runner" som genererer nye Claude-svar av seg selv — Claude
Code er request/response. "Loopen" er derfor implementert med ett av disse to ekte
mekanismene:

1. **`/loop` skillen** (finnes allerede i denne installasjonen) — planlegger et
   gjentakende /loop-kall med `ScheduleWakeup`. Bruk denne når cyklene skal trigges
   med jevne mellomrom (f.eks. hver 20-30 min) over lang tid, og sesjonen kan ligge
   stille mellom hver.
2. **Selv-kjedet i én sesjon** — i samme samtale, etter hver cycle, kall selv
   `ScheduleWakeup` (for tidsstyrt fortsettelse) eller bare fortsett direkte til neste
   cycle hvis ingen ventetid er nødvendig. Dette er det enkleste oppsettet og det som
   brukes i eksemplene under.

Velg (1) når cyklene skal spres ut over lang reell tid (timer/dager med pauser),
og (2) når cyklene skal kjøre tett etter hverandre i én sammenhengende sesjon.

## Cycle-format

Hver cycle skal følge nøyaktig denne strukturen i svaret:

```
## CYCLE [N] — [kort beskrivelse] — Gjenstående tid: [X]

**Refleksjon:** hva er sant nå, hva har endret seg siden forrige cycle
**Valgt oppgave:** den ene tingen som gir mest verdi akkurat nå
**Utførelse / Leveranse:** faktisk gjort arbeid (kode, filer, tekst) — ikke planer
**Egenkritikk (score X/10):** ærlig vurdering, minimum 8/10 før commit
**Commit-handling:** faktiske kommandoer/filendringer som er utført, ikke forslag
**Oppdatert state:** todo-liste, progress-log, tids-estimat
**Neste beslutning:** fortsett til neste cycle, eller stopp og rapporter
```

**Kvalitetsgate før commit (alle må være sanne):**
- Praktisk og direkte brukbart, ikke en plan om å gjøre noe
- Høy signal/fluff-ratio — ingen pynt uten substans
- Faktisk skrevet/endret filer, ikke bare beskrevet dem
- Passer innenfor gjenstående tidsbudsjett
- Egenkritikken er ærlig, ikke selvskryt

Hvis en cycle ikke når 8/10: fiks den i samme cycle før du går videre, ikke i en
"cycle 2 skal fikse dette"-kommentar.

## Hvordan starte en run

1. Skriv mission og tidsbudsjett tydelig:
   `Start massive run loop. Mission: [konkret mål]. Budsjett: [X timer/cycles].`
2. Første cycle: les relevant kontekst (filer, evt. memory/notater brukeren peker på),
   bryt mission ned, og kjør cycle 1 med faktisk leveranse — ikke bare en plan for
   cycle 1.
3. Etter hver cycle: oppdater `state.json` (se under), og bestem selv om du fortsetter
   direkte eller schedulerer neste cycle med `ScheduleWakeup`.
4. Stopp når mission er ferdig, tidsbudsjettet er brukt opp, eller du står fast —
   i alle tilfeller: skriv en sluttrapport (se under).

## State-håndtering

Bruk én `state.json` per run, i samme mappe som arbeidet skjer i (se
`state.template.json` i denne skill-mappen for struktur). Oppdater den *i* cycle-en,
ikke som et eget steg etterpå — det er lett å glemme.

Felter: `mission`, `budget`, `time_elapsed`, `cycle`, `todo` (liste), `done` (liste),
`log` (kort linje per cycle), `status` (`running` / `done` / `stuck`).

## Sluttrapport (når loopen avsluttes)

```
## MASSIVE RUN LOOP — SLUTTRAPPORT
Mission: ...
Cycles kjørt: N over [tid]
Levert: [konkret liste over filer/resultater, med stier]
Ikke fullført: [hva som står igjen, hvorfor]
Anbefalt neste mission: ...
```

## Eksempler

- "Start massive run loop. Mission: bygg ut prosjektoversikten i README.md til en
  full prosjektmappe-struktur med en undermappe per idé. Budsjett: 5 cycles."
- "Massive run loop på dette repoet — gå gjennom alle prosjektidéer i README og lag
  et kort konsept-dokument for hver. Budsjett: 2 timer."
- "Start lang loop: skriv ferdig drafts for de 3 første satire-prosjektene nevnt i
  README, én per cycle, med egenkritikk før commit."

## Verktøy denne skillen typisk bruker

- `TaskCreate`/`TaskUpdate` for å holde todo-listen synlig mellom cycles
- `Agent` (subagent) når en cycle krever bred research uten å fylle hovedkonteksten
- `ScheduleWakeup` når cycles skal spres ut over reell tid i stedet for kjøres tett
- Vanlige fil- og git-verktøy (`Read`/`Write`/`Edit`/`Bash`) for selve leveransen

Denne skillen erstatter ikke `/loop` (intervall-kjøring av én kommando) — den definerer
*innholdet og strukturen* i hver cycle når jobben er stor og selvstyrt nok til å
trenge egen refleksjon og kvalitetskontroll per runde.
