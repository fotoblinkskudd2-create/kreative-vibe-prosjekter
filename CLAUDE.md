# Kreative Vibe Prosjekter — CLAUDE.md

## Prosjekt-oversikt
100+ kreative prosjekter: musikk, satire, video, Vibe-apps. Claude behandler daglige input-køer gjennom et multi-prompt pipeline.

## Daglig System Loop

Hver dag (eller manuelt med `/loop`) kjøres denne sekvensen:

1. **Scan** `inputs/queue/` — finn alle `.md`-filer med nye oppgaver
2. **Classify** — kjør `prompts/01-classify.md` på hver input
3. **Expand** — kjør `prompts/02-expand.md` for å utdype ideen
4. **Execute** — kjør `prompts/03-execute.md` for konkrete leveranser
5. **Archive** — flytt behandlet input til `inputs/done/` og skriv output til `outputs/`

## Struktur

```
inputs/
  queue/        ← legg nye ideer/oppgaver her som .md-filer
  done/         ← behandlede inputs arkiveres hit
outputs/
  YYYY-MM-DD/   ← daglige resultater
prompts/
  01-classify.md
  02-expand.md
  03-execute.md
  templates/    ← prompt-templates per oppgavetype
system/
  daily-loop.md ← loop-instrukser og kjøringslogg
```

## Kjøring

- **Manuell loop**: `/loop` i Claude Code
- **Enkelt prosjekt**: Les `inputs/queue/<fil>.md` og kjør pipeline
- **Se status**: Les `system/daily-loop.md`

## Input-format

Filer i `inputs/queue/` følger formatet i `inputs/TEMPLATE.md`.

## Regler for Claude

- Alltid behandle queue i rekkefølge (eldste fil først)
- Skriv output til `outputs/YYYY-MM-DD/<prosjektnavn>.md`
- Oppdater `system/daily-loop.md` med kjøringslogg etter hver runde
- Commit alle outputs etter fullført loop
