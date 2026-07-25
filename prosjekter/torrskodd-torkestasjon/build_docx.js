/**
 * Genererer designpitch for TØRRSKODD T6 som .docx
 * Kjør: node build_docx.js
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  LevelFormat, PageBreak, TableOfContents, Footer, PageNumber, convertMillimetersToTwip,
} = require("docx");

const OUT = process.argv[2] || path.join(__dirname, "TORRSKODD-T6-designpitch.docx");

/* ---------- Designtokens ---------- */
const INK = "1C1F21";
const ACCENT = "0F5E52";
const MUTED = "5A6468";
const HEADER_BG = "0F5E52";
const ZEBRA = "EEF3F1";
const CONTENT_W = 9026; // A4 minus 25,4 mm marger, i DXA

/* ---------- Hjelpere ---------- */
const p = (text, opts = {}) =>
  new Paragraph({
    spacing: { before: opts.before ?? 0, after: opts.after ?? 120, line: 276 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        bold: opts.bold,
        italics: opts.italics,
        size: opts.size ?? 21,
        color: opts.color ?? INK,
        font: "Calibri",
      }),
    ],
  });

const h1 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT, space: 6 } },
    children: [new TextRun({ text, bold: true, size: 30, color: ACCENT, font: "Calibri" })],
  });

const h2 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [new TextRun({ text, bold: true, size: 24, color: INK, font: "Calibri" })],
  });

const h3 = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 21, color: MUTED, font: "Calibri" })],
  });

const bullet = (text, level = 0) =>
  new Paragraph({
    numbering: { reference: "kule", level },
    spacing: { after: 60, line: 276 },
    children: [new TextRun({ text, size: 21, color: INK, font: "Calibri" })],
  });

const bulletRich = (runs, level = 0) =>
  new Paragraph({
    numbering: { reference: "kule", level },
    spacing: { after: 60, line: 276 },
    children: runs.map(
      (r) => new TextRun({ text: r.t, bold: r.b, italics: r.i, size: 21, color: INK, font: "Calibri" })
    ),
  });

const cell = (text, w, opts = {}) =>
  new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: opts.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill, color: "auto" }
      : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [
      new Paragraph({
        alignment: opts.align,
        spacing: { after: 0, line: 252 },
        children: [
          new TextRun({
            text,
            bold: opts.bold,
            italics: opts.italics,
            size: opts.size ?? 19,
            color: opts.color ?? INK,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });

/**
 * rows: [[celletekst, ...], ...] – første rad er header
 * aligns: array med AlignmentType per kolonne
 * boldRows: indekser (i body) som skal utheves som sumrader
 */
const table = (widths, rows, { aligns = [], boldRows = [] } = {}) =>
  new Table({
    columnWidths: widths,
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "C9D3D0" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "C9D3D0" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "DDE5E3" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: rows.map((r, ri) => {
      const isHeader = ri === 0;
      const isSum = boldRows.includes(ri);
      return new TableRow({
        tableHeader: isHeader,
        children: r.map((c, ci) =>
          cell(String(c), widths[ci], {
            bold: isHeader || isSum,
            color: isHeader ? "FFFFFF" : INK,
            fill: isHeader ? HEADER_BG : isSum ? "DCE8E5" : ri % 2 === 0 ? ZEBRA : undefined,
            align: ci === 0 ? AlignmentType.LEFT : aligns[ci] ?? AlignmentType.RIGHT,
          })
        ),
      });
    }),
  });

const caption = (text) =>
  new Paragraph({
    spacing: { before: 80, after: 240 },
    children: [new TextRun({ text, size: 17, italics: true, color: MUTED, font: "Calibri" })],
  });

const spacer = (after = 200) => new Paragraph({ spacing: { after }, children: [] });

const callout = (title, text) =>
  new Table({
    columnWidths: [CONTENT_W],
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: ZEBRA, color: "auto" },
            margins: { top: 160, bottom: 160, left: 220, right: 220 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: title, bold: true, size: 20, color: ACCENT, font: "Calibri" })],
              }),
              new Paragraph({
                spacing: { after: 0, line: 276 },
                children: [new TextRun({ text, size: 20, color: INK, font: "Calibri" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });

/* ---------- Innhold ---------- */
const children = [];

/* Forside */
children.push(
  spacer(1800),
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: "PRODUKTPITCH  ·  PILOTSERIE 2026", bold: true, size: 20, color: ACCENT, font: "Calibri", characterSpacing: 40 })],
  }),
  new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: "TØRRSKODD T6", bold: true, size: 68, color: INK, font: "Calibri" })],
  }),
  new Paragraph({
    spacing: { after: 320 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 10 } },
    children: [new TextRun({ text: "Lavenergi tørkestasjon for vått yttertøy", size: 30, color: MUTED, font: "Calibri" })],
  }),
  p("Fra problem til prototype: problemdefinisjon, produktkonsept, CAD-spesifikasjon, kostnadskalkyle for 20 enheter, investorpitch og visuell beskrivelse.", { size: 22, color: MUTED, after: 600 }),
  table([2600, 6426], [
    ["Felt", "Innhold"],
    ["Produkt", "TØRRSKODD T6 – veggmontert tørkestasjon med 6 porter"],
    ["Utviklet av", "Nordveg Design AS (konsept)"],
    ["Dokumenttype", "Komplett designpitch, pilotserie 20 enheter"],
    ["Dato", "25. juli 2026"],
    ["Status", "Konseptfase – klar for verktøybestilling og CE-forhåndstest"],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT] }),
  new Paragraph({ children: [new PageBreak()] })
);

