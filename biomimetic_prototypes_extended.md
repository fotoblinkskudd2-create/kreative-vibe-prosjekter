# Biomimetiske Prototyper — Utvidet Utviklingsguide

> Komplett utviklingsguide for 10 biomimetiske proof-of-concept (PoC) prototyper.
> Målgruppe: ingeniørteam (bygg/test) og produktledelse (kost/tid/prioritering).
>
> **Merking brukt i dokumentet:**
> - `[FK]` = Funksjonelt krav (må virke for at PoC skal godkjennes)
> - `[NTH]` = Nice-to-have (forbedrer, men ikke kritisk for PoC)
> - `[DEMO]` = Demo/gimmick (show-piece, ikke teknisk validering)
>
> Alle priser i **USD** og alle tider i **arbeidsdager** er **konservative grovestimater**
> for én PoC-enhet bygget av 1 ingeniør (der ikke annet er nevnt). Leverandørnavn er forslag,
> ikke anbefaling/godkjenning. Verifiser datablad før innkjøp.

---

## Innholdsfortegnelse

1. Gecko-inspirert tørr-adhesjonsgriper
2. Kolibri-inspirert mikro-flapper (ornithopter)
3. Haihud-inspirert anti-groe / drag-reduksjonsfilm
4. Elefantsnabel-inspirert myk manipulator-arm
5. Neseborsvamp-inspirert passiv vannhøster (Namib-bille + kaktus)
6. Ugle-inspirert støysvak vifte/rotor
7. Mycel-inspirert selvvoksende kompositt-emballasje
8. Pinnsvin/pangolin-inspirert deformerbart støtabsorpsjonsskall
9. Bønnerank-inspirert vekstformende «soft robot» (tendril-aktuator)
10. Kjerneelektrisk fisk-inspirert nærfelt-elektrolokasjons-sensor

Til slutt: Samlet kostnad/tid, topp-3 anbefaling, og tilbud om prioriteringsmatrise/Gantt.

---

# 1. Gecko-griperen — «Fester seg som en øgle, slipper på kommando»

### 2. Biologisk inspirasjon
Gekkoens tåputer bruker millioner av **setae** (mikroskopiske hår) som deler seg i **spatulae**
i nanometerskala. Adhesjonen kommer fra **van der Waals-krefter**, ikke lim eller sug — den er
tørr, gjenbrukbar, retningsavhengig og etterlater ingen rester. Griper vi prinsippet (skrå
mikrostrukturer som fester ved skjærbelastning og slipper ved peeling), får vi en gjenbrukbar
tørr-adhesiv overflate.

### 3. Problem den løser
Robotgriping av **glatte, ikke-magnetiske, skjøre** flater (glassplater, solcellepaneler,
displaymoduler) i renrom der sugekopper etterlater merker og mekaniske klør knuser godset.
Scenarie: pick-and-place av 200×200 mm glass i en solcellelinje uten kontaminasjon.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Griperpute 40×40 mm, aktiv adhesiv 25×25 mm. Total gripermodul
  ~90×60×50 mm, **~180 g** inkl. servo og ramme.
- **Materialer:**
  - Mikrostrukturert **PDMS** (Sylgard 184, Shore ~43 OO, driftstemp −45…+200 °C) støpt mot
    laserstrukturert/SU-8-mold med skrå mikropillarer (~30–50 µm diameter, 20° helning).
    Leverandør: Dow Sylgard 184; mold via lokal MEMS-foundry eller SU-8 på Si-wafer.
  - Bærebrakett i **aluminium 6061** eller SLA-printet resin (nice-to-have i metall).
  - Peel-sene i tynn **Dyneema**-line for retningsstyrt frigjøring.
- **Aktuering:** Én mikroservo (5 V, ~0,5–1,5 A topp, standard hobbyservo MG90S-klasse) som
  trekker peel-linen for load/release. Ingen høyspenning.
- **ASCII-skisse:**
```
   [servohorn]---Dyneema peel-line
        |                     ____________
        v                    |  bracket   |
   pre-load  ====>  ||||||||| PDMS pute ||||||||  <-- skrå mikropillarer
                    ~~~~~~~~~~~ glassflate ~~~~~~~~~
   Skjærbelastning (langs flate)  = fester
   Peel (normalt, fra kant)       = slipper
```

### 5. Funksjonsprinsipp (trinnvis)
1. Puten senkes flatt mot glasset med lett preload (~1–2 N).
2. En liten tangentiell forskyvning «legger ned» pillarene → maks kontaktareal → van der Waals.
3. Last bæres i skjær; jo mer skjær, jo mer holdekraft (retningsavhengig).
4. Servo trekker peel-linen → kontakten «lynes» opp fra én kant → slipper med minimal kraft.

### 6. Testing & validering (min. 4)
1. **Holdekraft i skjær** `[FK]` — Formål: bekrefte bæreevne. Oppsett: pute mot glass, hengende
   lodd. Metode: øk last til slipp. Suksess: ≥ **5 N/cm²** i skjær, reproduserbart 3 forsøk.
2. **Sykluslevetid** `[FK]` — Formål: gjenbrukbarhet. Oppsett: rigg som fester/slipper automatisk.
   Metode: 1 000 sykluser, mål holdekraft hver 100. Suksess: < **20 %** degradering.
3. **Ren-slipp / kontaminasjon** `[FK]` — Formål: ingen rester. Metode: mikroskop + optisk
   transmisjon på glass før/etter. Suksess: ingen målbar residu / < 1 % transmisjonstap.
4. **Frigjøringskraft** `[NTH]` — Formål: energieffektiv release. Metode: kraftmåler på peel-line.
   Suksess: release-kraft < **10 %** av holdekraft.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Sylgard 184 kit (nok til mange støp) | $45 |
