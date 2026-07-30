# Luna — byggekurs

Bygging av én prototype, fra ingenting til fungerende objekt.
Følger [designspesifikasjonen](00-designspec.md).

**Total tid:** 22–30 timer arbeid, fordelt over 2–3 uker (keramikk og lim styrer kalenderen).
**Nivå:** du må kunne bruke en loddebolt og en symaskin. Du trenger ikke være god i noen av delene.
**Kostnad, ett stykk:** ca. 3 500–5 500 kr avhengig av om du dreier basen selv.

---

## Modulnivå

| Modul | Hva | Tid | Blokkerer |
|---|---|---|---|
| 0 | Innkjøp og forberedelse | 2 t | alt |
| 1 | Basen (keramikk + ballast + gummi) | 4 t + 2 ukers tørk/brenning | 6 |
| 2 | Indre skjelett | 4 t | 3, 4 |
| 3 | Lys og diffusor | 3 t | 5 |
| 4 | Skum og form | 4 t | 5 |
| 5 | Trekk og skjerf (søm) | 6 t | 6 |
| 6 | Sammenstilling og test | 3 t | — |

Modul 1 startes **først** og går parallelt med alt annet. Keramikk venter ikke på deg.

---

## Modul 0 — Materialliste

### Base
- Steintøyleire, ca. 4 kg (eller: kjøpt keramikkpotte Ø280 × H120, se snarvei under)
- Matt glasur, sandgrå
- Silikonplate Shore A 60–70, 3 mm, Ø270
- Kvartssand 3,5 kg + tett pose, eller betongskive Ø240 × 25 mm
- Gummigjennomføring for kabel, Ø8 mm hull

> **Snarvei:** har du ikke tilgang til dreieskive og ovn, kjøp en matt, uglassert
> plantepotte i steintøy i riktig mål og lim inn bunn. Du mister perfekt måltilpasning
> og vinner to uker. For prototype 1 er det riktig valg.

### Skjelett
- Bjørkefiner 6 mm, ca. 60 × 60 cm (til ringer)
- Furulekt 20 × 20 mm, 3 × 500 mm (vertikale ribber)
- Alternativ: PETG 3D-print, ca. 400 g
- Trelim D3, skruer 3,5 × 30

### Lys
- COB LED-bånd 24 V, 2700 K, CRI ≥ 95, 8–10 W/m — 1,2 m
- Opal polykarbonat 2 mm, ca. 50 × 50 cm (transmisjon 45–60 %)
- 2 × varmhvit LED 5 mm + 2 × opal akrylskive Ø14 mm
- Strømforsyning 24 V / 30 W, klasse II, **CE-merket ferdigprodukt**
- ESP32-C3 eller RP2040 + 2 × MOSFET-driver
- Tekstiltrukket kabel 2 m med støpsel
- Aluminiumsplate 100 × 100 × 2 mm (kjøling/montasje)

### Kropp
- PU-skum 20 mm, tetthet 30 kg/m³, ca. 1,5 m²
- Vatt 100 g/m² til utjevning, ca. 1 m²
- Ull/bomull 60/40, 280–340 g/m², **flammehemmende (EN 1021-1/-2)**, 1,5 m
- Samme i tynn kvalitet 180–220 g/m² til skjerf, 0,4 m
- Skjult glidelås 320 mm
- Sytråd i grunnfargen, kontaktlim for skum

### Verktøy
Stikksag, pussepapir K120/K240, symaskin, loddebolt, avbitertang, multimeter,
varmluftpistol (krymp), skarp brødkniv (til skum — best verktøyet som finnes),
sandpapir-svamp.

---

## Modul 1 — Basen

1. Drei/støp Ø280 × H120 med godstykkelse 8–10 mm. La bunnen være tykkere (15 mm).
2. Skjær en not for silikonplaten i bunnkanten, 3 mm dyp, før tørking.
3. Bor kabelhull Ø10 mm i bakveggen, 25 mm over bunn, mens leiren er lærhard.
4. Tørk sakte (avisrundt, 5–7 dager), råbrenn, glasér matt, glattbrenn.
5. Etter brenning: legg inn ballast. Sanden skal ligge **helt i bunn og ikke kunne
   bevege seg** — en pose som sklir gjør Luna ustabil på en måte som er vanskelig å feilsøke.
