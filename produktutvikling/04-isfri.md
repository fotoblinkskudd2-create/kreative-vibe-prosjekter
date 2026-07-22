# 4. ISFRI
## Pulset de-ising for vinterdroner
### Sider 12–14

---

## SIDE 12 — IDÉ OG DESIGN

### Kilde
Dronedesign møter norsk virkelighet. Alle dronetimer jeg har planlagt
oktober–mars har hatt samme usikkerhet: ikke vind, ikke lys — *ising*.
Underkjølt tåke og yr legger milimeter med is på propellkanter i løpet av
minutter, løftet dør, og dronen faller ned. Bransjeløsningen er å la være
å fly. I landet der inspeksjonssesongen er vinter. Det er ikke en løsning,
det er en kapitulasjon.

### Problem
Kommersielle multirotordroner kan ikke operere i isingsforhold, som på
Vestlandet og i Nord-Norge betyr at 30–50 % av vinterdagene er tapt for
kraftlinje-, vindturbin- og beredskapsoppdrag.

### Produkt
Et ettermonterbart de-isingsystem for inspeksjonsdroner: varmeelement
integrert i propellblad, isdeteksjon, og pulset styring som fjerner is
i sykluser i stedet for å forhindre den kontinuerlig.

### Design
- **Varmeelement:** tynnfilm-motstandsfolie (samme prinsipp som fly-
  propellstøvler) innstøpt under bladets fremkant-laminat.
- **[ORIGINAL] Kraft uten sleperinger:** effektoverføring til det roterende
  bladet via en luftgap-transformator i navet — flat spole i motorfestet,
  flat spole i propellnavet, 100 kHz resonant. Ingen sleperinger (slitasje,
  havari), ingen batterier i bladet (ubalanse). Kommersiell fly-de-ising
  bruker sleperinger; hobbyforsøk bruker varme på armene og ignorerer
  bladene der isen faktisk dreper løftet. Roterende induktiv overføring til
  selve bladet i denne størrelsesklassen er den originale biten.
- **Isdeteksjon:** ingen egen issensor. Flightcontrolleren vet allerede alt:
  når effekt-per-skyvekraft driver oppover ved konstant turtall og
  lufttetthet, bygges is. Deteksjon i programvare, terskelstyrt puls.
- **Styring:** 10 % duty-syklus, blad-par for blad-par, synkronisert med
  detektert isvekst. Sentrifugalkraften kaster løsnet is av — varmen skal
  bare bryte vedheftet, ikke smelte alt. Det er hele energiregnestykket.

Ingen ettermarkedsløsning finnes. UBIQ Aerospace (Trondheim) gjør dette
for fixed-wing militært/industrielt — stor validering av problemet, feil
segment og prisklasse for multirotor-massemarkedet.

---

## SIDE 13 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 4.

### Hvorfor anti-ising er dødfødt og de-ising lever
Å *holde* bladet ved +2 °C i −10 °C og høy lokal lufthastighet krever
(h = 120 W/m²K, 0,022 m² bladflate per propell):

- **32 W per propell, 127 W for fire — kontinuerlig.**

På en 3,2 kg drone med 274 W hover-effekt er det 46 % påslag. Dødfødt.

Pulset de-ising med 10 % duty: **13 W snitt**. Regnestykket snur helt:

| Konfigurasjon | Effekt | Flytid (266 Wh) |
|---|---|---|
| Ren drone | 274 W | 49 min |
| + de-ising aktiv (10 % duty + 8 W elektronikk) | 295 W | 46 min |

**7 % flytidstap** for å fly på dager som ellers er 100 % tapt. Det er
ikke en kostnad, det er en rabatt.

### Induktiv overføring
130 W topp gjennom 2 mm luftgap ved 100 kHz resonant: velprøvd fysikk
(Qi gjør 15 W gjennom mer; industrielle roterende transformatorer gjør
kilowatt). Virkningsgrad-mål 85 %; tapene er med i 8 W-posten. Utfordringen
er masse i navet: budsjett 9 g per nav, 36 g totalt + 60 g styreboks.
Under 3 % av dronemassen. Akseptabelt.

### Det simuleringen ikke fanger
h-verdien (konvektiv koeffisient) på et roterende blad varierer kraftig
langs radius — 120 W/m²K er konservativt snitt, ytre tredjedel er verre og
er også der isen betyr mest. Fremkant-laminatets termiske treghet avgjør
pulslengden. Og deteksjonsterskelen mot falske positive (regn, turbulens)
er ren empiri. Alt dette er klimakammer-arbeid, ikke skrivebordsarbeid —
derfor er verifikasjonen designet rundt fryserom.

### Verifikasjon i prototyp
Pass/fail i leid fryserom med tåkedyse (−8 °C): referansepropell mister
30 % skyvekraft på X minutter; ISFRI-propell holder ≥95 % skyvekraft over
3× samme periode, målt på rigg. Ikke flygning før riggen har bevist det.

---

## SIDE 14 — MARKED OG PROTOTYP

### Marked
Kjøpere med kvantifiserbar smerte:
1. **Kraftlinjeinspeksjon.** Statnett + nettselskaper; linjefeil skjer om
   vinteren, inspeksjonsbehovet er størst nøyaktig når dronene ikke kan fly.
2. **Vindkraft.** Turbinblad-inspeksjon; parker står i isingsklima per
   definisjon.
3. **Beredskap.** Politi, redning, brann — de flyr ikke når de vil, de
   flyr når det skjer. Ising er en operativ nektelse.
4. **Nord-Norge/fjell-operatører generelt.**

Betalingsvilje: en tapt vinterinspeksjonsdag koster en operatør 15–40 000
NOK. Systempris **24 900 NOK** per drone (4 propeller + naver + styreboks)
er én til to reddede dager. BOM-mål i produksjon: 6 500 NOK.

Konkurrense: ingen i multirotor-ettermarkedet. UBIQ validerer problemet i
fixed-wing. Størst reelle trussel: DJI bygger det inn om tre år. Mottrekk:
selge patenterbar navløsning eller lisens *til* plattformeiere; exit
gjennom oppkjøp er et akseptabelt utfall, ikke et nederlag.

### Prototyp
| Post | NOK |
|---|---|
| Testdrone 3 kg-klasse (brukt) | 12 000 |
| Folieelementer, laminering, 12 blad | 3 400 |
| Induktiv overføring: spoler, driver, likeretter ×4 | 4 800 |
| Styreelektronikk + FC-integrasjon | 2 100 |
| Skyvekraftrigg (deles med STILLEPROP) | 0 |
| Fryseromsleie + tåkerigg, 3 økter | 7 500 |
| **Sum** | **29 800** |

Byggetid 8 uker — på grensen av metoderegelen, drevet av fryserom-
logistikk. Uke 1–3 induktiv overføring på benk (den tekniske risikoen),
uke 4–5 bladlaminering, uke 6–8 fryseromsøkter. Regulatorisk: modifisert
propell = operatørens SORA-ansvar; for C-merkede droner er ettermontering
formelt krevende i åpen kategori → målgruppen er spesifikk kategori-
operatører, som uansett er de som betaler.

### Dom
**BYGG, men etter STILLEPROP.** Deler rigg og målemetodikk, og STILLEPROP-
kundene er identiske med ISFRI-kundene. Én kundeliste, to produkter.
Rekkefølgen er logistikk, ikke tvil.
