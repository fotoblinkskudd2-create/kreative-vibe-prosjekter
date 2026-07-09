# 5. Bug-Harvest Loop

> Hver produksjonsfeil betaler for seg tre ganger: en fiks, en regresjonstest, og en vaktregel som gjør at samme feilklasse aldri når prod igjen.

## Problem

Solopreneurs har ikke QA-team. Feil oppdages av kundene, fikses i panikk, og glemmes. Tre måneder senere skipper du en ny variant av nøyaktig samme feil — for fiksen endret koden, men ikke *systemet som produserte koden*. Feillogger, GitHub-issues og «oops»-commits er en gullgruve av treningsdata som ingen høster.

## Solution

En `/harvest`-skill som tar en feil som input (stacktrace, issue-lenke eller beskrivelse) og spawner en `bug-harvester`-subagent som leverer den doble fiksen: (1) rotårsaksfiks, (2) regresjonstest som ville fanget feilen, og (3) — det selvforbedrende steget — en klassifisering av feilen mot `BUGBOOK.md`. Er feilklassen sett før, eskaleres den til en *vaktregel*: en linje i CLAUDE.md eller en lint-regel som stopper klassen ved kilden.

## Architecture

```
Feil (stacktrace / issue / «det er noe galt med X»)
      │
      ▼
[Subagent: bug-harvester]
      │ 1. Reproduser → skriv FEILENDE test først
      │ 2. Rotårsaksfiks (ikke symptomfiks) → testen går grønn
      │ 3. Klassifiser mot BUGBOOK.md:
      │      ny klasse   → registrer med teller = 1
      │      kjent klasse → teller++
      │ 4. teller ≥ 2? → ESKALER:
      │      • forebyggbar med lint? → foreslå regel (eslint/ruff/custom)
      │      • ellers → vaktregel i CLAUDE.md («sjekk alltid X når du endrer Y»)
      ▼
Commit: test + fiks + BUGBOOK.md [+ evt. lint-regel/CLAUDE.md]
```

Eskaleringsterskelen (2 forekomster) er bevisst: én feil er en hendelse, to er et mønster. Å lage regler av engangsfeil fyller CLAUDE.md med støy.

## Code Core

Ferdig i repoet:

- [`.claude/skills/harvest/SKILL.md`](../../.claude/skills/harvest/SKILL.md)
- [`.claude/agents/bug-harvester.md`](../../.claude/agents/bug-harvester.md)

BUGBOOK-format (feilklasse-registeret):

```markdown
## Klasse: null-fra-eksternt-api
- **Signatur:** Kode antar at felt fra tredjeparts-API alltid finnes.
- **Forekomster:** 3 (2026-05-12, 2026-06-01, 2026-07-04)
- **Eskalert:** JA → CLAUDE.md-regel: «Alle felt fra eksterne API-responser
  behandles som optional; valider med schema før bruk.»
- **Fikser:** commits a1b2c3, d4e5f6, 789abc
```

Test-først-kravet i steg 1 er ikke-forhandlebart — det er det som gjør at «fikset» betyr noe: testen feiler før fiksen og passerer etter.

## Validation Metrics

| Metrikk | Måling | Mål etter 30 dager |
|---------|--------|---------------------|
| Regresjonsrate | Feil av en klasse som allerede står i BUGBOOK | → 0 for eskalerte klasser |
| Testdekning fra feil | Regresjonstester lagt til via loopen | 1 per høstet feil (per definisjon) |
| Eskaleringer | Klasser som fikk vaktregel/lint-regel | ≥ 2 |
| Tid per høsting | Fra `/harvest` til grønn commit | < 30 min median |

Billig test: kjør `/harvest` på de 5 siste feilene du allerede har fikset (retroaktivt — «her er feilen og fiksen, klassifiser og skriv testen»). Da bootstraper du BUGBOOK på én kveld uten å vente på nye feil.

## 7-dagers Action Plan

- **Dag 1:** Kopier skill + agent. Bootstrap: kjør `/harvest` retroaktivt på dine 3 siste kjente feil (bruk gamle commits/issues som input).
- **Dag 2:** Les BUGBOOK.md. Er klassene på riktig nivå? («null-fra-eksternt-api» = bra; «bug i utils.py» = for smalt; «logikkfeil» = for bredt.)
- **Dag 3:** Fortsett bootstrap til ~5 klasser. Sjekk om noen allerede har 2+ forekomster → kjør eskaleringen.
- **Dag 4:** Første ekte kjøring: neste feil som dukker opp går gjennom `/harvest`, ikke panikk-fiksing. Ta tiden.
- **Dag 5:** Verifiser eskaleringene: prøv å skrive kode som bryter en vaktregel — stopper agenten deg?
- **Dag 6:** Koble til inntak: gjør det til vane at feilrapporter (mail, DM, egen observasjon) limes rett inn i `/harvest`.
- **Dag 7:** Gjennomgang: regresjonsrate på eskalerte klasser skal være null. Hvis en klasse residiverte, var vaktregelen for vag — skjerp den.
