# Kreative vibe-prosjekter

Dette repoet er «Herden» — et multiagent-verksted for research, vibe-koding, sangtekster,
satiriske bilde-/videoprompts og dagsplaner. Les `herden/README.md` for full bruksanvisning.

## Viktigst å vite
- **Skills**: `.claude/skills/` (20 stk). Agentene skal alltid følge relevant skill — den er fasit.
- **Agenter**: `.claude/agents/` (9 stk). Store oppdrag går via `herde-koordinator`.
- **Oppdrag**: `herden/oppdrag/` — 100-listene og 50-lista. Kjøres i bolker på 10.
- **Resultater**: `herden/resultater/<type>/`. Bygde prosjekter: `herden/bygg/<navn>/`.
- **Status**: `herden/STATUS.md` oppdateres etter hver bolk — sjekk den før nytt arbeid startes.

## Regler
- Bolker på 10, maks 3–4 agenter parallelt, kvalitetskontroll før godkjenning.
- Commit per bolk med norske meldinger (skill: git-flyt). Push til arbeidsbranchen.
- Etikk: satire mot makt/systemer, aldri privatpersoner eller grupper; ingen artistnavn i
  prompts; ingen hemmeligheter i git; ingen betalte API-batcher uten klarsignal.
- Språk: norsk til brukeren og i innhold (der ikke annet er angitt), engelsk i kode.
