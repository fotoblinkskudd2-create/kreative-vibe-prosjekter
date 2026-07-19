# CAD-design: Tungtlast hyllebrakett «HB-250»

Komplett design- og beregningsunderlag for en sveiset hyllebrakett i stål,
klar for modellering i AutoCAD, SolidWorks, FreeCAD, Fusion 360 e.l.

| Nøkkeldata | Verdi |
|---|---|
| Produkt | Veggmontert hyllebrakett, sveiset 3-delt konstruksjon |
| Nominell last | 50 kg per brakett (100 kg per hylle med 2 braketter) |
| Dimensjonerende last | 750 N per brakett (dynamisk faktor 1,5) |
| Utstikk fra vegg | 255 mm (for hyllebredde 250–300 mm) |
| Materiale | Konstruksjonsstål S235JR (EN 10025-2) |
| Overflate | Pulverlakkert (alt. varmforsinket, EN ISO 1461) |
| Vekt | ca. 1,3 kg per brakett |
| Laveste sikkerhetsfaktor | 5,3 (bøyning i arm ved ribbeslutt) |

---

## 1. Designbeskrivelse

Braketten består av tre deler i 5 mm stålplate som sveises sammen til én enhet:

1. **Veggplate** (200 × 50 × 5 mm) – ligger flatt mot veggen, fire festehull.
2. **Bærearm** (250 × 40 × 5 mm) – horisontal, hyllen skrus fast ovenfra
   gjennom to forsenkede hull.
3. **Trekantribbe** (180 × 150 × 5 mm) – står på høykant under armen og
   overfører bøyemomentet ned i veggplaten. Ribben er det bærende elementet:
   den gjør at tverrsnittet ved veggen virker som et høyt T-profil i stedet
   for en flat, svak plate.

### Prinsippskisse (sett fra siden)

```
  VEGG
   │
   │◄─ veggplate 200×50×5
 ○ │  (4× Ø6,6 hull)
   ├──────────────────────────────┐
   │__________________________────┘◄─ bærearm 250×40×5 (2× Ø4,5 forsenket)
   │         ／
   │       ／
   │     ／   ◄─ trekantribbe 180×150×5
   │   ／        (kilsveis a3 mot arm og veggplate)
 ○ │ ／
   │/
   │
```

### Hoveddimensjoner og koordinater

Koordinatsystem: origo i nedre bakre hjørne av veggplaten.
X = ut fra vegg, Y = sideveis (bredde), Z = opp.

| Del | Dimensjon | Plassering |
|---|---|---|
| Veggplate | 200 h × 50 b × 5 t | X: 0–5, Y: 0–50, Z: 0–200 |
| Bærearm | 250 l × 40 b × 5 t | X: 5–255, Y: 5–45, Z: 195–200 |
| Trekantribbe | 180 × 150, t = 5 | X: 5–185, Y: 22,5–27,5, Z: 45–195 |

**Hullplan:**

| Hull | Antall | Dimensjon | Posisjon (Y, Z) / (X, Y) | Funksjon |
|---|---|---|---|---|
| Veggfeste | 4 | Ø6,6 gjennomgående | (12; 30), (38; 30), (12; 170), (38; 170) | 6 mm treskrue/bolt |
| Hyllefeste | 2 | Ø4,5, forsenket Ø9 × 90° fra undersiden | (X=60; Y=15), (X=200; Y=15) | 4,2 mm treskrue opp i hyllen |

Hullene i veggplaten er lagt i to kolonner (Y = 12 og 38) slik at skruehoder
og verktøy går klar av ribben, som står sentrert (Y = 22,5–27,5).
Hyllehullene er forskjøvet til Y = 15 av samme grunn.

**Avrundinger/faser:**
- Alle frie ytterhjørner: radius R5 (veggplate) / fas 2 × 45° (armtupp).
- Ribbens rette hjørne (mot innerhjørnet arm/veggplate): fas 8 × 45° som
  sveiseavlastning, så kilsveisene ikke kolliderer i hjørnet.
- Alle skarpe kanter avgrades 0,3–0,5 mm.

---

## 2. Materialvalg med begrunnelse

| Kriterium | S235JR (valgt) | Aluminium 6061-T6 | Rustfritt A2 (1.4301) |
|---|---|---|---|
| Flytegrense Re | 235 MPa | 240 MPa | 210 MPa |
| E-modul | 210 GPa | 69 GPa | 200 GPa |
| Sveisbarhet | Meget god | Krever TIG/kompetanse | God |
| Pris | Lav | Middels | Høy |
| Korrosjon | Krever overflatebehandling | God | Meget god |