| SU-8 / laserstrukturert mold (deling av foundry-batch) | $120 |
| Mikroservo MG90S + driver | $12 |
| Al 6061 brakett / SLA-print | $20 |
| Dyneema line, festemidler, smådeler | $15 |
| Glass testplater | $18 |
| **Total per prototype** | **≈ $230** |

### 8. Fabrikasjonsplan (dag-for-dag, PoC)
- Dag 1: Mold-design + bestilling/leveranse av mold.
- Dag 2: Første PDMS-støp, avgassing, herding.
- Dag 3: Avforming, kvalitetssjekk under mikroskop, re-støp ved behov.
- Dag 4: Bygg brakett + servo + peel-mekanisme.
- Dag 5: Integrasjon + første fester/slipp-test.
- **Total: ~5 dager** (pluss mold-ledetid, ofte 5–10 kalenderdager eksternt).

### 9. Testfasiliteter & DIY
- Ideelt: kraftmåler (Instron/Mark-10), optisk mikroskop, renrom klasse ISO 7.
- DIY: digital fiskevekt/kraftceller (HX711 + lastcelle), USB-mikroskop, ren benk med laminær
  vifte. Mold DIY via høyoppløst SLA-print (grovere pillarer, redusert ytelse men gyldig PoC).

### 10. Kostnad & timeline sammendrag
~**$230**, ~**5 arbeidsdager** + mold-ledetid. Lav teknisk risiko for PoC.

### 11. Gøy / demo `[DEMO]`
- Video: gripe et vinglass etter stetten uten fingeravtrykk, løfte, «slippe» med et lite rykk.
- Show-piece: la puten holde en smarttelefon vertikalt mot en glassvegg.

### 12. Risiko / regulatorisk
- Lav risiko. PDMS er biokompatibelt/inert. Ingen sertifisering for PoC.
- Ved matkontakt/medisinsk bruk senere: **FDA 21 CFR 177.2600 / EU 10/2011** for silikon.

---

# 2. Kolibri-flapperen — «Svever på stedet som en kolibri»

### 2. Biologisk inspirasjon
Kolibrien roterer vingen i en **figur-8** og genererer løft på **både** frem- og bakstroke
(nær-symmetrisk vingeslag), noe som gir ekte stasjonær hovering. Vingemembran + fleksibel
leading edge gir passiv vridning (aeroelastisk twist).

### 3. Problem den løser
Innendørs/trang inspeksjon (tanker, ventilasjonssjakter, drivhus) der propellrotorer skaper
for mye nedvind, støy og kollisjonsfare. Behov: liten, stille, robust luftfarkost som tåler
lette sammenstøt.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Vingespenn ~180 mm, kropp ~90 mm. Mål-masse **< 25 g** (ambisiøst;
  realistisk PoC 25–35 g).
- **Materialer:** Vingemembran i **1,5 µm mylar/PET** eller ripstop-nylon; vingeribber i
  **karbonfiberstenger 0,8–1,0 mm**; girhus i POM/nylon; ramme SLA/karbon.
- **Aktuering:** Coreless DC-motor (6–8 mm) eller magnetaktuator, **3,7 V 1S LiPo (~150 mAh)**,
  topp ~2–4 W. Flapp via veivstang-mekanisme; enkel gir for symmetrisk slag.
- **ASCII-skisse:**
```
        /\        /\        vinger (figur-8 bane)
       /  \      /  \
      <----[gearbox+crank]---->   veivstang -> flapp
            |  motor  |
            [ 1S LiPo ]
            [  RX/IMU ]
```

### 5. Funksjonsprinsipp (trinnvis)
1. Motor driver veivstang → vingene slår opp/ned.
2. Passiv vridning i membranen gir angrepsvinkel som produserer løft begge veier.
3. Differensial vinge-amplitude gir yaw/roll; halehøyderoret gir pitch.
4. IMU + enkel stabiliseringssløyfe holder hovering.

### 6. Testing & validering (min. 4)
1. **Løft vs. slagfrekvens** `[FK]` — Rigg på kraftcelle, sveip 15–30 Hz. Suksess: statisk løft
   ≥ **egen vekt + 20 %** margin.
2. **Fritt-flukt hovering** `[FK]` — Innendørs, IMU-logg. Suksess: hover ≥ **30 s** innen 0,5 m
   drift.
3. **Kollisjonsrobusthet** `[NTH]` — Slipp/lett støt mot vegg. Suksess: 10 sammenstøt uten
   strukturskade.
4. **Flytid** `[NTH]` — Mål til batteri 3,3 V. Suksess: ≥ **3 min** flytid.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Coreless motor(er) + reserve | $18 |
| 1S LiPo + lader | $14 |
| Flight controller / IMU (mikro) | $30 |
| Karbonstenger, mylar, gir | $25 |
| RX/ekstra elektronikk | $20 |
| Ramme-print / smådeler | $15 |
| **Total per prototype** | **≈ $122** |

### 8. Fabrikasjonsplan
- Dag 1–2: Mekanisme-design + print/kutt vinger og gir.
- Dag 3: Monter flapp-mekanisme, benk-test løft.
- Dag 4: Integrer elektronikk + kontroll.
- Dag 5–7: Trimming, flytester, iterasjon på vingegeometri.
- **Total: ~7 dager** (flapper-mekanikk er finfølt → buffer).

### 9. Testfasiliteter & DIY
- Ideelt: liten vindtunnel, kraftcelle-rigg, motion-capture rom.
- DIY: kjøkkenvekt-rigg for løft, video-tracking (gratis software), nettbursikring.

### 10. Kostnad & timeline
~**$122**, ~**7 dager**. **Middels-høy risiko** (aeroelastisk trimming er tidkrevende).

### 11. Gøy / demo `[DEMO]`
- Video: farkosten «drikker» fra en kunstig blomst mens den hovrer. Klassisk kolibri-parodi.