6. Lim silikonplaten i noten med nøytralherdende silikon. La herde 24 t.

**Sjekkpunkt:** basen alene skal veie 4,5–5,5 kg og ikke vippe når du dytter den i kanten.

---

## Modul 2 — Skjelettet

Kroppen er en tønne, ikke en sylinder. Fem ringer definerer den:

| Kote (mm over base) | Ringdiameter |
|---|---|
| 0 (i basen) | 250 |
| 100 | 285 |
| 180 (midje) | 300 |
| 280 (skulder, bredeste) | 340 |
| 400 | 235 |
| 460 (isse, lukket) | 150 |

1. Tegn ringene på finer, skjær ut med stikksag, puss kantene runde (R3 minst — dette er
   under skummet, men skarpe finerkanter skjærer seg gjennom skum over tid).
2. Fest de tre vertikale ribbene innvendig mot ringene, 120° fra hverandre. Én ribbe
   skal ligge **bak** — den blir kabelvei og festepunkt for berøringselektroden.
3. Hodeseksjonen (kote 390–460) bygges som en egen liten kurv, festet med 8° helling
   fremover. Bruk en kile skåret i 8° mellom halsringen og hodeseksjonen — ikke prøv
   å «bøye det til». Vinkelen må være repeterbar.
4. Skjelettet festes til basen med tre M6-innsatser i en trekrans limt inne i keramikken.
   Luna skal kunne skrus fra hverandre. Du kommer til å ville inn igjen.

**Sjekkpunkt:** skjelett + base står, veltevinkel målt med gradskive ≥ 35° (den blir litt
lavere når kroppen får vekt, derfor margin her).

---

## Modul 3 — Lys og diffusor

1. Rull opal PC-arket til en sylinder Ø210 mm, høyde 300 mm (kote 60–360). Skjøt med
   tape på innsiden. Dette er diffusoren.
2. LED-båndet festes **innvendig i diffusoren, i en vertikal sløyfe** — opp én side,
   over toppen, ned den andre. Ikke spiral: spiral gir striper i lyset som konkurrerer
   med stripene i stoffet.
3. Kontroller avstanden LED → diffusor: **minimum 25 mm hele veien.** Sjekk med en
   pinne, ikke med øyemål.
4. Øyne-LEDene monteres i hodeseksjonen bak akrylskivene, senteravstand 68 mm,
   kote 415, symmetrisk om fronten. De skal peke litt nedover (samme 8°).
5. MCU og drivere skrus på aluminiumsplaten i basen. Alle skjøter loddes og krympes —
   ingen wago-klemmer inne i et objekt som skal stå på et nattbord i ti år.
6. Kabelen inn gjennom gummigjennomføringen, med en knute eller strekkavlaster
   **innenfor** gjennomføringen.

**Sjekkpunkt — kjør denne før noe stoff kommer på:**
- Tenn på full effekt i 60 minutter.
- Mål temperatur på diffusorens utside. **Over 45 °C: stopp, reduser effekt eller øk luftspalten.**
- Se etter synlige punkter i diffusoren. Ser du prikker nå, ser du dem gjennom stoffet også.

## Pusteanimasjon

Øynene: sinus, 0,20 Hz, intensitet 40 → 70 → 40 %. Bruk PWM med minst 10 bit oppløsning
og gamma-korrigering (γ ≈ 2,2), ellers ser «pusten» hakkete ut i den nedre enden.
Kroppslyset pulserer **ikke**. Bare øynene. Et helt objekt som puster blir urovekkende;
to små lys som puster blir levende.

---

## Modul 4 — Skum og form

