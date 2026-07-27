# kreative-vibe-prosjekter

100+ ideelle prosjekter, musikkidéer, satireprosjekter, videoer og Vibe-kort-apper.
Prototyper, salgsmateriell og klar-til-bygg-info.

Repoet er bygget for å drives av agenter. `AGENTS.md` er kontrakten — Cursor, Codex
og Copilot leser den direkte, Claude Code via `@AGENTS.md` i `CLAUDE.md`.

## Løypa

```
minne/inbox.md  →  destillering  →  prosjekter/<slug>/prosjekt.md  →  INDEKS.md
```

Dump rå ideer i `minne/inbox.md` uten struktur. En agent ruter hver linje til nytt
prosjekt, profilfakta, statusoppdatering eller forkastet beslutning, og regenererer
køen. Ingen linje forsvinner uten å ha landet et sted.

## Kommandoer

```bash
verktoy/nytt-prosjekt.sh <slug> "Navn"   # nytt prosjekt fra mal + regenerer indeks
python3 verktoy/bygg-indeks.py           # regenerer prosjekter/INDEKS.md
```

I Claude Code: `/destiller` kjører hele inbox-løypa.

## Kart

| Sti | Hva |
|---|---|
| `AGENTS.md` | Agentkontrakt — arbeidsregler, svarstil, minneløype |
| `CLAUDE.md` | Claude Code-spesifikt, importerer AGENTS.md |
| `minne/profil.md` | Stabil kontekst om Alexander |
| `minne/inbox.md` | Rå input, uprosessert |
| `minne/prosjekter.md` | Tverrgående notater og blokkeringer |
| `minne/beslutninger.md` | Hva som ble valgt bort, og hvorfor |
| `prosjekter/INDEKS.md` | Generert kø, sortert på verdi/innsats |
| `prosjekter/MAL/` | Mal for nye prosjekter |
| `verktoy/` | Skript |

## Rangering

Hvert prosjekt har `verdi` og `innsats` (1–5) i frontmatteren. Køen sorteres på
`verdi / innsats`. Med 100+ prosjekter er flaskehalsen utvelgelse, ikke oversikt —
øverste rad i indeksen svarer på hva som skal gjøres i kveld.

De tre prosjektene som ligger inne nå er bootstrappet fra `minne/profil.md` og
skal korrigeres ved første gjennomgang.
