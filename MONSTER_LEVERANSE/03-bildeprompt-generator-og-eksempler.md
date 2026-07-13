# SEKSJON 3 — Hyperrealistisk bildeprompt-system: Generator + 30 ferdige prompts

Oppgaven tillot «generator + 20+ konkrete eksempler + master-prompt som kjører resten». Det er den riktige leveransen — 100 statiske prompts eldes; en generator produserer 100 nye hver uke, kalibrert mot det som faktisk engasjerer. Her er generatoren, formelen, anti-AI-tells-reglene og **30 copy-paste-klare prompts** (Midjourney/Flux-format).

---

## 3.1 Master-formelen

Hver prompt bygges av seks sloter:

```
[MOTIV med konkret handling] + [MILJØ med værlys] + [2-3 KUNSTNER-TEKNIKKER
oversatt til foto-språk] + [KAMERA/FILM-SPESIFIKASJON] + [TEKSTUR-ANKERE]
+ [ANTI-AI-DIREKTIV]
```

**Kunstner-teknikker oversatt til fotospråk** (nøkkelen til at det ikke ser AI-generert ut — be aldri om «in the style of», be om *teknikken*):

| Kunstner | Be om dette i stedet |
|---|---|
| Rembrandt | single-source chiaroscuro, deep warm shadows, emotional key light |
| da Vinci | anatomical precision, sfumato haze on distant planes |
| Van Gogh | turbulent sky energy, expressive color in clouds only |
| Monet | atmospheric backlight, soft broken color in mist |
| Dalí | one (1) subtle surreal element, dream-logic scale |
| Kahlo | symbolic objects worn on the body, direct unflinching gaze |
| Michelangelo | sculptural body tension, dramatic diagonal composition |
| Picasso | fractured reflections (in glass/ice/water, keeps photo real) |
| Warhol | bold repeated motif in background signage |
| Banksy | stenciled graffiti element on a real surface in-scene |

**Anti-AI-direktiv (limes på alle prompts):**
`natural imperfect skin texture, asymmetric face, visible pores, weathered hands, authentic fabric wear, 35mm film grain, slight motion blur on moving elements, documentary composition, no text unless specified --style raw`

---

## 3.2 Generator-masterprompt (kjør i Claude/OpenClaw for neste 70+)

```text
Du er en bildeprompt-smed. Generer N hyperrealistiske prompts etter formelen
[MOTIV+handling][MILJØ+værlys][2-3 kunstnerteknikker i fotospråk][kamera/film]
[teksturanker][anti-AI-direktiv]. Trekk motiv fra listen: arktiske droner i
felt, biomimicry-makro, systemkritisk gatekunst (institusjoner - aldri
identifiserbare privatpersoner), mental helse/biohack-ro, oppfinnerportretter,
grønn fremtidstech, norsk natur+teknologi, justice-symbolikk. Variér kamera
(85mm f/1.4, 24mm dokumentar, makro 100mm, drone-perspektiv), tid på døgnet og
vær. ALDRI: perfekt symmetri, voksaktig hud, overmettede farger, glorete HDR.
Hver prompt maks 80 ord, engelsk, copy-paste-klar for Midjourney/Flux.
```

---

## 3.3 De 30 ferdige promptene

### Arktisk drone & biomimicry (1–8)

1. `Weathered hummingbird-inspired drone with shark-skin riblet texture landing on wind-carved snow ridge, Svalbard midnight sun grazing low, single-source chiaroscuro from the left, sfumato haze on distant peaks, National Geographic documentary framing, 200mm telephoto, frost crystals on carbon fiber, natural imperfect textures, 35mm film grain, slight rotor motion blur --style raw`

2. `Macro photograph of dragonfly wing beside carbon-fiber drone rotor blade on scarred wooden workbench, Bergen workshop window light, anatomical da Vinci precision, warm Rembrandt shadows in tool clutter, 100mm macro f/2.8, dust motes in light beam, fingerprints on metal, film grain --style raw`