**Valg: S235JR, 5 mm plate.**
- Billig, lett tilgjengelig som plate/flattstål, og svært godt egnet for
  laserskjæring og MAG-sveising.
- Stivheten (E = 210 GPa) er 3× aluminium – viktig for å begrense nedbøyning
  av hyllen.
- Innendørs bruk (korrosjonsklasse C1–C2) dekkes av pulverlakk;
  velg varmforsinking ved fuktig miljø (C3+).
- Flytegrense 235 MPa gir sikkerhetsfaktor > 5 med valgte tverrsnitt (se kap. 3).

Festemidler: skruer 6 × 60 mm elforsinket 8.8 (eller A2 ved forsinket
brakett unngås galvanisk problematikk ikke – bruk samme belegg som brakett).

---

## 3. Tekniske beregninger

### 3.1 Lastforutsetninger

- Nominell hyllelast: 100 kg per hylle, fordelt på 2 braketter → 50 kg per brakett.
- Nominell kraft: F_nom = 50 kg × 9,81 m/s² = **490 N**
- Dynamisk faktor (støt ved pålessing): γ = 1,5
- **Dimensjonerende last: F = 1,5 × 490 ≈ 750 N per brakett**, jevnt fordelt
  over armlengden (hylle skrudd til arm) → linjelast w = 750 / 250 = **3,0 N/mm**.
- Tilleggssjekk: punktlast på armtupp (unormal last, f.eks. person som lener seg).

### 3.2 Bøyning i bærearmen ved ribbeslutt (kritisk snitt)

Utenfor ribben (siste 70 mm av armen) bærer den flate armen alene.
Tverrsnitt: b = 40 mm, h = 5 mm (bøyes om den svake aksen).

Motstandsmoment:

    W = b·h²/6 = 40 · 5² / 6 = 166,7 mm³

Bøyemoment ved ribbeslutt (jevnt fordelt last, utkrager l = 70 mm):

    M = w·l²/2 = 3,0 · 70² / 2 = 7 350 Nmm

Bøyespenning og sikkerhetsfaktor:

    σ = M/W = 7 350 / 166,7 = 44,1 MPa
    SF = Re/σ = 235 / 44,1 = 5,3  ✔

**Punktlast på tupp:** Tillatt punktlast ytterst med SF = 1,5:

    F_maks = W·Re / (SF·l) = 166,7 · 235 / (1,5 · 70) ≈ 373 N  (≈ 37 kg)

Merkes på produktark: punktlast helt ytterst begrenses til 35 kg.

### 3.3 Sammensatt T-tverrsnitt ved veggen

Ved veggen virker arm (flens 40 × 5) + ribbe (steg 5 × 150) som T-profil.
Arealtyngdepunkt målt fra ribbens underkant (Steiners setning):

    A_flens = 200 mm², z = 152,5 mm   A_steg = 750 mm², z = 75 mm
    z̄ = (200·152,5 + 750·75) / 950 = 91,3 mm

Arealtreghetsmoment:

    I = Σ(I_egen + A·d²)
    I_flens = 40·5³/12 + 200·(152,5−91,3)² = 417 + 749 000 ≈ 749 400 mm⁴
    I_steg  = 5·150³/12 + 750·(91,3−75)²  = 1 406 250 + 199 300 ≈ 1 605 500 mm⁴
    I_tot ≈ 2 355 000 mm⁴

Motstandsmoment (strekk i underkant, c = 91,3 mm):

    W = I/c = 2 355 000 / 91,3 ≈ 25 800 mm³

Moment ved vegg: M = w·L²/2 = 3,0 · 250²/2 = 93 750 Nmm

    σ = 93 750 / 25 800 = 3,6 MPa   →   SF ≈ 65  ✔ (ribben gjør jobben)

### 3.4 Nedbøyning

Dominerende bidrag er den uavstivede armdelen utenfor ribben
(I = b·h³/12 = 40·5³/12 = 417 mm⁴, E = 210 000 MPa):

    δ ≈ w·l⁴/(8·E·I) = 3,0 · 70⁴ / (8 · 210 000 · 417) ≈ 0,10 mm

Med rotasjonsbidrag fra det avstivede partiet: **δ_total ≈ 0,2 mm** ved
dimensjonerende fordelt last – i praksis umerkelig. Ved unormal punktlast
750 N på tupp estimeres δ ≈ 1,5–2 mm (verifiseres med FEM ved behov,
f.eks. SolidWorks Simulation eller FreeCAD FEM-workbench).

### 3.5 Sveiseforbindelser

Kilsveis a = 3 mm på begge sider av ribben (mot arm og veggplate) samt
tverrsveis arm/veggplate. Dimensjonerende skjærkapasitet for S235
(EN 1993-1-8): f_vw,d = f_u/(√3·β_w·γ_M2) = 360/(√3·0,8·1,25) ≈ **208 MPa**.

