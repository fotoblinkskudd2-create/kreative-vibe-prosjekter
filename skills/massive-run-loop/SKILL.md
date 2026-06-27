---
name: massive-run-loop
description: "Autonom 24h+ massive run loop basert på Boris Cherny-prinsippet: du bygger ikke prompts for hvert steg, du bygger en loop som finner, gjør og sjekker arbeid selv. Start én gang, la den gå. Utløsere: 'massive run loop', 'start 24h run', 'lag massive-run-loop', 'aktiver massive run', '24h autonomous loop'."
---

# Massive Run Loop

## Overview

Du bygger ikke lenger manuelle prompts for hvert steg. Du bygger en **loop** som prompter seg selv.

Loopen:
- Finner neste høyest-leverage arbeid (basert på mission + tilgjengelig memory/kontekst)
- Gjør arbeidet (kode, prompts, docs, designs, tekster)
- Sjekker arbeidet mot kvalitetsgaten under
- Committer resultatet og oppdaterer state

Du designer systemet én gang. Loopen kjører i 24+ timer (manuelt fortsatt, eller automatisk via `runner.py`). Du sjekker loggen etterpå.

Bruksområder: produktbygging, drone R&D, skriving, manifest-arbeid, eller hvilket som helst annet prosjekt som tåler å brytes ned i tidsboksede cykler.

## Core Loop Mechanics

Hver cykel følger nøyaktig dette formatet (ikke avvik — konsistens er det som gjør loggen lesbar 3 måneder senere):

```
## CYCLE [N] — [kort beskrivelse] — Remaining: [X]h [Y]m

**Reflection:** Hva vet vi nå som vi ikke visste forrige cykel? Hva er fortsatt sant fra mission?
**Selected Task:** Den ENE oppgaven denne cykelen leverer. Ikke en liste.
**Execution / Deliverable:** Selve arbeidet — kode, tekst, fil, design. Konkret og ferdig, ikke skissert.
**Self-Critique (score X/10):** Ærlig. Styrker, svakheter, hva som ble fikset før levering.
**Commit Action:** Den faktiske kommandoen/handlingen som lagrer arbeidet (git commit, skriv fil, osv.)
**Updated State:** Todo-liste, progress-log, tidsestimat oppdatert.
**Next Decision:** Hva cykel N+1 gjør, eller at mission er ferdig.
```

### Kvalitetsgate (minimum 8/10 for å committe)

- Practical & copy-paste/bruksklar — ikke konsept, ikke skisse
- High-signal, minimal fluff
- Bygger på eksisterende skills/verktøy i stedet for å finne opp på nytt
- Tidsbevisst — passer faktisk innenfor remaining time
- Ærlig self-critique — en 10/10 uten svakheter er en rød flagg, ikke en seier

Hvis en cykel scorer under 8/10: fiks innenfor samme cykel før commit, ikke skyv problemet til neste cykel.

## How to Launch a Run

### Manuell (anbefalt for første gang du kjører en mission)

1. Ny fresh session med en sterk modell.
2. Lim inn System Prompt Template (under).
3. Start med:
   ```
   Start massive run loop. Mission: [din mission]. Tidsbudsjett: [Xh]. Bruk [memory/kontekst-fil] som grunnlag.
   ```
4. For hver påfølgende cykel: `Continue the loop. Previous output: [hele forrige cykel-output]`
5. Stopp når mission er ferdig, tidsbudsjettet er brukt opp, eller du aktivt avbryter.

### Automatisk (runner.py)

`runner.py` i denne mappen automatiserer "lim inn forrige output, be om neste cykel"-mønsteret ved å kalle Claude API i en loop, persistere state til disk, og logge hver cykel til en fil. Se kommentarene i scriptet for oppsett (API-nøkkel via miljøvariabel, ikke hardkodet).

Kjør:
```
python3 runner.py --mission "din mission her" --hours 24 --workdir ./run-<dato>
```

## System Prompt Template

Lim inn dette som system prompt (eller første melding) når du starter en run manuelt:

```
Du kjører en Massive Run Loop. Du er IKKE en chatbot som venter på instruksjoner per steg —
du er en autonom executor som finner, gjør og sjekker arbeid mot en mission, cykel for cykel.

MISSION: {{MISSION}}
TIDSBUDSJETT: {{HOURS}} timer
KONTEKST: {{CONTEXT_OR_MEMORY}}

Regler:
1. Hver respons er ÉN cykel i formatet beskrevet under "Core Loop Mechanics" i massive-run-loop skillen.
2. Velg alltid den ENE høyeste-leverage oppgaven for denne cykelen — ikke spre deg over flere.
3. Lever faktisk arbeid i "Execution / Deliverable", ikke en plan for arbeid.
4. Score deg selv ærlig. Under 8/10 → fiks det før du går videre, i samme cykel.
5. Oppdater state (todo, progress log, tid brukt) ved slutten av hver cykel slik at neste cykel
   (som ikke har annen kontekst enn det du skriver) kan fortsette uten å miste tråden.
6. Når mission er ferdig eller tidsbudsjettet er brukt opp: skriv en sluttrapport med hva som ble
   levert, hva som gjenstår, og anbefalt neste mission. Stopp der — ikke fortsett å finne på arbeid.
7. Hvis du står fast eller mission er uklar: si det rett ut i Reflection, still ETT konkret
   spørsmål, og vent. Gjett ikke deg videre forbi en ekte blocker.

Start med CYCLE 1 nå.
```

## State Management

Anbefalt struktur per run, i `run-<dato>/`:

```
run-<dato>/
  state.json       # current_mission, hours_budget, hours_used, todo[], progress_log[]
  artifacts/        # alle leverte filer/deliverables fra cyklene
  cycles.log        # full output av hver cykel, i kronologisk rekkefølge
```

`state.json`-skjema:

```json
{
  "mission": "string",
  "hours_budget": 24,
  "hours_used": 0,
  "cycle": 1,
  "todo": ["string"],
  "progress_log": [
    { "cycle": 1, "summary": "string", "score": 8.7 }
  ]
}
```

Oppdater `state.json` manuelt etter hver manuell cykel, eller la `runner.py` gjøre det automatisk.

## Integration med andre skills

- **agent-orchestrator** — når en cykel krever å koordinere flere sub-agenter parallelt
- **prompt-orchestra** — når en cykel krever komplekse prompt-kjeder
- **skill-lager / skill-factory** — når en cykel sin deliverable er en ny skill
- **self-improver / self-reflection-engine** — for meta-forbedring av loopen selv midt i en run

Massive-run-loop er orkestrerings-laget over disse — den bestemmer NÅR og HVORFOR de andre skillene brukes, cykel for cykel.

## Best Practices

- Start alltid med en klar, énlinjes mission og et eksplisitt tidsbudsjett.
- Vær brutal i self-critique — en loop som alltid scorer 10/10 lyver for seg selv.
- Prioriter "2-3 ting helt ferdig" over "10 ting startet."
- Når mission er ferdig eller tiden er ute: lever en sluttrapport + anbefalt neste mission.
- Logg alt i `cycles.log`. Målet er at loggen er forståelig 3 måneder senere uten ekstra kontekst.

## Triggers & Usage Examples

- "start 24h massive run loop on my drone anti-icing project"
- "lag massive-run-loop skill"
- "aktiver 24h autonomous loop for family justice manifest"
- "massive run loop – build 3 new skills this run"
