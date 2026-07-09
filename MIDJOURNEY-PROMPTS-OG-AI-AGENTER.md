# Midjourney-Prompts, Multi-Agent Kjøringsplan og Vibe-Baserte Løsninger

Komplett leveranse i tre deler: fem hyper-realistiske Midjourney-prompts, en detaljert
15-timers multi-agent kjøringsplan med checkpoint-system, og fem praktiske løsninger
bygget på distinkte visuelle "vibes".

---

<section>
  <title>Oppgave 1: Fem Midjourney-Prompts</title>

  <prompt number="1">
Hyper-realistic close-up portrait of a weathered 78-year-old Norwegian fisherman standing on the deck of his rust-streaked trawler in Lofoten at dawn, every pore, salt crystal and frost-tipped whisker of his silver beard rendered in extreme micro-detail, deep wrinkles carved like fjord lines across his wind-burned skin, pale blue eyes reflecting a cold orange sunrise, wearing a soaked mustard-yellow oilskin jacket with cracked buttons and frayed grey wool gloves, droplets of sea spray suspended mid-air around his shoulders, volumetric golden-hour light cutting through low Arctic fog, subtle cyan rim lighting separating his silhouette from the slate-grey ocean behind him, atmosphere of quiet endurance and generations of maritime labor, jagged snow-dusted peaks softly out of focus in the background, gulls as pale motion-blurred streaks, shot on a virtual 85mm f/1.4 lens with razor-thin depth of field, cinematic color grade with muted teal shadows and warm amber highlights, gritty documentary realism, photoreal skin texture, visible fabric weave, 8K fidelity --ar 4:5 --style raw --v 6.1 --q 2 --s 250
  </prompt>

  <prompt number="2">
Hyper-realistic wide interior shot of an abandoned Soviet-era brutalist swimming hall, cracked turquoise mosaic tiles peeling from massive raw concrete walls, a shallow mirror of ink-black rainwater covering the empty pool floor and reflecting the entire ceiling in perfect symmetry, three colossal shafts of dusty afternoon sunlight falling diagonally through shattered glass-brick skylights, suspended dust particles glowing inside each light beam, rusted chrome ladders and a collapsed ten-meter diving platform draped in decades of calcium streaks and moss, faded red Cyrillic lane numbers still visible on chipped paint, two pigeons frozen mid-flight through the light shafts, atmosphere of melancholic grandeur and monumental silence, cold desaturated palette of concrete grey, oxidized copper green and drowned turquoise broken only by the warm gold of the sun shafts, ultra-fine texture detail on every crack, water stain and spalled concrete edge, architectural photography style, tilt-shift level sharpness front to back, 8K photorealism, cinematic haze --ar 16:9 --style raw --v 6.1 --q 2 --s 300
  </prompt>

  <prompt number="3">
Extreme hyper-realistic macro photograph of a shard of 10,000-year-old glacier ice held against the low Arctic sun, thousands of trapped prehistoric air bubbles suspended inside the crystal like frozen galaxies, each bubble individually refracting light into micro-prisms of cyan, ultramarine and diamond white, razor-sharp internal fracture planes splitting the sunlight into caustic patterns, a single meltwater drop forming at the lowest edge and hanging at the exact moment before falling, the blurred silhouette of a violet-blue glacier wall and dark polar ocean melting into soft bokeh behind the ice, thin veils of drifting snow catching backlight as glittering specks, atmosphere of deep time, fragility and crystalline silence, lighting dominated by hard low-angle backlight with delicate blue fill from the sky, focus stacked macro clarity where every micro-bubble and internal crack is tack sharp, shot on a virtual 100mm macro lens at f/8, color palette of glacial blues against warm polar gold, scientific documentary realism, 8K resolution --ar 3:2 --style raw --v 6.1 --q 2 --s 200
  </prompt>

  <prompt number="4">
