# 3. Prompt-Optimizer Loop

> En skill som forbedrer sine egne instrukser: kjør den mot en liten eval-fil, la en subagent analysere tapene, og la den skrive om sin egen SKILL.md — med git som sikkerhetsnett.

## Problem

Du har prompts som er kritiske for businessen (produktbeskrivelser, support-svar, kode-generatorer), men du tuner dem på magefølelse. Du aner ikke om versjon 12 faktisk er bedre enn versjon 9, og forbedringer skjer bare når du orker. Prompt-kvalitet er en asset som burde vokse mens du sover.

## Solution

Tre deler: (1) en **eval-fil** med 10–20 input→forventet-output-par, (2) en `/optimize-prompt`-skill som kjører target-prompten mot alle casene og scorer resultatet, (3) en `prompt-optimizer`-subagent som leser tapene, foreslår én konkret endring i prompten, og committer den *bare hvis scoren gikk opp*. Kjør den ukentlig; prompten klatrer.

## Architecture

```
evals/cases.jsonl (10–20 par, håndplukket — dette er gullstandarden)
      │
      ▼
[Skill: optimize-prompt]
      │ 1. Kjør target-prompt mot alle cases (baseline-score)
      │ 2. Spawn [Subagent: prompt-optimizer]:
      │      - les de N verste casene
      │      - foreslå ÉN endring (aldri flere per iterasjon)
      │ 3. Kjør evals på nytt med endret prompt
      │ 4. score_ny > score_gammel?
      │      ja → commit («prompt v13: +0.08 på tone-cases»)
      │      nei → git checkout (forkast), logg hypotesen som feilet
      ▼
prompts/<navn>.md  (versjonert asset som bare kan bli bedre)
```

Én-endring-per-iterasjon er den viktigste regelen: uten den vet du aldri *hva* som ga effekten, og loopen degenererer til støy.

## Code Core

Ferdig i repoet:

- [`.claude/skills/optimize-prompt/SKILL.md`](../../.claude/skills/optimize-prompt/SKILL.md)
- [`.claude/agents/prompt-optimizer.md`](../../.claude/agents/prompt-optimizer.md)
- [`evals/example-cases.jsonl`](evals/example-cases.jsonl) — malfil du bytter ut med dine egne cases

Eval-caseformat (én linje per case):

```jsonl
{"input": "Kunde klager på sen levering, tredje gang", "must_include": ["beklager", "konkret tiltak"], "must_avoid": ["dessverre er det slik at"], "weight": 2}
```

Scoring er bevisst primitiv — `must_include`/`must_avoid`-sjekker en subagent kan dømme deterministisk nok. Ikke bygg LLM-judge før regex-nivået er utnyttet; det er 10× billigere og godt nok til å drive loopen de første ukene.

## Validation Metrics

| Metrikk | Måling | Mål etter 2 uker |
|---------|--------|------------------|
| Eval-score | Vektet andel beståtte cases | +15–25 % fra baseline |
| Monotoni | Antall commits som *senket* scoren (skal være umulig per design) | 0 |
| Hypotese-logg | Forkastede endringer med notat om hvorfor | ≥ 5 (tap er også læring) |
| Ekte-verden-sjekk | Stikkprøve: er output nr. 1 fra ny prompt faktisk bedre? (deg som dommer) | Ja i ≥ 7/10 |

Billig test: hele loopen koster ~20 LLM-kall per iterasjon. Med 15 cases er én iterasjon < $1.

## 7-dagers Action Plan

- **Dag 1:** Velg din mest brukte prompt. Skriv 10 eval-cases fra *ekte* eksempler (gamle inputs du husker gikk bra/dårlig).
- **Dag 2:** Kopier skill + agent, pek SKILL.md mot prompt- og eval-filen. Kjør baseline — ikke optimaliser ennå, bare mål.
- **Dag 3:** Første optimeringsiterasjon. Les diffen nøye: er endringen fornuftig, eller overtilpasser den til casene?
- **Dag 4:** Legg til 5 nye cases som dekker det prompten fortsatt bommer på. (Eval-filen er også en asset som skal vokse.)
- **Dag 5:** Kjør 2–3 iterasjoner til. Sjekk monotoni-garantien: har noen commit senket scoren? Da er det en bug i skillen.
- **Dag 6:** Ekte-verden-stikkprøve: bruk ny prompt på 10 ferske inputs, sammenlign med gammel versjon side om side.
- **Dag 7:** Sett en ukentlig rutine (fast dag, 15 min): kjør loopen, godkjenn/forkast diffen, legg til 2 nye cases fra ukens ekte bruk.
