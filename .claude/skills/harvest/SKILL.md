---
name: harvest
description: Høst en produksjonsfeil - bug-harvester-subagenten leverer rotårsaksfiks + regresjonstest + BUGBOOK-klassifisering, med eskalering til vaktregel ved gjentak. Brukes når brukeren skriver /harvest med en stacktrace, issue eller feilbeskrivelse.
---

# Harvest

Hver feil betaler tre ganger: fiks, regresjonstest, systemlæring. Fungerer også retroaktivt på allerede fiksede feil (for å bootstrappe BUGBOOK).

## Steg

1. Samle feilkonteksten fra brukeren: stacktrace, issue-nummer/lenke, eller beskrivelse. For retroaktiv høsting: også commiten som fikset feilen.
2. Spawn subagenten `bug-harvester` med konteksten. Den reproduserer med en feilende test, rotårsaksfikser, klassifiserer i `BUGBOOK.md`, og eskalerer til lint-regel eller CLAUDE.md-vaktregel ved ≥ 2 forekomster i samme klasse.
3. Vis brukeren: diffen (test + fiks + BUGBOOK + evt. eskalering) og harvester-rapporten.
4. Ved godkjenning: commit alt sammen, melding `harvest: <rotårsak i stikkord> [klasse: <slug>, forekomst #N]`.

## Regler

- Ingen fiks uten test som feilet først — ellers er den ikke høstet, bare lappet.
- Retroaktiv modus: testen skrives mot koden FØR fiks-commiten (verifiser rødt med `git stash`/checkout av gammel versjon der det er praktisk), eller som ren regresjonstest hvis det er urimelig dyrt — merk i så fall commiten med `(uverifisert rød)`.
