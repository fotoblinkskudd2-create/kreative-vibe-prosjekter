# FylkeVibe • Gonzo Research 🔥

Massive vibe fullstack-dashboard for norske fylker: **oppfinnelser, lønn, patenter, video og rå gonzo-kommentarer**. Thirsting for inputs – du skriver, den henter.

Bygget med **Next.js 15 (app router) + TypeScript + Tailwind CSS 4 + framer-motion + lucide-react**. Open source (MIT) og klar for Claude/OpenClaw-agenter.

## Kom i gang

```bash
cd fylkevibe
npm install
npm run dev
```

Gå til [http://localhost:3000](http://localhost:3000) og kjenn massive vibe.

## Funksjoner

- 🗺️ **Fylkevelger** – alle 15 fylker, Vestland som default (Bergen-vibe)
- 🔍 **Thirsty input** – skriv research-query, trykk HENT (eller Enter), appen poster til `/api/research`
- 💡 **ResearchPanel** – oppfinnelser, gjennomsnittslønn (SSB-stil) og patenttall (Patentstyret-stil) per fylke
- 🔥 **Gonzo Mode** – rå, direkte kommentar per fylke, digital Hunter S. Thompson-stil
- 🎬 **VideoEmbed** – video-kort klart for Claude/OpenClaw video-sammendrag
- 🌒 **Neon-Bergen dark mode** med framer-motion-animasjoner

## Arkitektur

```
fylkevibe/
├── app/
│   ├── layout.tsx              # Global layout, dark mode, metadata
│   ├── globals.css             # Neon-vibe (Tailwind 4)
│   ├── page.tsx                # Hovedside: input → API → paneler
│   └── api/research/route.ts   # POST { fylke, query } → research-data
├── components/
│   ├── FylkeSelector.tsx
│   ├── ResearchPanel.tsx
│   ├── GonzoMode.tsx
│   └── VideoEmbed.tsx
└── lib/
    └── data.ts                 # Mock-datasett for alle 15 fylker
```

## API

```bash
# Hent research for et fylke
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"fylke": "Vestland", "query": "patenter i bergen 2025"}'

# Liste over støttede fylker
curl http://localhost:3000/api/research
```

## Koble til ekte data / agenter

All data kommer i dag fra `lib/data.ts` (mock strukturert som ekte kilder). Bytt ut oppslaget i `app/api/research/route.ts` med:

- **SSB API** for lønn: `https://data.ssb.no/api/v0/no/table/11418`
- **Patentstyret** for patentsøknader
- **Claude API / OpenClaw-agent** for video-sammendrag og generert gonzo-tekst – legg API-nøkkel i `.env.local` og kall agenten fra routen

## Lisens

MIT – bygg videre, remix, thirst.
