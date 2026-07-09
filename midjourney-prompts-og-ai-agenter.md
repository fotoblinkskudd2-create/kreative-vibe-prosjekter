# Midjourney-Prompts, Multi-Agent Løkkekjøring og Vibe-Baserte Løsninger

Komplett leveranse i tre deler: fem hyper-realistiske Midjourney-prompts, en 15-timers
multi-agent kjøringsplan med checkpoint-system, og fem vibe-baserte løsninger på ekte problemer.

---

<section>
  <title>Oppgave 1: Fem Midjourney-Prompts</title>

  <prompt number="1">
Weathered Norwegian lighthouse keeper standing at the edge of a storm-battered pier, salt crystals frozen in his gray beard, hyper-realistic photographic style with gritty analog film grain and raw unpolished texture, every pore and rain droplet rendered in extreme macro-level detail, shot on Hasselblad H6D-400c with 90mm lens at f/2.8, dramatic low-angle golden hour light breaking through charcoal storm clouds, rim lighting tracing the silhouette of his oilskin coat, volumetric fog rolling across the wet planks reflecting amber and steel-blue tones, atmosphere of quiet defiance and solitude against the roaring North Sea, spray suspended mid-air like shattered glass, deep shadows retaining full texture detail in the wood grain and rusted iron bollards, color graded with muted teal shadows and warm desaturated highlights, cinematic depth of field isolating the subject from the churning waves behind, photorealistic skin subsurface scattering, --ar 16:9 --style raw --v 6.1 --stylize 250 --chaos 12 --quality 2
  </prompt>

  <prompt number="2">
Abandoned brutalist swimming hall reclaimed by nature, emerald moss cascading over cracked concrete diving platforms, hyper-realistic architectural photography with decayed-luxury aesthetic, water-stained walls showing decades of mineral streaking rendered in obsessive textural detail, shafts of hard noon sunlight piercing through collapsed ceiling panels creating cathedral-like god rays through suspended dust particles, still black water in the pool below acting as a perfect mirror doubling the geometry, atmosphere of sacred silence and beautiful entropy, single red plastic chair floating motionless in the center as chromatic focal point, condensation beading on rusted chrome ladder rails, ferns sprouting from tile grout lines, shot on Phase One XF IQ4 with 32mm tilt-shift lens, deep focus front to back, color palette of viridian, bone white and oxidized iron orange, high dynamic range preserving detail in both blown highlights and crushed shadows, photogrammetry-level surface fidelity, --ar 4:5 --style raw --v 6.1 --stylize 300 --quality 2
  </prompt>

  <prompt number="3">
Elderly street food vendor in a rain-soaked Tokyo back alley at 2 AM, steam billowing from a battered ramen cart into neon-saturated darkness, hyper-realistic cinematic style with gritty documentary texture, wrinkled hands glistening with broth splatter captured in razor-sharp macro detail, hard practical lighting from a single bare tungsten bulb overhead mixed with magenta and cyan neon signage bleeding through the drizzle, wet asphalt reflecting fractured light like an oil painting, atmosphere thick with loneliness, warmth and midnight hunger, cigarette smoke curling through the light beams, condensation dripping from corrugated plastic awning, every noodle strand and chipped ceramic bowl rendered with tactile precision, shallow depth of field at f/1.4 on anamorphic 50mm lens, oval bokeh from distant vending machines, Kodak Portra 800 film emulation with lifted blacks and halation glow around highlights, subtle motion blur in the falling rain, --ar 21:9 --style raw --v 6.1 --stylize 200 --chaos 8 --quality 2
  </prompt>

  <prompt number="4">