### 12. Risiko / regulatorisk
- LiPo: brann-/ladefare → bruk LiPo-safe pose, aldri lad uten tilsyn.
- Droneregler: under vektgrenser innendørs OK; utendørs følg **EASA/luftfartsmyndighet**
  registreringskrav.

---

# 3. Haihud-filmen — «Glir og gror ikke, som en haihud»

### 2. Biologisk inspirasjon
Haiens hud har **dermal denticles** (riblets) — mikroriller på langs som reduserer turbulent
drag og hindrer at organismer får feste (anti-fouling). Passiv geometri, ingen kjemi.

### 3. Problem den løser
Marin begroing (biofouling) og drag på skrog/rør/propeller gir økt drivstofforbruk og dyre
rensesykluser. Scenarie: retrofit-film på skrog eller subsea-rør som reduserer begroing uten
biocider.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Testkuponger 100×100 mm, tykkelse ~0,3–0,5 mm. Riblet-spissavstand
  **~50–120 µm**. Vekt ubetydelig (~5 g per kupong).
- **Materialer:** UV-herdet **akryl/PU-film** eller PDMS støpt mot riblet-mold; alternativt
  mikro-preget PET-teip (3M-klasse bæremateriale). Leverandør: Dow (PDMS), 3M (bærefilm),
  lokal roll-to-roll pregeleverandør for skalering.
- **Aktuering:** Ingen (passiv overflate).
- **ASCII-skisse (tverrsnitt):**
```
  strøm ->    /\  /\  /\  /\  /\   riblets (spiss avstand s)
             /  \/  \/  \/  \/  \
  =========================================  bærefilm + lim
```

### 5. Funksjonsprinsipp
1. Riblets hever virvler bort fra veggen → redusert tverr-momentumutveksling → lavere skjær-drag.
2. Skarpe topper + mikrospenn gjør det energetisk ugunstig for larver/biofilm å feste.

### 6. Testing & validering (min. 4)
1. **Dragreduksjon** `[FK]` — Vannkanal/flow-loop, mål trykkfall glatt vs. riblet. Suksess:
   ≥ **5 %** dragreduksjon ved mål-Reynolds.
2. **Anti-fouling feltprøve** `[FK]` — Nedsenk kuponger 4–8 uker i sjø/akvarium. Suksess:
   ≥ **50 %** mindre biomasse vs. glatt kontroll.
3. **Heftfasthet/holdbarhet** `[FK]` — Peel-test + abrasjon (Taber). Suksess: film intakt etter
   1 000 sykluser + saltvann.
4. **UV/aldring** `[NTH]` — QUV-kammer. Suksess: < 10 % geometriforringelse etter ekvivalent 1 år.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| PDMS/PU + herder | $50 |
| Riblet-mold (mikrofrest/laser) | $150 |
| Bærefilm + industri-lim | $30 |
| Akvarium/nedsenk-rigg + salt | $60 |
| Referanse-glattkuponger | $10 |
| **Total per prototype (batch kuponger)** | **≈ $300** |

### 8. Fabrikasjonsplan
- Dag 1–2: Mold-design + bestilling.
- Dag 3: Støp/preg kuponger.
- Dag 4: Lim på bærefilm, klargjør referanser.
- Dag 5: Flow-loop drag-test.
- Dag 6+: Sett ut nedsenk-prøver (løper 4–8 uker i bakgrunn).
- **Aktiv total: ~6 dager** + 4–8 ukers feltprøve.

### 9. Testfasiliteter & DIY
- Ideelt: hydrodynamisk vannkanal, Taber-abraser, QUV-kammer, marin feltstasjon.
- DIY: lukket pumpe-loop med differensialtrykkgiver; saltvannsakvarium med naturlig sjøvann.

### 10. Kostnad & timeline
~**$300** aktivt, men **kalendertid dominert av 4–8 ukers feltprøve**. Lav teknisk risiko,
lang valideringstid.

### 11. Gøy / demo `[DEMO]`
- Video: side-om-side rør i strømningstank — riblet-siden slipper fri for alger mens glattsiden
  gror igjen. Time-lapse over uker.

### 12. Risiko / regulatorisk
- Lav. Passiv, ingen biocider (det er hele poenget). Marin utsetting: sjekk lokale
  **utslipp-/nedsenkings-tillatelser**; ingen kjemikalielekkasje.

---

# 4. Snabel-armen — «Griper mykt som en elefantsnabel»

### 2. Biologisk inspirasjon
Elefantsnabelen er en **muskulær hydrostat** — ingen skjelett, ~40 000 muskelbunter gir
uendelige frihetsgrader, kan både gripe fjær og løfte stokk. Kontinuum-manipulasjon.

### 3. Problem den løser
Håndtering av **variabelt formede, skjøre eller uordnede** objekter (frukt, pakking, plukk fra
rot) der stive griperfingrer feiler. Scenarie: plukk av moden frukt uten trykkmerker.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Lengde ~300 mm, ytre Ø 40 mm ved base → 20 mm ved tupp. Vekt **~250 g**.
- **Materialer:** Silikon-bellows (**Ecoflex 00-30**, Shore 00-30, −53…+232 °C) med innstøpte
  fiberforsterkninger; 3 pneumatiske kamre for bøy i alle retninger. Leverandør: Smooth-On
  Ecoflex/Dragon Skin.
- **Aktuering:** Pneumatikk, **0,5–2 bar** lavtrykk luft; 3 proporsjonalventiler + liten
  kompressor/pumpe. Ingen elektrisk høyspenning.
- **ASCII-skisse:**
```
   base [3 luftlinjer]  P1 P2 P3
     ||===[kammer 1]===[kammer 2]===[kammer 3]===> tupp
     bøyer mot lavtrykks-side (asymmetrisk oppblåsing)
   Sug-/mykpute i tupp for grep
```

