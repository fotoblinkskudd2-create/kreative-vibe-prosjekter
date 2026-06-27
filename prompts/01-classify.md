# Prompt 01 — Klassifiser og vurder

Du får en input-fil fra `inputs/queue/`. Din jobb:

1. Les innholdet grundig
2. Identifiser:
   - **Oppgavetype**: musikk / satire / video / app / tekst / sammensatt
   - **Kompleksitet**: enkel (1 prompt) / middels (2 prompts) / heftig (full pipeline)
   - **Mangler**: hva trenger mer info for å levere godt?
   - **Beste template**: se `prompts/templates/` og velg passende

3. Skriv en kort klassifiseringsrapport (3–5 setninger) som neste prompt kan bruke

## Output-format

```
KLASSIFISERING
Oppgavetype: <type>
Kompleksitet: <nivå>
Valgt template: <filnavn eller "ingen">
Mangler: <liste eller "ingen">
Sammendrag: <1–2 setninger om hva oppgaven går ut på>
```

Ikke gjør noe annet enn å klassifisere. Neste prompt tar over.
