# 1. FJORDVAKT
## Autonom miljøbøye for fjordovervåking
### Sider 3–5

---

## SIDE 3 — IDÉ OG DESIGN

### Kilde
U-864-saken. Årevis med argumentasjon om kvikksølv utenfor Fedje lærte meg
én ting som ingen i debatten vil innrømme: ingen måler kontinuerlig. Staten
tar prøvetokt. Tokt er øyeblikksbilder. Lekkasjer er kontinuerlige. Gapet
mellom de to er der både miljøskaden og produktet ligger.

### Problem
Ingen vet hva som skjer i vannsøylen over et forurenset punkt mellom to
prøvetokt, og tokt koster 150 000–400 000 NOK per døgn med fartøy.

### Produkt
En forankret overflatebøye, 90 cm diameter, som måler turbiditet, pH,
ledningsevne, oksygen og — det viktige — akkumulert tungmetalleksponering,
og rapporterer over LTE-M tre ganger i døgnet. Selges ikke som maskinvare.
Selges som «målepunkt per måned»: kunden kjøper data, jeg eier bøya.

### Design
- **Skrog:** rotasjonsstøpt PE, 90 cm, selvrettende med ballastkjøl.
  Standard IALA gul spesialmerke-lakkering, lanterne på topp.
- **Kraft:** 2 × 30 W solpanel, 640 Wh LiFePO4, MPPT. Dimensjonert for
  vestlandsvinter, ikke datablad-sol.
- **Sensorer:** turbiditet, pH, ledningsevne, løst oksygen — hyllevare,
  antifouling med kobbertape og UV-LED.
- **[ORIGINAL] Hg-proxy-veksler:** karusell med 12 DGT-passivprøvetakere
  (diffusive gradients in thin films) som eksponeres én og én i to uker
  hver, styrt av en liten pumpe og servo. Bøya gir dermed lab-verifiserbar
  tungmetall-tidsserie med 14 dagers oppløsning uten at noen drar ut dit.
  Karusellen byttes ved halvårlig service. Ingen kommersiell bøye i
  hobbyprisklassen gjør dette; det er tokt-produktet omgjort til abonnement.
- **Hjerne:** STM32L4, duty-syklet. LTE-M primært, satellitt (Astrocast)
  som opsjon for fjorder uten dekning.
- **Forankring:** 250 m line, betonglodd, gummistrekkavlaster.

Alt annet på markedet er enten forskningsbøyer til 1,5–4 MNOK (Aanderaa/
Xylem-klassen) eller hobbyloggere uten forankring og uten metalldata.
Midten er tom. FJORDVAKT står i midten.

---

## SIDE 4 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 1. Tall herfra.

### Energibudsjett
| Last | Snitt |
|---|---|
| Sensorpakke (turb, pH, kond, DO) | 0,35 W |
| Hg-proxy (pumpe+servo, 2 % duty) | 0,18 W |
| MCU + logging | 0,06 W |
| LTE-M (3 opplastinger/døgn) | 0,09 W |
| GPS (fix hvert 30. min) | 0,05 W |
| IALA-lanterne (natt) | 0,25 W |
| **Sum** | **0,98 W = 23,5 Wh/døgn** |

### Innhøsting mot forbruk, Bergen-breddegrad
| Måned | Solinnhøsting | Behov | Balanse |
|---|---|---|---|
| Desember | 14,2 Wh/døgn | 23,5 | −9,3 |
| Mars | 85,1 Wh/døgn | 23,5 | +61,6 |
| Juni | 236,3 Wh/døgn | 23,5 | +213 |

Desember går i minus. Det er ikke et problem, det er en batteridimensjon:
640 Wh ved 80 % utladingsdybde gir **22 døgn helt uten sol**. Mørketids-
underskuddet på 9 Wh/døgn tærer ~280 Wh over desember–januar; bufferen
dekker det dobbelt. Konklusjon: går rundt året uten service.

### Det simuleringen ikke fanger
Begroing på optiske sensorer (driftserfaring sier 6–10 uker uten tiltak —
derfor kobber + UV), islast i indre fjordarmer (bøya tåles neddykket, men
forankringen må sertifiseres), og LTE-M-dekning i trange fjorder (målekart
finnes hos Telenor; satellitt-opsjonen finnes av en grunn).

### Verifikasjon i prototyp
Pass/fail: 60 døgn kontinuerlig drift i Byfjorden november–januar med
mindre enn 15 % batterisvingning uke til uke, og DGT-karusell som fullfører
4 vekslinger uten å kile seg. Kiler den seg, er produktet dødt — hele
verdien ligger i veksleren.

---

## SIDE 5 — MARKED OG PROTOTYP

### Marked
Kjøpere, i rekkefølge etter betalingsvilje:
1. **Oppdrettsnæringen.** ~1 500 sjølokaliteter i Norge. Pålagt miljø-
   overvåking (B- og C-undersøkelser). En bøye som dokumenterer kontinuerlig
   er et argument mot naboklager og et varsel før inspeksjon. 2 000–4 000
   NOK/mnd per målepunkt er under én konsulenttime.
2. **Kommuner og havnevesen.** 50+ kystkommuner med gamle synder i sjøbunn
   (Bergen havn, Puddefjorden er kroneksempelet). Miljødirektoratets
   tiltaksplaner krever dokumentasjon.
3. **Forskning/NGO.** Lavere pris, høy synlighet. U-864-nettverket er en
   åpenbar pilotkunde og medieforsterker.

Konkurrenter: Aanderaa (Xylem) — 10–40× prisen, forskningsklasse. NIVA
gjør tokt, ikke abonnement. Ingen selger tungmetall-tidsserie som tjeneste.

Pris: **2 990 NOK/mnd** per bøye, 24 mnd binding, service inkludert.
Bøyekost i produksjon ~28 000 NOK → tilbakebetalt på ~10 mnd.
100 bøyer ute = 3,6 MNOK ARR. Realistisk år 2-mål.

### Prototyp
| Post | NOK |
|---|---|
| Skrog (modifisert fenderbøye) + kjøl | 4 500 |
| Solceller, MPPT, LiFePO4 | 5 200 |
| Sensorpakke (Atlas Scientific-klasse) | 9 800 |
| DGT-karusell: print, servo, pumpe, 12 prøvetakere | 6 400 |
| STM32-kort, LTE-M-modem, antenne, kapsling | 3 100 |
| Forankring, lanterne, diverse | 4 000 |
| **Sum** | **33 000** |

Byggetrinn: uke 1–2 karusellmekanikk på benk (den er hele risikoen),
uke 3–4 elektronikk og strømbudsjett-verifikasjon, uke 5 sammenstilling og
kartrening i kar, uke 6 utsett i Byfjorden med kommunal tillatelse.
Regulatorisk: utsett krever tillatelse fra havnemyndighet, merking etter
IALA. Papirarbeid, ikke hinder.

### Dom
**BYGG.** Sterkeste kombinasjon i porteføljen av domenekunnskap (U-864),
tom markedsmidte og abonnementsøkonomi. Dette er produktet advokatene og
direktoratet ikke kan argumentere bort: en tidsserie.