### 5. Funksjonsprinsipp
1. Ulikt trykk i de 3 langsgående kamrene → asymmetrisk ekspansjon → segmentet bøyer.
2. Kombinasjon av segmenter gir S-kurver / wrap-around grep.
3. Mykt materiale konformerer rundt objektet → fordelt, lavt kontakttrykk.

### 6. Testing & validering (min. 4)
1. **Bøyeområde vs. trykk** `[FK]` — Mål vinkel per bar. Suksess: ≥ **90°** bøy per segment ved
   ≤ 2 bar.
2. **Løftekapasitet** `[FK]` — Wrap rundt objekt, øk vekt. Suksess: løft ≥ **500 g** uten slipp.
3. **Skånsomhet** `[FK]` — Grip trykksensitiv frukt / trykkfilm. Suksess: maks kontakttrykk under
   skademargin (< **20 kPa** for myk frukt).
4. **Utmatting** `[NTH]` — 5 000 grep-sykluser. Suksess: ingen lekkasje/sprekk.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Ecoflex/Dragon Skin kit | $60 |
| 3D-printede molds | $25 |
| Miniatyr luftpumpe/kompressor | $45 |
| 3× proporsjonalventiler | $90 |
| Slanger, koblinger, trykkgiver | $35 |
| Mikrokontroller + driver | $20 |
| **Total per prototype** | **≈ $275** |

### 8. Fabrikasjonsplan
- Dag 1: Mold-design + print.
- Dag 2–3: Støp silikonsegmenter (flertrinns, herdetid).
- Dag 4: Lim/monter segmenter + luftlinjer, lekkasjetest.
- Dag 5: Bygg pneumatikk-kontroll.
- Dag 6: Integrasjon + grep-tester.
- **Total: ~6 dager.**

### 9. Testfasiliteter & DIY
- Ideelt: trykkfilm (Fujifilm Prescale), trykk-rigg, kompressor med regulator.
- DIY: akvariepumpe + solenoid-ventiler (bang-bang i stedet for proporsjonal), håndmanometer.

### 10. Kostnad & timeline
~**$275**, ~**6 dager**. Middels risiko (silikonstøp + lekkasjer krever iterasjon).

### 11. Gøy / demo `[DEMO]`
- Video: armen plukker en bringebær og deretter et egg, uten å knuse noen av dem. «Snabelen som
  drikker vann» ved å suge opp fra glass.

### 12. Risiko / regulatorisk
- Lavt trykk → lav risiko, men **trykksatt system** krever trykkavlastning og aldri overskrid
  materialgrense. Matkontakt: matgodkjent silikon (**FDA/EU 10/2011**) ved reell fruktplukk.

---

# 5. Dugg-høsteren — «Drikker av tåka som en ørkenbille»

### 2. Biologisk inspirasjon
**Namib-billen** (Stenocara) har rygg med hydrofile topper og hydrofobe daler som kondenserer
og kanaliserer tåke til munnen. **Kaktuspigger** og **edderkoppsilke** bruker konisk geometri
+ gradientkrumning for retningsstyrt vanntransport (Laplace-trykkgradient).

### 3. Problem den løser
Ferskvann i tørre/tåkete kystområder uten strøm. Scenarie: passiv atmosfærisk vannhøster for
avsidesliggende utpost / drivhus.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Oppsamlingspanel 300×300 mm, mesh + mønstret overflate. Ramme + tank
  total **~1,5 kg**.
- **Materialer:** Rustfritt/nylon-mesh med **mønstret hydrofil/hydrofob coating** (TiO₂-basert
  hydrofil + PTFE/silan hydrofob soner); kanaliseringsspor i akryl; oppsamlingstank. Leverandør:
  standard Raschel-mesh (som brukt i fog-nets i Chile/Peru), coating fra silan-kjemi.
- **Aktuering:** Ingen (passiv). NTH: liten peltier for aktiv kondens ved lav tåke.

### 5. Funksjonsprinsipp
1. Tåkedråper treffer mesh; hydrofile flekker nukleérer og fanger dråper.
2. Overflatens våt/tørr-mønster + gravitasjon dirigerer dråper til hydrofobe kanaler.
3. Dråper renner til bunnrenne → tank.

### 6. Testing & validering (min. 4)
1. **Vannutbytte** `[FK]` — Sett i kunstig tåke (ultralyd-forstøver) eller kystnatt. Metode: mål
   ml/time. Suksess: ≥ **2× glatt kontrollnett** per m² panel.
2. **Innsamlingseffektivitet vs. dråpestørrelse/vind** `[FK]` — Varier vifte. Suksess: stabil
   fangst ved 1–4 m/s vind.
3. **Coating-holdbarhet** `[NTH]` — UV + fukt-sykluser. Suksess: hydrofilitet bevart 4 uker.
4. **Vannkvalitet** `[FK]` — Mål pH, turbiditet, ledningsevne. Suksess: innen drikkevann-forbehandling
   (kreve filtrering før konsum).

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Raschel/mesh materiale | $25 |
| Coating-kjemi (silan/TiO₂/PTFE) | $70 |
| Ramme (alu/PVC) + renne + tank | $45 |
| Ultralyd-tåkeforstøver + vifte | $35 |
| Måleutstyr (vekt, pH-strips) | $20 |
| **Total per prototype** | **≈ $195** |

### 8. Fabrikasjonsplan
- Dag 1: Mønster-/maske-design for coating.
- Dag 2: Påfør coating-mønster, herde.
- Dag 3: Bygg ramme + renne + tank.
- Dag 4: Rigg tåkekammer, kalibrer.
- Dag 5: Utbyttetester + iterasjon.
- **Total: ~5 dager.**

