# Vibe-kort

En kortstokk med 100 kreative gnister — konkrete, konsentrerte idéer du faktisk kan bygge, fordelt på fire kategorier:

- **◆ Idealistisk** — nabolagsprosjekter og ideelle initiativ
- **♪ Musikk** — konseptalbum og lydidéer
- **▲ Satire** — parodier og skarpe konsepter
- **▶ Video** — videoserier og formater

## Kjøre appen

Ingen installasjon, ingen build, ingen avhengigheter.

```
open vibe-kort/index.html
```

eller dobbeltklikk `index.html` i filutforskeren. Fungerer også servert (`python3 -m http.server` fra denne mappen), om du foretrekker det.

## Bruk

| Handling | Hvordan |
|---|---|
| Snu kortet | Klikk kortet, eller trykk `mellomrom`/`Enter` |
| Bla gjennom stokken | Piltastene `←` `→`, eller pilknappene |
| Trekk et tilfeldig kort | «✦ Trekk tilfeldig kort»-knappen |
| Stokk stokken på nytt | «⟲ Stokk kortstokken» |
| Filtrer på kategori | Kategori-chipsene øverst |
| Lagre et kort | Hjerteikonet på kortets bakside, eller tast `f` |
| Se lagrede kort | Hjerteknappen øverst til høyre |
| Eksporter idéene dine | «⇩ Eksporter pitch-ark» i skuffen — laster ned en `.md`-fil klar til å dele eller pitche videre |

Favoritter lagres lokalt i nettleseren (`localStorage`) — ingenting sendes til noen server.

## Struktur

```
vibe-kort/
├── index.html       markup + tilgjengelighet (aria-live, tastatur, roller)
├── style.css         designsystemet — mørk scene, én aksentfarge per kategori
├── app.js            all logikk: kortstokk, filter, favoritter, eksport
├── data/cards.js      100 kort som ren data (tittel, pitch, kategori, innsats)
└── DESIGN.md          refleksjon over designvalgene
```

## Utvide kortstokken

Legg til flere kort i `data/cards.js` — hvert kort er ett objekt:

```js
{ id: 101, category: "idealistisk", title: "...", pitch: "...", effort: "lav" }
```

`category` må matche en nøkkel i `CATEGORIES` (samme fil). `effort` er `"lav"`, `"medium"` eller `"høy"`.