/* Innholdsfortegnelse */
children.push(
  h1("Innhold"),
  new TableOfContents("Innholdsfortegnelse", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] })
);

/* 1. Problemdefinisjon */
children.push(
  h1("1. Problemdefinisjon"),
  h2("1.1 Problemet"),
  p("Vått yttertøy tørker ikke innenfra. Støvler, skisko, hansker, votter, skøyter og vadere er lukkede volumer med lite luftutskifting, høy isolasjonsevne og fuktabsorberende fôr. Når de settes i gangen tørker skallet, mens innerfôret holder 70–95 % relativ fuktighet i 12–24 timer. Resultatet er tre konkrete kostnader for husholdningen:"),
  bullet("Hygiene: fuktig fôr over 8 timer gir bakterievekst og luktdannelse, og over tid mugg i tekstilfôr."),
  bullet("Materialskade: den vanligste «løsningen» – radiator, vedovn eller varmevifte – tørker fra utsiden med 60–90 °C. Det delaminerer membraner (GORE-TEX og tilsvarende), herder og sprekker skinn, og krymper limte såler."),
  bullet("Tapt tid og dobbeltinnkjøp: tøyet er ikke klart til neste dag. Barnefamilier kjøper to sett votter, to par støvler og to dresser per barn per sesong – ikke fordi de slites ut, men fordi de ikke rekker å tørke."),
  spacer(80),
  p("I tillegg er energiforbruket ved dagens alternativer betydelig: et tørkeskap trekker 1 500–2 000 W og kjøres typisk 4–8 timer i døgnet gjennom hele vinterhalvåret."),

  h2("1.2 Målgruppe"),
  table([2400, 3300, 3326], [
    ["Segment", "Størrelse (Norge)", "Utløsende behov"],
    ["Barnefamilier", "ca. 1,1 mill. husholdninger med barn", "Votter og støvler må være tørre til neste morgen"],
    ["Barnehager og SFO", "ca. 6 000 barnehager", "30–80 sett yttertøy daglig, krav til inneklima"],
    ["Idrettslag og klubbhus", "ca. 11 000 idrettslag", "Fotballsko, skisko, skøyter mellom økter"],
    ["Hytter og fritidsbåt", "ca. 440 000 fritidsboliger", "Begrenset strøm, ofte 12 V solcelleanlegg"],
    ["Yrkesbruk", "Bygg, brann, oppdrett, landbruk", "Vernestøvler og hansker mellom skift"],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 1: Primærsegmenter og utløsende behov."),

  h2("1.3 Bruksscenario"),
  p("Klokken 16.30 kommer to barn inn fra snø og slaps. Yttertøyet er vått både utenpå og inni. I dag legges vottene på radiatoren, støvlene settes på en avis, og neste morgen er minst ett par fortsatt fuktig. Med TØRRSKODD henges de seks plaggene på hver sin arm i gangen, brukeren trykker én gang, og stasjonen blåser 38 grader varm, tørr luft direkte inn i hulrommene. Fuktsensoren registrerer når returluften ikke lenger tilfører fukt, og stopper syklusen – typisk etter 4–6 timer. Klokken 07.00 er alt tørt, luktfritt og uskadd, til en energikostnad på under 30 øre."),

  h2("1.4 Hvorfor eksisterende løsninger er utilstrekkelige"),
  table([2200, 1500, 5326], [
    ["Løsning", "Pris", "Begrensning"],
    ["Radiator / ovn", "0 kr", "Tørker utenfra, 60–90 °C skader membran, skinn og lim. Gir lukt fordi innerfôret aldri blir tørt."],
    ["Enkel skotørker", "300–900 kr", "Ett par om gangen, står på gulvet, velter, ingen sensor, ingen avstenging, ingen hanskestøtte."],
    ["Tørkeskap", "9 000–18 000 kr", "1 500–2 000 W, krever 0,5 m² gulvplass og eget rom. Overdimensjonert for daglig yttertøy."],
    ["Varmepumpetørketrommel", "8 000–15 000 kr", "Tåler ikke støvler, skinn eller hardt fottøy i det hele tatt."],
    ["Avisepapir / silica", "Lav", "Fungerer på skinnsko over døgn, ikke på isolerte vinterstøvler eller votter."],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 2: Konkurranseanalyse. Ingen av alternativene kombinerer lav effekt, skånsom temperatur, flere plagg samtidig og automatisk stopp."),
  callout("Markedsgapet", "Det finnes lavkapasitetsprodukter til under 1 000 kr og høykapasitetsprodukter til over 9 000 kr. Mellomsegmentet – 4–8 plagg, veggmontert, under 50 W, med automatikk – er tomt."),
  new Paragraph({ children: [new PageBreak()] })
);

/* 2. Produktkonsept */
children.push(
  h1("2. Produktkonsept"),
  h2("2.1 Løsningen kort"),
  p("TØRRSKODD T6 er en veggmontert tørkestasjon som fordeler oppvarmet, tørr luft gjennom seks fleksible armer direkte inn i vått fottøy og håndplagg. En anodisert aluminiumsskinne bærer både blåseenheten og armene; armene klikkes inn og ut verktøyfritt og kan flyttes langs skinnen. En kombinert temperatur- og fuktsensor styrer syklusen og slår av stasjonen når tøyet er tørt."),
  p("Kjerneprinsippet er at fukten fjernes der den faktisk sitter – i det lukkede volumet – med lav temperatur og høy luftutskifting, i stedet for høy temperatur mot yttersiden."),

  h2("2.2 Hovedfunksjoner"),
  bulletRich([{ t: "Seks uavhengige porter: ", b: true }, { t: "tørker et helt sett yttertøy samtidig – to par støvler, to par votter og en lue, eller seks enkeltplagg." }]),
  bulletRich([{ t: "Lav, kontrollert temperatur: ", b: true }, { t: "maks 38 °C ±2 °C ved dyseutløp, med redundant termosikring på 55 °C. Trygt for membraner, skinn, neopren og limte såler." }]),
  bulletRich([{ t: "Automatisk stopp: ", b: true }, { t: "SHT40-sensor måler differansen mellom inn- og returluft. Når differansen holder seg under 3 % RH i 20 minutter, avsluttes syklusen." }]),
  bulletRich([{ t: "Lavt energiforbruk: ", b: true }, { t: "25–48 W avhengig av last. En full syklus på 5 timer bruker ca. 0,2 kWh – rundt 30 øre." }]),
  bulletRich([{ t: "Stillegående: ", b: true }, { t: "34 dB(A) på 1 meter. Kan stå på om natten i en gang som grenser til soverom." }]),
  bulletRich([{ t: "Verktøyfri modularitet: ", b: true }, { t: "armene låses med kvartomdreining i T-sporet. Kjøp 3 armer eller 6, flytt dem, eller brett dem inn i skinnen om sommeren." }]),
  bulletRich([{ t: "12 V DC-variant: ", b: true }, { t: "samme enhet leveres med DC-inntak for hytte, bobil og båt på solcelle- eller batterianlegg." }]),

  h2("2.3 Unike egenskaper"),
  table([2600, 6426], [
    ["Egenskap", "Hvorfor den er unik"],
    ["Selvlukkende porter", "Hver port har en fjærbelastet spjeldventil som lukker seg når armen tas av. All luft går til de portene som faktisk er i bruk – tørketiden endres ikke om du bruker to armer eller seks."],
    ["Fuktstyrt syklus", "Konkurrerende skotørkere har enten ingen styring eller en enkel tidsbryter. Sensorstyringen kutter typisk 40 % av gangtiden."],
    ["Skinnearkitektur", "Blåseenhet og armer sitter på samme T-spor. Systemet kan utvides til T9 (dobbel skinne) uten nytt kabinett."],
    ["Veggmontert, null gulvareal", "Frigjør gangen, tåler støvsuging og barnehagevask under."],
    ["DC-native elektronikk", "Hele produktet går på 12 V internt. Nettvarianten bruker ekstern strømforsyning; hyttevarianten kobles rett på batteribanken uten omformertap."],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 3: Differensierende egenskaper."),
  new Paragraph({ children: [new PageBreak()] })
);

/* 3. CAD */
children.push(
  h1("3. CAD-tegningsspesifikasjoner"),
  p("Modellen bygges som en parametrisk assembly med fire hoveddelmengder: bæreskinne, blåseenhet, armsett og dryppkar. Alle mål i millimeter, toleranser etter ISO 2768-m der annet ikke er angitt."),

  h2("3.1 Hovedmål og proporsjoner"),
  table([2900, 2400, 1500, 2226], [
    ["Delmengde", "L × B × H (mm)", "Vekt", "Merknad"],
    ["Bæreskinne (T-spor)", "900 × 60 × 55", "1 020 g", "Ekstrudert profil, kappet i lengde"],
    ["Blåseenhet", "240 × 150 × 115", "1 180 g", "Monteres i skinnens venstre ende"],
    ["Tørkearm (per stk.)", "420 lang, Ø32 ytre", "95 g", "Ø24 innvendig kanal"],
    ["Dysehode (per stk.)", "78 × 44 × 30", "22 g", "Silikon, to utløp"],
    ["Dryppkar", "880 × 190 × 35", "310 g", "Volum 2,1 liter"],
    ["Komplett, i bruk", "900 × 250 × 520", "3 400 g", "Høyde inkl. hengende armer"],
    ["Komplett, sammenlagt", "900 × 145 × 120", "3 400 g", "Armer brettet inn i skinnen"],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.RIGHT, AlignmentType.LEFT] }),
  caption("Tabell 4: Hovedmål. Veggavstand 42 mm, som gir plass til kabelføring bak skinnen."),
  p("Proporsjonene er styrt av tre forhold: skinnen er 900 mm fordi det er standard modulbredde i norske entréer og treffer stendere med c/c 600 mm; blåseenheten er 115 mm høy for å romme radialviften uten å bryte skinnens silhuett; og armene er 420 mm slik at en støvel med 380 mm skaft henger fritt over dryppkaret."),

  h2("3.2 Materialvalg"),
  table([2300, 3100, 3626], [
    ["Komponent", "Materiale", "Begrunnelse"],
    ["Bæreskinne", "Aluminium 6063-T6, anodisert grafitt (15 µm)", "Stivhet ved lav vekt, korrosjonsbestandig mot saltvann fra støvler, ekstrudert T-spor krever ingen etterbearbeiding"],
    ["Kabinett og plenum", "Pilot: PA12 (MJF-print). Serie: PP-GF30 sprøytestøpt", "PA12 gir formfrihet uten verktøy i pilot; PP-GF30 gir samme stivhet til 1/4 av enhetsprisen i serie"],
    ["Tørkearmer", "TPU 92A, ekstrudert spiralforsterket slange", "Bøyelig ned til R40 uten kollaps, tåler 60 000 bøyesykluser"],
    ["Dysehoder", "Silikon LSR 40 Shore A, matt", "Merker ikke skinn, tåler 38 °C kontinuerlig, tørkes av"],
    ["Dryppkar", "PET-G, termoformet, 1,5 mm", "Klart materiale gjør vannivået synlig, tåler oppvaskmaskin"],
    ["Pakninger", "EPDM 60 Shore A", "UV- og fuktbestandig, holder IPX4 rundt viftehuset"],
    ["Festemateriell", "Rustfritt A2 (AISI 304)", "Gang og bod har høy luftfuktighet"],
    ["Isolasjon i plenum", "Melaminskum 10 mm", "Demper viftestøy med ca. 6 dB(A), brannklasse B-s1,d0"],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 5: Materialspesifikasjon."),

  h2("3.3 Nøkkelfunksjoner visualisert i modellen"),
  h3("Luftvei"),
  bullet("Inntaksgrill 62 × 38 mm på blåseenhetens underside, med vaskbart polyesterfilter i uttrekkbar kassett."),
  bullet("Radialvifte 12 V EC, 24 W, 62 m³/t ved 180 Pa, montert på tre silikondempere for å hindre strukturbåren støy inn i skinnen."),
  bullet("PTC-element 40 W plassert etter viften i et 24 mm langt varmekammer med turbulator, slik at luften varmes jevnt uten hotspots."),
  bullet("Fordelingsplenum med avtagende tverrsnitt, fra 480 mm² ved port 1 til 160 mm² ved port 6, som gir under 8 % avvik i luftmengde mellom portene."),
  bullet("Seks porter med senteravstand 140 mm langs skinnen."),
  h3("Sensorikk og styring"),
  bullet("SHT40 fuktsensor nr. 1 i inntaket, sensor nr. 2 i returkanalen over dryppkaret."),
  bullet("Styrekort 68 × 42 mm med RP2040-basert mikrokontroller, MOSFET-styring av PTC og PWM på viften."),
  bullet("Betjening: én trykkbryter med LED-ring – hvit puls under tørking, rolig grønn ved ferdig syklus, gul ved fullt dryppkar."),
  bullet("Termosikring 55 °C i serie med PTC-elementet, uavhengig av programvaren."),
  h3("Ergonomi"),
  bullet("Armene henger 180 mm fra vegg, slik at en voksen støvel ikke skraper listverket."),
  bullet("Skinnens overkant monteres 1 350 mm over gulv – lav nok til at en sjuåring når portene selv."),
  bullet("Dysehodet er formet som en avlang kile med to utløp: ett mot tåboksen og ett mot skaftet."),

  h2("3.4 Monteringspunkter og mekanismer"),
  table([2600, 6426], [
    ["Grensesnitt", "Utførelse"],
    ["Vegginnfesting", "To nøkkelhullsspor i skinnens bakvegg, c/c 600 mm (treffer stendere). Ett sikringshull M5 i høyre ende hindrer at skinnen løftes av. Leveres med A2-skruer og plugger for gips, betong og tre."],
    ["Arm til skinne", "Kvartomdreinings kamlås: armfoten føres inn i T-sporet og dreies 90°. En fjærbelastet kule gir taktil klikk i låst posisjon. Verktøyfritt, uttrekkskraft over 140 N."],
    ["Port-spjeld", "Hver port har et fjærbelastet spjeld (0,4 mm fjærstål, PET-belagt) som holdes åpent av armfoten. Uten arm lukker spjeldet automatisk og bevarer trykket i plenumet."],
    ["Blåseenhet til skinne", "Fire M4-skruer inn i skinnens skrukanaler, pluss en O-ringtettet flens mot plenumets inngang."],
    ["Dryppkar", "Fire N42-magneter (Ø10 × 3 mm) i karets bakkant mot ståloppleggene i skinnen. Trekkes rett av og tømmes; magnetkraft 4 × 11 N holder kar med 2 liter vann."],
    ["Strøm", "DC-jack 5,5/2,1 mm i blåseenhetens høyre side, med strekkavlaster og skjult kabelkanal langs skinnens bakside."],
    ["Servicetilgang", "Filterkassett og viftemodul byttes gjennom lokk i underside, festet med to torx T10 – ingen liming i luftveien."],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 6: Mekaniske grensesnitt og monteringspunkter."),

  h2("3.5 Ytelsesmål (dimensjonerende krav)"),
  table([3400, 2300, 3326], [
    ["Parameter", "Målverdi", "Verifikasjon"],
    ["Luftmengde totalt", "62 m³/t", "Anemometer i testrigg"],
    ["Utløpstemperatur", "38 °C ± 2 °C", "Termoelement i dyse, 20 °C romtemp."],
    ["Effektopptak", "25–48 W", "Effektmåler, full last"],
    ["Lydnivå", "≤ 34 dB(A) @ 1 m", "ISO 3745, forenklet"],
    ["Tørketid, vinterstøvel", "4–6 timer", "Veiing før/etter, 120 g vannlast"],
    ["Tørketid, ullvott", "45–70 minutter", "Veiing før/etter, 25 g vannlast"],
    ["Kapslingsgrad", "IPX4", "IEC 60529 sprutetest"],
    ["Levetid vifte", "≥ 40 000 timer", "Leverandørdata, L10"],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 7: Dimensjonerende ytelseskrav for prototypen."),
  new Paragraph({ children: [new PageBreak()] })
);

/* 4. Kostnader */
children.push(
  h1("4. Produksjonskostnader og prismodell"),
  p("Kalkylen gjelder en pilotserie på 20 enheter produsert i eget verksted, med innkjøpte komponenter og additivt produserte kabinettdeler. Alle beløp er i norske kroner eksklusive merverdiavgift."),

  h2("4.1 Materialkostnad per enhet"),
  table([4200, 1500, 1600, 1726], [
    ["Komponent", "Antall", "Enhetspris", "Sum"],
    ["Aluminiumsprofil 900 mm, anodisert, kappet", "1", "185", "185"],
    ["Kabinett og plenum, PA12 MJF (3 deler)", "1 sett", "420", "420"],
    ["Radialvifte 12 V EC, 24 W", "1", "165", "165"],
    ["PTC-varmeelement 12 V / 40 W m/termosikring", "1", "95", "95"],
    ["Sensormodul SHT40 (×2)", "2", "19", "38"],
    ["Styrekort, montert og testet", "1", "210", "210"],
    ["Strømforsyning 12 V / 60 W, CE", "1", "145", "145"],
    ["Kabelsett, DC-inntak, kontakter", "1 sett", "65", "65"],
    ["Tørkearm TPU m/kamlåsfot", "6", "52", "312"],
    ["Dysehode silikon LSR", "6", "14", "84"],
    ["Dryppkar PET-G, termoformet", "1", "95", "95"],
    ["Festemateriell, magneter, pakninger", "1 sett", "72", "72"],
    ["Emballasje, innstikk, bruksanvisning", "1", "88", "88"],
    ["Sum materialer per enhet", "", "", "1 974"],
  ], { boldRows: [14] }),
  caption("Tabell 8: Materialkostnad (BOM) per enhet ved 20 stk."),

  h2("4.2 Arbeidskostnad per enhet"),
  table([4200, 1500, 1600, 1726], [
    ["Operasjon", "Timer", "Timesats", "Sum"],
    ["Mekanisk montering og kabling", "1,30", "480", "624"],
    ["Funksjonstest og sensorkalibrering", "0,40", "480", "192"],
    ["Sluttkontroll og pakking", "0,30", "480", "144"],
    ["Sum arbeid per enhet", "2,00", "", "960"],
  ], { boldRows: [4] }),
  caption("Tabell 9: Arbeidskostnad per enhet. Timesats inkluderer arbeidsgiveravgift og verkstedskostnad."),

  h2("4.3 Direkte enhetskostnad"),
  table([4200, 2400, 2426], [
    ["Post", "Per enhet", "20 enheter"],
    ["Materialer", "1 974", "39 480"],
    ["Arbeid", "960", "19 200"],
    ["Direkte enhetskostnad", "2 934", "58 680"],
  ], { boldRows: [3] }),
  caption("Tabell 10: Direkte produksjonskostnad for pilotserien."),

  h2("4.4 Engangskostnader (NRE) for pilotserien"),
  table([5700, 3326], [
    ["Post", "Beløp"],
    ["Styrekort: skjema, layout, stensil, to prototyperunder", "9 000"],
    ["Monteringsjigger og oppsett for additiv produksjon", "6 000"],
    ["Termoformverktøy for dryppkar", "4 500"],
    ["CE: EMC- og lavspenningsforhåndstest, teknisk fil", "18 000"],
    ["Emballasjedesign, produktfoto og bruksanvisning", "4 500"],
    ["Sum engangskostnader", "42 000"],
    ["Fordelt per enhet (20 stk.)", "2 100"],
  ], { boldRows: [6, 7] }),
  caption("Tabell 11: Engangskostnader. Disse belastes kun pilotserien og faller bort ved gjentatte serier."),

  h2("4.5 Prismodell og resultat for 20 enheter"),
  table([5100, 1900, 2026], [
    ["Post", "Per enhet", "20 enheter"],
    ["Salgspris eks. mva.", "4 990", "99 800"],
    ["Veiledende pris inkl. mva. (25 %)", "6 238", "124 750"],
    ["Direkte enhetskostnad", "2 934", "58 680"],
    ["Dekningsbidrag (før engangskostnader)", "2 056", "41 120"],
    ["Dekningsgrad", "41,2 %", "41,2 %"],
    ["Engangskostnader (NRE)", "2 100", "42 000"],
    ["Resultat etter engangskostnader", "−44", "−880"],
  ], { boldRows: [4, 8] }),
  caption("Tabell 12: Økonomi for pilotserien på 20 enheter."),
  callout(
    "Tolkning av pilotøkonomien",
    "Pilotserien genererer 41 120 kr i dekningsbidrag og dekker dermed 98 % av de 42 000 kronene i engangskostnader. Serien er i praksis kostnadsnøytral: den finansierer sin egen verktøy- og sertifiseringsutvikling, og fra og med enhet nummer 21 er hele dekningsbidraget på 2 056 kr per enhet overskudd. Pilotens formål er verifikasjon og referansekunder, ikke fortjeneste."
  ),

  h2("4.6 Skaleringsscenario – 500 enheter"),
  p("Ved overgang til sprøytestøpt kabinett, voluminnkjøp og delvis automatisert montering faller enhetskostnaden kraftig. Verktøykostnaden for sprøytestøping er beregnet til 185 000 kr."),
  table([4000, 1700, 1700, 1626], [
    ["Post", "20 enheter", "500 enheter", "Endring"],
    ["Materialer per enhet", "1 974", "1 180", "−40 %"],
    ["Arbeid per enhet", "960", "336", "−65 %"],
    ["Enhetskostnad", "2 934", "1 516", "−48 %"],
    ["Pris direktesalg eks. mva.", "4 990", "4 990", "0 %"],
    ["Dekningsbidrag, direktesalg", "2 056", "3 474", "+69 %"],
    ["Dekningsgrad, direktesalg", "41,2 %", "69,6 %", "+28 p.p."],
    ["Pris forhandler/B2B eks. mva.", "—", "2 995", "—"],
    ["Dekningsgrad, forhandler", "—", "49,4 %", "—"],
  ], { boldRows: [3, 6] }),
  caption("Tabell 13: Kostnadsutvikling fra pilot til første kommersielle serie."),
  p("Med en salgsmiks på 60 % direktesalg og 40 % forhandler gir en serie på 500 enheter en omsetning på 2 096 000 kr, et dekningsbidrag på 1 338 000 kr og et resultat etter verktøykostnad på 1 153 000 kr. Sprøytestøpeverktøyet er nedbetalt etter 54 solgte enheter i direktekanalen."),
  new Paragraph({ children: [new PageBreak()] })
);

/* 5. Pitch */
children.push(
  h1("5. Pitch-presentasjon"),
  p("Investorpitch, 173 ord.", { italics: true, color: MUTED }),
  spacer(60),
  new Table({
    columnWidths: [CONTENT_W],
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
      left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
      right: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            margins: { top: 300, bottom: 300, left: 340, right: 340 },
            children: [
              p("Norske husholdninger tørker vått yttertøy på to måter: på radiatoren, eller i et tørkeskap på 2 000 watt til 15 000 kroner. Begge er dårlige løsninger. Radiatoren gir mugglukt og ødelagte membraner. Tørkeskapet krever et helt rom og et strømbudsjett de færreste vil ha.", { size: 22 }),
              p("TØRRSKODD er en veggmontert tørkestasjon som blåser tørr luft på maks 38 grader direkte inn i støvler, hansker og skøyter – der fukten faktisk sitter. Seks verktøyfrie armer klikkes inn i en aluminiumsskinne, og en fuktsensor stopper syklusen automatisk når tøyet er tørt. Resultatet er 25–48 watt, 4–6 timer, ingen lukt og ingen varmeskade.", { size: 22 }),
              p("Markedet er konkret: 1,1 millioner norske barnefamilier, 6 000 barnehager, 11 000 idrettslag og 440 000 fritidsboliger – de siste dekket av vår 12-volts variant for solcelleanlegg.", { size: 22 }),
              p("Pilotserien på 20 enheter er ferdig kalkulert: 2 934 kroner i direkte enhetskostnad, 4 990 kroner i utsalgspris, 41 prosent dekningsgrad. Ved 500 enheter faller enhetskostnaden til 1 516 kroner og dekningsgraden stiger til 70 prosent.", { size: 22 }),
              p("Vi søker 750 000 kroner for verktøy, CE-sertifisering og første kommersielle serie.", { size: 22, bold: true, after: 0 }),
            ],
          }),
        ],
      }),
    ],
  }),
  spacer(240),
  h2("5.1 Støttepunkter for muntlig fremføring"),
  bullet("Verdiproposisjon i én setning: tørt yttertøy hver morgen, til 1/40 av effekten og 1/3 av prisen av et tørkeskap."),
  bullet("Tallet som fester seg: 0,2 kWh per syklus mot 8–12 kWh for et tørkeskap."),
  bullet("Første kanal: direktesalg mot barnefamilier i oktober–desember, der betalingsvilje og problembevissthet er høyest."),
  bullet("Andre kanal: barnehager og idrettslag, med rammeavtale på 4–8 enheter per anlegg."),
  bullet("Risiko som allerede er håndtert: termosikring uavhengig av programvare, IPX4-kapsling og CE-forhåndstest lagt inn i pilotbudsjettet."),
  bullet("Neste milepæl: 20 enheter ut til betalende referansekunder, med måledata på tørketid og energiforbruk fra reell bruk."),
  new Paragraph({ children: [new PageBreak()] })
);

/* 6. Bildebeskrivelse */
children.push(
  h1("6. Bildebeskrivelse"),
  h2("6.1 Produktet som objekt"),
  p("Førsteinntrykket er en horisontal, rolig strek på veggen. Bæreskinnen er en 900 mm lang aluminiumsprofil i mørk grafitt, anodisert til en matt, fint kornet overflate som reflekterer lys som børstet stein – ikke som blankt metall. Profilen har en enkelt myk fasing langs overkanten, og T-sporet ligger som en skyggelinje i underkant. Ingen synlige skruer, ingen logo på fronten; merket er preget i endelokket i lys grå.")
,
  p("I venstre ende sitter blåseenheten som en avrundet volumøkning, ikke som en påmontert boks. Overgangen mellom skinnen og kabinettet er en kontinuerlig radius på 18 mm, slik at enheten leser som én form. Kabinettet er i varmgrå PA12 med en lett strukturert, sandblåst overflate som skjuler fingeravtrykk og lagdeling. På oversiden ligger én enkelt trykkbryter med en tynn LED-ring: hvit og langsomt pulserende under tørking, rolig grønn når syklusen er ferdig."),
  p("De seks armene henger ned fra skinnen som myke, matte svarte rør i TPU – gummiaktige å ta på, med en synlig spiralforsterkning under overflaten som gir dem et teknisk, tauliknende preg. De henger ikke helt loddrett, men buer svakt utover mot brukeren. Nederst sitter dysehodene i lys grå silikon, formet som avlange kiler med to utløp, mykt matte og litt fløyelsaktige i overflaten. Under det hele ligger dryppkaret i lett røkfarget PET-G, halvtransparent, slik at man ser vannet samle seg uten at karet virker skittent."),

  h2("6.2 Designestetikk"),
  bullet("Formspråk: nordisk funksjonalisme – én horisontal hovedlinje, alt annet underordnet den."),
  bullet("Fargepalett: grafitt (RAL 7024) på aluminium, varmgrå (NCS S 3502-Y) på kabinett, matt sort på armer, lys grå silikon som eneste kontrastfarge."),
  bullet("Teksturkontrast: hardt og fint kornet metall mot mykt og strukturert polymer mot halvtransparent plast – tre tydelig ulike taktile kvaliteter."),
  bullet("Ingen skjerm, ingen app-krav, ingen skrift på fronten. Produktet forklares av formen: du ser hvor støvelen skal."),
  bullet("Detaljene som signaliserer kvalitet: den frest-liknende fasingen på skinnen, det taktile klikket når armen dreies på plass, og magnetkaret som løsner med et lite, dempet sug."),

  h2("6.3 Produktet i bruk"),
  p("Bildet er tatt i en norsk entré i februar, sen ettermiddag. Ute er det blått mørke; inne er lyset varmt fra en taklampe utenfor bildekanten. Skinnen er montert på en lys vegg over et gulv i eik, 1 350 mm opp, med en knaggrekke og en speilkant så vidt synlig i høyre bildekant."),
  p("På de fire venstre armene henger to par barnestøvler i rødt og marineblått, opp-ned, med skaftene trukket helt ned over armene slik at dysehodene forsvinner inn i støvelen. Snøen på yttersålene har smeltet, og to dråper står i ferd med å falle ned i dryppkaret, der det allerede ligger en tynn vannfilm. På den femte armen henger en vott i ull, litt utspilt av luftstrømmen. Den sjette armen er tom, og spjeldet i porten er lukket – synlig som en liten svart flate."),
  p("LED-ringen lyser hvitt og pulserer langsomt. Et barn på omtrent syv år strekker seg opp og trer den andre votten på plass uten hjelp – hånden i bildets forgrunn, litt uskarp, som viser at produktet er innenfor rekkevidde. Under stasjonen er gulvet tørt og fritt: ingen avis, ingen søle, ingen støvler i veien for døren."),
  p("En sekundær bildevariant viser hytteoppsettet: samme enhet montert på en bordkledd vegg i furu, med en DC-kabel som forsvinner ned mot en batteribank, og et par vadere og en fleecelue på armene. Utenfor vinduet: snø og ettermiddagslys."),

  h2("6.4 Bildeliste for pitchmateriell"),
  table([2400, 6626], [
    ["Bilde", "Innhold"],
    ["Hovedbilde", "Entréscenen beskrevet i 6.3, 3/4-vinkel fra høyre, 35 mm."],
    ["Produktbilde", "Ren studioframstilling mot lys bakgrunn, rett forfra, armene brettet inn."],
    ["Detalj 1", "Kamlåsen i nærbilde, arm halvveis dreid inn i T-sporet."],
    ["Detalj 2", "Dysehodet inne i en gjennomskåret støvel, med luftstrøm indikert."],
    ["Snitt-render", "Blåseenheten i snitt: filter, vifte, PTC-element, plenum og sensor."],
    ["Skalabilde", "Barn som henger opp en vott, viser monteringshøyde."],
    ["Hyttevariant", "12 V-oppsett på furuvegg med solcelleanlegg antydet."],
  ], { aligns: [AlignmentType.LEFT, AlignmentType.LEFT] }),
  caption("Tabell 14: Anbefalt bildesett for investorpresentasjon og produktside."),
  spacer(200),
  h2("6.5 Videre arbeid"),
  bullet("Ferdigstille parametrisk CAD-modell og skrive ut første kabinettsett i PA12."),
  bullet("Bygge testrigg for luftmengde og tørketid med kalibrert vektlogging."),
  bullet("Kjøre EMC- og lavspenningsforhåndstest før serieproduksjon av styrekortet."),
  bullet("Plassere 20 pilotenheter hos betalende referansekunder i tre segmenter: familie, barnehage og hytte."),
  bullet("Samle måledata i én sesong og bruke dem som grunnlag for verktøybestilling og serie 2.")
);

/* ---------- Dokument ---------- */
const doc = new Document({
  creator: "Nordveg Design AS",
  title: "TØRRSKODD T6 – Designpitch",
  description: "Komplett designpitch: problem, konsept, CAD-spesifikasjon, kostnader og investorpitch.",
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 21, color: INK } },
    },
  },
  numbering: {
    config: [
      {
        reference: "kule",
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: "•",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 400, hanging: 220 } } },
          },
          {
            level: 1,
            format: LevelFormat.BULLET,
            text: "◦",
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 760, hanging: 220 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertMillimetersToTwip(25),
            bottom: convertMillimetersToTwip(22),
            left: convertMillimetersToTwip(25),
            right: convertMillimetersToTwip(25),
          },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "TØRRSKODD T6 – Designpitch  ·  ", size: 16, color: MUTED, font: "Calibri" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: MUTED, font: "Calibri" }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("Skrev", OUT, buf.length, "bytes");
});
