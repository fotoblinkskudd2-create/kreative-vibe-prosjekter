# 8. RETROVOLT
## Reversibel elektrifisering av vintagesykler
### Sider 24–26

---

## SIDE 24 — IDÉ OG DESIGN

### Kilde
Vintage-sykkelrestaurering. Hver restaurerte DBS og Crescent ender i samme
samtale: «nydelig sykkel, men jeg bor i Bergen». Syv bakker mellom
Sandviken og sentrum dreper hverdagsbruken av stålsykler folk elsker.
Eksisterende elkonvertering løser det ved å ødelegge det: nav må byttes,
kranker demonteres, ledninger strips langs et lakkert 60-tallsrør.
Restauratøren i meg nekter. Det er hærverk med batteri.

### Problem
Eiere av klassiske sykler vil ha elassistanse uten å skade et objekt de
har brukt titusener på å restaurere — dagens kit krever irreversible
inngrep (nav, krank, boring) og ser ut som ettertanke.

### Produkt
Et friksjonsdrift-kit uten verktøykrav og uten permanente inngrep:
motorenhet som klemmes på setestagene og driver bakdekket via
polyuretanrull, batteri i en klassisk lærveske på bagasjebrettet,
og *hele systemet av og på sykkelen på 90 sekunder*. Sykkelen forblir
original. Det er hele produktet.

### Design
- **Drivenhet:** børsteløs motor med PU-rull mot dekkbanen, fjærbelastet
  anlegg med eksenterlås — samme prinsipp som gamle Solex, utført med
  2026-motorer og momentstyring.
- **[ORIGINAL] Reversibilitet som absolutt designkrav:** null hull, null
  demontering, klemflater i lærforet aluminium formet for klassiske
  stagdiametre (og ovale Reynolds-rør), kabling i tekstilstrømpe langs
  eksisterende linjer med lærstropper. Ettermarkedet konkurrerer på
  watt og pris; ingen konkurrerer på *fravær av spor*. RETROVOLT er
  konservering med fremdrift — restaureringskompetansen er spesifikasjonen.
- **Sensor:** kadens fra magnetring på eiker (limfri klips) + IMU i
  drivenheten; assistanse kun ved tråkk (EU-krav), kuttes over 25 km/t.
- **Batteri:** 36 V 7 Ah (252 Wh) i veske — under 3 kg-følelsen, flybårbar
  er den ikke (over 100 Wh), men flyttbar mellom sykler.
- **Regn:** friksjonsdrift taper grep på våt dekkbane; rullen har spor-
  mønster og momentstyringen detekterer slipp og øker anleggskraft.
  Bergen-testet eller dødt — dette er go/no-go-punktet (side 25).

Konkurranse: Rubbee (Litauen) er nærmest — friksjonsdrift, men klumpete,
plastpreget og uten reversibilitets-estetikken; navkonverteringer (Swytch
m.fl.) krever hjulbytte. Ingen bygger for verneverdige sykler spesifikt.

---

## SIDE 25 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 8.

### Effektbehov (95 kg rytter + 14 kg stålsykkel + 3,4 kg kit)
| Situasjon | Effekt ved hjul |
|---|---|
| 20 km/t, flatt | 84 W |
| 20 km/t, 3 % stigning | 268 W |
| 25 km/t, flatt | 138 W |

250 W nominell motor (EU-grensen) dekker 3 %-bakken med rytterbidrag;
Fløyfjellet-klassen (8 %+) blir samarbeid mellom motor og bein. Ærlig
spec: dette er assistanse, ikke moped.

### Rekkevidde
Flatmark 20 km/t, motor tar 60 % av lasten, kjedevirkningsgrad friksjon
0,78 × drivverk 0,85: **60 km teoretisk**, nedjustert til **35–45 km
Bergen-realistisk** (bakker, stopp, regn-anleggskraft). To pendlerdager
per lading for de fleste. Godt nok, og batteribyttet er sekunder.

### Friksjonsgrensesnittet — der produktet lever eller dør
PU-rull mot dekk: ~15 % ekstra dekkslitasje (målt slitasjerate fra
moped-analogier, skalert) — byttbar rull, og ærlig informasjon om at
kittet spiser vinterdekk-gummi. Slippgrense våt: anleggskraft må opp
40–60 % ved vannfilm; momentstyringens slipp-deteksjon (turtall rull vs
kadens-avledet hjulturtall) er kjernefastvaren. Simuleringen sier det
går; bare Bergen i november vet sikkert.

### Det simuleringen ikke fanger
Klemkraft på 60 år gamle, potensielt korroderte setestag (materialprøve-
protokoll: aldri klem uten inspeksjon; lastfordeling over 120 mm flate),
resonans i stålrammer ved motorens rippel (dempes i gummi-mellomlegg),
og den juridiske: EN 15194-samsvar for ettermontert system — kittet
CE-merkes som system, dokumentasjonspakken er en reell kostnadspost
(40–80 000 NOK med testhus) som ligger *etter* prototypfasen med vilje.

### Verifikasjon i prototyp
Pass/fail: 200 km blandet Bergen-kjøring inkl. 20 km i aktivt regnvær
uten slipp-hendelser som krever fotstøtte, null merker på ramme ved
demontering etter 200 km (inspeksjon med makrofoto før/etter), av/på
målt under 2 minutter av tre ukjente brukere.

---

## SIDE 26 — MARKED OG PROTOTYP

### Marked
Nisje, med vilje. Norge: titusener av bevaringsverdige sykler i bruk
eller i kjellere; Oslo/Bergen har aktive vintage-miljøer, og sykkel-
verksteder melder jevn etterspørsel etter «diskret el» de ikke kan levere.
Europa er hovedmarkedet: Nederland, Danmark, Tyskland — land med både
vintage-parkkultur og elsykkel-modenhet. Rubbees eksistens beviser
segmentet; deres anmeldelser (grep i regn, estetikk) skriver min
kravspec.

Pris: **8 900 NOK** komplett kit. BOM-mål: 2 600 NOK. Kanal: vintage-
verksteder som forhandlere (de har kundene og monteringskompetansen —
selv om montering knapt trengs, trengs tilliten), + direktesalg med
restaurerings-innholdsmarkedsføring jeg uansett produserer.

Ærlig markedsrisiko: friksjonsdrift har dårlig rykte fra billige kit.
Produktet må overvinne kategori-skepsis med demonstrasjon, ikke argument.
Derav: regnvideoen er viktigste markedsføringsaktivum, og den kan ikke
fakes i Bergen — det regner uansett.

### Prototyp
| Post | NOK |
|---|---|
| Motor, ESC, PU-ruller (3 hardheter for test) | 3 100 |
| Klemmekanikk (CNC-frest alu + lær) | 4 200 |
| Batteri + BMS + veske (sadelmaker for veske-proto) | 3 800 |
| Sensorer, fastvare-elektronikk | 1 200 |
| Testsykkel har jeg. Regn har Bergen. | 0 |
| **Sum** | **12 300** |

Byggetid 6 uker: uke 1–2 klemmekanikk (reversibilitetskravet er den
vanskelige delen, resten er kjent), uke 3 drivlinje, uke 4 fastvare med
slipp-styring, uke 5–6 200 km-protokollen.

### Dom
**BYGG — men som nummer to eller tre.** Emosjonelt sterkeste produkt i
porteføljen og det med tydeligst historiefortelling, men EN 15194-
kostnaden før salg gjør at HEVEKAMMER og LYDSKALPELL bør generere
kontantstrøm først. Prototypen bygges uansett — den koster mindre enn
sertifiseringen av den kommer til å gjøre.
