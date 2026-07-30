# Luna — designspesifikasjon

**Status:** utkast 1 (fra fritekst-beskrivelse til byggbar spec)
**Kategori:** myk lysobjekt / rolig companion. Skal lese som møbel, ikke som maskin.

---

## 1. Hovedmål

| Mål | Verdi |
|---|---|
| Total høyde | 580 mm |
| Total bredde (bredeste punkt) | 340 mm |
| Total dybde | 310 mm |
| Basediameter | Ø280 mm |
| Basehøyde | 120 mm |
| Kroppshøyde (over base) | 460 mm |
| Hodebredde | 220 mm |
| Estimert totalvekt | 4,5–6,0 kg (derav 3–4 kg ballast i basen) |

120 + 460 = 580. **Hodet er altså den øverste delen av de 460 mm, ikke et påbygg.**
Hodet opptar de øverste ca. 190 mm av kroppen. Dette er en tolkning — se åpne punkter (§8).

Bredeste punkt (340 mm) sitter på kroppen, ikke på basen (Ø280). Luna er altså
litt bredere enn foten sin. Det er visuelt riktig (den «hviler» heller enn å stå),
men krever ballast — se §5.

### Vertikal inndeling

```
 580 ┬── isse
     │   hode, B220, lett fremoverlent 8°
 390 ┼── halslinje (myk innsnevring, ingen skarp overgang)
     │   skulderparti, bredeste punkt B340 / D310
 300 ┼── skjerf faller herfra
     │   kropp, avrundet sylinder
 120 ┼── skjøt kropp/base (skjult i stoffkant)
     │   keramikkbase Ø280
   0 ┴── gummiunderflate
```

---

## 2. Form og holdning

- Alt avrundet. **Minste konvekse radius noe sted på objektet: R15 mm.** Ingen skarpe
  kanter, ingen synlig skjøt, ingen synlig plast, ingen knapper.
- Kroppen er en myk, avrundet sylinder — ikke en rett sylinder. Svak tønneform:
  bredest ved skulder (340), smalere ved midjen (ca. 300), smalere igjen mot basen (285).
- Hodet er **lett fremoverlent, 8°** fra vertikalen. Nok til å lese som oppmerksomhet,
  lite nok til å ikke lese som nedstemthet. (10° begynner å se trist ut; 5° er umerkelig.)
- Overgangen hode/kropp er en innsnevring, ikke en hals. Ingen synlig ledd.
- Munnen er lukket og rolig. Den er **ikke** en lysende del — den er en søm/preging
  i stoffet, 45 mm bred, 2 mm dyp. Den beveger seg ikke.

## 3. Materialer og CMF

### Base
- Dreid steintøy, matt glasur, godstykkelse 8–10 mm.
- Farge: sandgrå, halvmatt (glansverdi 10–20 GU @ 60°).
- Underflate: silikongummi Shore A 60–70, 3 mm, limt i not. Skal ikke ripe parkett,
  skal ikke vandre på benkeplate.
- Ballastkammer støpt i bunnen: 3–4 kg tørr kvartssand i forseglet pose, eller
  betongskive Ø240 × 25 mm.

### Kropp
- Trekk: **ull/bomull 60/40**, 280–340 g/m², vevd (ikke strikket — strikk henger seg ut).
- Grunnfarge varm beige: NCS S 2010-Y30R.
- Striper: diskrete, vertikale, uregelmessig fordelt.
  - Dempet oransje: NCS S 3040-Y60R
  - Grå: NCS S 4000-N
  - Stripebredde 6–14 mm, avstand 40–90 mm. Aldri to like avstander etter hverandre.
- **Stoffet må være flammehemmende behandlet og bestå EN 1021-1 og -2.** Ikke valgfritt
  når det ligger tekstil over en lyskilde.
- Trekket er avtakbart: skjult glidelås i ryggsømmen, 320 mm, med stoffklaff over.
  Vaskbart på 30° ullprogram.

### Skjerf
- Samme veve-familie, tynnere kvalitet (180–220 g/m²), samme fargekart.
- **Integrert, ikke løst tilbehør.** Festet i skulderpartiet i én søm på venstre side,
  faller fritt over høyre skulder og ned til ca. kote 260 mm.
- Skal kunne dras i uten at noe ryker: sømmen tåler 60 N strekk.

---

## 4. Lys

