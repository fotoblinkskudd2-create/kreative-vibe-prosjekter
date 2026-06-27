# Daglig System Loop — Status & Logg

## Kjøring

```
/loop   ← starter multi-prompt pipeline i Claude Code
```

Loopen behandler alle filer i `inputs/queue/` i rekkefølge.

## Loop-sekvens

```
For hver fil i inputs/queue/ (eldste først):
  1. Les filen
  2. Kjør prompts/01-classify.md  → klassifisering
  3. Kjør prompts/02-expand.md    → prosjektplan
  4. Kjør prompts/03-execute.md   → ferdig leveranse
  5. Skriv output til outputs/YYYY-MM-DD/<navn>.md
  6. Flytt input-fil til inputs/done/
  7. Commit outputen

Etter alle filer:
  - Oppdater denne filen med kjøringslogg
  - Push til branch
```

## Kjøringslogg

| Dato | Filer behandlet | Output-mappe | Status |
|------|----------------|--------------|--------|
| (ingen kjøringer ennå) | | | |

## Tips

- Legg til nye oppgaver i `inputs/queue/` og bruk `inputs/TEMPLATE.md` som mal
- For én enkelt oppgave: be Claude "kjør pipeline på inputs/queue/<fil>.md"
- For å se alle outputs: se i `outputs/`-mappen sortert på dato
