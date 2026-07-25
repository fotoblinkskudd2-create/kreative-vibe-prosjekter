# TØRKA T1 — designpitch

Komplett designprosess fra problem til prototype for **TØRKA T1**, et sammenleggbart,
sensorstyrt tørkerom for våte uteklær. Dekker problemdefinisjon, produktkonsept,
CAD-spesifikasjoner med konseptriss, kostnadskalkyle for en pilotserie på 20 enheter,
investorpitch og bildebeskrivelse.

## Leveranser

| Fil | Innhold |
|---|---|
| `TORKA-T1-designpitch.docx` | Hoveddokumentet, klart til å åpnes i Word |
| `TORKA-T1-designpitch.md` | Samme innhold som Markdown |
| `figurer/torka-t1-tegning.svg` / `.png` | Konseptriss rev. A: oppriss, snitt, plan og to detaljsnitt |

## Bygge på nytt

Innholdet ligger i én modell (`verktoy/innhold.js`) som rendres til både `.docx` og `.md`,
slik at de to filene ikke kan gå fra hverandre.

```bash
cd verktoy
npm install          # henter docx (npm)
npm run tegning      # genererer SVG og rendrer PNG via Chromium
npm run bygg         # skriver .docx og .md i prosjektmappen
```

`npm run tegning` krever Python 3 og Playwright med Chromium.

## Status

Konseptfase, rev. A. Tall for tørketid og energiforbruk er beregnet, ikke målt —
forutsetningene og hvordan de skal valideres står i vedlegg A i hoveddokumentet.
Tegningen er et konseptriss og er ikke frigitt for produksjon.
