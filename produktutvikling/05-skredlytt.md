# 5. SKREDLYTT
## Geofon- og infralydnett for skredvarsling
### Sider 15–17

---

## SIDE 15 — IDÉ OG DESIGN

### Kilde
Akustisk analyse + norsk geografi. Et snøskred er en lydhendelse før det
er en nyhetshendelse: infralyd (1–5 Hz) forplanter seg kilometervis
gjennom luft, seismikk (10–50 Hz) gjennom grunn. Signalbehandlingen som
skiller et skred fra vind, fly og scooter er samme verktøykasse jeg bruker
på musikk og støy: spektral signatur, transientform, koherens mellom
sensorer. Kompetansen er flyttbar. Fjellet bryr seg ikke om at jeg lærte
FFT på gitarklang.

### Problem
Skredutsatte veier (Fv. i Vestland, Troms) stenges i dag på værprognose og
skjønn — for sent når det smeller, for ofte når det ikke gjør det — fordi
faktisk skredaktivitet i sanntid ikke måles på annet enn et fåtall dyre
radaranlegg.

### Produkt
Batteridrevne sensornoder (geofon + infralydmikrofon) som spikres i
terrenget over en veistrekning, lytter en hel vinter på ett batterisett,
og melder detekterte skred med posisjon og størrelsesestimat over LoRaWAN
innen sekunder — til Statens vegvesen, NVE og lokale beredskapsaktører.

### Design
- **Node:** LiSOCl₂-batterier (fungerer til −40 °C), geofon 10 Hz,
  MEMS-infralydmikrofon med vindfilter (porøs plate + volum), STM32
  med analog vekkekrets — MCU-en sover til fjellet sier noe.
- **Nett:** 6–10 noder per dalside, LoRaWAN til gateway ved vei (strøm
  fra veiskap), 800 m nodeavstand (side 16).
- **[ORIGINAL] To-domene koinsidens:** deteksjon krever samtidig treff i
  *både* seismisk og infralyd-domene med riktig tidsforsinkelse mellom
  nodene (utbredelseshastighet skiller domenene: ~340 m/s i luft, km/s i
  grunn — et ekte skred gir et karakteristisk dobbelt-ankomstmønster).
  Radaranlegg ser én flanke; kamerabaserte løsninger ser ingenting i
  snøvær. Koinsidenskravet er det som dreper falske alarmer, og falske
  alarmer er det som dreper tilliten, og tillit er hele produktet.
- **Klassifisering:** lettvekts nevralt nett *på gatewayen* (ikke i noden
  — noden skal bare våkne og strømme 20 s buffer), trent på åpne
  skredsignatur-datasett + egne opptak.

Wyssen og Geopraevent (Sveits) selger radar til 1–3 MNOK per installasjon.
SKREDLYTT sikter på 150–250 000 NOK per strekning. Ikke bedre enn radar —
*billig nok til å være overalt*, som radar aldri blir.

---

## SIDE 16 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 5.

### Batterilevetid — hele produktets eksistensgrunnlag
| Post | Strøm |
|---|---|
| Analog lyttekjede, kontinuerlig | 1,80 mA |
| MCU dyp søvn | 0,012 mA |
| LoRa TX (6 hendelser/status/døgn à 4 s) | 0,013 mA snitt |
| **Snitt** | **1,82 mA @ 3,6 V** |

2 × LiSOCl₂ D-celler (13 Ah) med 75 % kuldederating: **223 døgn = 7,4
måneder.** En vintersesong er ~5 måneder. Margin 48 %. Noden settes ut i
oktober på barmark og hentes/byttes i juni. Ingen vinterservice — det er
kravet som styrer alt, fordi service i skredterreng om vinteren er både
livsfarlig og økonomisk absurd.

### Rekkevidde og nettgeometri
Infralyd ved 2 Hz demper ~0,2 dB/km i luft — avstand er nesten gratis;
det er vindstøy, ikke demping, som begrenser. Med publiserte kildestyrker
for skred >5 000 m³ gir 800 m nodeavstand SNR >12 dB etter vindfilter.
6 noder dekker en typisk utsatt dalside; tidsdifferanse mellom node-
ankomster gir posisjon langs strekningen til ±150 m — nok til å si
*hvilket* gjel, som er det veitrafikksentralen faktisk spør om.

### Det simuleringen ikke fanger
Vindstøy-statistikken (den reelle deteksjonsgrensen — vindfilteret må
verifiseres i felt, ikke regnes), snødekkets demping av seismikk gjennom
sesongen, og LoRa-linkbudsjett i dyp daltopografi (kan kreve repeater-node
på rygg). Klassifisererens falsk-positiv-rate kan bare måles med en full
vinter med data. Derfor er pilotvinteren *datainnsamling*, ikke varsling —
det loves ingenting til noen før én sesong er logget.

### Verifikasjon i prototyp
Pass/fail: 3 noder overlever nov–apr i felt (Vestland, kjent skredløp
valgt med lokal veiledning), batterisving < beregnet +20 %, og datasettet
inneholder minst 5 verifiserbare skredhendelser (kryssjekk mot regObs/NVE).

---

## SIDE 17 — MARKED OG PROTOTYP

### Marked
Kunder er ikke forbrukere. De er tre institusjoner og de kjøper trygghet
i anbudsformat:
1. **Statens vegvesen / fylkeskommunene.** Hundrevis av registrerte
   skredpunkt på fylkesveinettet; stengningskostnad (omkjøring, kolonne,
   samfunnskost) er utredet i NVDB-data — argumentasjonen skrives med
   deres egne tall.
2. **NVE** — regionale varslingsdata; kjøper data, ikke jernvare.
3. **Bane NOR** — samme problem på skinner, høyere betalingsvilje.
4. Sekundært: alpinanlegg (kontrollsprengnings-verifikasjon: «gikk det
   faktisk et skred da vi sprengte?» er et reelt udekket spørsmål).

Prismodell: **installasjon 180 000 NOK per strekning + 4 000 NOK/mnd**
drift og data. Node-BOM ~2 800 NOK. Marginen ligger i data-abonnementet,
og abonnement til offentlig sektor er langsomt å selge og nesten umulig
å miste. Salgssyklus: 12–24 mnd, anbud. Det er produktets største kostnad
og største vollgrav i ett.

### Prototyp
| Post | NOK |
|---|---|
| 3 noder (geofon, MEMS, STM32, LoRa, kapsling IP68) | 8 400 |
| LiSOCl₂-batterier | 2 100 |
| Gateway (Pi + LoRa-konsentrator + 4G) | 3 800 |
| Feltmontasje, forankring, frakt | 4 500 |
| Klassifiserer-utvikling (åpne datasett + egen tid) | 0 |
| **Sum** | **18 800** |

Byggetid: 6 uker bygging (høst), deretter én vinter passiv datafangst.
Det lange kalenderløpet er ikke valgfritt — fysikken har årstider.
Sikkerhet: utsett kun på barmark, aldri opphold i utløpssone om vinteren,
lokal skredkyndig konsulteres på nodeplassering. Ikke forhandlingsbart.

### Dom
**BYGG NODENE NÅ, SELG OM 18 MND.** Billigste prototyp i porteføljen, men
lengst vei til inntekt. Den asymmetrien er akseptabel fordi utsettelse
koster en hel vinter: noder som ikke står ute i november, lærer ingenting
før neste november. Kalenderen, ikke kapitalen, er den knappe ressursen her.
