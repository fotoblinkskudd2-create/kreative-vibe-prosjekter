---
name: massive-run-loop
description: "Autonom 24h+ massive run loop basert på Boris Cherny-prinsippet (juni 2026): du bygger ikke prompts, du bygger en loop som prompter seg selv. Loopen finner, gjør og sjekker arbeid mot dine standarder, cycle etter cycle. Utløsere: 'massive run loop', 'start 24h run', 'lag massive-run-loop', 'aktiver massive run', '24h autonomous loop'."
---

# Massive Run Loop

## Overview

Boris Cherny sa det rett ut i juni 2026: den gamle måten var å skrive ett prompt per steg og overvåke hver respons. Den nye måten er å bygge **loopen selv** — du designer reglene én gang, så kjører den 24+ timer uten deg.

Denne skillen er det permanente hjemmet for alle dine lange autonome kjøringer: AI Empire-bygging, drone-R&D, gonzo writing, manifest-arbeid, skill-factory-arbeid — alt som tåler "sett i gang og sjekk loggen i morgen".

Hver cycle i loopen:
1. **Reflekterer** — leser memory + mission, vurderer hva som faktisk er høyest leverage akkurat nå
2. **Velger** ett konkret, avgrenset stykke arbeid
3. **Utfører** det (kode, prompts, docs, design, tekst — hva mission krever)
4. **Sjekker** det mot kvalitetsgaten under
5. **Committer** (fil til disk, git commit, eller artifact — avhengig av kontekst)
6. **Oppdaterer state** og bestemmer neste cycle

Du går ikke inn igjen før loopen sier den er ferdig eller tiden er ute.

## Core Loop Mechanics

Bruk alltid denne strukturen for hver cycle — ikke fritekst, ikke hopp over felt:

```
## CYCLE [N] — [kort beskrivelse] — Remaining: [X]h

**Reflection:**
[Hva har endret seg siden siste cycle? Hva er fortsatt høyest leverage?]

**Selected Task:**
[Ett konkret, avgrenset stykke arbeid — ikke fem]

**Execution / Deliverable:**
[Det faktiske resultatet — kode, fil, tekst, plan. Skal kunne brukes direkte.]

**Self-Critique (score X/10):**
- Strengths:
- Weaknesses:
- Fixes applied (eller "ingen, leveres som er"):

**Commit Action:**
[Eksakt hva som ble lagret/committet — filsti, commit-melding, eller "ingen disk-skriving denne cyclen"]

**Updated State:**
```json
{ ...fullt state.json-objekt, se state.example.json for skjema... }
```

**Next Decision:**
[Continue til neste cycle / Stopp og rapporter / Spør bruker om retning]
```

Den fenced `json`-blokken under Updated State er obligatorisk når `runner.py` kjører loopen — den parses direkte til disk. Ved manuell kjøring (copy-paste) er den valgfri, men anbefalt for å kunne resume senere.

## Kvalitetsgate (minimum 8/10 for commit)

En cycle får IKKE committe arbeid før den scorer 8/10 på alle disse:

- **Practical & copy-paste ready** — ingen "TODO: fyll inn senere"
- **High-signal, minimal fluff** — hvis en linje ikke endrer noe, stryk den
- **Bygger på eksisterende skills** — ikke reimplementer det agent-orchestrator/prompt-orchestra/skill-lager/self-improver allerede løser
- **Tidsbevisst** — arbeidet passer faktisk innenfor remaining time
- **Ærlig self-critique** — svakheter skal stå der, ikke pyntes bort

Scorer arbeidet under 8/10: loopen fikser det i samme cycle (Fixes applied) før den går videre. Den committer aldri "godt nok for nå".

## How to Launch a 24h Run

### Manuell (anbefalt for første gang du kjører en ny mission)

1. Ny fresh session, sterk model (Opus eller Sonnet — se System Prompt under)
2. Lim inn System Prompt-malen fra `system_prompt.md` i denne mappen
3. Start med:
   ```
   Start 24h Massive Run Loop. Mission: [din mission].
   Bruk mitt memory.md som kontekst. Tidsbudsjett: [X]h.
   ```
4. For hver påfølgende cycle: `Continue the loop. Previous output: [hele forrige cycle-output]`
5. Stopp loopen manuelt, eller la den selv si "Mission complete" / "Time budget exhausted"

### Automatisk (runner.py)

Se `runner.py` i denne mappen. Den:
- Laster `state.json` (mission, todo, progress_log, time_elapsed, budget)
- Bygger neste prompt fra System Prompt + forrige cycle-output + memory.md
- Kaller Claude API direkte (ingen menneskelig copy-paste)
- Parser cycle-output, oppdaterer `state.json`, logger til `log.md`
- Stopper selv ved "Mission complete", "STOP", eller når tidsbudsjettet er brukt opp

Kjør med:
```bash
export ANTHROPIC_API_KEY=...
python3 runner.py --mission "Bygg 3 nye skills til skill-lager" --hours 24 --memory ./memory.md
```

## State Management

Hver run har sin egen mappe under `runs/<run-id>/`:

- `state.json` — current_mission, todo_list, progress_log, time_elapsed_hours, budget_hours, status
- `artifacts/` — alle faktiske deliverables (filer, kode, tekster) produsert i runet
- `log.md` — append-only, én cycle per entry, rå output. Skal kunne leses 3 måneder senere og fortelle nøyaktig hva som skjedde og hvorfor.

Se `state.example.json` for skjema.

Etter en run: oppdater ditt eget `memory.md` manuelt eller via `self-improver`/edit_memory-skillen med hva som ble lært — runet sin egen `state.json` er ikke ditt langtidsminne, bare run-loggen.

## Integration med andre skills

- **agent-orchestrator** — når en cycle krever flere sub-agenter parallelt
- **prompt-orchestra** — når en cycle trenger en kjede av flere prompts for å fullføre ett deliverable
- **skill-lager / skill-factory** — når mission *er* "bygg nye skills" (som dette runet selv)
- **self-improver / self-reflection-engine** — kjør hver 5.–10. cycle for å sjekke om loopens egne regler (kvalitetsgate, cycle-struktur) bør justeres

Massive-run-loop er orkestreringslaget over disse — den bestemmer *når* og *hvorfor*, de andre skillene gjør *hvordan*.

## Best Practices

- Start alltid med klar mission + eksplisitt tidsbudsjett. Ingen mission = ingen run.
- 2-3 ting helt ferdig slår 10 ting halvferdig. Selected Task skal være avgrenset nok til å fullføres i én cycle.
- Self-critique skal være brutalt ærlig — en 9/10 du ikke tror på er verre enn en ærlig 6/10 med fixes.
- Når mission er ferdig ELLER tiden er ute: siste cycle er alltid en **sluttrapport** (hva ble levert, hva er ikke gjort, anbefalt neste mission) — ikke bare stoppe stille.
- Logg alt i `log.md`. Loggen er kontrakten med fremtidig-deg.

## Triggers & Usage Examples

- "start 24h massive run loop on my drone anti-icing project"
- "lag massive-run-loop skill"
- "aktiver 24h autonomous loop for family justice manifest"
- "massive run loop – build 3 new skills this run"
- "kjør massive-run-loop, mission: skriv ferdig satire-manuset, budsjett 12 timer"

## Filer i denne skillen

- `SKILL.md` — denne filen
- `system_prompt.md` — fullt System Prompt (v1.1) som limes inn ved manuell kjøring, eller lastes av `runner.py`
- `runner.py` — automatisk runner som kaller Claude API i loop til mission er ferdig eller budsjett er brukt opp
- `state.example.json` — skjema for `state.json` per run