1. Skjær skumbaner som følger ringdiametrene, 20 mm tykt, med 10 mm overlapp i skjøtene.
2. Lim med kontaktlim på skjelettet. Jobb nedenfra og opp.
3. **Form med brødkniv.** Alle overganger skal ha R15 minst. Kjenn etter med håndflaten,
   ikke med fingertuppen — håndflaten finner kanter øyet ikke ser.
4. Legg vatt over hele kroppen. Vatten er det som gjør at skjøtene i skummet forsvinner.
5. Skjær ut en åpning i skum/vatt foran diffusoren? **Nei.** Skummet skal gå over
   diffusoren — det er det som gjør at gløden blir jevn i stedet for et vindu.
   20 mm skum + vatt slipper gjennom nok lys ved 8 W.

**Sjekkpunkt:** tenn lyset med skummet på, i mørkt rom. Nå ser du hvordan Luna faktisk
kommer til å gløde. Juster effekt her, ikke etterpå.

---

## Modul 5 — Trekk og skjerf

1. Lag mønsteret i billig bomull først. Alltid. Et trekk til en dobbeltkrum form treffer
   aldri på første forsøk.
2. Trekket er 6 kiler + en issedel. Kilene er bredest ved skulder.
3. Stripene: legg dem **vertikalt, uregelmessig fordelt**, 6–14 mm brede, 40–90 mm mellomrom.
   Aldri to like mellomrom etter hverandre. Regelmessige striper leser som produkt;
   uregelmessige leser som tekstil.
4. Munnen: en søm 45 mm bred, 2 mm dyp, trukket inn med tråd til vatten under.
   Sy den **etter** at trekket sitter, ellers havner den skjevt.
5. Skjult glidelås i den bakre sømmen, 320 mm, med stoffklaff over.
6. Skjerfet: sy fast i én søm på venstre skulder, la resten falle fritt. Test at sømmen
   tåler at noen drar i det (60 N ≈ 6 kg — heng en bøtte vann i det).
7. Nederste stoffkant brettes inn under skjelettets bunnring, mellom kropp og keramikk.
   Skjøten skal ikke være synlig fra noen vinkel i øyehøyde.

---

## Modul 6 — Sammenstilling og sluttest

1. Kropp på base, tre M6-skruer.
2. Berøringselektroden (60 × 40 mm kobberfolie) limes på bakre ribbe under stoffet i
   skulderhøyde. Kalibrer terskelen med trekket på — stoffet endrer kapasitansen.
3. **Testliste, alle skal passere:**

| Test | Krav |
|---|---|
| Veltevinkel | ≥ 30°, retter seg opp fra 15° |
| Overflatetemp. etter 2 t på full effekt | ≤ 40 °C på stoffet |
| Berøring av/på | 10 av 10 forsøk |
| Dimming 1 % | ingen flimmer, ingen hopp |
| Øyepust | jevn, ingen hakking i bunn av kurven |
| Kabeluttrekk | 100 N uten bevegelse |
| Skarpe kanter | ingen R < 15 mm ved håndflatetest |
| Synlig plast | ingen, fra alle vinkler i sittende øyehøyde |
| Trekk av/på | glidelås, uten verktøy, under 2 min |

4. La den stå tent en hel kveld i rommet den skal bo i, før du kaller den ferdig.
   Halvparten av feilene i et slikt objekt oppdages ikke på arbeidsbenken — de oppdages
   når du sitter i sofaen og noe ved den er litt feil.

---

## Sikkerhet — ikke valgfritt

- Nettspenning skal aldri inn i objektet. Ekstern, sertifisert strømforsyning, punktum.
- Stoffet skal være flammehemmende behandlet. Det ligger tekstil over en varmekilde.
- 45 °C-grensen på diffusoren er ikke en anbefaling. Over det begynner PU-skum og
  tekstil å gulne, og margin mot feiltilstander forsvinner.
- Ballasten skal være sikret. En løs vekt i en base er verre enn ingen ballast.

---

## Neste versjon

Ting som er bevisst utsatt fra v1: lyd, sensorer, radio, bevegelse i munnen,
batteridrift. Alle fem gjør Luna til en maskin. Bygg v1 ferdig og lev med den en måned
før du vurderer noen av dem.