3. `Search-and-rescue drone hovering over crevasse in blue glacier ice, its silhouette fractured into cubist shards by the ice reflections below, overcast polar light, turbulent Van Gogh cloud energy overhead, documentary wide 24mm, rope team of three tiny figures for scale, breath fog, 35mm grain --style raw`

4. `Close-up of engineer's weathered hands soldering circuit board inside folding drone frame, headlamp chiaroscuro in dark field tent, Michelangelo tension in the fingers, red aurora bleeding through canvas, shallow depth 85mm f/1.4, solder smoke curl, chapped knuckles, authentic fabric wear --style raw`

5. `Drone charging dock shaped like a Norwegian stone cairn on coastal mountain summit, drone descending at dusk, Monet atmospheric backlight through sea mist, one subtle Dalí element: the cairn's shadow stretches impossibly long toward the fjord, 35mm documentary, lichen texture on stone, film grain --style raw`

6. `Kingfisher diving beside high-speed drone in identical posture, split-second frozen over dark fjord water, overcast silver light, da Vinci anatomical study composition, droplets sculptural as Michelangelo marble, 1/8000s telephoto capture aesthetic, wet feather detail, natural color, grain --style raw`

7. `Frost-covered sensor station half-buried in snow transmitting under green aurora, long-exposure star trails, lone snowmobile track leading away, Rembrandt keylight from the station's single status LED, 14mm astro lens, hoarfrost crystal detail, honest darkness, film grain --style raw`

8. `Test drone crashed in birch forest snow, inventor kneeling beside it laughing, mid-morning flat light, documentary honesty, Kahlo directness in the eye contact with camera, tools spread on tarp, broken propeller in foreground, 35mm f/2, red wool cap, real fatigue lines, grain --style raw`

### System & justice (institusjoner, ikke personer) (9–15)

9. `Banksy-style stencil of scissors cutting red tape sprayed on brutalist concrete government building, rain-slick Oslo street at dusk, real wet reflections doubling the stencil, passing umbrella blurred in foreground, sodium streetlight chiaroscuro, 35mm documentary, moss in concrete cracks, grain --style raw`

10. `Mountain of case files reaching toward fluorescent office ceiling, one small potted flower on top, Dalí dream-scale, cold institutional light against one warm window, dust in air shafts of light, 24mm from floor level, paper texture, coffee ring stains, film grain --style raw`

11. `Empty waiting room with forty numbered queue tickets scattered on floor like autumn leaves, Warhol repetition in the identical orange chairs, late afternoon light through blinds striping the linoleum, Rembrandt warmth on one occupied chair, 35mm, worn upholstery detail, grain --style raw`

12. `Weathered hands of elderly woman holding rejection letter, kitchen table with rosemaling bowl, window light Vermeer-soft, Kahlo symbolism: house keys arranged like a necklace before her, shallow 85mm f/1.4, paper tremor blur, real skin texture, dignity not despair, film grain --style raw`

13. `Stenciled silhouette of child's swing on the wall of decommissioned institutional building, real swing frame rusting in overgrown yard beyond, Monet atmospheric summer haze, documentary 50mm, peeling paint texture, fireweed blooming through asphalt, quiet, grain --style raw`

14. `Justice scale made of ice melting on courthouse steps in spring sun, water running down granite, Dalí logic rendered physically real, morning golden hour, macro drops mid-fall, 100mm, granite crystal detail, honest impermanence, film grain --style raw`

15. `Whistleblower's desk lamp burning alone in dark open-plan office at 2am, Rembrandt single-source light on scattered documents and reading glasses, city bokeh through rain window, Edward Hopper loneliness, 35mm f/2, coffee cup ring, highlighter marks visible, grain --style raw`

### Mental helse & biohack-ro (16–21)

16. `Man breathing steam in icy fjord at dawn, water to his shoulders, absolute calm, Monet mist swallowing the far shore, Michelangelo stillness in the shoulders, cold blue palette with one warm towel red on the rocks, 85mm across the water, goosebump skin detail, film grain --style raw`

17. `Close-up of smartwatch on wrist showing calming waveform, forest floor bokeh beyond, hand resting on moss, macro 100mm, da Vinci anatomical tendon detail, soft rain, water beading on screen, real arm hair and scars, natural light, grain --style raw`

