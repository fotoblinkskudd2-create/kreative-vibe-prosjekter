# Research — eksisterende tic-hjelpemidler (juli 2026)

## Markedsoversikt

| Løsning | Metode | Deteksjon | Pris | Status i Norge |
|---|---|---|---|---|
| Neupulse | Håndleddsklokke, median nerve stimulation (MNS), 10–12 Hz rytmiske pulser | Nei — manuell trykknapp | ~5000–6000 kr + mnd.abonnement | Ikke offisielt lansert, pre-order/UK-levering, privatimport mulig |
| DIY Pico + TENS (GitHub-community) | Raspberry Pi Pico + TENS-pads, åpen kildekode | Delvis, enkle terskler | Delekostnad ~200–400 kr | Ingen — selvbygd |
| Biofeedback-apper/-spill (f.eks. Mightier-lignende) | Hjerterate/pust-basert regulering via app/spill | Ja, men krever aktiv sesjon | App-abonnement | Tilgjengelig |
| Neurofeedback-klinikker | EEG-trening over uker/måneder | Ja, klinisk | Høy (klinikkbesøk) | Tilgjengelig, men krever oppmøte |

## Vurdering

- Neupulse sin styrke: klinisk validert MNS-effekt (25%+ reduksjon i
  studier), lett å bruke ("trykk-knapp, bruk når du vil").
- Neupulse sin svakhet: **passiv** — brukeren må selv oppdage
  urge/tic og trykke. Ingen automatisk deteksjon. Abonnementsmodell,
  lang leveringstid, ikke offisielt i Norge.
- DIY Pico+TENS: billig og hackbart, men ingen ordentlig deteksjonslogikk —
  stort sett manuell/timer-basert bruk.
- Biofeedback/neurofeedback: god langsiktig trening, men ikke en
  "i øyeblikket"-løsning — krever sitting/app-sesjon.

## Konklusjon → hva TicShield gjør annerledes

TicShield sikter på å kombinere det beste fra begge verdener:

1. **Automatisk deteksjon** (som mangler i Neupulse) via IMU-basert
   burst-gjenkjenning, i stedet for at brukeren må trykke selv.
2. **Umiddelbar counter-stim** (vibrasjon i MVP, evt. trigger til
   sertifisert TENS-apparat) — ingen ventetid, ingen sesjon.
3. **Eid av brukeren** — egen kode, egen hardware, ingen abonnement,
   ingen venteliste.
4. **Billigere** — ca. 200–400 kr i deler mot 5000–6000 kr + abonnement.

## Import av Neupulse — kort vurdering

Privatimport fra UK er i utgangspunktet mulig (personlig bruk, medisinsk
utstyr til eget bruk er normalt tillatt inn i Norge uten spesiell
godkjenning, men sjekk gjeldende tollregler og ev. CE-merking før kjøp).
Dette er ikke undersøkt i detalj her — hvis import er aktuelt parallelt
med DIY-sporet, bør det sjekkes opp mot gjeldende regelverk hos Tolletaten
og Legemiddelverket før bestilling.