### 9. Testfasiliteter & DIY
- Ideelt: klimakammer med kontrollert tåke/vind, kontaktvinkel-goniometer.
- DIY: humidifier + boksvifte i telt; kontaktvinkel via sidefoto av vanndråpe + gratis
  vinkelmåling.

### 10. Kostnad & timeline
~**$195**, ~**5 dager**. Lav risiko, høy «feel-good»-demo-verdi.

### 11. Gøy / demo `[DEMO]`
- Video: tomt glass under panelet fylles time-lapse i «ørken-natt»-oppsett. Drikk (etter filter!)
  det høstede vannet på kamera.

### 12. Risiko / regulatorisk
- **Drikkevann krever forbehandling/filtrering** — ikke markedsfør som direkte drikkbart uten
  mikrobiologisk test. Ved kommersiell drikkevannspåstand: lokal drikkevannsforskrift / **WHO
  guidelines / Mattilsynet**. Coating-kjemi: bruk verneutstyr under påføring (silaner).

---

# 6. Ugle-viften — «Stille som en ugle i flukt»

### 2. Biologisk inspirasjon
Ugla flyr nesten lydløst pga. tre trekk: **sagtannet leading edge** (bryter opp virvler),
**myk frynsete trailing edge** (reduserer bakkant-støy) og **dunete overflate** (demper).

### 3. Problem den løser
Vifte-/rotorstøy i datasenter, ventilasjon, drone og hvitevarer. Scenarie: CPU-/rack-vifte som
er hørbart stillere ved samme luftmengde.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Standard 120 mm vifteramme (retrofit blad), eller egen 200 mm rotor.
  Vekt **~120 g**.
- **Materialer:** SLA/FDM-printede blad (PLA/PETG) med sagtann-forkant + frynset bakkant i tynn
  fleksibel TPU/mesh; nav standard. Leverandør: generisk 3D-print + TPU-filament.
- **Aktuering:** BLDC-viftemotor, **12 V, 2–6 W**, PWM-styrt. Standard.
- **ASCII-skisse (blad-forkant):**
```
  Forkant (leading edge):   /\/\/\/\/\   <- serrations
  Blad:                    [============]
  Bakkant (trailing edge):  |||||||||||   <- fringe/frynser
```

### 5. Funksjonsprinsipp
1. Sagtenner deler den innkommende grenselaget i småvirvler → mindre tonal støy.
2. Porøs/frynset bakkant demper trykkfluktuasjoner ved avløsning → lavere bredbånds-støy.

### 6. Testing & validering (min. 4)
1. **Lydnivå ved lik luftmengde** `[FK]` — Anekoisk-ish rom, kalibrert mik. Sammenlign standard
   vs. bio-blad ved samme CFM. Suksess: ≥ **3 dB(A)** reduksjon.
2. **Luftmengde/statisk trykk** `[FK]` — Vifte-plenumsrigg. Suksess: ≤ **5 %** CFM-tap.
3. **Frekvensspekter** `[NTH]` — FFT av lyd. Suksess: redusert BPF-topp (blade-pass frequency).
4. **Vibrasjon/balanse** `[NTH]` — Akselerometer. Suksess: ingen økning vs. standard.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| BLDC vifte-donor / motor | $18 |
| Print-materiale (PLA/PETG/TPU) | $15 |
| PWM-driver + tach | $12 |
| Måle-mik (kalibrert) + rigg | $60 |
| **Total per prototype** | **≈ $105** |

### 8. Fabrikasjonsplan
- Dag 1: Bladdesign (parametrisk sagtann/frynse).
- Dag 2: Print + etterbehandling.
- Dag 3: Balansér, monter, akustikk-baseline.
- Dag 4: Sammenlignende lyd/flow-tester + iterasjon.
- **Total: ~4 dager.**

### 9. Testfasiliteter & DIY
- Ideelt: anekoisk kammer, kalibrert mikrofon, viftemåler (AMCA-rigg).
- DIY: stille rom nattestid, USB-målemik + gratis FFT, anemometer for CFM-proxy.

### 10. Kostnad & timeline
~**$105**, ~**4 dager**. Lav risiko, **høy demo-verdi** (dB-tall er lette å kommunisere).

### 11. Gøy / demo `[DEMO]`
- Video: to identiske vifter, live dB-meter — bytt fra «vanlig» til «ugle»-blad, nålen faller.
  Blås ut et stearinlys like langt unna for å vise at luftmengden er bevart.

### 12. Risiko / regulatorisk
- Svært lav. Ingen sertifisering for PoC. Ved produkt: **EMC/lavspenning (CE)**, evt.
  støymerking.

---

# 7. Mycel-emballasjen — «Vokser til form, komposterer etterpå»

### 2. Biologisk inspirasjon
Soppens **mycel** (hyfenettverk) binder organisk substrat til et fast, lett, brann- og
støtdempende materiale — naturens selvbindende kompositt. (Kommersialisert av bl.a. Ecovative.)

### 3. Problem den løser
Erstatte **EPS/isopor** (ikke-nedbrytbar) i beskyttelsesemballasje og isolasjon med et
hjemmekomposterbart, lokalt dyrket materiale. Scenarie: skreddersydd støtvern for elektronikk.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Testblokk 150×150×50 mm, densitet **~60–120 kg/m³**, vekt ~150–270 g.
- **Materialer:** Landbruksavfall (hampskiver, sagflis, halm) + **mycel-inokulum** (f.eks.
  *Ganoderma*/oyster-strain). Formverktøy i mat-trygg plast. Leverandør: Ecovative «Grow-It-Yourself»
  eller lokal soppfarm for spawn.
- **Aktuering:** Ingen — biologisk vekst. Behov: temp/fukt-kontroll ~24–27 °C, høy RH.