Hyper-realistic cinematic street scene of a narrow night market alley during heavy monsoon rain, hybrid of Tokyo backstreet and Nordic harbor town, saturated neon signage in magenta, electric cyan and tangerine reflected as long liquid smears across black wet cobblestones, dense curtains of rain backlit into silver threads by every light source, thick steam rising from a yakitori grill and drifting sideways through the neon glow, an elderly vendor in a translucent plastic rain poncho leaning into the warm light of her stall, crowded rows of glistening umbrellas receding into atmospheric haze, tangled overhead power lines dripping and sparking faint reflections, condensation and grease texture on every plastic stool and enamel sign, atmosphere of electric loneliness and warm shelter inside chaos, anamorphic lens flares stretching horizontally from each neon tube, shallow cinematic depth of field on a virtual 35mm lens at f/1.8, teal-and-magenta blockbuster color grade with deep crushed blacks, hyper-detailed rain physics, 8K photorealism, film still energy --ar 21:9 --style raw --v 6.1 --q 2 --s 400
  </prompt>

  <prompt number="5">
Hyper-realistic high-end studio still life of thick liquid chrome pouring in slow motion over a jagged block of matte black obsidian, the metallic stream frozen mid-flow into perfect glassy ripples, folds and tendrils, every surface mirror-reflecting an unseen softbox grid as crisp white rectangles, micro-droplets of chrome orbiting the main pour like satellites, razor-sharp contrast between the wet liquid metal and the dry volcanic micro-texture of the stone, faint violet and ice-blue gradient backlight bleeding around the silhouette, a low fog layer hugging the reflective black acrylic floor, atmosphere of luxurious futurism and sterile precision, inspired by polished AI-era commercial production aesthetics and high-budget perfume advertising, controlled studio lighting with one hard key light, twin strip lights for edge definition and a deep graphite background fading to pure black, hyper-clean composition with generous negative space, macro-level sharpness on every ripple and reflection, subtle chromatic aberration at the frame edges, 8K render-grade photorealism --ar 4:5 --style raw --v 6.1 --q 2 --s 350
  </prompt>
</section>

---

<section>
  <title>Oppgave 2: Multi-Agent Løkkekjøring (15 timer)</title>

  <agent_plan>

## De fem agentene

| # | Agent | Rolle | Ansvar |
|---|-------|-------|--------|
| 1 | **DIRIGENT** (Orchestrator) | Styring og flyt | Starter hver syklus, fordeler oppgaver, håndhever tidsbokser, eier checkpoint-systemet og stopper/eskalerer ved avvik |
| 2 | **PROMPT-SMED** (Generator) | Kreativ produksjon | Genererer 10 nye prompt-varianter per syklus basert på stilbibliotek + feedback fra forrige runde |
| 3 | **TEKNIKER** (Optimizer) | Teknisk finpuss | Justerer parametere (--s, --q, --ar, seed-verdier), kjører A/B-varianter og logger hvilke innstillinger som gir best resultat |
| 4 | **KURATOR** (QA/Evaluator) | Kvalitetskontroll | Scorer hvert resultat 1–10 på realisme, komposisjon, lys og atmosfære; alt under 7 sendes tilbake med konkret begrunnelse |
| 5 | **ARKIVAR** (Librarian) | Lagring og læring | Versjonerer alle prompts + scores i git, bygger et voksende «hva fungerer»-dokument som mater PROMPT-SMED i neste syklus |

## Syklusstruktur: 90 minutter × 10 sykluser = 15 timer

Hver syklus følger samme sekvens:

| Tid i syklus | Aktivitet | Agent |
|--------------|-----------|-------|
| 00:00–00:05 | Syklus-briefing: mål, tema og læring fra forrige runde | DIRIGENT |
| 00:05–00:30 | Generering av 10 prompt-varianter | PROMPT-SMED |
| 00:30–00:50 | Parameteroptimalisering + A/B-oppsett | TEKNIKER |
| 00:50–01:15 | Scoring og kvalitetsvurdering av alle varianter | KURATOR |
| 01:15–01:25 | Commit av resultater, oppdatering av læringsdokument | ARKIVAR |
| 01:25–01:30 | Syklus-rapport og go/no-go for neste runde | DIRIGENT |

