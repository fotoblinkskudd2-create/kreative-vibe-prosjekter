# 🃏 Vibe-kort

En kortstokk-app med kreative prompts og stemningskort — hele appen ligger i én
selvstendig HTML-fil uten eksterne avhengigheter.

## Hva er dette?

Fire kortstokker med 26 håndskrevne kort hver, alle på norsk:

| Stokk | Innhold |
|---|---|
| ✨ **Kreativ gnist** | Kreative utfordringer du kan gjøre i dag — tegn, skriv, bygg |
| 💬 **Samtalestartere** | Dype og lure spørsmål som åpner ekte samtaler |
| 🎧 **Musikk-vibe** | Konkrete låtidéer og stemninger for musikkproduksjon |
| 🌱 **Satire-frø** | Humoristiske premisser å bygge sketsjer og tekster på |

## Slik bruker du den

1. Åpne `index.html` direkte i en nettleser (dobbeltklikk holder — ingen server trengs).
2. Velg en kortstokk.
3. Trykk **«Trekk kort»** eller bruk **mellomrom** for å trekke et tilfeldig kort.
4. Trykk **♡** for å lagre et kort som favoritt (lagres i localStorage),
   eller **⧉** for å kopiere kortteksten til utklippstavlen.
5. Favorittene dine finner du under **«♥ Favoritter»** øverst til høyre.

Detaljer:

- Kortene stokkes, og du får aldri samme kort to ganger før hele stokken er
  brukt opp. Da stokkes den automatisk på nytt (uten å gjenta det siste kortet
  umiddelbart).
- Telleren viser «Kort X av Y» for gjeldende runde.
- Hver stokk har sin egen farge og glød; designet er mørkt og mobilførst.

## Idéer til videreutvikling

- **Egne kort:** La brukeren legge til egne kort og stokker (lagret i localStorage).
- **Deling:** Del et kort som lenke (`?stokk=musikk&kort=12`) eller som generert bilde.
- **Timer-modus:** Trekk et kort + nedtelling (f.eks. 10 minutter) for kreative sprinter.
- **Dagens kort:** Ett fast kort per dag, likt for alle, basert på dato-seed.
- **Eksport/import:** Last ned favoritter som JSON eller tekstfil, og importer igjen.
- **Kombo-trekk:** Trekk ett kort fra to ulike stokker samtidig («satirisk låtidé»).
- **Historikk:** Vis de siste 10 trukne kortene med mulighet for å hente dem tilbake.
- **PWA:** Legg til manifest + service worker slik at appen kan installeres på mobil.
- **Lyd og haptikk:** Diskré kortstokk-lyd ved trekk og vibrasjon på mobil.