- Skjær fra tverrkraft, vertikalsveiser 2 × 150 mm:
  τ = 750 / (2·3·150) = 0,8 MPa
- Momentkraftpar (strekk i toppsveis, indre momentarm ≈ 145 mm):
  T = 93 750 / 145 = 647 N over sveiseareal 2·40·3 = 240 mm² → 2,7 MPa

Utnyttelse < 2 % – sveisen dimensjoneres altså av minimumskrav (a3),
ikke av lasten. ✔

### 3.6 Veggfeste og forankring (svakeste ledd)

Braketten vipper om underkant av veggplaten; de to øverste skruene tar strekk.
Momentarm til øvre hullrekke: d = 170 mm, antall skruer i rekken n = 2,
hevarmstillegg («prying») 30 %:

    F_skrue = 1,3 · M / (n·d) = 1,3 · 93 750 / (2 · 170) ≈ 360 N per skrue

- Skruekapasitet 6 mm stålskrue 8.8: > 6 kN → SF > 15 ✔
- Skjær per skrue: 750/4 ≈ 190 N – neglisjerbart. ✔
- **Forankring er dimensjonerende:** Ø8 nylonplugg i betong/massiv tegl har
  typisk anbefalt uttrekkslast 500–900 N → SF ≥ 1,7 mot 360 N. ✔
- Krav i monteringsanvisning: kun betong, massiv tegl eller trestender.
  Gipsplate alene er **ikke** tillatt uten hulromsanker klassifisert ≥ 1 kN.

### 3.7 Vekt og materialforbruk

    V = 200·50·5 + 250·40·5 + ½·180·150·5 = 50 000 + 50 000 + 67 500 = 167 500 mm³
    m = ρ·V = 7,85 g/cm³ · 167,5 cm³ ≈ 1,31 kg per brakett

### Beregningssammendrag

| Sjekk | Resultat | Krav | Status |
|---|---|---|---|
| Bøyning arm ved ribbeslutt | 44,1 MPa | SF ≥ 2 → SF = 5,3 | ✔ |
| T-snitt ved vegg | 3,6 MPa | SF = 65 | ✔ |
| Nedbøyning (normal last) | ≈ 0,2 mm | < L/250 = 1 mm | ✔ |
| Sveis a3 | < 3 MPa av 208 MPa | ✔ | ✔ |
| Skruestrekk (øvre) | 360 N | Plugg ≥ 500 N | ✔ |
| Punktlast tupp | maks 37 kg (SF 1,5) | merkes | ✔ |

---

## 4. Toleranser og overflate

- Generelle toleranser: **ISO 2768-mK** (middels for mål, K for form/retning).
- Sveisekonstruksjon: **EN ISO 13920-BF**.
- Hull Ø6,6: toleranse +0,3/0; posisjonstoleranse ±0,2 mm (sikrer at
  4-hullsbildet passer borejigg/vater ved montering).
- Vinkel arm/veggplate: 90° ± 0,5° (kontrolleres med fikstur under sveising).
- Planhet veggplate: 0,5 mm over 200 mm (så platen ligger an mot veggen).
- Overflate: avgrading, deretter pulverlakk RAL 9005 (60–80 µm) eller
  varmforsinking EN ISO 1461.

---

## 5. Steg-for-steg CAD-instruks

Instruksene er skrevet for FreeCAD (Part Design), med kommandonavn for
SolidWorks/AutoCAD i parentes. Et ferdig Python-makro som genererer hele
modellen ligger i [`freecad_makro_hyllebrakett.py`](freecad_makro_hyllebrakett.py).

### Del 1 – Veggplate (POS 1)

1. Ny fil → Part Design → ny Body → skisse på **XZ-planet** (SW: Front Plane).
2. Tegn rektangel 50 × 200 mm med nedre venstre hjørne i origo.
3. **Pad/Extrude 5 mm** (SW: Extruded Boss; ACAD: EXTRUDE).
4. Skisse på frontflaten: 4 sirkler Ø6,6 i posisjonene
   (12; 30), (38; 30), (12; 170), (38; 170) → **Pocket/Through All**
   (SW: Hole Wizard, «6 mm clearance»).
5. **Fillet R5** på de fire ytterhjørnene.

### Del 2 – Bærearm (POS 2)

1. Ny Body → skisse: rektangel 250 × 40 mm → **Pad 5 mm**.
2. 2 hull Ø4,5 gjennomgående på (60; 15) og (200; 15) målt fra
   veggenden/langsiden.
