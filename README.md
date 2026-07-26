# kreative-vibe-prosjekter

Prosjekter, musikkidéer, satire, prototyper, salgsmateriell og klar-til-bygg info — drevet av
en strukturert arbeidsloop i stedet for av innfall.

## To deler

### `openclaw/` — maskineriet

**REGNVIKING-30H-MAX**: en 30-timers arbeidsloop med state, agent-rotasjon, vektet
scoringsmodell og logg. Fem sub-agenter, maks tre aktive om gangen, en definition-of-done som
skiller ferdige ting fra skisser.

```bash
python3 openclaw/runner/openclaw.py init --energi 8
python3 openclaw/runner/openclaw.py start
```

Start med [`openclaw/README.md`](openclaw/README.md). Kjører du for første gang: ta
[6-timers testen](openclaw/prompts/6h-testrun.md) før du binder deg til 30.

### `prosjekter/` — det loopen produserer

Én mappe per syklus. Alt som er levert, med logg, scoring og dødsårsaker.

| Syklus | Dato | Verdi | Leveranser |
|---|---|---|---|
| [01](prosjekter/syklus-01/LOGG.md) | 2026-07-26 | 8/10 | [Riblet-Kalkulator](prosjekter/syklus-01/riblet-kalkulator/) · [Suno-pakke «SAKSNUMMER»](prosjekter/syklus-01/gonzo/suno-prompt-pack.md) · [15 scorede ideer](prosjekter/syklus-01/ide-jakt/idebank-scoret.md) · [Patentnotat 001](prosjekter/syklus-01/patent/patentnotat-001-riblet.md) |

## Kjør testene

```bash
python3 openclaw/runner/test_runner.py                              # 14 — loop-mekanikk
python3 prosjekter/syklus-01/riblet-kalkulator/riblet.py --test     # 10 — aerodynamikk
```

## Regler som gjelder alt her

- **Output skal være sterkere enn input.** Null slurv.
- **Ferdige ting slår skisser.** Fire krav i definition-of-done, alle må være oppfylt.
- **Døde ideer slettes aldri** — dødsårsaken er det mest gjenbrukbare vi produserer.
- **Patentnotat skrives i samme øyeblikk** som en teknisk effekt oppdages, ikke etterpå.
  Dokumentér → mål → vurdér → publisér. Aldri motsatt rekkefølge.
