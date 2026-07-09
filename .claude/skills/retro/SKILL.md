---
name: retro
description: Kjør en 60-sekunders retro på sesjonen - destillerer lærdom inn i CLAUDE.md via retro-analyst-subagenten. Brukes når brukeren skriver /retro eller avslutter en arbeidsøkt og vil lagre lærdommene.
---

# Retro

Lukk læringsloopen for denne sesjonen: det som gikk tregt eller galt nå, skal gå riktig på første forsøk neste gang.

## Steg

1. Oppsummer for deg selv sesjonens friksjonspunkter: hva brukeren måtte korrigere, hva som feilet på første forsøk, hvilke konvensjoner som ble oppdaget underveis. Vær konkret — dette sendes til analytikeren.
2. Spawn subagenten `retro-analyst` med denne konteksten (friksjonspunktene, og hvilke filer/kommandoer som var involvert). Den leser diffen selv og oppdaterer `CLAUDE.md` under `## Lært av erfaring`.
3. Vis brukeren diffen av CLAUDE.md og analytikerens rapport (lagt til / slettet / forkastet).
4. Hvis brukeren godkjenner (eller allerede har bedt om commit): commit med melding `retro: <kort oppsummering av lærdommene>`.

## Regler

- Budsjettet håndheves av subagenten: maks 3 nye regler per retro, maks 20 linjer totalt i seksjonen.
- En tom retro (ingen kvalifisert lærdom) er et gyldig og ærlig resultat — ikke press frem regler.