3. **Countersink Ø9 × 90°** fra undersiden (SW: Hole Wizard countersunk;
   FreeCAD: Hole-funksjonen med «Countersink»).
4. **Chamfer 2 × 45°** på tuppens to hjørner.

### Del 3 – Trekantribbe (POS 3)

1. Ny Body → skisse: rettvinklet trekant med kateter 180 mm (horisontal)
   og 150 mm (vertikal) → **Pad 5 mm**.
2. **Chamfer 8 mm** på det rette hjørnet (sveiseavlastning).

### Sammenstilling (Assembly)

1. Nytt assembly (FreeCAD: Assembly-workbench; SW: New Assembly).
2. Sett inn veggplaten fast (grounded) med bakflate i X = 0.
3. Bærearm: bakre endeflate **Coincident** mot veggplatens frontflate,
   overkant flush med veggplatens topp (Z = 195–200), sentrert
   (Y = 5–45).
4. Ribbe: vertikal katet mot veggplaten, horisontal katet mot armens
   underside, sentrert i bredden (Y = 22,5–27,5).
5. Kontroller kollisjoner (Interference Check) – skruehoder Ø12 på
   (Y = 12/38) skal gå klar av ribben med ≥ 4 mm.

### Teknisk tegning (Drawing/TechDraw/Layout)

1. Ark **A3 liggende, målestokk 1:2**, tittelfelt iht. ISO 7200
   (tegningsnr. HB-250-001, materiale, vekt 1,31 kg, toleranse ISO 2768-mK,
   EN ISO 13920-BF).
2. Visninger:
   - **Front (hovedprojeksjon):** braketten fra siden – viser L-formen,
     ribben, alle lengde-/høydemål (255, 200, 180, 150, hullposisjoner Z).
   - **Sett bakfra:** veggplaten med 4-hullsbildet (senteravstander 26 × 140,
     kantavstander 12/30).
   - **Sett ovenfra:** armbredde 40, hyllehull X = 60/200, Y = 15.
   - **Isometrisk** (målestokk 1:5) for oversikt.
   - **Detalj A (2:1):** forsenkning Ø9 × 90°.
3. Sveisesymboler iht. **ISO 2553**: kilsveis a3, tosidig, rundt ribbe og
   arm/veggplate-anlegg.
4. Målsetting fra funksjonelle referanser: veggplatens bakflate (datum A)
   og underkant (datum B).

---

## 6. Stykkliste (BOM) – per brakett

| Pos | Antall | Betegnelse | Dimensjon | Materiale | Funksjon |
|---|---|---|---|---|---|
| 1 | 1 | Veggplate | 200 × 50 × 5 | S235JR | Anlegg mot vegg, 4 festehull |
| 2 | 1 | Bærearm | 250 × 40 × 5 | S235JR | Bærer hyllen, 2 forsenkede hull |
| 3 | 1 | Trekantribbe | 180 × 150 × 5 | S235JR | Momentavstivning arm–vegg |
| 4 | 4 | Skrue m/skive | 6 × 60, 8.8 elforsinket | Stål | Veggfeste |
| 5 | 4 | Nylonplugg | Ø8 × 40 | PA6 | Forankring i betong/tegl |
| 6 | 2 | Treskrue forsenket | 4,2 × 25 | Stål elforsinket | Feste av hylle til arm |

Per hylle brukes 2 braketter (senteravstand ≤ 600 mm anbefales).

---

## 7. Formeloversikt

| Formel | Bruk |
|---|---|
| σ = M/W | Bøyespenning |
| W = b·h²/6 (rektangel) | Motstandsmoment |
| I = b·h³/12 + A·d² (Steiner) | Sammensatt tverrsnitt |
| M = w·l²/2 (fordelt), M = F·l (punkt) | Moment i utkrager |
| δ = w·l⁴/(8EI), δ = F·l³/(3EI) | Nedbøyning utkrager |
| SF = Re/σ | Sikkerhetsfaktor |
| f_vw,d = f_u/(√3·β_w·γ_M2) | Sveisekapasitet (EN 1993-1-8) |
| F_skrue = γ_prying·M/(n·d) | Strekk i festeskruer |
| m = ρ·V | Vekt |

---

## 8. Videre arbeid

- FEM-verifikasjon av punktlast-tilfellet (SolidWorks Simulation / FreeCAD FEM).
- DXF-eksport av de tre platedelene for laserskjæring (alle deler er 2D-konturer i 5 mm plate – svært produksjonsvennlig).
- Variantstudie: parameteren `L_ARM` i makroen kan settes til 200/300 mm for
  hylledybde 250/350 mm – beregningene i kap. 3 gjentas da med ny lengde.