Colossal humpback whale suspended mid-breach frozen in time above a glassy Arctic fjord, hyper-realistic wildlife photography fused with surreal scale distortion, barnacle clusters and battle scars on the whale's skin rendered with forensic texture detail, thousands of water droplets cascading off the pectoral fins each refracting the low polar sun individually, midnight sun lighting at 3 AM casting endless honey-gold horizontal rays across the mirror-flat water, snow-dusted basalt cliffs framing the composition in deep shadow, atmosphere of impossible stillness and monumental awe, a tiny red wooden rowboat beneath providing dizzying scale contrast, breath vapor hanging in the freezing air, ultra-high shutter speed aesthetic freezing every splash crystal-sharp, shot on Sony A1 with 400mm f/2.8 telephoto compression flattening the scene into layered planes, color palette of arctic cerulean, warm amber and slate gray, hyperdetailed water displacement physics, National Geographic editorial grade, --ar 16:9 --style raw --v 6.1 --stylize 350 --quality 2
  </prompt>

  <prompt number="5">
Extreme close-up portrait of a retired deep-sea diver's face, skin like weathered leather mapped with stories, one milky-blue eye and one clear gray eye staring directly into the lens, hyper-realistic beauty-dish studio portrait subverted with raw brutal honesty, every capillary, salt-and-pepper stubble follicle and scar tissue ridge rendered at pore-level fidelity, Rembrandt lighting from a single gridded softbox camera-left carving deep triangular shadow under the eye, pitch-black seamless background swallowing the edges of his frame, atmosphere of confrontational intimacy and unspoken history, faint tattoo of coordinates fading on his neck, moisture glinting in the deep creases around his mouth, shot on Fujifilm GFX 100 II with 110mm f/2 lens, focus stacked for edge-to-edge sharpness across the face, desaturated color grade with warm skin tones against cold shadow falloff, subtle film grain overlay, museum-print large format quality, --ar 4:5 --style raw --v 6.1 --stylize 180 --quality 2
  </prompt>
</section>

---

<section>
  <title>Oppgave 2: Multi-Agent Løkkekjøring (15 timer)</title>

  <agent_plan>

## De fem agentene

| Agent | Rolle | Ansvar |
|---|---|---|
| **A1 — Kurator** | Idé- og prompt-generator | Genererer nye prompt-varianter basert på stilbiblioteket og tidligere resultater |
| **A2 — Produsent** | Bildegenerering | Kjører prompts mot Midjourney (via API/automasjon), håndterer kø, retries og rate limits |
| **A3 — Kritiker** | Kvalitetsvurdering | Scorer hvert bilde 1–10 på realisme, komposisjon, lys og prompt-troskap; forkaster under 7 |
| **A4 — Arkivar** | Lagring og metadata | Tagger, versjonerer og lagrer godkjente bilder + prompt-lineage i strukturert arkiv |
| **A5 — Strateg** | Meta-optimalisering | Analyserer trender i A3s scoringer og justerer A1s parametere hver syklus |

## Kjøringsarkitektur

Én syklus = 45 minutter. 15 timer = **20 sykluser** totalt.

```
┌─────────────────────────── SYKLUS (45 min) ───────────────────────────┐
│                                                                        │
│  A1 Kurator ──> A2 Produsent ──> A3 Kritiker ──> A4 Arkivar            │
│  (0–10 min)     (10–30 min)      (30–40 min)     (40–43 min)           │
│       ▲                                              │                 │
│       └──────────── A5 Strateg (43–45 min) <─────────┘                 │
│                     (justerer neste syklus)                            │
└────────────────────────────────────────────────────────────────────────┘
```

## Detaljert sekvens per syklus

1. **00:00–10:00 — A1 Kurator**: Leser A5s siste direktiv, genererer 8 nye prompts
   (4 variasjoner av toppscorere + 4 eksperimentelle). Skriver til `queue/pending.json`.
2. **10:00–30:00 — A2 Produsent**: Kjører køen sekvensielt. Ved feil: 3 retries med
   eksponentiell backoff (30s/60s/120s). Skriver rå-output til `output/raw/`.
3. **30:00–40:00 — A3 Kritiker**: Vurderer hvert bilde mot rubrikk (realisme 30 %,
   lys 25 %, komposisjon 25 %, prompt-troskap 20 %). Score ≥ 7 → godkjent,
   score < 7 → forkastes med begrunnelse i `feedback/rejections.log`.
4. **40:00–43:00 — A4 Arkivar**: Flytter godkjente bilder til `archive/{dato}/{syklus}/`,
   skriver metadata (prompt, seed, score, foreldre-prompt) til `archive/index.db`.