### 5. Funksjonsprinsipp
1. Sterilisert substrat blandes med spawn, pakkes i form.
2. Mycel vokser 5–10 dager og binder partiklene til fast blokk.
3. Tørking/varmebehandling stopper vekst og herder (deaktiverer sporing).

### 6. Testing & validering (min. 4)
1. **Trykkfasthet** `[FK]` — Kompresjon på testblokk. Suksess: ≥ **200 kPa** ved 10 % tøyning
   (EPS-klasse).
2. **Støtdemping** `[FK]` — Slipptest med akselerometer-instrumentert masse. Suksess: G-topp ≤
   EPS-ekvivalent.
3. **Kompostering** `[FK]` — Nedbrytning i hjemmekompost. Suksess: ≥ **90 %** desintegrasjon på
   ≤ 90 dager.
4. **Fukt/vann-opptak** `[NTH]` — Neddykk. Suksess: bevarer form, definert vannopptaksgrense.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Mycel-spawn/inokulum | $35 |
| Substrat (hamp/flis/halm) | $10 |
| Former (matplast/print) | $20 |
| Steriliseringsutstyr (trykk-koker) | $40 |
| Voksekammer (kasse + fukt/varme) | $30 |
| **Total per prototype (flere blokker)** | **≈ $135** |

### 8. Fabrikasjonsplan
- Dag 1: Substrat-prep + sterilisering + inokulering + fylle former.
- Dag 2–8: Inkubasjon (passiv, sjekk daglig).
- Dag 9: Avforming.
- Dag 10: Tørking/varmeherding + mekaniske tester.
- **Aktiv total: ~3 dager**, **kalendertid ~10 dager** pga. vekst.

### 9. Testfasiliteter & DIY
- Ideelt: autoklav, klimakammer, universaltestmaskin.
- DIY: trykk-koker for sterilisering, isoporkasse + akvarievarmer for vekstkammer,
  fjærvekt/håndpresse for grov kompresjon.

### 10. Kostnad & timeline
~**$135** aktivt, ~**10 kalenderdager**. Lav teknisk risiko, hovedrisiko er **kontaminasjon**.

### 11. Gøy / demo `[DEMO]`
- Video: «vi dyrker esken din over natten» time-lapse; slipp en telefon pakket i mycel fra
  brysthøyde — den overlever; grav ned emballasjen, vis at den er borte etter uker.

### 12. Risiko / regulatorisk
- **Biologisk sikkerhet:** arbeid med levende sopp/sporer → bruk maske ved sporing, unngå
  allergener; hold rent for å hindre muggkontaminasjon. Bruk kun ikke-patogene, mattrygge
  stammer. Ved næringsmiddelkontakt-emballasje: **EU 10/2011 / FDA food-contact**.

---

# 8. Pangolin-skallet — «Bøyer og herder som et pangolinpanser»

### 2. Biologisk inspirasjon
**Pangolinets** overlappende keratinskjell og **pinnsvinets** piggmatrise gir fleksibelt panser
som fordeler og absorberer støt. Overlappende «scale armor» kombinerer bevegelighet med vern.

### 3. Problem den løser
Lett, bøyelig støtvern som er stivt ved slag men mykt i ro — hjelmforinger, wearables,
robot-skall, pakkebeskyttelse. Scenarie: fleksibelt albue-/kne-vern som herdner ved anslag.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Panel 200×150 mm, overlappende skjell 30×30 mm. Vekt **~200 g**.
- **Materialer:** Harde skjell i **PC/ABS eller nylon** (SLS-print) festet på fleksibelt
  TPU/tekstil-underlag; NTH: fyll med **shear-thickening fluid (STF)**-pute (silika i PEG) for
  hastighetsavhengig herding. Leverandør: generisk SLS, STF fra silika-nanopartikler + PEG.
- **Aktuering:** Passiv (mekanisk/reologisk).

### 5. Funksjonsprinsipp
1. I ro glir overlappende skjell fritt → panelet bøyer.
2. Ved slag «låser» skjellene mot hverandre → stiv, lastfordelende plate.
3. NTH STF-lag: raskt anslag → viskositetshopp → ekstra energiabsorpsjon.

### 6. Testing & validering (min. 4)
1. **Slagenergi-absorpsjon** `[FK]` — Drop-tower, instrumentert. Suksess: transmittert G ≤
   **50 %** av bar plate.
2. **Fleksibilitet i ro** `[FK]` — Bøyeradius-måling. Suksess: bøyer til ≤ **80 mm** radius uten
   låsing.
3. **Penetrasjonsmotstand** `[NTH]` — Spiss-impaktor. Suksess: ingen gjennomtrenging ved
   spesifisert energi.
4. **Syklisk holdbarhet** `[NTH]` — 500 bøy + 50 slag. Suksess: skjell intakte, festet holder.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| SLS/print-skjell (batch) | $80 |
| TPU/tekstil underlag | $25 |
| STF-kjemi (silika + PEG) [NTH] | $45 |
| Fester, lim, kant | $20 |
| Akselerometer + DAQ (delt) | $60 |
| **Total per prototype** | **≈ $230** |

### 8. Fabrikasjonsplan
- Dag 1: Skjell-mønster (parametrisk overlapp) + print-bestilling.
- Dag 2: Lag underlag, monter skjell.
- Dag 3: (NTH) bland/innkapsle STF-pute.
- Dag 4: Drop-tests + iterasjon.
- **Total: ~4 dager** (+ print-ledetid).

### 9. Testfasiliteter & DIY
- Ideelt: instrumentert drop-tower, høyhastighetskamera.
- DIY: guidet fallrigg med kjent masse + akselerometer (ADXL/høy-G) + Arduino; leirkule-avtrykk
  for kvalitativ energifordeling.

