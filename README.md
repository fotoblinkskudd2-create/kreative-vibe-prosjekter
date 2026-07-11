# Kreative Vibe-Prosjekter 🎨

Et kreativt AI-studio i ett repo: 100+ prosjektidéer, fungerende prototyper, låtpakker, satire og salgsmateriell — drevet av et multiagent-system som gjør idéer om til ferdige leveranser.

## Kom i gang

1. **Prøv prototypen:** åpne `prototyper/vibe-kort/index.html` i nettleseren.
2. **Bla i idéene:** start med topp 10-lista i [`ideer/README.md`](ideer/README.md).
3. **Se status:** [`STATUS.md`](STATUS.md) viser hva som er ferdig og hva som anbefales videre.

## Slik jobber studioet

Åpne repoet i Claude Code og bruk kommandoene:

| Kommando | Gjør |
|---|---|
| `/nytt-prosjekt <idé>` | Hele linja: idé → prototype → salgsmateriell → kvalitetssjekk |
| `/dagens-sprint` | Autopilot: studioet velger de mest verdifulle oppgavene og gjennomfører dem |
| `/ny-laat <idé>` | Komplett låtpakke klar for Suno |
| `/salgsmateriell <prosjekt>` | Salgspakke for et eksisterende prosjekt |

Bak kulissene jobber seks spesialiserte agenter (idégenerator, prototypebygger, musikkprodusent, satireskribent, tekstforfatter og kvalitetssjef) — se `.claude/agents/`.

## Struktur

```
ideer/           idékatalogen (musikk, satire, video, apper, ideelle prosjekter)
prototyper/      fungerende apper — åpne index.html rett i nettleseren
musikk/          låtpakker (konsept, tekst, Suno-prompt)
satire/          satiretekster og sketsjmanus
salgsmateriell/  salgspakker per prosjekt
.claude/         agentene og kommandoene som driver studioet
```
