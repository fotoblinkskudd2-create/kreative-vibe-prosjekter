---
name: prosjekt-oppsett
description: Sett opp et nytt kodeprosjekt raskt og riktig — mappestruktur, avhengigheter, README og kjørbar «hello world» på under fem minutter.
---

# Prosjekt-oppsett

## Fremgangsmåte
1. **Velg letteste stack som løser jobben**:
   - Visuelt/nettleser: ren HTML + JS (én fil!) eller Vite
   - Script/data: Python med `uv` eller venv
   - Generativ kunst: p5.js eller Canvas
2. **Minimal struktur**: `src/`, `README.md`, avhengighetsfil. Ikke mer før det trengs.
3. **Kjørbart først**: Få «hello world» til å kjøre FØR du bygger funksjonalitet.
4. **README fra start** med tre linjer: hva det er, hvordan kjøre, hvordan det ser ut.

## Regler
- Nye prosjekter legges i `herden/bygg/<navn>/`.
- Ingen rammeverk-maksimalisme: ikke React for noe en HTML-fil løser.
- `.gitignore` opprettes samtidig med prosjektet (node_modules, .venv, .env, dist).