### 10. Kostnad & timeline
~**$230**, ~**4 dager**. Lav-middels risiko. STF-varianten øker begge.

### 11. Gøy / demo `[DEMO]`
- Video: bøy panelet rundt en arm, så slå det med hammer over et rått egg — egget overlever.
  «Mykt til det treffer.»

### 12. Risiko / regulatorisk
- Bruk verneutstyr under slagtesting. Som **sertifisert verneutstyr** (hjelm/PPE) kreves
  **EN 1621 / CE PPE-forordning (EU) 2016/425** — PoC er ikke sertifisert vern; ikke markedsfør
  som beskyttelsesutstyr uten testing.

---

# 9. Rank-aktuatoren — «Vokser og griper som en klatreplante»

### 2. Biologisk inspirasjon
Klatreplanters **tendriler** (ranker) utfører **nastisk/koiling-bevegelse**: de vokser, søker
kontakt og kveiler seg om støtter via differensiell vekst/turgor. «Vekst-i-stedet-for-bevegelse».

### 3. Problem den løser
Feste/manipulasjon i **trange, ustrukturerte** rom (rørinnvendig, vegetasjon, rot, romfagverk)
der en stiv arm ikke kommer til. Scenarie: myk aktuator som kveiler seg rundt en gren/rør for
å henge sensorer.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Ø 8–12 mm, lengde 300 mm bånd/rør. Vekt **~90 g**.
- **Materialer:** To-lags silikon (Ecoflex) med asymmetrisk **pneumatisk bøy-kammer** som kveiler
  ved trykk; alternativt **vekst via «tip-eversion»** (rull-ut-teip fra Stanford «vine robot»
  prinsipp) i tynn TPU-slange. Leverandør: Smooth-On + TPU-film.
- **Aktuering:** Lavtrykk luft **0,2–1,5 bar**; 1–2 ventiler + pumpe.

### 5. Funksjonsprinsipp
1. (Kveil-variant) Ett kammer på innersiden ekspanderer mindre enn ytterlaget → naturlig kurl.
2. (Vekst-variant) Indre trykk everterer tuppen → «vokser» fremover fra spissen uten friksjon
   mot omgivelsene.
3. Ved kontakt kveiler den om objektet og holder passivt.

### 6. Testing & validering (min. 4)
1. **Kveileradius vs. trykk** `[FK]` — Mål. Suksess: kveiler til ≤ **20 mm** radius ved ≤ 1,5 bar.
2. **Holdekraft rundt stav** `[FK]` — Trekk objektet ut. Suksess: holder ≥ **300 g** trekk.
3. **Vekstlengde/rate** `[NTH]` (vekstvariant) — Suksess: everter ≥ **200 mm** stabilt.
4. **Sykluslevetid** `[NTH]` — 2 000 kveil-sykluser uten lekkasje.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Silikon/TPU-materiale | $40 |
| Molds (print) | $20 |
| Pumpe + 2 ventiler | $70 |
| Slanger, trykkgiver, MCU | $45 |
| **Total per prototype** | **≈ $175** |

### 8. Fabrikasjonsplan
- Dag 1: Mold/kammer-design + print.
- Dag 2–3: Støp + herde silikon (eller sveis TPU-slange).
- Dag 4: Pneumatikk + lekkasjetest.
- Dag 5: Kveil/vekst-tester + iterasjon.
- **Total: ~5 dager.**

### 9. Testfasiliteter & DIY
- Ideelt: trykk-rigg, kraftmåler.
- DIY: akvariepumpe + solenoider, fjærvekt for holdekraft, håndmanometer.

### 10. Kostnad & timeline
~**$175**, ~**5 dager**. Middels risiko (silikonlekkasje/geometritrimming).

### 11. Gøy / demo `[DEMO]`
- Video: aktuatoren «vokser» ut over et bord og kveiler seg om en blyant som en levende ranke;
  henger så et lite kamera i en gren.

### 12. Risiko / regulatorisk
- Trykksatt → hold under materialgrense, trykkavlastning. Ingen sertifisering for PoC.

---

# 10. Elektrolokasjons-sensoren — «Ser i mørket som en knivfisk»

### 2. Biologisk inspirasjon
**Svakelektriske fisk** (knivfisk, elefantfisk) sender ut et svakt elektrisk felt og «leser»
forstyrrelser i feltet for å oppfatte objekter i grumsete vann uten syn — **aktiv
elektrolokasjon**.

### 3. Problem den løser
Nærfelts-deteksjon og materialskille i **mørke/grumsete/optisk umulige** medier (subsea-inspeksjon,
rørinnvendig, robotgriping i skum) der kamera og laser feiler. Scenarie: undervannsrobot som
kjenner en metallgjenstand i søl-vann.

### 4. Teknisk design — Version 1 (PoC)
- **Dimensjoner/vekt:** Sensorbom ~150 mm med elektrode-array (1 sender + 4–8 mottakere). Elektronikk
  ~80×50 mm. Vekt **~150 g** (uten kapsling).
- **Materialer:** Grafitt/rustfrie elektroder, epoksy-innkapsling for vann; PCB. Leverandør:
  standard elektronikk (analog frontend), rustfrie elektroder.
- **Aktuering/elektrisk:** **Lavspent** vekselstrøm-eksitasjon (typisk **< 5 V**, kHz-område,
  strømbegrenset til trygge µA–mA), synkron deteksjon (lock-in). **Ingen farlige spenninger.**
- **ASCII-skisse:**
```
   [TX elektrode] ~~ svakt E-felt ~~ [objekt forstyrrer felt]
        |                                   |
   [RX1][RX2][RX3][RX4]  -> analog frontend -> lock-in -> MCU -> "avstand/materiale"
```

