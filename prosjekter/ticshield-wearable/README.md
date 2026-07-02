# TicShield — DIY tic-deteksjon & counter-stim wearable

Åpen, egen-bygd wearable som forsøker å detektere tic/urge-bursts i sanntid
(IMU-basert bevegelsesanalyse) og svarer umiddelbart med haptisk
counter-stimulering (vibrasjon). Inspirert av Neupulse (median nerve
stimulation) og DIY Pico+TENS-prosjekter, men bygget som egen, billig,
hackbar plattform.

## ⚠️ Sikkerhet først

Dette er **ikke et godkjent medisinsk utstyr**. Les dette før du bygger noe:

- **Elektrisk stimulering (TENS/MNS) skal IKKE kobles direkte fra egne,
  hjemmebygde strømkretser mot huden.** Design og testing av trygge
  strømdrivere for nervestimulering krever elektroteknisk/medisinsk
  kompetanse og sertifisering (CE/FDA) — feil strøm/spenning kan gi
  brannskader eller verre.
- Denne prototypen (firmware i `firmware/ticshield/`) håndterer kun
  **sensor + vibrasjonsmotor** (helt trygt, samme prinsipp som en
  smartklokke). Vibrasjon er selve counter-stim-signalet i MVP-en.
- Hvis du vil ha faktisk MNS/TENS-stimulering: bruk et **ferdig sertifisert
  TENS-apparat** (finnes fritt i butikk/nett) og la TicShield sende et
  triggersignal til apparatets manuelle knapp (f.eks. via et relé eller
  optokobler), i stedet for å bygge egen strømkrets. Se
  `docs/handleliste.md`.
- Ikke bruk stimulering nær hjertet, med pacemaker, ved epilepsi, graviditet
  eller andre kontraindikasjoner uten å ha snakket med lege først.
- Dette er et personlig eksperiment/hobbyprosjekt, ikke medisinsk
  rådgivning.

## Konsept

1. **Sense**: IMU (akselerometer + gyro) på håndledd fanger opp de raske,
   rykkvise bevegelsesmønstrene som ofte følger med tics/urge.
2. **Detect**: Firmware regner ut en rullende baseline for normal bevegelse
   og flagger et "burst" når bevegelsesenergien plutselig stikker over
   terskel i et kort tidsvindu.
3. **Respond**: Umiddelbar vibrasjonspuls (counter-stim / sensorisk
   avledning) + valgfri triggerpuls ut til eksternt sertifisert TENS-apparat.
4. **Log**: Hver hendelse tidsstemples og sendes over serial/BLE, slik at du
   kan måle burst-frekvens før/etter og se om vibrasjons-responsen faktisk
   reduserer frekvensen.

## Struktur

```
ticshield-wearable/
├── README.md                          (dette dokumentet)
├── firmware/ticshield/ticshield.ino    (ESP32/Arduino-kode, klar til å flashe)
└── docs/
    ├── handleliste.md                  (BOM / delelister, 3D-print-noter)
    ├── research-neupulse.md            (markedsoversikt, sammenligning)
    ├── uke-plan.md                     (dag-for-dag byggeplan)
    └── skill-ticshield-mns-hack.md     (skill/agent-definisjon for auto-logging)
```

## Status / roadmap

- [x] Research: kartlagt eksisterende løsninger (Neupulse, DIY Pico+TENS,
  biofeedback-apper).
- [x] Kode-skisse: burst-deteksjon + vibrasjonsrespons (v0.1, se firmware).
- [ ] Bygge fysisk MVP og teste burst-deteksjon mot ekte bevegelsesdata.
- [ ] Kalibrere terskelverdier per bruker.
- [ ] Legge til BLE-logging til app/dashboard.
- [ ] Vurdere trigger-integrasjon mot sertifisert TENS-apparat (via relé).

## Neste steg

Se `docs/uke-plan.md` for dag-for-dag plan, og `docs/handleliste.md` for hva
som må bestilles før byggingen kan starte.
