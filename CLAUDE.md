# Kreative Vibe-Prosjekter — Kreativt AI-studio

Dette repoet er et kreativt studio drevet av et multiagent-system. Eieren er én kreativ person som bruker AI-verktøy (Claude, Suno, videoverktøy) til å realisere idéer. **Svar alltid brukeren på norsk (bokmål).**

## Struktur

| Mappe | Innhold |
|---|---|
| `ideer/` | Idékatalogen — 100+ idéer i fem kategorier, med topp 10-liste i `ideer/README.md` |
| `prototyper/` | Fungerende apper — selvstendige `index.html`-filer, én mappe per prosjekt |
| `musikk/` | Låtpakker — konsept, tekst, Suno-prompt, variasjoner per låt |
| `satire/` | Satiretekster og sketsjmanus |
| `salgsmateriell/` | Salgspakker per prosjekt + `MAL.md` som definerer strukturen |
| `STATUS.md` | Statustavla — hva som er ferdig, pågår og anbefales videre |

## Agent-teamet (`.claude/agents/`)

- **ide-generator** — nye prosjektidéer inn i katalogen
- **prototype-bygger** — fungerende apper (selvstendig HTML, ingen avhengigheter)
- **musikk-produsent** — komplette låtpakker
- **satire-skribent** — satiretekster og sketsjmanus
- **tekstforfatter** — pitcher, landingssider, SoMe, salgsmateriell
- **kvalitetssjef** — gjennomgang før noe regnes som ferdig

## Skills (kommandoer)

- `/nytt-prosjekt` — idé → prototype → salgsmateriell → kvalitetssjekk, hele linja
- `/dagens-sprint` — autonom økt: velg de mest verdifulle oppgavene og gjennomfør
- `/ny-laat` — komplett låtpakke fra en musikkidé
- `/salgsmateriell` — salgspakke for et eksisterende prosjekt

## Arbeidsregler

1. **Produksjonslinja:** idé (katalog) → bygging (riktig fagagent) → salgsmateriell (tekstforfatter) → kvalitetssjekk (kvalitetssjef) → `STATUS.md` oppdateres → commit + push.
2. **Prototyper** er alltid selvstendige: én `index.html`, inline CSS/JS, ingen CDN eller eksterne ressurser. Skal fungere ved å åpnes direkte i nettleser.
3. **Nye idéer** skrives alltid inn i katalogen først (riktig kategorifil, etablert format), selv om de bygges umiddelbart — katalogen er komplett historikk.
4. **Satire** rammer fenomener og systemer, aldri navngitte privatpersoner eller sårbare grupper.
5. **Hold `STATUS.md` oppdatert** — den er sannheten om hvor prosjektene står.
6. Brukeren liker autonome økter: når beskjeden er «kjør på», bruk `/dagens-sprint`-tilnærmingen — velg selv, bygg ferdig, rapportér til slutt.