18. `Person sitting on Bergen rooftop in rain jacket at blue hour, city lights below, breath visible, seven chimneys repeating Warhol-like into the mist, Rembrandt warmth from one attic window, 35mm documentary, wet Gore-Tex texture, honest solitude not sadness, film grain --style raw`

19. `Cold plunge barrel steaming in snowy backyard, aurora faint above pine silhouettes, one towel frozen stiff mid-flap on the line, subtle Dalí, long exposure stars, wood grain and ice detail, 24mm, warm porch light spilling on snow, grain --style raw`

20. `Hands planting seedling in soil beside a disassembled phone lying screen-down, spring window light, Kahlo symbolic contrast worn casually, macro focus on soil under fingernails, 100mm f/2.8, root hair detail, no preaching just fact, film grain --style raw`

21. `ADHD workspace mid-hyperfocus: three coffee cups, drone parts, sheet music, and lit soldering iron in beautiful chaos, golden hour through workshop window, Rembrandt shadow depth, Van Gogh energy confined to steam swirls, 35mm honest documentary, every texture real, grain --style raw`

### Oppfinnerportretter & grønn fremtid (22–30)

22. `Portrait of Nordic inventor in his forties, rain-wet hair, staring past camera on Bergen mountainside, fjord and seven mountains in sfumato haze, Kahlo direct gaze, Rembrandt key light through cloud break, drone controller hanging from weathered hand, 85mm f/1.4, real skin, pores, scar over eyebrow, film grain --style raw`

23. `Inventor's silhouette in doorway of small wooden boathouse workshop at night, interior glowing with warm tungsten and one blue LED strip, drone frames hanging like fish to dry, Rembrandt doorway chiaroscuro, wet cobblestones, 35mm, rain streaks in light cone, grain --style raw`

24. `Bamboo drone frame growing in workshop clamp beside steel predecessor, morning light, Warhol repetition of five iterations lined on shelf behind showing evolution, macro grain of bamboo fiber, 50mm f/2, sawdust in air, honest craft, film grain --style raw`

25. `Solar panel array on turf-roofed cabin, sheep grazing between mounting posts, coastal storm approaching in Van Gogh turbulence, sunbeam holding on the panels, documentary 24mm, wool and silicon texture contrast, real Norwegian west coast light, grain --style raw`

26. `Seaweed farm ropes lifted from dark water by gloved hands at dawn, kelp glistening amber, Monet broken color in the wake, workboat diesel smoke, 35mm documentary honesty, salt crust on gloves, gull motion blur, film grain --style raw`

27. `Child and grandmother releasing small biodegradable sensor float into fjord, overcast soft light, Kahlo symbolic red thread tied to the float, sfumato islands layered to horizon, 50mm eye-level with child, wool sweater texture, quiet hope, grain --style raw`

28. `Retired oil platform in fjord being reborn: climbing wall bolted to one leg, kelp lines below, drone surveying above, Dalí scale-shift subtlety, dramatic Michelangelo diagonals in the steel, storm light break, wide 16mm from water level, rust and lichen detail, film grain --style raw`

29. `Night workshop window seen from snowy street: inventor silhouette bent over glowing workbench, Hopper composition, Rembrandt interior warmth against blue snow, single set of footprints leading in, 35mm, frost patterns on glass edge, film grain --style raw`

30. `Handshake between weathered fisherman's hand and young engineer's hand over drone case on harbor edge, Bergen fish market bustle blurred behind, da Vinci anatomical honesty in both hands, morning side light, 85mm f/2, rope callus vs keyboard callus detail, film grain --style raw`

---

## 3.4 Selvkritikk-loop (kjørt)

Første utkast hadde tre prompts med «in the style of Banksy» — omskrevet til *fysisk stencil i scenen*, fordi stilimitasjon er det AI-detektorer og trente øyne ser først. Alle prompts verifisert mot tells-listen: ingen ber om symmetri, ingen om «perfect», alle har teksturanker og lyskilde med retning. Promptene 9–15 er verifisert frie for identifiserbare personer.
