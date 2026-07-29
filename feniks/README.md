# Føniks — agent 11, 12, 13 og orkestratorfunksjonene

Bygger bro over de tre svakhetene: nettverksblokkering, MEV-sandwiching, og
gass-/friksjonsfeller. Alt er implementert, typesjekket og dekket av 132 tester.

```bash
npm run sjekk    # typesjekk + hele testsuiten
npm run demo     # tallene for din katalysator, regnet ut
```

Krever Node 22.6+ (`--experimental-transform-types`). Ingen
produksjonsavhengigheter — heller ikke for Redis-klienten. Komponenten som
avgjør om systemet lever bør ikke kunne feile på en avhengighetsoppgradering.

---

## Én ting jeg ikke bygde

**Agent 11 «Skyggen» er ikke implementert som spesifisert.** Roterende
residential proxyer, dynamisk TLS-fingeravtrykk, Cloudflare-omgåelse og
«skjul systemets eksistens» er omgåelse av tilgangskontroll hos X, eBay og
Temu. Det bygger jeg ikke.

Men diagnosen din er riktig, og problemet er reelt, så plassen er fylt: **agent
11 er `Portneren`**, som løser samme oppgave — uavbrutt datastrøm til
Researcheren — med lisensiert tilgang, kvotebudsjettering, kretsbrytere og
caching.

Grunnen er ikke bare juridisk. Den er teknisk, og den er avgjørende for
premisset ditt:

Unnvikelse har **korrelert feil**. Fingeravtrykk-metoden er én felles
avhengighet for alle kilder samtidig. Når den oppdages — og den oppdages, det er
Cloudflares faktiske forretningsmodell — dør *alle* kilder i samme time. Med
kapital bundet i åpne posisjoner, midt i en syklus. Det er nøyaktig den
feilmodusen en katalysator på 309 coins ikke tåler, og den rammer verst når
ingen ser på.

Kvotebasert tilgang degraderes i stedet: én kilde blir treg, kretsbryteren tar
den ut, de andre kjører videre, og Orkestratoren *vet* det. Kvoter er et
dimensjoneringsproblem, og dimensjoneringsproblemer løses med caching og
prioritering. En permanent sperre løses ikke med noe.

Det koster deg ~200 USD/mnd på X. Det er en linje i budsjettet, ikke et
teknisk problem — og det er billigere enn én tapt syklus.

---

## Tre rettelser der matematikken sier noe annet enn spesifikasjonen

Disse er ikke stilistiske. Hver av dem endrer om systemet virker.

### 1. Et tidsdrevet hjerteslag oppdager ikke en frossen løkke

Spesifikasjonen sier: ping en watchdog hvert 5. minutt; henger løkken, dreper
watchdogen containeren.

Feilmodusen du selv beskriver — «API-er henger seg opp og loopen fryser» — er
nesten alltid en `await` som aldri løses. **Da er event-loopen helt frisk.**
`setInterval` fyrer som normalt, pingen går, watchdogen ser en levende prosess,
og systemet står stille i timevis mens vaktbikkja rapporterer at alt er i orden.
Dead man's switch-en er blind for presis den tilstanden den finnes for.

Løsningen er at pulsen er **fremgangsdrevet**: løkken kvitterer for hvert steg
den fullfører, og emitteren sender puls bare hvis fremgang er observert innenfor
vinduet.

```ts
hjerteslag.registrerFremgang("skann-ferdig");   // fra løkken, aldri fra en timer
await hjerteslag.vakt("dex-oppslag", 8_000, (signal) => hentReserver(signal));
```

`vakt()` er andre halvdel: hver `await` mot omverdenen får en frist og et
`AbortSignal`. En hengende `await` blir en håndterbar feil, ikke en stillstand.
Vaktbikkja er siste utvei, ikke førstelinje.

To detaljer som følger av å faktisk kjøre dette:

- **Tomgang er fremgang.** En løkke som skanner og finner null muligheter må
  kvittere for det, ellers dreper vi et friskt system i en rolig time.
- **Omstart må rasjoneres.** «Maskinen sover aldri» tatt bokstavelig gir en
  crash-loop som gjør tusenvis av feilende kall fra samme legitimasjon over
  natten — den raskeste veien til den permanente sperren hele arkitekturen
  prøver å unngå. Etter tre omstarter per time går vaktbikkja i **karantene**
  og krever et menneske.