### 5. Funksjonsprinsipp
1. Sender-elektroden setter opp et svakt vekslende E-felt i mediet.
2. Objekter med annen konduktivitet/permittivitet forvrenger feltet.
3. Mottaker-array måler amplitude/fase-endring; lock-in trekker signal ut av støy.
4. Mønster over array → estimat av avstand, retning, og grov materialklasse (leder vs. isolator).

### 6. Testing & validering (min. 4)
1. **Deteksjonsavstand** `[FK]` — Nærme kjent objekt i vannkar. Suksess: pålitelig påvisning ≥
   **50 mm** for håndstor gjenstand.
2. **Materialskille** `[FK]` — Metall vs. plast vs. tre. Suksess: korrekt klasse ≥ **80 %**.
3. **Retningsoppløsning** `[NTH]` — Objekt til side. Suksess: venstre/høyre skille pålitelig.
4. **Grumse-immunitet** `[FK]` — Gjenta i uklart/gjørmete vann. Suksess: ytelse bevart der kamera
   svikter.

### 7. BOM (est. USD)
| Del | Est. pris |
|---|---|
| Analog frontend / lock-in (AD-krets) | $40 |
| MCU-utviklingskort | $25 |
| Elektroder (grafitt/rustfri) | $15 |
| Epoksy-innkapsling + kabel | $25 |
| Vannkar + testobjekter | $20 |
| **Total per prototype** | **≈ $125** |

### 8. Fabrikasjonsplan
- Dag 1: Elektrode/array-design + frontend-oppsett.
- Dag 2: Bygg krets, lock-in i firmware.
- Dag 3: Innkapsling + vanntetting.
- Dag 4: Kalibrering i vannkar.
- Dag 5: Materialskille- og avstandstester + iterasjon.
- **Total: ~5 dager.**

### 9. Testfasiliteter & DIY
- Ideelt: skjermet vannkar, oscilloskop, signalgenerator.
- DIY: plastbalje, USB-oscilloskop, gjørme fra hagen for grumse-test.

### 10. Kostnad & timeline
~**$125**, ~**5 dager**. Middels risiko (signal/støy-tuning er kjernen).

### 11. Gøy / demo `[DEMO]`
- Video: hånd i grumsete vann-akvarium, roboten «peker» på skjulte metallmynter den ikke kan se.
  «Fisken som ser i blinde.»

### 12. Risiko / regulatorisk
- **Elektrisk sikkerhet i vann:** hold spenning/strøm godt under trygge grenser (galvanisk
  isolert, strømbegrenset). Ingen fare ved korrekt lavspent design; dokumentér strømgrenser.

---

# Samlet oppsummering

## Total estimert kostnad (10 PoC-er)
| # | Prototype | Est. USD |
|---|---|---|
| 1 | Gecko-griper | 230 |
| 2 | Kolibri-flapper | 122 |
| 3 | Haihud-film | 300 |
| 4 | Snabel-arm | 275 |
| 5 | Dugg-høster | 195 |
| 6 | Ugle-vifte | 105 |
| 7 | Mycel-emballasje | 135 |
| 8 | Pangolin-skall | 230 |
| 9 | Rank-aktuator | 175 |
| 10 | Elektrolokasjon | 125 |
| | **SUM materialer** | **≈ $1 892** |

> **Merk:** Dette er **kun BOM/materialer**. Legg til delt utstyr (kraftceller, mikrofon,
> DAQ, oscilloskop, 3D-printer, kompressor) som engangsinvestering ~**$2 000–4 000** hvis lab
> ikke finnes, samt arbeidstimer.

## Total estimert tid
- **Aktive arbeidsdager (sum):** 5+7+6+6+5+4+3+4+5+5 = **50 arbeidsdager** (seriell, 1 person),
  ≈ **10 arbeidsuker**.
- **Kalendertid** ekstra pga. eksterne ledetider og biologiske/felt-prosesser:
  - Haihud: +4–8 uker feltprøve (i bakgrunn)
  - Mycel: +~1 uke vekst
  - Div. mold-/print-ledetider: +1–2 uker overlappende
- **Parallelisert med 3–4 personer:** kritisk sti ≈ **3–4 uker aktivt arbeid**, men
  **kalendertid ~8–10 uker** bestemt av haihud-feltprøven (kjør den først, i bakgrunn).

```
Seriell (1 pers):     |==================================================|  ~10 uker aktivt
Parallell (3-4 pers): |==============|  ~3-4 uker aktivt
Feltprøve (haihud):   |==========================================|        ~8 uker kalender (bakgrunn)
```

## Anbefalt topp-3 for umiddelbar prototyping
1. **Ugle-vifte (#6)** — Billigst (~$105), raskest (~4 dager), og dB-reduksjon er en
   *lettkommunisert, målbar* demo. Beste kost/impact/time-to-demo.
2. **Dugg-høster (#5)** — Lav kost (~$195), sterk «feel-good»/bærekraft-fortelling, enkel
   visuell demo (glasset som fylles). Lav teknisk risiko.
3. **Snabel-arm (#4)** — Høyere kost (~$275) men *høyest kommersiell impact* (myk griping er et
   hett felt), og «plukk et egg og et bringebær»-demoen selger seg selv.

> Hederlig omtale: **Gecko-griperen** hvis renrom/glass-håndtering er målmarkedet — sterk
> industriell nisje, men avhenger av mold-ledetid.

---

## Neste steg — velg visualisering

Ønsker du at jeg lager **prioriteringsmatrise** (impact × innsats/kost, 2×2 med alle 10 plottet)
og/eller et **Gantt-chart** (parallellisert plan for 3–4 personer med kritisk sti)?

**Jeg kan lage begge** — si fra, så leverer jeg:
- [ ] Prioriteringsmatrise (2×2: Impact vs. Kost/Tid)
- [ ] Gantt-chart (8–10 ukers plan, ressursallokering)
- [ ] Begge deler
