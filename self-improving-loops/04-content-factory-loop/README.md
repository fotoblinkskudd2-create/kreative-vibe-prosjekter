# 4. Content-Factory Loop

> En innholdspipeline som lærer av tallene dine: hver uke mater du inn engasjementsdata, en subagent finner mønstrene i vinnerne, og neste ukes briefs skrives med de mønstrene bakt inn.

## Problem

Solopreneurs produserer innhold (LinkedIn, nyhetsbrev, YouTube-beskrivelser, produkttekster) på ren intuisjon. Dataene finnes — visninger, klikk, svar — men de kobles aldri tilbake til *produksjonen*. Resultat: du gjentar det som føles bra i stedet for det som målbart virker, og AI-generert innhold forblir like generisk i måned 6 som i uke 1.

## Solution

En `playbook`-drevet fabrikk: `/content`-skillen genererer utkast styrt av `PLAYBOOK.md` (dine dokumenterte vinnermønstre). Ukentlig kjører du `/content-retro` med ukens tall (en CSV-eksport eller bare tall limt inn i chatten). En `content-analyst`-subagent sammenligner topp- og bunn-innhold, destillerer 1–2 mønsterhypoteser, og oppdaterer playbooken. Neste ukes utkast arver automatisk det som vant.

## Architecture

```
PLAYBOOK.md (vinnermønstre + forbudsliste)
      │ styrer
      ▼
[Skill: content] ──▶ utkast ──▶ du publiserer ──▶ verden reagerer
                                                       │
      uke slutt: /content-retro + ukens tall ◀─────────┘
                        │
                        ▼
              [Subagent: content-analyst]
                        │ 1. Ranger ukens poster på metrikk
                        │ 2. Kontrast topp-25 % mot bunn-25 %:
                        │    hook-type, lengde, format, tema, CTA
                        │ 3. Destiller ≤2 hypoteser, merk som UPRØVD
                        │ 4. Promoter forrige ukes UPRØVDE hypoteser
                        │    som fikk data: BEKREFTET eller AVKREFTET
                        ▼
                  PLAYBOOK.md (oppdatert) ──▶ tilbake til toppen
```

Hypotese-livssyklusen (UPRØVD → BEKREFTET/AVKREFTET) er det som hindrer playbooken i å bli en haug med overtro: en regel må overleve en uke med ekte data før den blir permanent.

## Code Core

Ferdig i repoet:

- [`.claude/skills/content/SKILL.md`](../../.claude/skills/content/SKILL.md)
- [`.claude/skills/content-retro/SKILL.md`](../../.claude/skills/content-retro/SKILL.md)
- [`.claude/agents/content-analyst.md`](../../.claude/agents/content-analyst.md)
- [`PLAYBOOK.template.md`](PLAYBOOK.template.md) — startpunkt for din egen playbook

Playbook-format:

```markdown
## Bekreftede mønstre
- [BEKREFTET 2026-06-28, n=8] Hooks som stiller et spørsmål slår påstander (+40 % visninger).

## Hypoteser under test
- [UPRØVD, fra uke 27] Poster under 120 ord får flere svar enn lange.

## Forbudsliste (avkreftet eller off-brand)
- [AVKREFTET uke 26] Emojis i første linje. Ingen målbar effekt, dropp.
```

## Validation Metrics

| Metrikk | Måling | Mål etter 4 uker |
|---------|--------|-------------------|
| Median-engasjement | Per post, uke over uke | +20 % |
| Hypotese-omløp | Hypoteser som får en dom (bekreftet/avkreftet) per uke | ≥ 1 |
| Gulv-heving | Din *dårligste* post denne uken vs. baseline-median | Bunnen løftes — det er fabrikkens jobb |
| Redigeringstid | Tid fra utkast til publiserbart | −50 % |

Billig test: du trenger bare 5–10 poster/uke og tallene plattformen allerede gir deg gratis. Null verktøykostnad.

## 7-dagers Action Plan

- **Dag 1:** Fyll ut `PLAYBOOK.template.md` med det du *tror* virker (3–5 mønstre). Merk alt som UPRØVD — intuisjonen din er hypotese nr. 1.
- **Dag 2:** Generer ukens innhold med `/content`. Rediger som vanlig, men noter hva du alltid retter — det er playbook-kandidater.
- **Dag 3–5:** Publiser som normalt. Ikke endre playbooken midt i uka (du forurenser eksperimentet).
- **Dag 6:** Hent ukens tall (visninger/klikk/svar per post). Trenger ikke være perfekt — rangering holder.
- **Dag 7:** Kjør `/content-retro` med tallene. Les diffen i PLAYBOOK.md: er hypotesene konkrete nok til å styre neste uke? Gjenta ukentlig; etter 4 uker har du en databekreftet playbook ingen konkurrent kan kopiere.