## 15-timers tidslinje

| Klokketime | Sykluser | Fokus |
|------------|----------|-------|
| T+0 til T+3 | 1–2 | **Utforskning:** bred variasjon over alle fem prompt-temaene |
| T+3 | — | ✅ **CHECKPOINT 1** |
| T+3 til T+6 | 3–4 | **Innsnevring:** de 20 % best scorede retningene videreutvikles |
| T+6 | — | ✅ **CHECKPOINT 2** |
| T+6 til T+9 | 5–6 | **Fordypning:** lys- og teksturvariasjoner på topp-kandidatene |
| T+9 | — | ✅ **CHECKPOINT 3** |
| T+9 til T+12 | 7–8 | **Polering:** kun varianter med score ≥ 8 bearbeides videre |
| T+12 | — | ✅ **CHECKPOINT 4** |
| T+12 til T+15 | 9–10 | **Finale:** endelig topp-10-liste kurateres og dokumenteres |
| T+15 | — | ✅ **CHECKPOINT 5 (slutt):** full rapport og leveranse |

## Checkpoint-systemet (hver 3. time)

Ved hvert checkpoint kjører DIRIGENT denne kontrollen:

1. **Kvalitetsgate:** Gjennomsnittsscore fra KURATOR må være ≥ 6,5 og stigende.
   Hvis ikke: neste syklus vies til feilanalyse i stedet for ny produksjon.
2. **Drift-kontroll:** ARKIVAR sammenligner nye prompts mot original stilbeskrivelse
   (hyper-realisme). Ved stilavvik > 20 % resettes PROMPT-SMED til siste godkjente baseline.
3. **Duplikat-sjekk:** Varianter med > 80 % tekstlikhet mot tidligere prompts forkastes.
4. **Ressurs-sjekk:** Loggstørrelse, kjøretid per syklus og feilrate gjennomgås;
   ved to påfølgende timeouts halveres batch-størrelsen fra 10 til 5 varianter.
5. **Beslutning:** DIRIGENT logger `FORTSETT`, `JUSTER` eller `STOPP` med begrunnelse —
   alt committes av ARKIVAR slik at hele kjøringen kan etterprøves.

## Feilhåndtering

- **Én agent feiler:** DIRIGENT restarter agenten med siste kjente tilstand fra ARKIVAR (maks 3 forsøk).
- **Gjentatt feil:** Agentens steg hoppes over i inneværende syklus og flagges til neste checkpoint.
- **Kritisk feil ved checkpoint:** Kjøringen pauses og en statusrapport genereres i stedet for at dårlige resultater akkumuleres videre.

**Sluttleveranse etter 15 timer:** topp-10 kuraterte prompts med scores, komplett
parameterlogg fra TEKNIKER, og et «hva fungerer»-dokument som kan gjenbrukes som
startpunkt for neste kjøring.

  </agent_plan>
</section>

---

<section>
  <title>Oppgave 3: Fem Vibe-Baserte Problemløsninger</title>

  <solution number="1">
**Problem:** Matsvinn i husholdninger — folk kaster rester fordi de ikke vet hva de kan lage.
→ **Vibe:** 70-talls retro-kokebok — varm oransje/brun palett, kornete matfoto, håndskrevne kort.
→ **Løsning:** «Restekort» — en web-app der du skriver inn 3–5 rester du har i kjøleskapet, og får tilbake en oppskrift formatert som et nostalgisk, printbart oppskriftskort. Retro-estetikken gjør restemat til noe koselig og statusverdig i stedet for noe flaut.
→ **Implementering:** Enkel React/Next.js-app + LLM-API for oppskriftsgenerering, CSS-filter og retro-fonter (Cooper Black, papirtekstur som bakgrunn) for kortdesignet, «del som bilde»-knapp via html2canvas. MVP på én helg.
  </solution>

  <solution number="2">