| Parameter | Verdi |
|---|---|
| Kropp: lyskilde | COB LED-bånd, 24 V |
| Fargetemperatur | 2700 K |
| Fargegjengivelse | CRI ≥ 95 (R9 ≥ 50) |
| Effekt kropp | 8 W nominelt, 12 W maks |
| Lysstrøm ut av stoffet | ca. 120–180 lm (stemningslys, ikke lesestlys) |
| Dimming | 1–100 %, logaritmisk kurve |
| Øyne | 2 × varmhvit LED, Ø14 mm opal akrylskive, PWM |
| Pulsfrekvens øyne | 0,20 Hz (12 pust/min), sinus, 40–70 % intensitet |

Kritisk: **stoffet skal aldri ligge mot LED-båndet.** Rekkefølgen innenfra og ut er
LED → luftspalte 25 mm → opal PC-diffusor 2 mm → luftspalte 8 mm → skum → stoff.
Uten den avstanden får du synlige prikker i stoffet, og over tid brune brennmerker.

Effekttettheten er med vilje lav (8 W fordelt over ca. 1,2 m bånd). Det er både
termisk og estetisk: Luna skal gløde, ikke lyse.

---

## 5. Stabilitet

Basen er ballast, ikke bare fot. Med 3,5 kg i basen og en lett kropp havner
tyngdepunktet på ca. 175 mm — under en tredjedel av totalhøyden.

Veltevinkel ≈ atan(140 / 175) ≈ **38°**. Målkrav: **≥ 30°**, og Luna skal rette seg opp
igjen selv ved 15° vipping. Test dette fysisk før du syr igjen trekket (§ byggekurs, modul 6).

Dette er punktet der «bredere enn foten» kan gå galt. Ikke kutt ballasten.

---

## 6. Elektronikk og strøm

- **Ekstern, ferdigsertifisert 24 V / 30 W klasse II strømforsyning.** Ingen nettspenning
  inne i Luna. Ikke bygg egen nettdel.
- Kabel: tekstiltrukket, 2 m, går ut bak i basen gjennom en gummigjennomføring
  med strekkavlastning (skal tåle 100 N uttrekk).
- Styring: MCU (ESP32-C3 eller RP2040) i basen, på aluminiumsplate mot keramikken
  som varmeavledning.
- **Ingen knapper** er en designbeslutning med en konsekvens: det må finnes en annen
  vei inn. Anbefalt primærløsning: kapasitiv berøringssone i skulderpartiet
  (elektrode under stoffet, 60 × 40 mm) — ett trykk = av/på, hold = dimming.
  Den er usynlig, den er ikke en knapp, og den gjør at Luna kan slås av uten å trekke
  ut støpselet.
- Ingen mikrofon, ingen kamera, ingen radio i versjon 1. Det holder objektet ærlig
  og gjør at det kan stå på et soverom uten forklaring.

---

## 7. Hva Luna ikke er

Nyttig å ha skrevet ned, fordi det er her slike prosjekter sklir:

- Ikke en høyttaler.
- Ikke en assistent. Den svarer ikke, den lytter ikke.
- Ikke et ansikt med uttrykk. Øynene pulserer i én rytme, alltid den samme.
- Ikke et nattlys for barnerom (høyde og vekt gjør den til et veltepunkt for de minste).

---

## 8. Åpne punkter

1. **Hodet: inkludert i de 460 mm, eller på toppen av dem?** Spec-en her antar inkludert,
   fordi 120 + 460 = 580 går opp. Er hodet et påbygg blir totalhøyden ca. 750 mm og
   proporsjonene helt andre. Bekreft.
2. **Dybde 310 mm mot base Ø280** — hva stikker ut bakover? Sannsynligvis skulderpartiet.
   Trenger en snittegning fra siden.
3. **Fremoverlent hode: hvilken vei er «foran»?** Objektet er ellers rotasjonssymmetrisk.
   Skjerfet og hellingen definerer en front — det bør merkes i basen så trekket
   monteres riktig vei.
4. **Skjerf-lengde og fall** er beskrevet, ikke tegnet. Trenger en drapering-test i
   ekte stoff; papir og skum lyver om fall.
5. **Pris- og volumantakelse mangler.** Ett stykk håndlaget vs. 50 stk. endrer
   basen fra dreid keramikk til slipestøpt, og det endrer alle toleranser.