5. **43:00–45:00 — A5 Strateg**: Beregner glidende snitt av score siste 3 sykluser,
   identifiserer hvilke stilelementer som trekker opp/ned, og skriver nytt direktiv
   til `strategy/directive.json` for neste syklus.

## Checkpoint-system for kvalitetskontroll

| Checkpoint | Tidspunkt | Kontroll | Handling ved feil |
|---|---|---|---|
| **CP-Micro** | Hver syklus (hvert 45. min) | Minst 4 av 8 bilder godkjent? | A5 senker chaos-parameter og reverterer til sist kjente gode prompt-mal |
| **CP-Timeout** | Løpende | A2 brukt > 25 min? | Avbryt gjenstående kø, logg, gå videre til A3 med det som finnes |
| **CP-Makro** | Time 3, 6, 9, 12 | Snittscore siste 4 sykluser ≥ 7,5? | Full strategi-reset: A5 bytter til konservativ modus i 2 sykluser |
| **CP-Drift** | Time 5 og 10 | Ligner nye bilder for mye på gamle (embedding-avstand < terskel)? | A1 tvinges til å bytte hovedmotiv-kategori |
| **CP-Final** | Time 14:15 | Siste syklus = kun raffinering av de 5 beste bildene totalt | Ingen nye eksperimenter tillates |

## Tidslinje over 15 timer

| Fase | Timer | Sykluser | Fokus |
|---|---|---|---|
| **Oppvarming** | 0–3 | 1–4 | Bred utforskning, høy chaos (15–20), etablere baseline-score |
| **Konvergens** | 3–8 | 5–10 | A5 snevrer inn mot de 3 best presterende stilretningene |
| **Dybde** | 8–12 | 11–16 | Kun variasjoner av toppscorere, chaos senkes til 5–8 |
| **Raffinering** | 12–14 | 17–19 | Upscaling, mikro-justeringer av lys/tekstur i vinnerprompts |
| **Sluttføring** | 14–15 | 20 | CP-Final: endelig utvalg, generere sluttrapport med topp 10 + full lineage |

## Feilhåndtering og robusthet

- **Heartbeat**: Hver agent skriver puls til `health/heartbeat.json` hvert 5. minutt.
  Uteblitt puls > 10 min → orkestratoren restarter agenten fra siste checkpoint.
- **Idempotens**: Alle agenter kan restartes midt i en syklus uten dobbeltarbeid
  (kø-elementer har status `pending`/`processing`/`done`).
- **Sluttrapport**: Ved time 15 genereres `report/final.md` med statistikk per syklus,
  score-utvikling, de 10 beste bildene og komplett prompt-slektstre.

  </agent_plan>
</section>

---

<section>
  <title>Oppgave 3: Fem Vibe-Baserte Problemløsninger</title>

  <solution number="1">
**[Problem]** Eldre mennesker dropper digitale banktjenester fordi grensesnittene føles kalde, tette og fremmede — noe som gjør dem avhengige av fysiske filialer som legges ned.
→ **[Vibe/Estetikk]** «Kjøkkenbord-nostalgi»: varme papirtoner, håndskrift-inspirert typografi, én ting om gangen — estetikken til å sitte ved kjøkkenbordet med kontoutskriften og en kaffekopp.
→ **[Løsning]** En «rolig modus» i bank-appen: maks tre valg per skjerm, stor serif-typografi på kremhvit bakgrunn, transaksjoner formulert som setninger («Du betalte 340 kr til Rema 1000 i går») i stedet for tabellrader.
→ **[Implementering]** Bygges som et alternativt tema-lag over eksisterende API-er (ingen ny backend). A/B-testes på brukere 65+ med fullføringsgrad på regningsbetaling som hovedmetrikk. Pilot: 8 uker, én sparebank, React Native-temamodul på ~3 ukers utviklingstid.
  </solution>

  <solution number="2">