**Problem:** Ensomhet blant eldre — familien deler hverdagen digitalt på plattformer besteforeldre ikke bruker.
→ **Vibe:** Analog avis-nostalgi — avispapir-layout, serif-typografi, sort-hvitt-bilder med bildetekster.
→ **Løsning:** «Familieavisen» — familien sender bilder og korte meldinger til én e-postadresse gjennom uken; hver søndag genereres automatisk en 4-siders PDF i klassisk avislayout som printes og postes (eller vises på en enkel skjerm) hjemme hos bestemor. Avis-formatet er kjent, trygt og krever null teknisk kompetanse hos mottakeren.
→ **Implementering:** E-post-innboks (f.eks. Postmark inbound) → cron-jobb som samler innhold → LaTeX/HTML-til-PDF-mal med avisdesign → print-API (f.eks. lokalt trykkeri eller Peecho) for fysisk utsendelse.
  </solution>

  <solution number="3">
**Problem:** Prosessdokumentasjon i småbedrifter finnes ikke eller er utdatert — kunnskap forsvinner når folk slutter.
→ **Vibe:** Teknisk blueprint/cyanotype — dyp koboltblå bakgrunn, hvite linjer, rutenett, stemplet tittelfelt.
→ **Løsning:** «Blåkopi» — et verktøy der ansatte beskriver en arbeidsprosess i fritekst, og får tilbake et visuelt flytdiagram i blueprint-stil, klart til å henges på veggen eller legges i internwikien. Den tekniske estetikken signaliserer «dette er offisielt og gjeldende», som øker sjansen for at dokumentasjonen faktisk vedlikeholdes.
→ **Implementering:** Fritekst → LLM → Mermaid/Graphviz-definisjon → egendefinert blueprint-tema (blå bakgrunn, monospace-etiketter, tittelfelt med versjon og dato). Kjøres i CI slik at diagrammene re-genereres automatisk når kildeteksten endres i repoet.
  </solution>

  <solution number="4">
**Problem:** Treningsvaner kollapser etter 2–3 uker fordi fremgang er usynlig i hverdagen.
→ **Vibe:** 8-bit retro gaming — pikselgrafikk, chiptune-lyder, byggespill-estetikk à la SimCity på NES.
→ **Løsning:** «Pikselbyen» — en habit-tracker der hver gjennomførte økt bygger en ny bygning i en liten pikselby. Hopper du over en uke, begynner byen å gro igjen med pikselugress. Fremgangen blir et sted du har bygget og ikke vil miste — tap-aversjon som motor i stedet for skippertak-motivasjon.
→ **Implementering:** PWA med canvas-rendering av tilemap, lokal lagring + valgfri sky-synk, ferdige piksel-tilesets (f.eks. Kenney.nl, CC0). Push-varsel formulert i spillets univers: «Byen din trenger deg i dag.»
  </solution>

  <solution number="5">
**Problem:** Venterom (fastlege, NAV, tannlege) skaper stress og opplevd urettferdighet fordi ingen vet hvor lang køen faktisk er.
→ **Vibe:** Skandinavisk hygge-minimalisme — rolig beige/salvie-palett, myke geometriske former, langsom animasjon, ingen røde tall.
→ **Løsning:** «Rolig kø» — en veggskjerm som erstatter aggressive kønummer-display med en rolig visualisering: hver ventende er en myk form som langsomt driver mot et fjell-landskap, med ærlig estimert ventetid i store, vennlige typer. Forskningsinnsikten er at *forklart og visualisert* ventetid oppleves opptil 40 % kortere — estetikken er selve virkemiddelet, ikke pynt.
→ **Implementering:** Raspberry Pi + hvilken som helst TV-skjerm, fullskjerms webapp (SVG-animasjon med CSS), kobles til eksisterende kølapp-system via webhook eller enkel manuell «neste»-knapp hos resepsjonen. Pilot kan settes opp for under 2 000 kr per rom.
  </solution>
</section>
