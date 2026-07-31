# Topp 3 — utvalg, kritikk og videreføring

Gjennomgang av hele materialet i dette repoet: **98 grener, 79 unike temaer,
9 åpne pull requests**. Målet var å finne de tre elementene som fortjener å bli
ferdigstilt for alvor, og si tydelig hva som ikke gjør det.

| | |
|---|---|
| **Vinnerne** | [TØRKA T1](01-torka-t1/) · [Luna](02-luna/) · [Sonisk Kunst](03-sonisk-kunst/) |
| **Grunnlag** | 98 grener gjennomgått, 4 kjørt og verifisert |
| **Nytt her** | Termisk revisjon av TØRKA (fant 33 % feil), stabilitetsrevisjon av Luna (fant feil dimensjonerende krav), seriemodus for Sonisk Kunst (kjørbar) |

---

## 1  Metode

Materialet ble vurdert på fem akser. Vekten ligger på de to siste, fordi det er
der nesten alt i repoet faller:

| Akse | Spørsmål |
|---|---|
| Originalitet | Finnes dette allerede, og i så fall hvorfor er dette bedre? |
| Gjennomførbarhet | Kan én person bygge det med kjent teknologi og et realistisk budsjett? |
| Markedsverdi | Finnes det en kjøper med et budsjett som allerede eksisterer? |
| **Etterprøvbarhet** | Er påstandene regnet på, eller bare skrevet ned? |
| **Ferdighetsgrad** | Hvor mye gjenstår før noen andre enn forfatteren kan bruke det? |

Etterprøvbarhet ble avgjørende. Repoet er fullt av dokumenter som *høres*
ferdige ut. Skillet mellom de tre vinnerne og resten er at vinnerne tåler at
man regner etter — og to av dem viste seg å ha feil som først kom fram da noen
faktisk gjorde det.

### Hva som ble kjørt, ikke bare lest

| Hva | Resultat |
|---|---|
| `sonisk-kunst --demo` | Kjører på 7 s. Reproduserer A-moll, 72 BPM, 28 onsets — eksakt som dokumentert. |
| Sonisk Kunst mot ukjent lyd | Egen testfil i C-dur @ 120 BPM: **C major, 120,2 BPM, 39 onsets**. Analysen er ekte, ikke tilpasset egen demo. |
| TØRKA T1 energibudsjett | Regnet om fra bunnen. **Avvik på 33 %** — se under. |
| Luna stabilitet | Regnet om fra bunnen. **Feil dimensjonerende krav** — se under. |

---

## 2  De tre valgte

### 🥇 TØRKA T1 — sammenleggbart, sensorstyrt tørkerom

`claude/product-design-pitch-459m3f` (ingen åpen PR) · [detaljer →](01-torka-t1/)

Den eneste idéen i repoet som er tatt hele veien fra problem til
produksjonsklar kalkyle: 7 konkurrentløsninger analysert, komplett materialliste
med 24 poster, CAD-ark med oppriss, snitt, plan og seks detaljsnitt, kostnad per
enhet på NOK 4 573 og dekningspunkt ved enhet nr. 15.

**Hvorfor topp 3:** problemet er reelt og målbart (0,8–2 l vann per last inn i
inneluften), målgruppen har allerede budsjett (barnehager kjøper tørkeskap til
25 000–45 000 kr), og produktet gjør tre ting samtidig som ingen konkurrent
kombinerer. Sikkerheten ligger i fysikken — et selvbegrensende PTC-element kan
ikke gå termisk løpsk uansett programvarefeil.

**Det jeg fant:** energibudsjettet går ikke opp. Rev. A oppgir 0,90 kWh per
syklus. Regnet med latent varme, erstatningsluft, kappetap og vifte blir det
**1,20 kWh og 798 W snitteffekt — 74 W over produktets eget effekttak på 724 W.**
Posten som mangler er kappetapet gjennom duken. Massebalansen holder derimot:
70 m³/h avtrekk er 74 % av viftekapasiteten, så spjeldet har margin.

