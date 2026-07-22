# 6. LYDSKALPELL
## Håndholdt akustisk kamera for industri og bygg
### Sider 18–20

---

## SIDE 18 — IDÉ OG DESIGN

### Kilde
Sonisk visualisering — algoritmene jeg bygde for å *se* musikk er
matematisk identiske med beamforming: fase, forsinkelse, summasjon,
kartlegging av lydenergi i rommet. Forskjellen er at industrien betaler
for det. En trykkluftlekkasje på 3 mm koster en fabrikk 5–15 000 NOK i
året i kompressorstrøm, og en middels norsk fabrikk har titalls av dem.
De hveser i ultralyd. Ingen hører dem. Et kamera gjør.

### Problem
Akustiske kameraer finnes (Fluke ii900, FLIR Si124) men koster 180–350 000
NOK, så de eies av konsulenter og leies inn årlig — mens lekkasjene lekker
kontinuerlig og vedlikeholdsfolkene som går forbi dem hver dag mangler
verktøyet.

### Produkt
Et akustisk kamera til under en femtedel av Fluke-prisen: 64 MEMS-
mikrofoner i spiral-array rundt et vanlig kamera, sanntids lydbilde lagt
over video, bygget for tre jobber og bare dem: trykkluftlekkasje,
gasslekkasje, elektrisk utladning (koronastøy).

### Design
- **Array:** 64 digitale MEMS-mikrofoner (samme klasse som i hodetelefoner,
  ~8 NOK/stk i volum) i optimalisert spiral på 18 cm sirkulær plate —
  spiral undertrykker gitterlober bedre enn rutenett ved samme antall.
- **Prosessering:** delay-and-sum beamforming på RP2350 + liten FPGA for
  kanal-aggregering; 25 bilder/s ved 40×40 piksler lydkart (side 19).
  Ingen PC, ingen sky — bildet skjer i hånda.
- **Skjerm/kamera:** 5″ touch, vanlig CMOS-kamera i array-senter.
- **[ORIGINAL] Lekkasje-økonomi i sanntid:** kameraet klassifiserer
  lekkasjens spektrum og estimerer literstrøm (kalibrert mot kjente dyser),
  og viser **NOK/år** direkte på lydflekken i bildet, med fabrikkens egen
  strømpris. Fluke og FLIR viser dB — et tall vedlikeholdssjefen må
  oversette. LYDSKALPELL viser penger, som er språket budsjettmøtet
  snakker. Rapport genereres på enheten: bilde, posisjon, estimert tap,
  prioritert liste. Det er n8n-tankegang flyttet inn i fastvare.
- **Kapsling:** IP54, fallsikker, hanskevennlige knapper.

---

## SIDE 19 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 6.

### Vinkeloppløsning (Rayleigh, 18 cm apertur)
| Frekvens | Bølgelengde | Oppløsning |
|---|---|---|
| 2 kHz | 17,2 cm | ~67° |
| 8 kHz | 4,3 cm | ~17° |
| 20 kHz | 1,7 cm | ~6,7° |
| 35 kHz | 1,0 cm | ~3,8° |

Lesningen av tabellen er produktdefinisjonen: under ~8 kHz er et 18 cm
håndholdt array fysisk blindt — derfor er dette *ikke* et verktøy for
maskindiagnostikk eller romakustikk, uansett hva markedsavdelingen måtte
ønske. Trykkluftlekkasjer stråler bredbånd 20–40 kHz: der er oppløsningen
3–7°, som er en 15–30 cm flekk på 3 m avstand. Nok til å peke på riktig
kobling. Fysikken har valgt nisjen; jeg adlyder.

### Datastrøm og regnekraft
64 kanaler × 48 kHz × 24 bit = 9,2 MB/s rå. Delay-and-sum med
forhåndsberegnede forsinkelsestabeller for 40×40 retninger klarer 25
bilder/s på RP2350+FPGA-hybriden — verifisert mot publiserte open
source-arrayer (UMA-16-klassen) som gjør tilsvarende på svakere jern.
Ultralydbåndet foldes ned til hørbart for hodetelefon-utgang
(heterodyning), så operatøren også *hører* lekkasjen den peker på.

### Det simuleringen ikke fanger
Mikrofon-til-mikrofon fasetoleranse i MEMS (kalibreringsrutine per enhet
er obligatorisk — kjent dyse på kjent avstand, 60 sekunder), refleksjoner
i trange maskinrom (multipath gir spøkelsesflekker; mitigeres med
koherens-vekting), og literstrøm-estimatets nøyaktighet, som må bygges
empirisk med dyserigg. ±30 % på NOK-tallet er godt nok — prioriteringslisten
blir riktig selv om absoluttallet er grovt.

### Verifikasjon i prototyp
Pass/fail: finne 5 av 5 utplasserte lekkasjer (1–3 mm dyser, 6 bar) i et
verkstedlokale med bakgrunnsstøy >75 dBA, på under 10 minutter, av en
person som ikke er meg.

---

## SIDE 20 — MARKED OG PROTOTYP

### Marked
Norge: ~2 000 industribedrifter med trykkluftanlegg av relevant størrelse,
pluss energirådgivere, Enova-støttede ENØK-kartlegginger (lekkasjesøk er
standardpost), elektro (korona på høyspent), og bygg (luftlekkasje ved
trykktesting — samme fysikk, samme kamera, egen programvaremodus).

Konkurranse og pris: Fluke ii900 ~250 000 NOK, FLIR Si124 ~200 000,
kinesiske OEM-kameraer siver inn rundt 60–90 000 med svak programvare.
LYDSKALPELL: **39 900 NOK**. Under innleie-prisen for én ukes konsulent
med Fluke. BOM-mål i produksjon: 9 500 NOK. Programvaren (NOK/år-laget,
rapportene) er det kinesisk OEM ikke har og Fluke ikke prioriterer i
lavprissegmentet.

Kanal: direktesalg mot vedlikeholdssjefer med én video: kamera opp,
fabrikkvegg, syv røde flekker, «denne veggen koster deg 61 000 i året».
Salgsargumentet skriver seg selv fordi produktet regner det ut selv.

### Prototyp
| Post | NOK |
|---|---|
| 64 MEMS-mikrofoner + spiral-PCB (4-lags, JLCPCB-klasse) | 4 800 |
| RP2350 + FPGA (iCE40-klasse) + skjerm | 2 900 |
| Kamera-modul, batteri, kapsling (print) | 2 400 |
| Kalibrerings-/dyserigg (dyser, manometer, kompressorleie) | 3 200 |
| Referansemåling (leie Fluke ii900 én uke for A/B) | 6 000 |
| **Sum** | **19 300** |

Byggetid 7 uker: uke 1–2 PCB-design og bestilling, uke 3–4 fastvare
(beamforming-kjernen porteres fra visualiseringskoden min — den finnes),
uke 5 kalibrering, uke 6–7 felttest i to velvillige verksteder. A/B mot
innleid Fluke gjøres ærlig og publiseres uansett utfall — troverdigheten
av den testen er verdt mer enn et pent resultat.

### Dom
**BYGG.** Størst gjenbruk av eksisterende kode i hele porteføljen, tydelig
prispunkt-gap, og kunden kan regne hjem kjøpet på under et minutt fordi
produktet gjør regnestykket for dem.
