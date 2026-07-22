# 2. VRAKØYE
## Kompakt inspeksjons-ROV til 200 m
### Sider 6–8

---

## SIDE 6 — IDÉ OG DESIGN

### Kilde
Samme sak, andre vinkel. U-864 ligger på 150 m. Hver gang noen skal se på
vraket, leies et offshorefartøy med arbeidsklasse-ROV. Men 90 % av det som
faktisk trengs er å *se*: er anodene der, har seksjonen flyttet seg, står
sedimentskjermen. Å se koster i dag like mye som å gripe. Det er feil.

### Problem
Visuell inspeksjon under 40 m (dykkergrensen for normal drift) krever i dag
fartøysstøttet ROV til 50 000+ NOK/døgn, så inspeksjoner som burde skjedd
månedlig skjer aldri.

### Produkt
En 11 kg ROV som én person kan operere fra kai, molo eller lettbåt, med
200 m dybdekapasitet, 4K-kamera, og en arbeidsflyt der leveransen er en
ferdig strukturert inspeksjonsrapport — ikke åtte timer råvideo.

### Design
- **Skrog:** POM-sylinder, 12 mm gods (SF 2,1 ved 200 m, se side 7),
  syntaktisk skum for oppdrift, åpen ramme i HDPE.
- **Fremdrift:** 6 børsteløse thrustere i vektor-konfigurasjon; holder
  posisjon i 1,5 kn strøm.
- **Tether:** 250 m, 4 mm, nøytral oppdrift, Ethernet over toleder.
- **Kamera/lys:** 4K 1/1,7", 2 × 1 500 lm dimbare, laser-skala (to
  parallelle lasere 10 cm avstand — måling direkte i bildet).
- **[ORIGINAL] Rapportmotoren:** ROV-en logger telemetri (dyp, heading,
  posisjon fra USBL-opsjon) synkronisert med video, og en n8n-pipeline på
  land klipper automatisk stillbilder ved operatørens merkeknapp, kjører
  bildeforbedring (fargekorreksjon for vanntap av rødt), og setter sammen
  PDF-rapport med tidsstempel, dybde og kartreferanse per funn — før
  operatøren har kjørt hjem. Konkurrentene selger farkoster. VRAKØYE
  selger ferdig dokumentasjon; farkosten er bare pennen.
- **Batteri:** 310 Wh utskiftbar kassett, verktøyfritt bytte på 30 s.

Blueye Robotics (Trondheim) eier hobby/lett-pro-segmentet til 100 m.
Chasing og QYSEA fyller AliExpress-sjiktet. Ingen av dem leverer rapport-
pipeline eller 200 m i denne vektklassen. Dybden + rapporten er posisjonen.

---

## SIDE 7 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 2.

### Fremdrift og drag
Stump kropp, C_d 0,9, frontareal 0,045 m², sjøvann 1025 kg/m³:

| Fart | Drag | Akseleffekt (η 45 %) |
|---|---|---|
| 1 kn | 5,5 N | 6,3 W |
| 2 kn | 22,0 N | 50,2 W |
| 3 kn | 49,4 N | 169,5 W |

Kubisk vekst i effekt er grunnen til at 3 kn marsjfart er markedsføring og
2 kn er sannheten. VRAKØYE spesifiseres ærlig på 2 kn.

### Driftstid
Hotellast (lys på fullt, kamera, kommunikasjon, MCU): 55 W. Total ved 2 kn
arbeidsfart: **105 W**. Batteri 310 Wh × 0,85 nyttbart → **150 min**.
Kravet var 120 min (en full inspeksjon av et 80 m skrog med margin). OK,
og batteribyttet på 30 s gjør kravet nesten irrelevant.

### Trykk
200 m gir 20,1 bar. POM med 12 mm gods på 90 mm innerdiameter-sylinder gir
sikkerhetsfaktor 2,1 mot kollaps (tynnvegget overslag + endekapp-forsterkning).
Akrylvindu 15 mm, flat, liten diameter — flate vinduer taper lysvinkel men
vinner pris og knuser ikke katastrofalt slik store domer kan.

### Det simuleringen ikke fanger
Tetherdrag i strøm (dominerer over skrogdrag ved 200 m utlagt line — derfor
nøytral tether og strømkrav satt til 1,5 kn, ikke 3), USBL-presisjon i
fjordtopografi med akustiske refleksjoner, og POM-krypning over år. Trykktank-
test til 25 bar er obligatorisk før første sjøsetting, hos NTNU eller
kommersiell tank i Bergen (~8 000 NOK).

### Verifikasjon i prototyp
Pass/fail: 120 min kontinuerlig operasjon på 100+ m i Byfjorden, video uten
dropouts, og rapportpipelinen leverer ferdig PDF innen 15 min etter opptak.

---

## SIDE 8 — MARKED OG PROTOTYP

### Marked
1. **Havbruk:** 1 500 lokaliteter, pålagt not- og fortøyningsinspeksjon.
   I dag: dykkerlag (30–60 000 NOK) eller ROV-tjeneste. En egen VRAKØYE
   per område-team betaler seg på under ti inspeksjoner.
2. **Havner/kommuner:** kaifronter, moloer, ledninger. Bergen havn alene
   har kilometervis med kaifront eldre enn 50 år.
3. **Forsikring/survey:** skroginspeksjon uten dokking for kystflåten.
4. **Vrak/miljø:** U-864-klassen av saker; NGO-er og media. Synlighet.

Konkurrentpriser: Blueye X3 ~150 000 NOK ferdig rigget, Chasing M2 Pro
~60 000, arbeidsklasse starter på millioner. VRAKØYE: **119 000 NOK**
inkl. rapportlisens år 1, deretter 12 000 NOK/år for pipeline + støtte.
BOM-mål i produksjon: 38 000 NOK. Bruttomargin 62 % pluss halen.

### Prototyp
| Post | NOK |
|---|---|
| POM-emner, dreiing, O-ringer, gjennomføringer | 8 500 |
| 6 thrustere + ESC | 7 200 |
| Kamera, lys, lasere | 5 800 |
| Tether 250 m + vinsjtrommel | 6 500 |
| Elektronikk (Pi CM5, IMU, dybde, DC/DC) | 4 200 |
| Batterikassett ×2 | 3 800 |
| Trykktest | 8 000 |
| **Sum** | **44 000** |

Over 40 000-regelen fra metoden. Løsning: trinn 1 bygges som 100 m-versjon
uten trykktest-ekstern (egen testrigg til 12 bar: 1 500 NOK), holder
prototypen på 37 500. 200 m kvalifiseres i steg to når noen har betalt.
Byggetid: 7 uker. Rapportmotoren er ren n8n + ffmpeg + eksisterende
bildemodeller — den bygges parallelt uke 1–3 og demonstreres på GoPro-
opptak før farkosten i det hele tatt er våt.

### Dom
**BYGG — men rapportmotoren først.** Pipelinen alene er selgbar til folk
som allerede eier Blueye/Chasing. Farkosten er steg to. Det senker risiko
fra 44 000 til 4 000 før første kundekontakt.
