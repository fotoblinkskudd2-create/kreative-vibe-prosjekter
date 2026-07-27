---
name: destiller
description: Tømmer minne/inbox.md ved å rute hver rå input til riktig sted — nytt prosjekt, profilfakta, statusoppdatering eller forkastet beslutning — og regenererer porteføljeindeksen. Bruk når inboxen har uprosesserte linjer, når brukeren sier "destiller", "tøm inbox", "rydd minnet", eller etter at en bunke nye ideer er dumpet inn.
---

# Destiller

Rå input inn, strukturert portefølje ut. Ingen linje forsvinner uten å ha landet et sted.

## Kjør

1. Les `minne/inbox.md`, `minne/profil.md`, `prosjekter/INDEKS.md`.
2. For hver uprosesserte linje i inboxen, velg **ett** mål:

   | Input | Mål |
   |---|---|
   | Konkret prosjektidé | `verktoy/nytt-prosjekt.sh <slug> "<navn>"` og fyll ut `prosjekt.md` |
   | Fakta om Alexander — verktøy, preferanse, begrensning | `minne/profil.md` |
   | Status/framdrift på eksisterende prosjekt | prosjektets `prosjekt.md` (+ `minne/prosjekter.md` hvis tverrgående) |
   | Retning som er forkastet | `minne/beslutninger.md` med dato, valgt, forkastet, fordi |
   | Duplikat av noe som allerede finnes | slå sammen inn i eksisterende prosjekt, ikke lag nytt |

3. Sett `verdi` og `innsats` (1–5) på hvert nytt prosjekt. Gjett heller enn å spørre —
   tallene er justerbare, og en tom kø er verre enn en unøyaktig kø.
4. `neste` skal alltid være én konkret handling som får plass i én kveld.
   «Jobbe med appen» er ikke gyldig. «Skisse datamodell for kortstokken» er.
5. Fjern behandlede linjer fra `minne/inbox.md`.
6. `python3 verktoy/bygg-indeks.py`
7. Commit: `minne: destiller inbox (<n> linjer)`

## Rapporter

Maks fem linjer tilbake til Alexander:
- antall linjer behandlet
- nye prosjekter opprettet, med navn
- toppen av køen etter regenerering
- eventuelle linjer du ikke klarte å plassere, og hvorfor

Ingen oppsummering av det han allerede vet.