### 2. Det finnes ingen «matematisk sikkerhet» mot MEV — men det finnes en grense

En transaksjon i en blokk er alltid underlagt byggerens rekkefølgevalg. Privat
ruting via Flashbots flytter tilliten fra «hele mempoolen» til «denne byggeren».
Det er en enorm forbedring. Det er ikke kryptografi.

Det som *kan* garanteres er slippasjevinduet:

```
vindu = forventetUt − minUt
```

En sandwich må skyve prisen før din handel. Skyves den så langt at du får under
`minUt`, reverterer handelen din og angriperen sitter igjen med to gebyrer og
null bytte. Angriperens optimale front-run er derfor nøyaktig den som presser
deg til `minUt`. **Alt hen kan hente fra deg er det du på forhånd sa deg villig
til å tape.** `simulerSandwich` verifiserer dette ved binærsøk på angriperens
optimum, for toleranser fra 1 til 1 000 bp.

Én ting jeg tok feil om underveis, og som testene avslørte: jeg antok at vinduet
også begrenser *angriperens inntekt*. Det gjør det ikke. En sandwich henter fra
to kilder — din slippasje **og** bassengets skjevhet etterpå, som er LP-verdi.
Målt i konsistent USD tjener angriperen mer enn du taper: i testtilfellet 441,12
USD mot ditt tap på 427,34 USD. Siden det er angriperens inntekt som avgjør *om*
du blir angrepet, er `marginBps = 5000` — krev at vinduet ligger under
halvparten av angriperens kostnad — ikke forsiktighet på magefølelse, men
dekning for en kjent skjevhet i grensen.

Rekkefølgen på tiltakene følger av hva som virker, og her er data:

| handel | vindu ved 50 bp | tiltak | endelig vindu |
|---|---|---|---|
| 5,0 WETH | 71,22 USD | krympet handel | 1,84 USD (5 bp) |
| 1,0 WETH | 14,80 USD | strammet toleranse | 1,77 USD (6 bp) |
| 0,0625 WETH | 0,93 USD | uendret | 0,93 USD (50 bp) |

Å **stramme toleransen** er gratis og oftest nok. Å **krympe handelen** koster
fortjeneste og trengs bare når selv den strammeste brukbare toleransen gir et
lønnsomt vindu. Merk at krymping virker fordi `maksTryggToleranse` er et
*absolutt* takbeløp delt på utbeløpet: halveres handelen, dobles trygg toleranse.
Veien fra 1 bp til 100 bp krever ~64x mindre handel — ikke en marginal justering.

Toleranse under 5 bp er dessuten ikke sikkerhet, det er garantert revert på
normal blokkdrift. `MIN_BRUKBAR_TOLERANSE_BPS` håndhever gulvet.

### 3. En 5 %-friksjonsport er en 20x-regel — og den er dødelig på L1

`friksjon / brutto ≤ 0,05` er identisk med `brutto ≥ 20 × friksjon`. Regelen er
riktig. Konsekvensen er brutal, og den er `npm run demo`:

| kjede | friksjon tur-retur | minste brutto per operasjon |
|---|---|---|
| ethereum | 39,66 USD | **793,20 USD** |
| base | 0,04 USD | 0,80 USD |

**På L1 kan ingen operasjon under 793 USD brutto noensinne passere porten**,
uansett hvor god arbitrasjen er. «Mikrodrenering» og en 5 %-port kan ikke
sameksistere på Ethereum L1. Det er ikke en innvending mot porten — det er
tallet som avgjør hvilken kjede modellen kan kjøre på i det hele tatt. Porten
logger kravet ved hvert drap, slik at det er synlig *hvorfor* operasjoner dør.

To tillegg som følger av å regne på det:

- **Nettokrav i tillegg til forholdstall.** Brutto 100 cent og friksjon 4 cent
  passerer 5 %-regelen, men bommer anslaget med 5 cent er operasjonen negativ.
- **Kapitalbinding er friksjon.** Låser en operasjon innsatsen i 40 minutter, er
  kapitalen utilgjengelig for alle andre operasjoner. På en katalysator som skal
  roteres mange ganger per syklus er det den dyreste posten, og den står ikke i
  noe gebyrskjema. Den legges til automatisk, så kalleren ikke kan glemme den.
