---
name: nettside-bygging
description: Bygg små, selvstendige nettsider og visuelle demoer (gallerier, spillere, generativ kunst) som én HTML-fil uten byggetrinn.
---

# Nettside-bygging

Perfekt for å vise frem Herdens produksjon: sanggallerier, bildeprompt-oversikter, demoer.

## Prinsipper
1. **Én fil**: All CSS og JS inline i én `index.html`. Ingen byggetrinn, ingen CDN-avhengigheter — åpnes med dobbeltklikk.
2. **Mobil først**: Relative enheter, flexbox/grid, `max-width: 100%` på bilder.
3. **Mørk og lys**: Respekter `prefers-color-scheme`.
4. **Norsk innhold, semantisk HTML**: `<article>`, `<nav>`, `<figure>` — ikke div-suppe.

## Typiske oppdrag
- **Galleri**: Grid av kort med tittel + prompt + kopier-knapp (`navigator.clipboard`).
- **Sangbok**: Filtrerbar liste (sjanger/språk) med utvidbare tekster.
- **Generativ kunst**: Canvas/p5.js-skisse med «regenerer»-knapp og seed i URL.

## Regler
- Test i nettleser (Playwright/Chromium er tilgjengelig) før du sier at det virker.
- Lagre i `herden/bygg/<navn>/index.html`.
- Ytelse: 100 elementer skal rendres uten hakking — lazy-load bilder.
