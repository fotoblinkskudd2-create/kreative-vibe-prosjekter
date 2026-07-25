# TØRRSKODD T6 – lavenergi tørkestasjon for vått yttertøy

Komplett designpitch fra problem til prototype, levert som Word-dokument.

## Leveranse

- **[`TORRSKODD-T6-designpitch.docx`](TORRSKODD-T6-designpitch.docx)** – hoveddokumentet (18 tabeller, 6 kapitler, innholdsfortegnelse, sidetall)
- `build_docx.js` – generatorskript som bygger dokumentet

## Innhold i dokumentet

| Kapittel | Innhold |
|---|---|
| 1 | Problemdefinisjon: fukt i lukkede plagg, målgrupper, bruksscenario, konkurranseanalyse |
| 2 | Produktkonsept: hovedfunksjoner og differensierende egenskaper |
| 3 | CAD-spesifikasjon: hovedmål, materialvalg, mekanismer, monteringspunkter, ytelseskrav |
| 4 | Kostnadskalkyle for 20 enheter, prismodell og skaleringsscenario til 500 enheter |
| 5 | Investorpitch på 173 ord + støttepunkter for muntlig fremføring |
| 6 | Bildebeskrivelse: designestetikk, materialteksturer, produktet i bruk, bildeliste |

## Nøkkeltall (pilotserie, 20 enheter)

| Post | Per enhet | 20 enheter |
|---|---:|---:|
| Materialer | 1 974 kr | 39 480 kr |
| Arbeid (2,0 t à 480 kr) | 960 kr | 19 200 kr |
| Direkte enhetskostnad | 2 934 kr | 58 680 kr |
| Salgspris eks. mva. | 4 990 kr | 99 800 kr |
| Dekningsbidrag (41,2 %) | 2 056 kr | 41 120 kr |
| Engangskostnader (NRE) | 2 100 kr | 42 000 kr |
| Resultat etter NRE | −44 kr | −880 kr |

Pilotserien er i praksis kostnadsnøytral og finansierer egen verktøy- og
sertifiseringsutvikling. Ved 500 enheter faller enhetskostnaden til 1 516 kr
og dekningsgraden stiger til 69,6 % i direktekanalen.

## Bygge dokumentet på nytt

```bash
npm install docx
node build_docx.js [utfil.docx]
```

Skriptet har ingen andre avhengigheter enn `docx` (npm).