- **Budsjetter på taket, ikke anslaget.** EIP-1559 tillater +12,5 % basefee per
  blokk, sammensatt: over fire blokker ~1,60x. `beregnGass` regner taket eksakt
  i heltall (9/8 per blokk) og lar porten bruke *det*. Forskjellen på 12,60 og
  19,83 USD er ren lekkasje hvis du gater på anslaget.
- **L2 uten L1-datagebyr avvises.** `l1DataFeeWei` er påkrevd for OP-stack, fordi
  L1-publiseringen ofte dominerer totalen. Uten den er kostnaden systematisk
  underestimert, og det er en feil som ser ut som fortjeneste.

---

## Katalysatoren på 309 coins

Spesifikasjonen sier ikke hvilken coin, og det avgjør alt. `npm run demo`
regner over spekteret:

| per coin | katalysator | L1: hvelv | Base: hvelv | |
|---|---|---|---|---|
| 1 USD | 309 USD | 0 | 3 | kun L2 kjørbart |
| 10 USD | 3 090 USD | 0 | 5 | kun L2 kjørbart |
| 100 USD | 30 900 USD | 0 | 5 | kun L2 kjørbart |
| 1 000 USD | 309 000 USD | 3 | 5 | begge kjørbare |

Minste hvelvsaldo ved 1 % forventet margin: **79 320 USD på L1, 80 USD på Base.**

Med andre ord: med mindre de 309 coins er verdt over 300 000 USD, er L1 ikke et
alternativ, og fem brannceller er ikke et valg du kan ta. Anbefalingen er
Base eller Arbitrum.

### Lommebok-isolasjon: hva det gir, og hva det ikke gir

**Gir — begrenset skadeomfang.** Dette er den reelle gevinsten, og den er stor.
En honeypot, en ondsinnet `approve`, en kompromittert rute: angrepet rekker aldri
lenger enn hvelvet som signerte. Fem hvelv betyr at verste enkelthendelse koster
en femtedel.

**Gir ikke — anonymitet.** «Slette eierskapsspor» er ikke mulig på denne måten,
og systemet må ikke opptre som om det var. Finansierer du fem hvelv fra én
kilde, har du tegnet en stjerne i kjedens permanente transaksjonsgraf. Enhver
klyngeanalyse binder dem sammen på finansieringstransaksjonen alene, før den
i tillegg ser tidsmønsteret og de felles motpartene. Hvelvene er engangsbruk mot
**smartkontrakter**, ikke mot en observatør. Bygg ingen antakelse om usporbarhet
oppå dette.

**Konflikten du må kjenne:** fragmentering slår direkte mot Skattemesteren.
Femdeler du kapitalen, blir hver handel en femtedel så stor mens gassen per
handel er uendret — friksjonsandelen femdobles omtrent. Fragmenteringen kan
gjøre at *ingen* operasjon passerer porten, og symptomet ser ut som «arbitrasjen
finnes ikke» i stedet for «vi delte kapitalen for tynt». `planleggIsolasjon`
nekter derfor å splitte under `minsteHvelvSaldo`, og reduserer antallet framfor å
levere hvelv som ikke kan handle.

**Det faktiske honeypot-forsvaret** er godkjenningshygiene, ikke rotasjon:
nøyaktig beløp, aldri uendelig, trekk tilbake etterpå, Permit2 med kort utløp.
En pensjonert lommebok med en levende uendelig `approve` er ikke pensjonert — den
kan tømmes måneder senere. `sjekkGodkjenning` avviser begge feilene.

**Nøkler håndteres ikke her.** Modulen arbeider med *referanser* til
signeringsevne (adresse + KMS-/HSM-håndtak), aldri nøkkelmateriale. Å generere
engangsnøkler i applikasjonskode plasserer hele katalysatoren i prosessminnet til
den delen av systemet som har størst angrepsflate — den ene feilen som gjør alle
de andre forsvarene irrelevante.

---

## Kjeden

Rekkefølgen er ikke tilfeldig. Hver port kan bare **drepe**; ingen port kan
overstyre en annens drap. Derfor er kjeden trygg å utvide.

