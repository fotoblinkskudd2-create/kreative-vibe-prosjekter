# ProblemKnuser 💥

En gøyal, gamifisert problemløser-app. Ren HTML/CSS/JS — ingen avhengigheter, ingen build-steg.

## Slik fungerer det

1. **Skriv inn problemet ditt** — appen kategoriserer det automatisk (Jobb, Relasjoner, Penger, Helse, Kreativitet, Annet).
2. **Spin perspektiv-hjulet** — få en tilfeldig tankeknekker (5 Hvorfor, Pre-mortem, Gummiand-forklaring, osv.) før du planlegger noe.
3. **Følg handlingsplanen** — tre konkrete, kategori-spesifikke skritt. Kryss av for å tjene XP.
4. **Knus problemet** — fullfør alle tre skritt for bonus-XP, konfetti og en plass i historikken.

XP, level, streak og historikk lagres lokalt i nettleseren (`localStorage`) — ingen server, ingen konto.

## Kjøre appen

Åpne `index.html` direkte i en nettleser, eller server mappen lokalt:

```bash
cd problemknuser
python3 -m http.server 8000
# åpne http://localhost:8000
```

## Filer

- `index.html` — struktur
- `style.css` — vibrant, mørkt gamification-tema
- `script.js` — all logikk: kategorisering, teknikker, XP/level, konfetti, localStorage
