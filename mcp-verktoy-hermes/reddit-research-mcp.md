# Reddit Research MCP — detaljert bruk

Repo: https://github.com/king-of-the-grackles/reddit-research-mcp

## Hvorfor

Reddit er full av ufiltrerte meninger: folk klager, sammenligner verktøy, ber om råd, og forklarer hva de prøvde, hva som feilet, og hva de faktisk hadde betalt for. Det er rådata for markedsføring — kundeoppdagelse, konkurrentanalyse, produktideer og innholdsvinkler, uten å basere seg på antagelser.

## Oppsett

```bash
claude mcp add --scope local --transport http reddit-research https://reddit-research-mcp.fastmcp.app/mcp
```

Første gang serveren brukes godkjennes tilgang via Descope OAuth2 (~30 sek). Ingen Reddit API-nøkkel trengs.

## Eksempel-prompts til Hermes

- "Finn hva folk hater ved Lovable, Cursor og Claude Code."
- "Undersøk hva små bedriftseiere sliter med når de velger et CRM."
- "Finn Reddit-diskusjoner om AI-agenter og oppsummer de største bekymringene."
- "Samle ekte brukerklager om abonnementspriser for SaaS-verktøy."
- "Finn innholdsidéer basert på hva folk spør om i AI-communities."

## Arbeidsflyt

1. `discover_subreddits` — semantisk søk for å finne relevante communities rundt et tema
2. `search_subreddit` / `fetch_posts` — hent relevante innlegg (hot/new/top/rising) eller søk direkte i en subreddit
3. `fetch_multiple` — hent fra flere subreddits samtidig når temaet spenner over flere communities
4. `fetch_comments` — hent hele kommentartråden for de mest relevante innleggene
5. Be Hermes trekke ut: gjentatte smertepunkter, eksakte fraser folk bruker, innvendinger mot eksisterende løsninger, og kjøpssignaler
6. Be Hermes omforme funnene til: innholdsidéer, annonsevinkler, landingsside-seksjoner, eller produktforbedringsforslag — med sitater/lenker tilbake til de originale Reddit-trådene

## Bruksområder

Innholdsstrategi, SaaS-research, konkurrentanalyse, AI-verktøy-anmeldelser, community-bygging, og å validere en idé mot ekte samtaler før man bruker tid på å bygge feil ting.
