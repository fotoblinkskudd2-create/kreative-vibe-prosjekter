// Innholdsmodell for designpitchen TORKA T1.
// Samme modell rendres til bade .docx og .md, slik at dokumentene ikke gar fra hverandre.
// Nodetyper: h1, h2, h3, p, ul, ol, table, img, callout, pagebreak.

const meta = {
  tittel: 'TØRKA T1',
  undertittel: 'Fra problem til prototype – komplett designpitch',
  linje3: 'Sammenleggbart, sensorstyrt tørkerom for våte uteklær',
  rev: 'Rev. A · 25. juli 2026 · Konseptfase, ikke frigitt for produksjon',
};

const innhold = [
  // ────────────────────────────────────────────────────────── sammendrag
  { h1: 'Sammendrag' },
  {
    p: 'TØRKA T1 er et sammenleggbart tørkerom på 0,4 m² gulvflate: en foldbar pod i aluminium og belagt ripstop, med en avtakbar klimamodul i bunnen. Modulen sender skånsomt oppvarmet luft (32–38 °C) opp gjennom plaggene, måler fuktopptaket med to sensorer, og fører den mettede luften ut av rommet gjennom en slange til vindusplaten. Full vinterbekledning tørkes på omtrent halvannen time i stedet for et døgn, uten filting av ull, uten membranskade – og uten at fukten havner i stueluften.',
  },
  {
    table: {
      head: ['Nøkkeltall', 'Verdi'],
      widths: [4500, 4500],
      rows: [
        ['Utfoldet / sammenlagt', '640 × 640 × 1780 mm / 780 × 220 × 180 mm'],
        ['Vekt', '8,4 kg'],
        ['Effekt / energi per syklus', '724 W maks / ca. 0,9 kWh (beregnet)'],
        ['Tørketid, typisk last', 'ca. 90 minutter (beregnet, skal verifiseres)'],
        ['Enhetskostnad ved 20 stk', 'NOK 4 573'],
        ['Salgspris eks. mva.', 'NOK 8 900 (NOK 11 125 inkl. mva.)'],
        ['Bruttomargin', '48,6 % ved 20 stk, 59,2 % ved 2 000 stk'],
        ['Dekningspunkt for engangskostnader', 'Enhet nr. 15 i pilotserien'],
      ],
    },
  },

  // ────────────────────────────────────────────────────── 1 problemdefinisjon
  { h1: '1. Problemdefinisjon' },

  { h2: '1.1 Problemet' },
  {
    p: 'Våte uteklær tørker for sakte, på feil sted, og skader seg selv underveis. En gjennomvåt vinterutrustning – skalljakke, regnbukse, ullag, votter og støvler – bruker anslagsvis 18 til 36 timer på å lufttørke innendørs. Plaggene henges der de er i veien: på tørkestativ i stua, over ovnen, på dørhåndtak.',
  },
  {
    p: 'Det skaper tre problemer samtidig. **For det første** havner fukten i inneluften. Et vått sett uteklær bærer typisk 0,8 til 2 liter fritt vann, og alt sammen fordamper inn i rommet. I en tett, moderne leilighet hever det den relative luftfuktigheten kraftig og gir kondens på kalde flater, som over tid gir muggsopp og lukt. **For det andre** er plaggene ubrukelige mens de tørker. Familier med barn i barnehage løser dette ved å kjøpe to og tre sett med dyre klær som uansett aldri blir helt tørre. **For det tredje** begynner plagg som pakkes bort fuktige raskt å lukte, samtidig som våt ull og våt dun mister det meste av isolasjonsevnen – man fryser i klær man har betalt for at man ikke skal fryse i.',
  },

  { h2: '1.2 Målgruppe' },
  {
    ul: [
      '**Primærmålgruppe:** barnefamilier i leilighet uten tørkerom eller tørkeskap, i Norden, Alpene, Skottland, Irland, Canada og Nord-Japan. Typisk husholdning med 1–3 barn, aktiv fritid, 55–95 m² bolig og ingen mulighet til å bygge om.',
      '**Sekundær B2B:** barnehager og SFO, klatre- og skisentre, utstyrsutleie, hytteutleie, borettslagenes fellesvaskerier, brakkerigger og feltarbeid – der utstyr må være tørt til neste skift eller neste gjest.',
      '**Tidligbrukere:** friluftsfolk med utstyr til 15 000–40 000 kroner som allerede vet at tørketrommelen ødelegger membranen, og som i dag tørker skalljakken over en stolrygg.',
    ],
  },

  { h2: '1.3 Bruksscenario' },
  {
    p: 'Klokka 16.45, tirsdag i november. To barn kommer hjem fra barnehagen med gjennomvåte dresser, votter og støvler; en voksen har syklet hjem i regn. Podden står allerede utfoldet i gangen. Plaggene henges på skinnen, votter og støvler tres på dyseportene, glidelåsen lukkes, og ett trykk starter syklusen. Klokka 18.15 varsler appen at differansen mellom inn- og utluft er utlignet – plaggene er tørre – og modulen har allerede stoppet av seg selv. Neste morgen er alt tørt, luktfritt og på plass, og stueluften er tørrere enn den var kvelden før, ikke fuktigere.',
  },

  { h2: '1.4 Hvorfor eksisterende løsninger er utilstrekkelige' },
  {
    table: {
      head: ['Dagens løsning', 'Tid', 'Hvorfor den ikke strekker til'],
      widths: [2100, 1100, 5800],
      rows: [
        ['Tørkestativ i stua', '18–36 t', 'Tilfører 0,8–2 l vann til inneluften per last. Okkuperer rommet i flere døgn. Ingen effekt på hulrom som støvler og votter.'],
        ['Tørkeskap, fastmontert', '3–6 t', 'Koster typisk 25 000–45 000 kroner montert, krever fast plass, egen kurs og avtrekk. Uaktuelt i leid bolig og i små leiligheter.'],
        ['Tørketrommel', '1–2 t', 'Kan ikke ta støvler, hjelmer eller votter. Filter ull, skader membran og impregnering på skallplagg. 2,5–4 kWh per last.'],
        ['Romavfukter', '8–14 t', 'Avfukter 30–40 m³ rom for å tørke 0,4 m³ plagg. Ingen luftføring gjennom stoffet – bare langsom fordamping.'],
        ['Varmevifte mot stativ', '4–8 t', 'Ukontrollert temperatur, brannrisiko ved tildekking, tørker bare det som treffes direkte, og fukten blir igjen i rommet.'],
        ['Passivt tørketrekk over stativ', '6–12 t', 'Ingen sensorer, ingen avtrekk, ingen dyser. Fukten slippes ut i rommet når trekket åpnes. Ingen kontroll på temperatur mot ull.'],
        ['Støveltørker med rør', '4–8 t', 'Tørker kun fottøy. Ingen kapasitet for jakke, bukse eller ullag.'],
      ],
    },
  },
  {
    p: 'Fellesnevneren: ingen av løsningene gjør alle tre tingene samtidig – føre luft **gjennom** plagget, holde temperaturen lavt nok for ull og membran, og få fukten **ut av rommet**. TØRKA T1 er bygget rundt nettopp den kombinasjonen.',
  },

  // ────────────────────────────────────────────────────── 2 produktkonsept
  { pagebreak: true },
  { h1: '2. Produktkonsept' },

  { h2: '2.1 Løsningen kort' },
  {
    p: 'En foldbar pod på 640 × 640 × 1780 mm reises på under ett minutt uten verktøy. I bunnen dokkes en klimamodul som trekker inn romluft, varmer den over et selvbegrensende PTC-element og fordeler den gjennom et plenum: dels fritt oppover mot plaggene som henger på skinnen, dels gjennom seks hurtigkoblede dyser inn i støvler, votter og hjelmer. Den fuktige luften samles i en retursjakt integrert i bakveggen og føres tilbake til modulen. Et motorisert spjeld bestemmer hvor mye av returluften som resirkuleres og hvor mye som blåses ut gjennom en 100 mm slange til vindusplaten. To fuktsensorer måler differansen mellom tilluft og returluft; når differansen flater ut, er plaggene tørre, og syklusen avsluttes automatisk.',
  },

  { h2: '2.2 Hovedfunksjoner og fordeler' },
  {
    ul: [
      '**Halvannen time i stedet for et døgn.** Beregnet syklustid for typisk last (4 kg plagg med ca. 0,8 l fritt vann) er ca. 90 minutter mot 18–36 timer passivt.',
      '**Ullvennlig av konstruksjon.** Temperaturen ved plagget holdes på 32–38 °C, og plaggene beveges ikke mekanisk. Ingen filting, ingen delaminering, ingen nedbrytning av impregnering.',
      '**Fukten ut, ikke inn.** Avtrekket til vindusplaten gjør at rommet blir tørrere under bruk. Dette er den eneste av dagens løsninger som reduserer fuktbelastningen i boligen i stedet for å øke den.',
      '**Dyser til hulrom.** Seks porter med selvlukkende ventil gir samme luftstrøm inn i støvler, votter, skistøvler og hjelmer som til plaggene på skinnen.',
      '**Stopper på måling, ikke på klokke.** Auto-stopp på utlignet fuktdifferanse sparer strøm og hindrer overtørking av ull.',
      '**Sammenlegges på under ett minutt** til 780 × 220 × 180 mm – under senga, i bod, i bagasjerommet til hytta.',
      '**Fungerer uten app.** Én knapp starter standardsyklus. BLE og app gir status, ferdigvarsel, energiforbruk og valg av program (ull / skall / fottøy / lufting).',
      '**Energi:** ca. 0,9 kWh per syklus mot 2,5–4 kWh for en tørketrommel som uansett ikke kan ta skalljakken eller støvlene.',
    ],
  },

  { h2: '2.3 Unike egenskaper' },
  {
    ol: [
      'Kombinasjonen lukket pod + målt avtrekk + sensorstyrt stopp. Passive tørketrekk har ingen av de tre; tørkeskap har dem, men koster 30 000 kroner og må bygges inn.',
      'Ett plenum betjener både hengende plagg og hulrom. Konkurrentene løser enten det ene eller det andre.',
      'Sikkerheten ligger i fysikken, ikke i programvaren: PTC-elementet er selvbegrensende og kan ikke gå termisk løpsk, uansett hva styringen finner på.',
      'Nullinstallasjon: ingen fast montering, ingen egen kurs (3,15 A), flyttbar mellom boliger – og dermed salgbar til den halvparten av markedet som leier.',
      'Reparerbar og modulær: åtte skruer inn til klimamodulen, duk som kan vaskes og byttes, og en ramme som kan settes sammen på nytt etter en ødelagt knute.',
    ],
  },

  { h2: '2.4 Slik virker en syklus' },
  {
    ol: [
      'Plaggene henges på skinnen; fottøy og votter tres på dyseportene. Front lukkes med to glidelåser og magnetlist.',
      'Modulen kartlegger lasten i to minutter: viften går, varmen er av, og sensorene leser absolutt fuktighet i tilluft og retur.',
      'Varmefasen: PTC-elementet moduleres slik at temperaturen ved plagget holdes på settpunktet (32 °C for ull, 38 °C for skall og fottøy). Spjeldet slipper akkurat nok mettet luft ut til å holde podden på ca. 35 % RF.',
      'Sluttfase: når differansen mellom tilluft og retur faller under terskelen, kjøres fem minutter uten varme for å svale plaggene.',
      'Stopp, varsel i app, og LED-listen slår over til grønt. Kondens fra dysene samles i bunnkaret (3,2 l) og tømmes i vasken.',
    ],
  },

  // ────────────────────────────────────────────────────────── 3 CAD
  { pagebreak: true },
  { h1: '3. CAD-tegningsspesifikasjoner' },
  {
    p: 'Figuren under er konseptrisset som ligger til grunn for spesifikasjonene i dette kapittelet: oppriss, snitt gjennom luftveien, plan over plenum og to detaljsnitt.',
  },
  {
    img: {
      path: '../figurer/torka-t1-tegning.png',
      widthCm: 17.0,
      caption: 'Figur 1: TØRKA T1, konseptriss rev. A. Mål i mm. Ikke frigitt for produksjon.',
    },
  },

  { h2: '3.1 Hovedmål og proporsjoner' },
  {
    table: {
      head: ['Mål', 'Verdi'],
      widths: [4500, 4500],
      rows: [
        ['Utfoldet (B × D × H)', '640 × 640 × 1780 mm inkl. fotmoduler'],
        ['Sammenlagt (L × B × H)', '780 × 220 × 180 mm'],
        ['Fri innvendig tørkehøyde', '1440 mm (fra plenumtopp til hengerskinne)'],
        ['Innvendig volum', '0,63 m³'],
        ['Proporsjon B : D : H', '1 : 1 : 2,78'],
        ['Gulvflate', '0,41 m²'],
        ['Klimamodul', '320 × 210 × 160 mm, 2,5 kg'],
        ['Bunnkar', '640 × 640 × 40 mm, 3,2 l oppsamlingsvolum'],
        ['Retursjakt', '60 mm dyp, integrert i bakvegg, 0,036 m² fritt tverrsnitt'],
        ['Rammerør', 'Ø22 × 1,2 mm, samlet lengde 10 m per enhet'],
        ['Vekt totalt', '8,4 kg (ramme og duk 5,9 kg, klimamodul 2,5 kg)'],
        ['Kapasitet', '4 kg vått tøy, eller 6 par votter + 3 par støvler'],
        ['Maks last hengerskinne', '12 kg fordelt'],
      ],
    },
  },
  {
    p: 'Proporsjonene er styrt av to krav. Høyden er satt slik at en herrejakke i str. XL (1 100 mm) og en bukse på tverrstang (400 mm) henger fritt over plenum med 60 mm klaring. Grunnflaten tilsvarer et sammenlagt tørkestativ, slik at podden opptar plassen brukeren allerede har avsatt til tørking – ikke mer.',
  },

  { h2: '3.2 Materialer' },
  {
    table: {
      head: ['Del', 'Materiale og prosess', 'Begrunnelse'],
      widths: [2300, 4200, 2500],
      rows: [
        ['Rammerør, 12 stk', 'Aluminium 6063-T5, Ø22 × 1,2 mm, klaranodisert 10 µm. Kappet og avgradet.', 'Stivhet per vekt, korrosjonsfast mot saltvann fra fottøy.'],
        ['Hjørneknuter, 8 stk', 'PA12-GB (glassfylt nylon), MJF-print i pilot, sprøytestøp ved volum.', 'Komplekse vinkler uten verktøykostnad i pilotfasen.'],
        ['Fotmoduler, 4 stk', 'TPU 90 Shore A sokkel, PA6 hjulgaffel, låsbart hjul.', 'Flyttbar under bruk, 6 mm nivåjustering på ujevnt gulv.'],
        ['Ytterduk', '210D ripstop polyester med TPU-laminat, FR-behandlet.', 'Damptett, lett, flammehemmet, tåler bretting.'],
        ['Innerforing', 'Aluminisert PET-laminat på nonwoven.', 'Lav emissivitet holder strålevarmen inne og korter syklusen.'],
        ['Bunnkar', 'PP 3 mm, vakuumformet (MDF-verktøy i pilot).', 'Tåler smeltevann, veisalt og skismøring.'],
        ['Plenum og risere', 'PA12 (MJF) med PP-spirokanal Ø38 mm.', 'Fri formgivning av luftfordelingen uten verktøy.'],
        ['Klipsdyser, 6 stk', 'PA12 med silikontetning 60 Shore A.', 'Klemmer på støvelskaft og hanskemansjett uten å merke stoffet.'],
        ['Modulhus', 'ABS UL94 V-0, vakuumformet, MJF-front.', 'Brannklasse og el-sikkerhet rundt varmeelementet.'],
        ['Varmeelement', 'PTC 230 V / 700 W, selvbegrensende, dobbel termosikring.', 'Kan ikke gå termisk løpsk selv ved full tildekking.'],
        ['Vifte', 'EC-radialvifte 24 V, 145 m³/h fritt, 95 m³/h ved 60 Pa.', 'Turtallsregulering gir lavt lydnivå og målbar luftmengde.'],
        ['Tetninger', 'Silikonprofil 60 Shore A.', 'Krage mellom modul og bunnkar, tåler 100 °C.'],
      ],
    },
  },

  { h2: '3.3 Nøkkelfunksjoner visualisert gjennom detaljer' },
  {
    ul: [
      '**Snitt B–B, luftveien:** inntaksgitter → vaskbart filter (240 × 90 mm) → radialvifte → PTC-batteri → plenum → plagg → retursjakt → spjeld → avtrekk. Hele veien er tegnet i ett snitt slik at trykkfallet kan leses av som en kjede, ikke som løsrevne komponenter.',
      '**Detalj A, klimamodul:** NTC-føler 15 mm nedstrøms PTC-elementet, selvtilbakestillende termosikring ved 78 °C og engangssikring ved 98 °C. SHT40-sensor i tilluft, tilsvarende i retur. Mikrobryter i kamlåsen hindrer drift når modulen ikke er låst fast.',
      '**Detalj B, avtrekksstuss:** bajonettkobling Ø100 mm med 1/8 omdreining, og magnetisk klaff som lukker stussen automatisk når slangen tas av – podden kan brukes uten avtrekk uten at det oppstår en åpen varmluftskanal.',
      '**Detalj C, hjørneknute:** 45 mm innstikk, fjærknapp Ø8 mm gjennom rørveggen som primærlås, M5 settskrue 90° forskjøvet som sikring. Boringen er Ø22,2 +0,15/0 for å kompensere for krymp i MJF-prosessen.',
      '**Detalj D, hengerskinne:** Ø16 mm i toppen med åtte glidekroker, dimensjonert for 12 kg fordelt last med sikkerhetsfaktor 3.',
      '**Detalj E, frontlukking:** to vannavvisende glidelåser #5 gir 560 mm fri åpning ved full åpning; 14 neodymmagneter 10 × 3 mm holder lukkelisten tett mellom glidelåsene.',
      '**Detalj F, dyseport:** Ø22 mm port med gummiventil som lukker seg selv når dysen ikke er koblet til, slik at luftmengden til de øvrige portene ikke faller.',
    ],
  },

  { h2: '3.4 Monteringspunkter og mekanismer' },
  {
    ul: [
      '**Ramme:** 8 hjørneknuter med 3 rørinnstikk hver. Reises teleskopisk med fjærknapp-lås, uten verktøy, av én person.',
      '**Klimamodul:** dokkes i bunnkaret med to kamlåser (90° dreining) og en jordet blindkontakt. Mikrobryter i låsen bryter varmekretsen når modulen ikke er i posisjon.',
      '**Duk:** 12 borrelåsstropper mot rammerørene, 4 D-ringer i toppen. Kan tas helt av og vaskes på 40 °C.',
      '**Bunnkar:** 8 snap-fester (levende hengsel i PP) mot nedre rammerør. Helning 1,5° mot tømmehjørnet.',
      '**Elektrisk:** klasse I, jordet, IPX2. 724 W / 3,15 A ved 230 V. 1,8 m kabel med strekkavlaster, oppheng for kabel på baksiden.',
      '**Avtrekk:** Ø100 mm slange, 1,5 m, med justerbar vindusplate for vindusbredde 500–1 100 mm.',
    ],
  },

  { h2: '3.5 Toleranser og standarder' },
  {
    ul: [
      'Generelle toleranser ISO 2768-m. Rørkapp ±0,3 mm. Knuteboring H9.',
      'El-sikkerhet: EN 60335-1 og EN 60335-2-43 (tørkeapparater for tekstiler).',
      'EMC: EN 55014-1 og EN 55014-2. RoHS og REACH på alle komponenter.',
      'Duk: flammehemming testes etter EN ISO 15025 (kostnad er tatt med i engangskostnadene i kapittel 4.6).',
      'Målsatt lydnivå: under 42 dB(A) på 1 m ved normalprogram (verifiseres i prototypetest).',
    ],
  },

  // ────────────────────────────────────────────────────── 4 kostnader
  { pagebreak: true },
  { h1: '4. Produksjonskostnader og prismodell' },

  { h2: '4.1 Forutsetninger' },
  {
    ul: [
      'Alle beløp i norske kroner eksklusive merverdiavgift.',
      'Komponentpriser er innhentet som småserie på 20 sett. Enhetsprisene er derfor høye; skaleringen er vist i kapittel 4.7.',
      'Timesats 520 kr inkluderer sosiale kostnader, verkstedleie og indirekte kostnader.',
      'Verktøy for det vakuumformede bunnkaret (4 800 kr) er fordelt på de 20 enhetene og ligger inne i post C1. Øvrige engangskostnader holdes utenfor enhetskostnaden og er spesifisert i kapittel 4.6.',
      'Frakt inn til verksted er inkludert i komponentprisene. Frakt ut til kunde er ikke medregnet og faktureres separat.',
    ],
  },

  { h2: '4.2 Materialkostnad per enhet' },
  {
    table: {
      head: ['Pos', 'Komponent og spesifikasjon', 'Kr/enhet'],
      widths: [700, 6200, 2100],
      rows: [
        ['', '**A – Ramme og bæresystem**', ''],
        ['A1', 'Aluminiumsrør 6063-T5, Ø22 × 1,2 mm, 10 m kappet og avgradet', '385'],
        ['A2', 'Hjørneknuter PA12-GB, MJF-print, 8 stk à 34', '272'],
        ['A3', 'Fotmodul med låsbart hjul og TPU-sokkel, 4 stk à 22', '88'],
        ['', '*Sum A*', '*745*'],
        ['', '**B – Kabinett**', ''],
        ['B1', 'Ytterduk 210D ripstop med TPU-laminat, FR, 4,0 m² à 68', '272'],
        ['B2', 'Innerforing, aluminisert PET-laminat, 4,0 m² à 41', '164'],
        ['B3', 'Glidelås #5 vannavvisende 2 × 1,7 m, magnetlist, bånd, D-ringer', '132'],
        ['B4', 'Konfeksjon – kutt og søm hos underleverandør, 20-off', '320'],
        ['', '*Sum B*', '*888*'],
        ['', '**C – Luftfordeling**', ''],
        ['C1', 'Bunnkar PP 3 mm, vakuumformet (verktøy 240 + materiale 48)', '288'],
        ['C2', 'Plenum og fordelerkanal, PA12 (MJF) med PP-spiro Ø38', '185'],
        ['C3', 'Klipsdyser med silikontetning, 6 stk à 11', '66'],
        ['', '*Sum C*', '*539*'],
        ['', '**D – Klimamodul**', ''],
        ['D1', 'EC-radialvifte 24 V, 24 W, 145 m³/h', '168'],
        ['D2', 'PTC-element 230 V / 700 W med dobbel termosikring', '118'],
        ['D3', 'Strømforsyning 24 V / 40 W, CE-merket', '98'],
        ['D4', 'Modulhus ABS UL94 V-0, vakuumformet med MJF-front', '140'],
        ['D5', 'Styrekort PCBA – ESP32-C3, triac, BLE, 20-off', '245'],
        ['D6', 'Sensorer: 2 × SHT40 (RF og temperatur), 1 × NTC sikkerhet', '88'],
        ['D7', 'Statusindikator, RGB-LED-list', '12'],
        ['D8', 'Kabling, jordforbindelse, kontakter, EMC-filter', '65'],
        ['', '*Sum D*', '*934*'],
        ['', '**E – Tilbehør og emballasje**', ''],
        ['E1', 'Avtrekksslange Ø100 × 1,5 m med justerbar vindusplate', '165'],
        ['E2', 'Bæreveske 600D og hurtigguide', '96'],
        ['E3', 'Transportemballasje, bølgepapp med EPE-hjørner', '88'],
        ['', '*Sum E*', '*349*'],
        ['', '**Materialkostnad totalt per enhet**', '**3 455**'],
      ],
    },
  },

  { h2: '4.3 Arbeidskraft per enhet' },
  {
    table: {
      head: ['Operasjon', 'Timer', 'Kr'],
      widths: [5200, 1700, 2100],
      rows: [
        ['Forhåndsmontering av ramme og knuter', '0,50', '260'],
        ['Innsetting og festing av duk og innerforing', '0,40', '208'],
        ['Montering og kabling av klimamodul', '0,60', '312'],
        ['Sluttmontering, merking og pakking', '0,30', '156'],
        ['Funksjonstest og el-sikkerhetstest (jordkontinuitet, isolasjon, tørkesyklus)', '0,35', '182'],
        ['**Sum arbeid**', '**2,15**', '**1 118**'],
      ],
    },
  },

  { h2: '4.4 Enhetskostnad og totalpris for 20 enheter' },
  {
    table: {
      head: ['Post', 'Per enhet', '20 enheter'],
      widths: [4500, 2250, 2250],
      rows: [
        ['Materialer', '3 455', '69 100'],
        ['Arbeidskraft', '1 118', '22 360'],
        ['**Produksjonskostnad**', '**4 573**', '**91 460**'],
      ],
    },
  },

  { h2: '4.5 Prismodell, margin og totalverdi' },
  {
    table: {
      head: ['Post', 'Per enhet', '20 enheter'],
      widths: [4500, 2250, 2250],
      rows: [
        ['Salgspris eks. mva.', '8 900', '178 000'],
        ['Salgspris inkl. 25 % mva.', '11 125', '222 500'],
        ['Produksjonskostnad', '4 573', '91 460'],
        ['**Bruttofortjeneste**', '**4 327**', '**86 540**'],
        ['Bruttomargin', '48,6 %', '48,6 %'],
        ['Engangskostnader (kap. 4.6)', '–', '62 000'],
        ['**Netto overskudd på pilotserien**', '–', '**24 540**'],
      ],
    },
  },
  {
    p: 'Prispunktet er satt mot alternativkostnaden, ikke mot materialkostnaden. For en barnehage er sammenligningen et fastmontert tørkeskap til 25 000–45 000 kroner med elektriker og bygningsmessig arbeid i tillegg. For en familie er sammenligningen ett ekstra sett vinterklær per barn, som fort koster 4 000–6 000 kroner og må kjøpes på nytt hvert år etter hvert som barna vokser.',
  },

  { h2: '4.6 Engangskostnader og dekningspunkt' },
  {
    table: {
      head: ['Post', 'Kr'],
      widths: [6300, 2700],
      rows: [
        ['Prototyper og testrigg, tre fysiske iterasjoner', '22 000'],
        ['Verktøy for vakuumformet modulhus', '9 000'],
        ['Ekstern el-sikkerhetstest, EN 60335-1 og -2-43', '18 000'],
        ['EMC-prøving, EN 55014-1 og -2', '9 000'],
        ['Teknisk fil, samsvarserklæring og brukermanual', '4 000'],
        ['**Sum engangskostnader**', '**62 000**'],
      ],
    },
  },
  {
    p: 'Med et dekningsbidrag på 4 327 kroner per enhet er engangskostnadene nedbetalt ved enhet nummer 15. Pilotserien finansierer med andre ord sin egen sertifisering og verktøykostnad, og legger igjen 24 540 kroner.',
  },

  { h2: '4.7 Skalering' },
  {
    table: {
      head: ['Volum', 'Materiale', 'Arbeid', 'Enhetskostnad', 'Pris eks. mva.', 'Margin'],
      widths: [1300, 1400, 1250, 1750, 1600, 1700],
      rows: [
        ['20 stk', '3 455', '1 118', '4 573', '8 900', '48,6 %'],
        ['200 stk', '2 495', '700', '3 195', '6 900', '53,7 %'],
        ['2 000 stk', '1 650', '264', '1 914', '4 690', '59,2 %'],
      ],
    },
  },
  {
    p: 'Kostnadsfallet kommer fra tre steder: sprøytestøpte hjørneknuter i stedet for MJF-print (–190 kr), industriell konfeksjon med kuttet lag i stedet for enkeltsøm (–210 kr), og volumpris på klimamodulens komponenter (–430 kr). Arbeidstiden faller fra 2,15 til 0,55 timer når rammen leveres forhåndsmontert i to seksjoner.',
  },

  // ────────────────────────────────────────────────────────── 5 pitch
  { pagebreak: true },
  { h1: '5. Pitch-presentasjon' },
  { p: '*Til investorer. 160 ord.*' },
  {
    callout: [
      'TØRKA T1 er et sammenleggbart tørkerom på 0,4 kvadratmeter gulvflate. Fire kilo våt vinterbekledning – skalljakke, ullag, votter og støvler – tørkes på halvannen time ved 38 grader: ingen filting, ingen membranskade, og fukten føres ut vinduet i stedet for inn i stua.',
      'Markedet er husholdningene og institusjonene som ikke har tørkerom. I Norden anslår vi 4,4 millioner slike hjem, i tillegg til barnehager, klatre- og skisentre og utstyrsutleie som i dag må velge mellom et fastmontert tørkeskap til 35 000 kroner eller ingenting.',
      'Pilotserien på 20 enheter koster 91 460 kroner å produsere og selges for 8 900 kroner eksklusive merverdiavgift. Det gir 178 000 kroner i omsetning, 48,6 prosent bruttomargin, og dekker verktøy og CE-sertifisering allerede ved enhet nummer 15. Ved 2 000 enheter faller enhetskostnaden til 1 914 kroner og utsalgsprisen til 4 690, med 59 prosent margin.',
      'Vi søker 750 000 kroner mot 15 prosent eierandel: verktøy, sertifisering og de første 200 enhetene. Ett produkt erstatter tørkeskapet, tørketrommelen og tre døgn med tørkestativ i stua.',
    ],
  },

  // ────────────────────────────────────────────────────── 6 bildebeskrivelse
  { h1: '6. Bildebeskrivelse' },

  { h2: '6.1 Formspråk og silhuett' },
  {
    p: 'Produktet leser som et møbel, ikke som en hvitevare. Silhuetten er en slank, rettvegget søyle med mykt avrundede vertikale kanter (r = 24 mm) – nær proporsjonene til et smalt garderobeskap, men uten dybden. Toppen avsluttes med en litt mørkere hette som skjuler hengerskinnen og gir produktet et tydelig «hode». Det finnes ingen synlige skruer på utsiden, ingen logoflater i plast, og ingen blank overflate noe sted. Klimamodulen i bunnen er trukket 12 mm inn fra duken, slik at podden ser ut til å sveve et par centimeter over gulvet.',
  },

  { h2: '6.2 Materialer og teksturer' },
  {
    ul: [
      '**Duken** er varmgrå, nesten skiferfarget (nær RAL 7016), med den matte, tørre teksturen til teknisk ripstop. Ripstop-rutene på 5 mm fanges så vidt av sidelyset og gir overflaten et fint, geometrisk kornmønster – man ser at det er teknisk tekstil, ikke plastfolie.',
      '**Aluminiumet** i fotmoduler og øvre kant er klaranodisert med børstet finish: kjølig, sølvgrå, med lengderetning som fanger lys som en tynn strek.',
      '**Detaljene** er i sandfarget nylon – dysene, kamlåsene, glidelåsdraget. Den varme sandtonen mot den kalde grå duken er den eneste fargekontrasten i produktet, og gjør at brukeren alltid ser hva som kan røres.',
      '**Innsiden** er sølvblank aluminisert foring som reflekterer varmen og gir et uventet, nesten teknisk-industrielt inntrykk når fronten åpnes – en tydelig kontrast til den dempete utsiden.',
      '**LED-listen** i modulens forkant er 3 mm bred, felt ned i en fals så den ikke blender: rolig ravgul under tørking, dempet grønn når syklusen er ferdig.',
    ],
  },

  { h2: '6.3 Produktet i bruk' },
  {
    p: 'Se for deg bildet: en gang i en leilighet fra 1970-tallet, sen ettermiddag i november, med blått vinterlys utenfor vinduet og varmt lys fra taklampa. Podden står inntil veggen ved siden av skoreolen og fyller mindre plass enn barnevognen som står ved siden av. Fronten er halvåpen; glidelåsen er dratt ned tre firedeler, og duken bøyer seg mykt utover slik teknisk tekstil gjør.',
  },
  {
    p: 'Inne i podden henger en oransje barnedress og en voksen skalljakke på skinnen, med tydelige mørke fuktflekker på skuldrene. To små gummistøvler står tredd på hver sin dyse i bunnen, med skaftene spilt lett ut av luftstrømmen; et par votter henger på de neste to. Damp er ikke synlig – det er hele poenget – men avtrekksslangen løper i en myk bue fra modulens bakside bort til vindusplaten, der den forsvinner ut i vinterluften.',
  },
  {
    p: 'I forgrunnen sitter et barn på gulvet i ullsokker og drar av seg den andre støvelen. LED-listen lyser rolig ravgult. På kjøkkenbenken i bakgrunnen ligger en telefon med appens skjermbilde: «Ferdig om 41 minutter · 0,4 kWh brukt». Ingenting i bildet ser ut som et apparat under arbeid – det ser ut som en gang der problemet allerede er løst.',
  },

  { h2: '6.4 Bildeforslag til salgsmateriell' },
  {
    ol: [
      '**Hovedbilde:** podden lukket, i tre kvart profil, mot en varm betonggrå bakgrunn. Ett hardt sidelys for å hente frem ripstop-teksturen, ett mykt fyllys. Ingen mennesker, ingen rekvisitter.',
      '**Brukssituasjon:** gangscenen beskrevet over, tatt i øyehøyde for et sittende barn, med produktet en tredjedel inn i bildet og avtrekksslangen synlig helt bort til vinduet.',
      '**Sammenlagt:** podden i vesken, stående mot en garderobevegg ved siden av et støvsugerrør, for å vise at den forsvinner når den ikke er i bruk.',
      '**Teknisk snitt:** konseptrisset i figur 1 som ren strektegning på hvitt, brukt i B2B-materiell mot barnehager og utleiere.',
    ],
  },

  // ────────────────────────────────────────────────────────── vedlegg
  { pagebreak: true },
  { h1: 'Vedlegg A: Forutsetninger, risiko og neste steg' },
  {
    p: 'Tallene i denne pitchen er beregnede og innhentede anslag i konseptfasen. Følgende punkter må verifiseres før serien settes i produksjon.',
  },

  { h2: 'A.1 Antakelser som må valideres' },
  {
    table: {
      head: ['Antakelse', 'Grunnlag', 'Slik valideres den'],
      widths: [2600, 3400, 3000],
      rows: [
        ['Tørketid ca. 90 min', 'Beregnet fra 0,8 kg fritt vann, 700 W tilført, 24 m³/h avtrekk ved 30 °C og 90 % RF', 'Måling på prototype med veid last, tre gjentak per plaggtype'],
        ['Energi ca. 0,9 kWh per syklus', 'Latent varme 0,545 kWh pluss ca. 40 % tap gjennom duk og avtrekk', 'Energilogging over 20 sykluser i reell bolig'],
        ['4,4 mill. husholdninger i Norden uten tørkerom', 'Ca. 11,5 mill. husholdninger, anslagsvis 38 % i leilighet uten tørkerom', 'Kjøpt markedsdata og 200 spørreskjema i pilotmarkedet'],
        ['Betalingsvilje 8 900 kr B2B', 'Alternativkostnad tørkeskap 25 000–45 000 kr montert', 'Forhåndssalg av pilotserien før produksjonsstart'],
        ['Materialpriser småserie', 'Tilbud fra tre leverandører, ikke bindende', 'Bindende tilbud før innkjøp'],
      ],
    },
  },

  { h2: 'A.2 Risiko' },
  {
    ul: [
      '**Sertifisering:** EN 60335-2-43 kan kreve konstruksjonsendringer rundt varmeelementet. Avsatt buffer i engangskostnadene er knapp; en ekstra runde koster anslagsvis 15 000 kroner.',
      '**Kondens i retursjakten:** dersom bakveggen blir for kald, kan fukt felle ut i sjakten i stedet for å gå ut avtrekket. Løses eventuelt med isolerende mellomlag – kostnad ca. 45 kroner per enhet.',
      '**Ripstop og varme over tid:** TPU-laminatet skal tåle 38 °C kontinuerlig, men aldringstest over 500 sykluser gjenstår.',
      '**Bruk uten avtrekk:** brukere som dropper vindusslangen får dårligere tørketid og fukt i rommet. Avbøtes med sensorvarsel i app og tydelig merking, men er en reell bruksrisiko.',
      '**Etterlikning:** produktet har lav teknisk terskel for kopiering. Beskyttelsen ligger i designregistrering, merkevare og forsprang, ikke i patent.',
    ],
  },

  { h2: 'A.3 Neste steg' },
  {
    ol: [
      'Bygge prototype nr. 1 med målerigg: veid last, logging av RF, temperatur og energi. Seks uker.',
      'Verifisere tørketid og energitall, og justere effekt og luftmengde etter måleresultatene. To uker.',
      'Designfryse, deretter prototype nr. 2 og 3 for sertifiseringsunderlag. Åtte uker.',
      'Ekstern el-sikkerhets- og EMC-prøving, teknisk fil og samsvarserklæring. Seks uker.',
      'Forhåndssalg av pilotserien til to barnehager og atten tidligbrukere, deretter produksjon av 20 enheter. Ti uker.',
    ],
  },
];

module.exports = { meta, innhold };
