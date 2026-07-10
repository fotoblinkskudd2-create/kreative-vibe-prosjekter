# FylkeVibe 🔥

Gonzo-research-dashboard med massive vibe. Velg fylke (Vestland først, selvsagt),
skriv en query, trykk **HENT** – og få oppfinnelser, lønnstall, patenter, video-plass
og rå gonzo-kommentarer. Neon-Bergen-estetikk, dark mode og animasjoner.

Bygget med **Next.js (app router) + TypeScript + Tailwind CSS v4 + framer-motion + lucide-react**.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne [http://localhost:3000](http://localhost:3000) og kjenn vibben.

## Struktur

| Fil | Hva |
| --- | --- |
| `app/page.tsx` | Hovedsiden – fylkevelger, input, resultater, gonzo-panel |
| `app/api/research/route.ts` | API-route som svarer på `POST { fylke, query }` |
| `lib/fylkedata.ts` | Mock-data per fylke (SSB/Patentstyret-stil) |
| `components/FylkeSelector.tsx` | Velg fylke |
| `components/ResearchPanel.tsx` | Oppfinnelser + lønn + patenter |
| `components/GonzoMode.tsx` | Rå gonzo-kommentar per fylke |
| `components/VideoEmbed.tsx` | Video-plass, klar for Claude/OpenClaw-agent |

## Koble på ekte data

Alt av mock ligger i `lib/fylkedata.ts`, og API-routen i `app/api/research/route.ts`
er stedet å bytte inn ekte kilder:

- **SSB API** – lønnsstatistikk: <https://data.ssb.no/api/v0/no/table/>
- **Patentstyret** – patentsøk: <https://search.patentstyret.no/>
- **Claude API** – video-sammendrag / agent-stuff: <https://docs.claude.com/>

## Lisens

Open source – gjør hva du vil. Massive vibe delivered.