**[Problem]** Utviklere ignorerer overvåkningsdashboards fordi 40 grafer i rødt/grønt skaper alarm-tretthet — reelle hendelser drukner i støy.
→ **[Vibe/Estetikk]** «Værmelding»: den rolige, ett-blikks-lesbare estetikken til yr.no — himmel-gradienter, ett stort symbol, én tallverdi.
→ **[Løsning]** Et «systemvær»-dashboard: hele tjenestens helse destilleres til én værtilstand (☀️ sol = alt friskt, 🌧 regn = degradert, ⛈ storm = kritisk) med gradientbakgrunn som skifter farge. Detaljgrafene finnes fortsatt — men ett klikk unna.
→ **[Implementering]** Grafana-panel-plugin som aggregerer eksisterende alerts til en vektet «værindeks» (error rate 40 %, latens 30 %, saturation 30 %). Vises på kontorets veggskjerm. MVP på én sprint; suksess måles i redusert tid-til-oppdagelse av reelle hendelser.
  </solution>

  <solution number="3">
**[Problem]** Fysioterapipasienter slutter med hjemmeøvelsene sine etter 2–3 uker fordi treningsark i PDF føles klinisk og demotiverende — noe som forlenger rehabilitering og øker helsekostnader.
→ **[Vibe/Estetikk]** «Retro treningsstudio 1985»: VHS-korn, neonrosa/turkis, synthwave-lydspor, arkade-poengtavle — trening som glad kitsch i stedet for medisinsk plikt.
→ **[Løsning]** En web-app der hver øvelse er et «arkadenivå»: repetisjoner teller opp som poeng med chiptune-lyd, ukesstreak vises som high-score-liste, og fullført program «låser opp» neste VHS-kassett i samlingen.
→ **[Implementering]** PWA med telefonens kamera + MediaPipe for enkel repetisjonstelling. Fysioterapeuten legger inn øvelsesprogrammet via et skjema; pasienten får en lenke, ingen innlogging. Pilot med én klinikk og 20 pasienter, måles på andel som fortsatt trener uke 6.
  </solution>

  <solution number="4">
**[Problem]** Matsvinn i husholdninger: folk glemmer hva som ligger bakerst i kjøleskapet til det er for sent — en gjennomsnittsfamilie kaster mat for tusenvis av kroner årlig.
→ **[Vibe/Estetikk]** «Tamagotchi-omsorg»: den emosjonelle 90-tallsestetikken der pikselvesener trenger stell — omsorgsfølelse som driver handling bedre enn dårlig samvittighet.
→ **[Løsning]** En app der hver matvare blir en liten piksel-skapning på en hylle. Skapningen er blid når varen er fersk, blir gradvis trist mot utløpsdato, og appen foreslår en oppskrift som «redder» de tre tristeste skapningene i dag.
→ **[Implementering]** Registrering via strekkodeskanning (Open Food Facts-API) med standard holdbarhetstabell per varekategori. Oppskriftsmotor matcher mot «trist»-listen. Flutter-app, MVP på 6 uker; suksessmetrikk er selvrapportert kastet mat før/etter 30 dager.
  </solution>

  <solution number="5">
**[Problem]** Nyansatte i distribuerte team føler seg isolerte og slutter oftere i løpet av første år — onboarding består av dokumentlenker og kalenderinvitasjoner uten stedsfølelse.
→ **[Vibe/Estetikk]** «Ghibli-landsby»: håndtegnet, varm kartestetikk — kontoret som en liten landsby med hus, stier og beboere, der utforskning føles som et eventyr i stedet for et pensum.
→ **[Løsning]** Et interaktivt onboarding-kart der hvert «hus» er et team og hver «beboer» en kollega med håndtegnet avatar og tre menneskelige fakta. Nyansatt får ukentlige «oppdrag» («Besøk smia — ta en kaffeprat med noen i plattformteamet») som gradvis åpner kartet.
→ **[Implementering]** SVG-kart + enkel CMS der HR vedlikeholder hus og beboere; Slack-boten sender ukens oppdrag og krysser av ved fullført kaffeprat (begge parter bekrefter med emoji). Bygges på 4 uker; måles på 90-dagers tilhørighetsscore i medarbeiderundersøkelsen.
  </solution>
</section>
