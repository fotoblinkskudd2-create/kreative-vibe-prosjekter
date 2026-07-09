# 1. Auto-Retro Loop

> Hver kodesesjon avsluttes med en 60-sekunders retro som destillerer lærdom rett inn i `CLAUDE.md` — så neste sesjon starter smartere enn forrige.

## Problem

Solopreneurs gjentar de samme feilene på tvers av AI-kodesesjoner: agenten glemmer at prosjektet bruker `pnpm` og ikke `npm`, at testene må kjøres fra `apps/web`, at du hater klasser i Python-koden din. Hver sesjon starter på null. Kunnskapen fantes — i forrige sesjons kontekst — men fordampet da vinduet lukket.

Kostnad: 10–20 min re-forklaring per sesjon × 3 sesjoner/dag = ~1 time daglig tapt til repetisjon.

## Solution

En `/retro`-skill + en `retro-analyst`-subagent. Når du avslutter en sesjon (eller når som helst), kjører du `/retro`. Subagenten leser sesjonens diff og feilskritt, destillerer maks 3 lærdommer, og appender dem til `CLAUDE.md` under `## Lært av erfaring` — med dato, slik at gamle regler kan prunes. Neste sesjon leser Claude Code `CLAUDE.md` automatisk, og loopen er lukket.

## Architecture

```
Du: /retro
      │
      ▼
[Skill: retro] ──spawner──▶ [Subagent: retro-analyst]
                                  │ 1. git diff + git log for sesjonen
                                  │ 2. Identifiser: hva feilet først og
                                  │    ble rettet? Hvilke instrukser
                                  │    måtte gjentas?
                                  │ 3. Destiller ≤3 regler, ≤120 tegn hver
                                  ▼
                            CLAUDE.md («## Lært av erfaring»)
                                  │
                                  ▼ (automatisk, neste sesjon)
                            Claude Code leser CLAUDE.md ved oppstart
```

- **Skill** (`.claude/skills/retro/SKILL.md`): brukerens inngangspunkt, definerer format og budsjett.
- **Subagent** (`.claude/agents/retro-analyst.md`): gjør analysen i eget kontekstvindu så hovedsamtalen ikke forurenses.
- **Lager:** ren git — hver retro er en commit du kan se og reverte.

## Code Core

Alt ligger ferdig i dette repoet:

- [`.claude/skills/retro/SKILL.md`](../../.claude/skills/retro/SKILL.md)
- [`.claude/agents/retro-analyst.md`](../../.claude/agents/retro-analyst.md)

Kjernen i subagent-prompten (den viktigste delen å få riktig):

```markdown
Destiller MAKS 3 lærdommer fra sesjonen. En lærdom kvalifiserer bare hvis:
1. Den ville endret agentens FØRSTE forsøk (ikke bare «vær nøye»)
2. Den er repo-spesifikk (generelle råd hører ikke hjemme her)
3. Den kan uttrykkes på ≤120 tegn som en imperativ regel

Format: `- [YYYY-MM-DD] Regel. (kilde: én linje om hva som skjedde)`

Hvis seksjonen «## Lært av erfaring» har over 20 linjer: slett de eldste
reglene som overlapper nyere, FØR du legger til nye. Budsjettet er hardt.
```

## Validation Metrics

| Metrikk | Måling | Mål etter 2 uker |
|---------|--------|------------------|
| Re-forklaringer per sesjon | Tell ganger du korrigerer agenten på noe du har sagt før | −70 % |
| Første-forsøk-treff | Andel oppgaver løst uten at du må rette kurs | +30 % |
| CLAUDE.md-slitasje | Linjer i «Lært av erfaring» (skal holde seg ≤ 20) | Stabil, ikke voksende |
| Regel-treff | Regler som faktisk påvirket en sesjon (spør agenten: «hvilke regler brukte du?») | ≥ 50 % av reglene |

Billig test: kjør 5 sesjoner med loop og 5 uten på samme type oppgaver, sammenlign antall korrigeringer.

## 7-dagers Action Plan

- **Dag 1:** Kopier skill + agent inn i ditt mest aktive repo. Kjør `/retro` etter dagens siste sesjon.
- **Dag 2–3:** Bruk normalt. Kjør `/retro` etter hver sesjon. Ikke rediger reglene manuelt ennå — se hva loopen produserer.
- **Dag 4:** Første prune-sjekk: les «Lært av erfaring». Slett regler du er uenig i. (Dette er treningssignal — noter *hvorfor* i commit-meldingen.)
- **Dag 5:** Test loopen: start en fersk sesjon med en oppgave som ligner en tidligere feil. Traff agenten riktig på første forsøk?
- **Dag 6:** Juster budsjettet i SKILL.md hvis reglene er for mange/få (standard: 3 per retro, 20 totalt).
- **Dag 7:** Mål: sammenlign korrigeringer dag 1 vs. dag 7. Over 30 % bedring → rull ut til de andre repoene dine.
