# Teknologirapport 2026

**Åpne systemer, multi-agent-arkitektur, codec-teknologi og Claude Code**

En konsulentrapport på nøyaktig 30 A4-sider som dekker fire teknologistakker og hvordan de henger
sammen i én leveranse.

| | |
|---|---|
| **Leveranse** | [`Teknologirapport-2026.pdf`](Teknologirapport-2026.pdf) — 30 sider, A4 |
| **Kilde** | [`rapport.html`](rapport.html) — én selvstendig fil, ingen eksterne avhengigheter |
| **Byggeskript** | [`build/render.mjs`](build/render.mjs) |
| **Versjon** | 1.0 — endelig, 1. august 2026 |

## Innhold

| Del | Kapitler | Sider | Tema |
|---|---|---|---|
| Innledende | — | 1–3 | Forside, innholdsfortegnelse, sammendrag med ti hovedfunn |
| **I** | 1–5 | 4–8 | Åpne systemer: åpenhetsmatrisen, standardlandskapet 2026, MCP 2026-07-28 i dybden, sjulags referansearkitektur, implementeringsstrategi |
| **II** | 6–11 | 9–14 | Multi-agent: tokenøkonomi og beslutningsmatrise, seks topologier, koordineringsmekanikk, A2A-spesifikasjoner, feilmodi og evaluering, fem use cases |
| **III** | 12–17 | 15–20 | Codecs: rate–distorsjon og metrikker, videokodeker inkl. AV2, enkoderpraksis og bitrate-stiger, lydkodeker, nevrale codecs, datakompresjon |
| **IV** | 18–23 | 21–26 | Claude Code: arkitektur og kontekstøkonomi, utvidelsesprimitivene, hooks, subagenter/skills/plugins, MCP og Agent SDK, produksjonssetting |
| **V** | 24–25 | 27–28 | Tilgrensende stakk (RAG, evaluering, isolering, forsyningskjede) og regulatorisk bilde |
| Avslutning | 26 + vedlegg | 29–30 | Tolv anbefalinger, treårig veikart, ordliste, kilder, sjekklister, metode |

## Hovedpåstand

Verdien ligger i **grensesnittet**, ikke i implementasjonen. En codec er en forhandlet kontrakt
mellom koder og dekoder; MCP og A2A er forhandlede kontrakter mellom modell og verktøy, og mellom
agent og agent; Claude Codes utvidelsesprimitiver er kontrakter mellom menneske og agent.
Organisasjoner som behandler grensesnittvalg som en arkitekturbeslutning — ikke en
implementasjonsdetalj — får lavere byttekostnad, raskere leveranse og målbart lavere driftsrisiko.

## Bygge PDF-en på nytt

Krever Node og Playwright med Chromium.

```bash
cd rapport/build
node render.mjs
```

Skriptet gjør to ting: renderer `rapport.html` til `Teknologirapport-2026.pdf` (A4), og måler for
hver side hvor mye innhold som ligger innenfor sidens faste høyde. Sider som ville fått avkuttet
tekst rapporteres som `OVERFLOW`, og sider med mye tomrom som `tynn`. Bygget er verifisert med
**null overskridelser og eksakt 30 sider**.

## Om kildegrunnlaget

Faktagrunnlaget er verifisert per juli–august 2026 mot primærspesifikasjoner og
leverandørdokumentasjon; sentrale kilder er listet i vedlegg B på side 30. Tall uten kildemerking i
teksten er rapportens egne estimater, oppgitt som størrelsesordener. Kompresjons- og ytelsestall
varierer med implementasjon, innstillinger og materiale — de skal brukes til å rangere alternativer,
ikke til kapasitetsplanlegging. Kapittel 25 er en teknisk lesning av regelverket og erstatter ikke
juridisk rådgivning.
