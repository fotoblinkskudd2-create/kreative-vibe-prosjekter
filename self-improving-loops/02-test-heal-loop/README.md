# 2. Test-Heal Loop

> En subagent som fikser røde tester — og for hver fiks lagrer *mønsteret* i et fikse-bibliotek, slik at samme klasse feil fikses raskere (eller unngås helt) neste gang.

## Problem

Røde tester er den største tidsluka i solo-utvikling: du kontekst-bytter fra featurearbeid til detektivarbeid. AI-agenter kan fikse dem, men de løser hver feil fra scratch — samme «mock-en mangler async»-feil koster like mange tokens og minutter i oktober som i mars. Ingen læring akkumuleres.

## Solution

En `/heal`-skill som spawner en `test-healer`-subagent. Healeren kjører testene, fikser feilene, og — det selvforbedrende steget — klassifiserer hver fiks og appender mønsteret til `HEALING.md`. Neste gang healeren kjører, leser den `HEALING.md` *først* og prøver kjente mønstre før den debugger fritt. Kjente feilklasser går fra minutter til sekunder.

## Architecture

```
Du: /heal  (eller en cron/CI-trigger)
      │
      ▼
[Subagent: test-healer]
      │ 1. Les HEALING.md (kjente mønstre)      ◀─┐
      │ 2. Kjør testkommando                       │
      │ 3. Per feil: match mot kjent mønster?      │
      │      ja → anvend mønsterfiks (rask sti)    │
      │      nei → debug fritt (treg sti)          │
      │ 4. Verifiser grønt                         │
      │ 5. Nye fikser fra treg sti →               │
      │    destiller mønster, append ──────────────┘
      ▼                            (HEALING.md)
   Commit: fiks + oppdatert mønsterbibliotek
```

- **Rask sti / treg sti**-skillet er kjernen: loopens verdi = andel feil som over tid flyttes til rask sti.
- `HEALING.md` er strukturert per mønster: *symptom-regex → diagnose → fiks-oppskrift*.
- Alt committes sammen, så mønsterbiblioteket har git-historikk.

## Code Core

Ferdig i repoet:

- [`.claude/skills/heal/SKILL.md`](../../.claude/skills/heal/SKILL.md)
- [`.claude/agents/test-healer.md`](../../.claude/agents/test-healer.md)

Mønsterformatet i `HEALING.md` (det som gjør gjenbruk mulig):

```markdown
## Mønster: async-mock-mangler
- **Symptom (regex):** `TypeError: object MagicMock can't be used in 'await'`
- **Diagnose:** Test mocker en async-funksjon med vanlig MagicMock.
- **Fiks:** Bytt til `AsyncMock` fra `unittest.mock`; sjekk alle mocks i samme fil.
- **Treff:** 4 (sist: 2026-07-02)
```

`Treff`-telleren oppdateres ved hver gjenbruk — den er både validering og prune-signal (0 treff på 30 dager → slett).

## Validation Metrics

| Metrikk | Måling | Mål etter 2 uker |
|---------|--------|------------------|
| Rask-sti-andel | Andel feil fikset via kjent mønster (healeren rapporterer per kjøring) | ≥ 40 % |
| Tid til grønt | Fra `/heal` til alle tester passerer | −50 % for kjente feilklasser |
| Regresjon | Fikser som brakk noe annet (fanges av full testkjøring) | 0 |
| Bibliotek-kvalitet | Mønstre med ≥ 2 treff / totalt antall mønstre | ≥ 60 % |

Billig test: introduser bevisst 3 feil av samme klasse over 3 dager. Kjøring 1 skal være treg sti, kjøring 2–3 rask sti.

## 7-dagers Action Plan

- **Dag 1:** Kopier skill + agent. Sett riktig testkommando i SKILL.md (`pytest`, `npm test`, …). Kjør `/heal` på en eksisterende rød test.
- **Dag 2:** Verifiser at `HEALING.md` ble opprettet med minst ett mønster. Les det — er symptom-regexen presis nok til å matche neste gang?
- **Dag 3:** Reproduksjonstest: brekk noe tilsvarende med vilje, kjør `/heal`, og sjekk at healeren rapporterer «rask sti».
- **Dag 4:** Kjør loopen på ditt nest største repo. Mønsterbiblioteket er repo-spesifikt — ikke del på tvers ennå.
- **Dag 5:** Gjennomgå biblioteket: slett mønstre som er for generelle («fiks: les feilmeldingen»). Presisjon > dekning.
- **Dag 6:** Koble på automatikk: kjør `/heal` som fast steg etter større refaktoreringer, eller via `send_later`/cron i Claude Code-økter.
- **Dag 7:** Mål rask-sti-andelen. Over 40 % → vurder å promotere de beste mønstrene til CLAUDE.md så de *forebygger* i stedet for å helbrede.
