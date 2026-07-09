# Self-Improving Loops — 5 prosjekter for coding-agenter

5 copy-paste-klare prosjekter som gjør at kodeverktøyene dine **blir bedre av å bli brukt**.
Alle er bygget rundt samme kjerneidé: en loop som produserer → måler → lærer → oppdaterer sin egen instruks.

Optimalisert for solopreneurs: null infrastruktur, billig å teste (< 1 time / < $5 per eksperiment), og alt kjører som **Claude Code skills og subagents** — ren markdown + små scripts, ingen server.

## Prosjektene

| # | Prosjekt | Loop den lukker | Tid til første resultat |
|---|----------|-----------------|--------------------------|
| 1 | [Auto-Retro Loop](01-auto-retro-loop/README.md) | Kodesesjon → lærdom → CLAUDE.md | 1 dag |
| 2 | [Test-Heal Loop](02-test-heal-loop/README.md) | Testfeil → fiks → fikse-mønster-bibliotek | 1–2 dager |
| 3 | [Prompt-Optimizer Loop](03-prompt-optimizer-loop/README.md) | Prompt → eval-score → bedre prompt | 2 dager |
| 4 | [Content-Factory Loop](04-content-factory-loop/README.md) | Innhold → engasjement → bedre briefs | 3 dager |
| 5 | [Bug-Harvest Loop](05-bug-harvest-loop/README.md) | Produksjonsfeil → fiks + regel → færre feil | 2–3 dager |

## Slik bruker du dem

1. **I dette repoet:** skills og agenter ligger allerede installert i [`.claude/`](../.claude/). Åpne Claude Code her og kjør f.eks. `/retro`.
2. **I ditt eget repo:** kopier `.claude/agents/*.md` og `.claude/skills/<navn>/` inn i prosjektet ditt. Ferdig — ingen bygging, ingen avhengigheter.

## Felles arkitekturprinsipp

```
        ┌─────────────┐
        │  PRODUSER    │  (kode, innhold, fiks)
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │  MÅL         │  (tester, evals, metrikk)
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │  DESTILLER   │  (subagent trekker ut lærdom)
        └──────┬──────┘
               ▼
        ┌─────────────┐
        │  OPPDATER    │  (skriver til CLAUDE.md / SKILL.md / regler)
        └──────┴──→ tilbake til PRODUSER, nå smartere
```

Nøkkelen som skiller dette fra «bare logging»: steg 4 skriver til filene som *styrer neste kjøring*. Instruksene er både output og input. Det er det som gjør loopen selvforbedrende.

## Vaktregler (så loopen ikke spiser seg selv)

- **Append-budsjett:** maks 5 nye linjer i CLAUDE.md per sesjon; over det må noe gammelt slettes først.
- **Menneske-gate:** alle selv-oppdateringer skjer via git-diff du kan se og reverte. Aldri direkte i prod.
- **Halveringstid:** regler som ikke har «reddet» noe på 30 dager markeres for sletting.
