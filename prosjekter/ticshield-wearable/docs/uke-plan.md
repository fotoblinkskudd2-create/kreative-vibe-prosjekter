# Byggeplan — TicShield

## Dag 1 — research + kode-skisse (gjort i denne commiten)

- [x] Kartlagt eksisterende løsninger (`research-neupulse.md`).
- [x] Kode-skisse klar til å flashe (`firmware/ticshield/ticshield.ino`).
- [x] Handleliste/BOM klar (`handleliste.md`).
- [ ] Bestill deler (se `handleliste.md` — lokalt for rask MVP, AliExpress
  for billigere reserve-deler).

## Dag 2–3 — bygg MVP

- Koble opp ESP32 + MPU6050 + vibrasjonsmotor på breadboard (ingen
  hudkontakt-elektronikk ennå).
- Flash `ticshield.ino`, verifiser at burst-deteksjon logger fornuftig over
  Serial ved bevisst rykkvis håndbevegelse.
- Kalibrer `BURST_THRESHOLD_MULT` og `BURST_WINDOW_MS` mot faktiske
  bevegelsesmønstre — start bredt, stram inn basert på falske positiver.
- Test i en reell situasjon (f.eks. mens du ser en kamp) og noter:
  - Antall bursts detektert
  - Antall falske positiver/negativer (sammenlignet med manuell markering
    via knappen)

## Uke 1–2 — utvidelser

- Legg til BLE-logging (ESP32 har dette innebygd) slik at hendelser kan
  sendes til en enkel dashboard-app i stedet for kun Serial.
- Vurder om triggerpin skal kobles til et sertifisert TENS-apparat via
  optokobler (se sikkerhetsnotat i README).
- Iterer på deteksjonsalgoritmen basert på loggdata — vurder enkel
  terskel-adaptasjon per bruker (morgen vs. kveld, aktivitetsnivå).
- Se på 3D-print av eget kabinett når breadboard-versjonen fungerer stabilt.

## Måling av suksess

- Baseline: tell bursts (manuelt eller via knapp) i en periode UTEN
  vibrasjonsrespons.
- Test: samme situasjon MED vibrasjonsrespons aktiv.
- Sammenlign frekvens før/etter — dette er din egen data, ikke en klinisk
  studie, men gir en reell indikasjon på om counter-stim-tilnærmingen
  hjelper for deg.
