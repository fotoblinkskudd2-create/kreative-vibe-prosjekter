# Rolig – et lite pusterom

En liten, rolig web-app på norsk for å dempe stress og nedstemthet. Ingen
innlogging, ingen poeng, ingen streaks og ingen varsler. Alt lagres lokalt på
enheten din.

## Fire faner

| Fane | Hva den gjør |
| --- | --- |
| **Hjem** | «Hvordan har du det akkurat nå?» – stemningsskala med fem nivåer, valgfritt notat og en støttende kvittering med snarvei til Pusterom. |
| **Pusterom** | Rolig pusteøvelse med sirkel som vokser og minker (4 sek inn, 2 hold, 6 ut) i fem runder, pluss fire korte guidede øvelser. |
| **Små grep** | Sju enkle handlinger med kort forklaring, og mulighet til å markere «gjort i dag». |
| **Historikk** | «Din oversikt» – myk kronologisk liste over tidligere innsjekk med full notatvisning, og en rolig ukesoppsummering. |

## Kjøre appen

Ren HTML, CSS og JavaScript – ingen byggesteg og ingen avhengigheter. Appen
bruker ES-moduler, så den må serveres over HTTP (ikke åpnes som `file://`):

```bash
npx http-server -p 8080 .
# åpne http://localhost:8080/rolig/
```

Legg filene på hvilken som helst statisk webhost for å publisere.

## Lagring

Alt ligger i `localStorage` på enheten:

- `rolig.v1.checkins` – innsjekk med tidspunkt, dato, stemning og notat
- `rolig.v1.actions` – hvilke små grep som er markert som gjort, per dato

Ingenting sendes noe sted. Tømmer du nettleserdataene, forsvinner historikken.

## Struktur

```
rolig/
  index.html              app-skall og bunnnavigasjon
  assets/css/style.css    designsystemet (pastell, runde hjørner, mye luft)
  assets/js/app.js        hash-ruter mellom de fire sidene
  assets/js/store.js      lokal lagring
  assets/js/dom.js        små DOM- og datohjelpere
  assets/js/pages/        home.js, breathe.js, actions.js, history.js
```

## Tone og design

- Pastell: lys blå, sage-grønn, varm beige og off-white
- Runde hjørner, myke skygger, mye negativ space, rolig sans-serif
- Varm, aksepterende og ikke-dømmende tekst overalt
- Mobil-først, og respekterer `prefers-reduced-motion`

Appen er et pusterom, ikke helsehjelp. Har du det vondt over tid, snakk med
noen – fastlegen, Mental Helses hjelpetelefon 116 123, eller noen du stoler på.