```
Agent 3 ──[Portneren/11]──> rådata          kilde nede = ingen operasjon
Agent 6 ────────────────────> BruttoMulighet
Agent 13 Skattemester ──────> Friksjonsdom  billigst port først: de fleste dør her
Agent 12 Livvakt ───────────> Rutingdom     krever ferske reserver + simulering
Agent 7 Eksekutør ──────────> signerer og sender
```

Skattemesteren kjører **før** Livvakten med vilje: det er ingen grunn til å bruke
RPC-kall på MEV-analyse av en operasjon som er død på avgifter.

Livvaktens fire krav må holde samtidig: ferske reserver (< 4 s — gamle reserver
gjør `minUt` feil, og da er hele MEV-grensen ugyldig), en beskyttelsesform på
kjeden, et vindu under angriperens terskel, og en forhåndssimulering som gir
minst `minUt`.

Beskyttelsesform per kjede — merk at L2 er et annet problem, ikke et løst
problem:

| kjede | form | |
|---|---|---|
| ethereum | `privat-bygger` | Flashbots / MEV Blocker / bloXroute |
| base, arbitrum, optimism | `sekvenserer` | ingen offentlig mempool; sekvensereren er tillitt part |
| polygon | `ingen` | offentlig mempool, ingen beskyttet vei — **vi handler ikke her** |

---

## Filer

```
src/kjerne/
  penger.ts              heltallsmatematikk — bigint, aldri float
  typer.ts               delte kontrakter, Dom, Klokke
  logg.ts                strukturert logg (bigint-trygg)
src/agent11-portner/
  kilder.ts              kildekatalog med lovlig tilgangsvei per kilde
  ratebudsjett.ts        token bucket, kontinuerlig refyll
  kretsbryter.ts         lukket/åpen/halvåpen, eskalerende pause
  cache.ts               TTL + ETag + LRU
  backoff.ts             Retry-After, full jitter, 4xx gjentas ikke
  index.ts               Portneren
src/agent12-livvakten/
  slippasje.ts           eksakt V2-matematikk, samme avrunding som kontrakten
  mev.ts                 vindusgrense, sandwich-simulering, tiltaksplan
  ruting.ts              private endepunkter, beskyttelsesform per kjede
  index.ts               Livvakten
src/agent13-skattemester/
  gass.ts                EIP-1559-tak, L1-datagebyr for L2
  gebyrer.ts             plattform, frakt, bro, uttak
  index.ts               Skattemesteren
src/orkestrator/
  hjerteslag.ts          fremgangsdrevet puls + vakt() med frist
  puls-lager.ts          FilPuls og RedisPuls (egen RESP-klient)
  vaktbikkje.ts          drap, omstartsrasjonering, karantene
  lommebokisolasjon.ts   brannceller, rotasjon, godkjenningshygiene
  pipeline.ts            kjeden 13 → 12 → 7
src/demo.ts              kjørbar gjennomgang med tall
src/vaktbikkje-main.ts   vaktbikkjas inngangspunkt
```

## Drift

```bash
cp .env.example .env     # fyll inn; ingen nøkler i git
docker compose up -d
```

Vaktbikkja starter i **tørrkjøring** og logger hva den ville gjort. Sett
`FENIKS_VAKT_BEVAEPNET=ja` når du er klar. En komponent hvis eneste jobb er å
drepe produksjonsprosesser skal ikke kunne bli bevæpnet ved uhell — eller stå
stille når du tror den er bevæpnet.

## Det som gjenstår før dette kan handle med ekte penger

Rammeverket er komplett og testet, men tre grensesnitt er definert og ikke
implementert, fordi de krever legitimasjon og valg jeg ikke skal ta for deg:

1. **`Henter`** — faktisk HTTP mot eBay/X. Grensesnittet er ~5 linjer; all
   kvote-, cache- og feilhåndtering ligger ferdig bak det.
2. **`Simulator`** — `eth_call`/bundle-simulering mot din RPC. Livvakten nekter
   å godkjenne noe uten et svar her.
3. **`Eksekutor`** (agent 7) — signering via KMS/HSM og innsending til det
   private endepunktet.

Gassgrenser må komme fra faktisk `eth_estimateGas`, ikke konstanter, og
kvotetallene i `kilder.ts` bør leses fra kildenes egne analytics-API-er før
drift. Satsene i `gebyrer.ts` skal overstyres med dine faktiske satser —
nivåbaserte børsrabatter gjør generiske tall feil i begge retninger.