### 🥈 Luna — mykt lysobjekt

`claude/luna-design-specs-ocybyo` · [PR #9](https://github.com/fotoblinkskudd2-create/kreative-vibe-prosjekter/pull/9) · [detaljer →](02-luna/)

En 58 cm høy lampe som skal lese som møbel, ikke som maskin. Spesifikasjonen er
uvanlig disiplinert: NCS-koder på hver farge, minste konvekse radius R15 satt
som regel, hodet vippet nøyaktig 8° med begrunnelse for hvorfor ikke 5 og ikke
10, og en lagpakke fra LED til stoff der hver luftspalte har en grunn.

**Hvorfor topp 3:** det er det eneste i repoet med en egen estetisk stemme.
Byggekurset gjør det faktisk byggbart av én person på 22–30 timer for
3 500–5 500 kr, og specen lister sine egne åpne punkter i stedet for å skjule
dem.

**Det jeg fant:** ballasten er begrunnet på feil størrelse. Specen krever
veltevinkel ≥ 30°, og bruker 3,5 kg ballast for å komme dit. Men regner man
tyngdepunktet med massepostene eksplisitt havner det på **103 mm, ikke 175 mm**,
og veltevinkelen blir 53,8°. **Kravet holder også helt uten ballast** (37,4°).
Ballasten er altså ikke overflødig — men vinkelen er feil størrelse å måle den
i. Riktig kriterium er hvor hardt du må dytte: 8,6 N uten ballast mot 20,6 N med.

### 🥉 Sonisk Kunst — lyd blir algoritmisk kunst

`claude/system-review-input-memory-1sjnre` · [detaljer →](03-sonisk-kunst/)

Komplett analysepipeline — STFT, spektral centroid, chroma, onset-deteksjon,
tempo via autokorrelasjon, toneart med Krumhansl-Schmuckler — implementert
direkte på numpy/scipy uten librosa. Tre rendringsmotorer, harmonisk fargelogikk
langs kvintsirkelen, og en live-versjon i nettleseren uten avhengigheter.

**Hvorfor topp 3:** det er det eneste ferdige, kjørende, verifiserbare stykket
ingeniørarbeid i repoet, og resultatet er vakkert. Jeg testet det mot lyd det
aldri har sett — det traff toneart, tempo og onsets riktig. Det er ikke en
demo som er trimmet til å se bra ut.

**Det jeg fant:** teknisk sterkest, kommersielt svakest. Det er et
kommandolinjeverktøy uten produkt rundt seg. Og tempoestimatet bommer på
oktaven: et spor bygget på 84 BPM ble lest som 42, 167 og 112 BPM i tre satser.
Harmløst i kunsten, pinlig i en herkomststripe på et trykk.

---

## 3  Hva som ble eliminert, og hvorfor

### 3.1 Maskineri som spiser produktet

**32 av 94 grener (34 %)** handler om agenter, prompts, loops, orkestrering og
multiagent-systemer — REGNVIKING, OpenCLAW, Herde, SymbioForge, Føniks,
«massive-run-loop-skill» ×3, «multi-layer-prompt-system», «ultimate-prompt-
multilayer», og videre.

Dette er systemer for å produsere prosjekter. En tredjedel av innsatsen har gått
til å bygge fabrikken i stedet for varen. Fabrikken har ingen kjøper, og hvert
nytt lag med orkestrering gjør neste lag lettere å rettferdiggjøre.

**Behold** kun `claude/multi-model-orchestration-system-kztcgy` (PR #5) — den
har 49 tester som faktisk kjører og et lintverktøy som fant feil i sine egne
seed-filer. Skriv resten av.

### 3.2 Parallelle omkjøringer som aldri ble avgjort

**13 temaer finnes i to eller tre varianter** — 28 grener som har produsert 13
resultater:

```
massive-run-loop-skill ×3   ·   workday-planning-8hr ×2
sustainable-fashion-research ×2  ·  smart-product-concepts-ai ×2
recursive-loop-threaded-fabric ×2  ·  product-prototype-workflow ×2
product-design-pitch ×2  ·  personal-analysis-creative ×2
multi-agent-system-design ×2  ·  midjourney-prompts-ai-agents ×2
innovation-ideation-concepts ×2  ·  fylkevibe-research-dashboard ×2
five-ai-product-ideas ×2
```

Samme oppgave er kjørt om igjen og har gitt et *annet* svar, ikke et bedre.
PR #7 og #8 er samme researchdokument i to versjoner, begge åpne. Ingen av
parene er slått sammen eller avgjort.

**Regel framover:** kjør aldri samme brief to ganger uten å lukke den første.
En variant som ikke velges bort, er en variant som må vedlikeholdes.

### 3.3 Lister uten dybde

`five-creative-projects-0130f5` inneholder 100 bilder, 100 sanger, 100 videoer
og 100 biomimikry-funn. `01-fem-geniale-ideer.md` har fem gjennomarbeidede
konsepter med markedstall og patentskisser.

Problemet er ikke kvaliteten — ISBRYTER og MEDVIND er skarpe. Problemet er at
volumet er selvbegrunnende. Hundre idéer på 20 KB er 200 byte per idé. De fem
i MONSTER_LEVERANSE er bedre enn de hundre, og bør beholdes som *idébank*, ikke
som prosjekter.

**Behold** `MONSTER_LEVERANSE/01-fem-geniale-ideer.md` og
`05-biomimikry/produktkonsepter.md`. Arkiver resten av listene.

### 3.4 Prototyper som stoppet ved «det virker på maskinen min»

`vibe-cards-prototype`, `art-generator`, `problemknuser`, `fylkevibe`,
`alex-civilian-field-lab`. Alle kjører. Ingen har en bruker.

De fire Devin-PR-ene (#1–#4) er reell forbedring — kritiske sikkerhetsfeil
funnet og fikset: hardkodet JWT-secret, SSRF i `/api/variations`, lagret XSS.
**Slå sammen #1 og #2.** Men ikke bygg videre: dette er øvingsprosjekter, og de
har gjort jobben sin.

### 3.5 Det som må stoppes av andre grunner enn kvalitet

**Føniks (PR #6)** er teknisk imponerende — 132 tester, ærlig matematikk, og
forfatteren nektet selv å bygge «Agent 11 Skyggen» fordi roterende proxyer og
TLS-fingeravtrykk er omgåelse av tilgangskontroll hos X, eBay og Temu. Den
avgjørelsen var riktig.

Men PR-en dokumenterer også sin egen konklusjon: med 309 coins er Ethereum L1
ikke kjørbart i det hele tatt, minste hvelvsaldo er 79 320 USD, og Temu har
ikke noe offentlig produkt-API — en arkitekturfeil i grunnmodellen. Prosjektet
har allerede bevist at det ikke bærer. **Lukk det, og behold matematikken.**

**TicShield** stopper der den skal: firmwaren håndterer kun IMU og
vibrasjonsmotor, og READMEen sier eksplisitt at man ikke skal bygge egne
strømkretser mot hud. Riktig avgrenset — men et ikke-godkjent medisinsk apparat
er ikke et produkt. **Behold som personlig eksperiment.**

---

## 4  Rangeringen i sin helhet

| # | Element | Orig. | Gjenn. | Marked | Etterprøv. | Ferdig | Sum | Dom |
|---|---|:--:|:--:|:--:|:--:|:--:|:--:|---|
| 1 | **TØRKA T1** | 8 | 8 | 9 | 9 | 8 | **42** | Bygg |
| 2 | **Luna** | 9 | 8 | 6 | 8 | 7 | **38** | Bygg |
| 3 | **Sonisk Kunst** | 8 | 9 | 5 | 10 | 9 | **41**\* | Bygg |
| 4 | ISBRYTER (idé) | 8 | 5 | 8 | 4 | 2 | 27 | Idébank |
| 5 | MEDVIND (idé) | 7 | 6 | 8 | 4 | 2 | 27 | Idébank |
| 6 | Orkestreringskjerne | 5 | 8 | 3 | 9 | 8 | 33 | Behold, frys |
| 7 | Føniks | 7 | 4 | 4 | 9 | 6 | 30 | Lukk |
| 8 | Devin-sikkerhetsfiksene | 3 | 9 | 4 | 8 | 9 | 33 | Slå sammen |
| 9 | TicShield | 6 | 5 | 2 | 5 | 4 | 22 | Hobby |
| 10 | Vibe-appene | 3 | 8 | 3 | 6 | 7 | 27 | Arkiver |
| 11 | 100-listene | 4 | 3 | 3 | 2 | 3 | 15 | Arkiver |
| 12 | Agent-/prompt-systemene | 3 | 6 | 1 | 4 | 5 | 19 | Skriv av |

\* Sonisk Kunst scorer nest høyest på sum, men rangeres som nr. 3 fordi
markedsverdien er den svakeste av de tre. Det er også den som er lettest å
rette — se [03-sonisk-kunst/](03-sonisk-kunst/).

---

## 5  Neste 90 dager

Rekkefølgen er satt etter hva som blokkerer hva, ikke etter hva som er
morsomst.

| Uke | TØRKA T1 | Luna | Sonisk Kunst |
|---|---|---|---|
| 1–2 | Frys rev. B med varmegjenvinner | Avklar de 5 åpne punktene | Fiks tempo-oktav + faste frø |
| 3–4 | Bygg testrigg, **mål** tørketid og kWh | Bestill materialer, start keramikk | Trykktest: A2, 300 dpi, CMYK |
| 5–8 | Prototype 1, mot målte tall | Modul 1–4 (base, skjelett, lys, skum) | Seriemodus + nettbutikk-flyt |
| 9–12 | 3 intensjonsavtaler med barnehager **før** sertifisering | Modul 5–6, fototest | Første 10 trykk til ekte kunder |
| Port | Måler du 90 min og under 1,1 kWh? | Står den støtt og glør den jevnt? | Vil noen betale for trykk nr. 11? |

**Det ene rådet som gjelder alle tre:** ingen av dem er stoppet av idé eller
design. De er stoppet av at ingen utenforstående har prøvd dem. Sett en
ekstern port på hver — en målt verdi, en fysisk test, en betalende kunde — og
la den avgjøre, ikke dokumentet.

---

## 6  Innhold i denne mappen

```
topp-3/
├── README.md                     dette dokumentet
├── 01-torka-t1/
│   ├── README.md                 analyse, forbedringer, neste steg
│   ├── termisk_revisjon.py       energibudsjettet regnet om (kjørbar)
│   ├── lag_figur.py              genererer figuren fra beregningen
│   └── figurer/torka-t1-revB-energi.svg / .png
├── 02-luna/
│   ├── README.md                 analyse, forbedringer, neste steg
│   ├── stabilitet.py             massebudsjett og veltearbeid (kjørbar)
│   ├── lag_figur.py              genererer designarket
│   └── figurer/luna-designark.svg / .png
└── 03-sonisk-kunst/
    ├── README.md                 analyse, produktretning, neste steg
    ├── lag_serie.py              seriemodus, kjørbar mot motoren
    └── figurer/sonisk-kunst-serie.png
```

Alle beregninger er kjørbare og bruker kun standardbiblioteket, med unntak av
`lag_serie.py` som trenger motoren fra sin egen gren. Figurene genereres fra
beregningene, slik at de ikke kan komme i utakt med tallene.
