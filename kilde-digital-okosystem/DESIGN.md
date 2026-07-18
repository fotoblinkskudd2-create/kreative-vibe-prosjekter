# KILDE — Et digitalt økosystem for helse, læring og meningsfull interaksjon

> *«Teknologi skal tjene mennesker — ikke manipulere dem.»*

**Kilde** kombinerer de beste aspektene fra Facebook, Snapchat, TikTok, Wikipedia og YouTube i én plattform, men snur den grunnleggende forretningslogikken på hodet: suksessmetrikken er ikke tid brukt i appen, men **personlig vekst per minutt**. Navnet spiller på dobbeltbetydningen: en *kilde* til kunnskap, og en *kilde* med rent vann — noe som gir næring, ikke avhengighet.

---

## 1. SYSTEMARKITEKTUR

### 1.1 Hovedkomponenter

```
┌─────────────────────────────────────────────────────────────────┐
│                        KILDE-PLATTFORMEN                        │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐   │
│  │  LÆR      │  │  KRETS    │  │  GNIST    │  │  ØYEBLIKK   │   │
│  │ (kunnskap)│  │ (sosialt) │  │ (kreativt)│  │ (efemert)   │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘   │
│        │              │              │               │          │
│  ┌─────┴──────────────┴──────────────┴───────────────┴──────┐   │
│  │              BALANSE-LAGET (velvære-motor)               │   │
│  │   pauser · skjermtid · fokusmodus · humørsjekk · søvn    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │            ÅPEN ALGORITME-MOTOR (brukerstyrt)            │   │
│  │  regelbasert feed · synlige vekter · «hvorfor ser jeg    │   │
│  │  dette?» på alt innhold · ingen skjult optimalisering    │   │
│  └──────────────────────────┬───────────────────────────────┘   │
│                             │                                   │
│  ┌──────────────────────────┴───────────────────────────────┐   │
│  │              TILLITSLAGET (kvalitet + personvern)        │   │
│  │  ekspertverifisering · faktasjekk · kildekrav ·          │   │
│  │  lokal datalagring · null tredjeparts sporing            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**De fire modulene:**

| Modul | Inspirert av | Hva den gjør | Hva den bevisst IKKE gjør |
|-------|-------------|--------------|---------------------------|
| **LÆR** | Wikipedia + YouTube | Strukturerte læringsstier med tekst, video og øvelser. Alt ekspertverifisert. | Ingen autoplay, ingen «anbefalt for deg»-kaninhull |
| **KRETS** | Facebook | Små, lukkede grupper (maks 150 personer) for ekte relasjoner | Ingen offentlig «vegg», ingen likes-tellere, ingen algoritmefeed |
| **GNIST** | TikTok | Korte kreative videoer (15–90 sek) sortert etter tema, ikke engasjement | Ingen infinite scroll, ingen trending-press, ingen visningstall |
| **ØYEBLIKK** | Snapchat | Midlertidig deling (24 t) med nære venner. Slettes permanent — også fra serverne | Ingen streaks, ingen «hvem så deg»-angst, ingen skjermbilde-spill |

**Tverrgående lag:**

- **Balanse-laget** ligger *mellom* brukeren og modulene — hver eneste økt går gjennom det. Det håndhever pauser, skjermtidsbudsjett og fokusmoduser, og kan ikke «kjøpes bort».
- **Åpen algoritme-motor:** All sortering av innhold skjer etter regler brukeren selv kan lese, endre og nullstille. Hvert innholdskort har en «Hvorfor ser jeg dette?»-knapp som viser den eksakte regelen.
- **Tillitslaget:** Verifiseringspipeline for LÆR-innhold, faktasjekk-flagg for delt innhold, og et personvernfundament der rådata aldri forlater brukerens enhet uten eksplisitt samtykke.

### 1.2 Dataflyt

```
BRUKER
  │
  ▼
[Lokal enhet] ── interesseprofil, historikk, humørdata lagres LOKALT (kryptert)
  │
  │  kun: eksplisitte valg (abonnementer, mål, publiseringer)
  ▼
[Kilde-server] ── innholdsbibliotek, gruppemeldinger (E2E-kryptert), læringsstier
  │
  ▼
[Tillitslaget] ── verifisering FØR publisering i LÆR, faktasjekk-kø for GNIST
  │
  ▼
[Åpen algoritme-motor] ── sorterer etter BRUKERENS regler, ikke serverens mål
  │
  ▼
[Balanse-laget] ── porsjonerer ut innhold i avgrensede «økter», håndhever pauser
  │
  ▼
BRUKER (får en avsluttbar, ferdig-følelse — ikke en endeløs strøm)
```

Nøkkelprinsippet i dataflyten: **profildata flyter aldri oppover.** Serveren vet hva du abonnerer på — ikke hva du nøler over, hvor lenge du ser på noe, eller når på døgnet du er mest sårbar. Det er nettopp dén dataen dagens plattformer bruker til manipulasjon, så Kilde samler den rett og slett ikke inn sentralt. Interessemodellen bor på din enhet og kan slettes med ett trykk.

### 1.3 Hvordan modulene integreres

- **LÆR → GNIST:** Fullfører du en læringssti, inviteres du til å lage en 60-sekunders «lær det videre»-video. Kunnskap konsumeres ikke bare — den videreformidles.
- **GNIST → LÆR:** Hver kreative video kan lenke til læringsstien bak («Vil du lære dette selv? 12 min intro»). Inspirasjon får alltid en vei til fordypning.
- **KRETS → LÆR:** Grupper kan starte felles læringsstier («Vi fem lærer spansk sammen») med delt fremdrift og ukentlige møtepunkter.
- **ØYEBLIKK → KRETS:** Efemert innhold deles kun innenfor kretsene dine — det finnes ikke noe «offentlig story»-begrep.
- **Balanse-laget → alt:** Vekstjournalen (se 4.5) samler trådene: hva du lærte, hvem du snakket med, hva du skapte — og viser det som en ukentlig fortelling, ikke som tall.

---

## 2. DESIGN-VISUALISERING

### 2.1 Hjemmeskjerm — «Dagens kilde»

Det første du ser er **ikke en feed**. Det er et rolig oversiktskort som kan leses ferdig på 20 sekunder:

```
┌─────────────────────────────────────┐
│  God morgen, Nora          ☀ 07:42  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  DAGENS KILDE                 │  │
│  │  «Du er 2 økter unna å        │  │
│  │  fullføre Python: Løkker»     │  │
│  │  [ Fortsett (12 min) ]        │  │
│  └───────────────────────────────┘  │
│                                     │
│  DINE KRETSER                       │
│  ● Vennegjengen — 3 nye øyeblikk    │
│  ● Fotoklubben — Jonas spurte deg   │
│                                     │
│  KREATIV GNIST (valgfritt)          │
│  ▶ 5 nye videoer i «Akvarell»       │
│    — en avgrenset bunke, ikke       │
│      en strøm                       │
│                                     │
│  ⏳ Skjermtid i dag: 0 av 45 min    │
│  ⚙ Endre hva denne skjermen viser   │
└─────────────────────────────────────┘
```

**Designvalg:** Hjemmeskjermen har en *slutt*. Alt på den er noe brukeren selv har valgt å følge. Ingenting blinker, ingen røde badges med tall — kretser med aktivitet markeres med en rolig prikk. Nederst står alltid dagens skjermtidsbudsjett (som brukeren selv har satt) og en synlig inngang til å omkonfigurere hele skjermen.

### 2.2 Læringsmodulen — LÆR

```
┌─────────────────────────────────────┐
│  LÆR › Python for nybegynnere       │
│                                     │
│  Fremdrift  ██████████░░░░░  62 %   │
│                                     │
│  STIEN DIN                          │
│  ✓ 1. Hva er programmering?         │
│  ✓ 2. Variabler og typer            │
│  ✓ 3. Betingelser                   │
│  ▶ 4. Løkker            (12 min)    │
│     ├ 📄 Konsept (Wikipedia-stil)   │
│     ├ ▶ Video: «Løkker forklart»    │
│     │    av Kari Nes ✔ verifisert   │
│     ├ ⌨ Øvelse: skriv din første    │
│     │    for-løkke (i appen)        │
│     └ 💬 Still spørsmål til         │
│          læringskretsen             │
│  ○ 5. Funksjoner                    │
│  ○ 6. Miniprosjekt: Gjettespill     │
│                                     │
│  ✔ Verifisert av 3 fageksperter     │
│    Sist revidert: mai 2026 [vis]    │
└─────────────────────────────────────┘
```

Hver leksjon er en *trippel*: **konsepttekst** (kollaborativt redigert og ekspertlåst, à la Wikipedia), **video** (produsert av verifiserte formidlere, à la YouTubes beste lærere) og **praktisk øvelse**. Videoer har aldri autoplay til neste video — etter én video kommer øvelsen, fordi kunnskap fester seg gjennom bruk, ikke gjennom passiv titting.

### 2.3 Sosial feed — KRETS (redesignet)

```
┌─────────────────────────────────────┐
│  KRETS › Vennegjengen (8 personer)  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Jonas · i går kveld           │  │
│  │ «Endelig ferdig med eksamen!  │  │
│  │  Hvem blir med på tur lørdag?»│  │
│  │                               │  │
│  │ 💬 4 svar   [Svar]  [Foreslå  │  │
│  │              tidspunkt]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Sara · i dag 09:12            │  │
│  │ 📷 [bilde: soloppgang]        │  │
│  │ «Morgentur før jobb»          │  │
│  │                               │  │
│  │ 💬 Svar (ingen like-teller)   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ── Du er à jour! ──────────────    │
│     Ingenting mer å se her. 🌿      │
│                                     │
│  [ ✎ Del noe med kretsen ]          │
└─────────────────────────────────────┘
```

**De tre store endringene fra Facebook:**
1. **Kronologisk og endelig.** Feeden er sortert etter tid, viser bare innhold fra kretsens medlemmer, og slutter med en eksplisitt «Du er à jour»-markør.
2. **Ingen offentlige tellere.** Du kan svare på et innlegg, men det finnes ingen like-teller å sammenligne seg med. Reaksjoner («Dette gledet meg» ❤) sendes privat til avsenderen.
3. **Handlingsknapper fremfor engasjementsknapper.** «Foreslå tidspunkt», «Bli med», «Ring» — feeden er designet for å flytte interaksjon *ut* av skjermen og inn i virkeligheten.

### 2.4 Innholdspublisering

```
┌─────────────────────────────────────┐
│  DEL NOE                            │
│                                     │
│  Hva vil du dele?                   │
│  ┌─────────┐ ┌─────────┐            │
│  │ ØYEBLIKK│ │  KRETS- │            │
│  │ (borte  │ │ INNLEGG │            │
│  │ om 24t) │ │ (varig) │            │
│  └─────────┘ └─────────┘            │
│  ┌─────────┐ ┌─────────┐            │
│  │  GNIST- │ │  LÆR-   │            │
│  │  VIDEO  │ │ BIDRAG  │            │
│  │(offent.)│ │(til rev.)│           │
│  └─────────┘ └─────────┘            │
│                                     │
│  Valgt: GNIST-VIDEO                 │
│  Tema: [Akvarell ▾]  (påkrevd)      │
│  Synlighet: [Alle ▾ / Kretser]      │
│                                     │
│  ⓘ Gnist-videoer vises i tema-      │
│    bunker, aldri i en rangert       │
│    strøm. Du får se svar og         │
│    kommentarer — men ingen          │
│    visningstall. Skaperglede > tall.│
│                                     │
│  [ 🎥 Spill inn ]  [ Avbryt ]       │
└─────────────────────────────────────┘
```

Publiseringsflyten tvinger frem ett bevisst valg: *hvor lenge skal dette leve, og hvem er det for?* Efemert, varig-privat, offentlig-kreativt eller kunnskapsbidrag — fire tydelige kontrakter. GNIST-videoer må tagges med tema (det er slik de blir funnet — via utforsking, ikke via algoritme), og skaperen ser aldri visningstall, kun faktiske svar fra faktiske mennesker.

---

## 3. BRUKERREISE-SIMULERING

**Møt Nora (24), sykepleierstudent.** Mål hun har satt i Kilde: *lære grunnleggende Python*, *holde kontakt med vennegjengen fra hjembyen*, *male mer akvarell*. Skjermtidsbudsjett hun selv har valgt: 45 min/dag.

### Morgen (07:40 — 12 minutter)

Nora åpner Kilde over frokosten. Hjemmeskjermen viser «Dagens kilde»: *Fortsett Python: Løkker (12 min)*. Hun trykker, leser konseptteksten om for-løkker (3 min), ser Kari Nes' verifiserte video (4 min), og løser øvelsen direkte i appen: en løkke som skriver ut medisindoser per pasient — LÆR har tilpasset eksemplene til helsefag-interessen hun oppga.

Når øvelsen er godkjent, viser appen: *«Godt jobbet! Neste leksjon låses opp i kveld — hjernen din lærer bedre med pauser.»* **Ingen mulighet til å binge.** Spaced repetition er innebygd i selve tilgangen. Nora legger fra seg telefonen med en følelse av å være *ferdig* — 12 minutter brukt.

### Middag (12:15 — 8 minutter)

I lunsjpausen sjekker Nora Vennegjengen-kretsen. Tre nye øyeblikk: Sara har delt et soloppgangsbilde, Jonas et videoklipp fra lesesalen. Hun ser dem (de forsvinner i morgen — ingen grunn til å kuratere eller prestere), sender en privat «Dette gledet meg»-reaksjon til Sara, og svarer på Jonas' turplan med «Foreslå tidspunkt»-knappen: lørdag kl. 11. Appen oppretter en felles avtale i kretsen.

Feeden når «Du er à jour» etter åtte innlegg. Det finnes bokstavelig talt ikke mer å scrolle. Nora legger bort telefonen og spiser lunsj med kollegene.

### Kveld (20:30 — 25 minutter)

Nora åpner GNIST og går til temaet «Akvarell» — som hun følger aktivt (ingenting annet dukker opp). Der ligger dagens *bunke*: 5 nye videoer, håndsortert av temaets frivillige kuratorer. En video om våt-i-vått-teknikk inspirerer henne; hun trykker «Vil du lære dette selv?» og legger 12-minutterskurset i morgendagens kø.

Så maler hun i 20 minutter — *med telefonen i lomma* — og spiller til slutt inn en egen 45-sekunders gnist av resultatet, tagget «Akvarell». Ingen visningstall venter henne, men neste morgen ligger det to hyggelige svar fra andre i temaet.

Kl. 21:00 dukker Balanse-laget opp: *«Du har brukt 43 av 45 minutter i dag, og leggetiden din nærmer seg. Vil du avslutte med kveldsoppsummeringen?»* Nora ser vekstjournalen: **Lærte:** løkker i Python. **Koblet:** lørdagstur avtalt. **Skapte:** én akvarell + én gnist. Så tones appen ned til gråskala og låser seg til kl. 07 — en grense Nora selv satte, og som appen hjelper henne å holde.

**Totalt: 45 minutter, tre mål støttet, null doomscrolling.**

---

## 4. FORKLARINGER — hvorfor hver komponent er som den er

### 4.1 Hjemmeskjerm uten feed

- **Hvorfor:** Det første skjermbildet setter tonen for hele økten. En feed sier «konsumér»; et oversiktskort sier «hva kom du hit for?».
- **Positiv atferd:** Brukeren starter alltid med sine egne mål øverst, og hver økt har en naturlig slutt.
- **Skadelig mønster fjernet:** *Variable rewards ved app-åpning* — dagens plattformer gir en ny, uforutsigbar feed hver gang du åpner appen, som en spilleautomat. Kilde gir deg det samme rolige kortet.

### 4.2 LÆR: ekspertverifisering + øvelsesplikt + spaced access

- **Hvorfor:** Wikipedia beviste at kollaborativ kunnskap fungerer; YouTube beviste at video underviser bedre enn tekst alene. Men ingen av dem sikrer at du faktisk *lærer*. Trippelen konsept→video→øvelse gjør konsum om til mestring.
- **Positiv atferd:** Fullført læring belønnes med *kompetanse* (øvelser bestått, prosjekter bygget) — ikke med poeng eller streaks som skaper prestasjonsangst.
- **Skadelig mønster fjernet:** *Autoplay-kaninhullet.* Én video fører aldri automatisk til neste. Og feilinformasjon stoppes før publisering: LÆR-bidrag går gjennom fagfellevurdering av verifiserte eksperter (vist med navn og revisjonsdato på hver side).

### 4.3 KRETS: maks 150, kronologisk, uten tellere

- **Hvorfor:** Dunbars tall (~150) er grensen for meningsfulle relasjoner. Facebook skalerte «venner» til tusenvis og måtte derfor bruke algoritmer for å velge for deg — og algoritmer optimert på engasjement velger alltid det mest opprivende. Små kretser trenger ingen algoritme i det hele tatt.
- **Positiv atferd:** Private reaksjoner og handlingsknapper («Foreslå tidspunkt», «Ring») flytter relasjonen mot ekte kontakt.
- **Skadelig mønster fjernet:** *Sosial sammenligning og statusjag.* Uten offentlige like-tellere finnes det ingen popularitetskonkurranse å tape. Uten offentlig profilvegg finnes det ingen fasade å vedlikeholde.

### 4.4 GNIST: temabunker i stedet for strøm

- **Hvorfor:** TikToks format (kort video) er genialt for kreativitet — det er *leveringsmekanismen* (engasjementsrangert infinite scroll) som skader. Kilde beholder formatet og bytter mekanismen: videoer bor i temaer du aktivt følger, leveres i endelige daglige bunker, og sorteres av menneskelige kuratorer + kronologi.
- **Positiv atferd:** Skjulte visningstall gjør at folk skaper for gleden og fellesskapet, ikke for tallene. «Lær dette selv»-lenken gjør inspirasjon til handling.
- **Skadelig mønster fjernet:** *Infinite scroll og trending-tyranni.* Ingen strøm som aldri tar slutt, ingen «For You»-side som lærer seg dine svakheter, ingen viral-jackpot som lokker til stadig mer ekstremt innhold.

### 4.5 ØYEBLIKK + Balanse-laget: efemert innhold og håndhevet balanse

- **Hvorfor (Øyeblikk):** Snapchats kjerneinnsikt var riktig — ikke alt fortjener et arkiv. Midlertidighet senker terskelen for ekthet. Men Snapchat koblet det til streaks og «hvem så deg»-mekanikker som skaper tvang. Kilde sletter innholdet *på ordentlig* (også serverside, kryptografisk verifiserbart) og dropper all metamekanikk.
- **Hvorfor (Balanse):** Viljestyrke er en begrenset ressurs, og det er urimelig å be brukere «bare legge fra seg telefonen» mens milliardindustri jobber mot dem. Kilde legger derfor grensene *i systemet*: brukerstyrt skjermtidsbudsjett, obligatoriske mikropauser hvert 20. minutt (øyne, nakke, pust), fokusmodus som stenger alt unntatt LÆR, og nattmodus med gråskala og applås.
- **Positiv atferd:** Vekstjournalen reframer hele forholdet til appen — suksess måles i *hva du lærte, hvem du møtte, hva du skapte*, aldri i tid brukt.
- **Skadelig mønster fjernet:** *Streaks, FOMO-mekanikk og søvntyveri.* Ingen straff for fravær — logger du av en uke, sier appen «Velkommen tilbake» uten tapte poeng, brutte streaks eller 47 røde varsler.

### 4.6 Åpen algoritme + personvern som fundament

- **Hvorfor:** Manipulasjon krever to ting: hemmelige algoritmer og intim atferdsdata. Kilde fjerner begge. Sorteringsreglene er lesbare og redigerbare («Vis nyeste først», «Prioriter læringskretser», vekter du selv drar i), og atferdsdata (nøling, visningstid, døgnrytme) samles aldri inn sentralt.
- **Positiv atferd:** «Hvorfor ser jeg dette?»-knappen på alt innhold bygger algoritmisk dannelse — brukerne *forstår* systemet de bruker.
- **Skadelig mønster fjernet:** *Overvåkningsbasert persuasjon.* Ingen annonseprofiler, ingen tredjeparts sporing, ingen mørke mønstre i samtykkeflyt. Forretningsmodellen er abonnement (med gratis LÆR-tilgang finansiert som allmennyttig stiftelse) — brukeren er kunden, aldri produktet.

---

## 5. DE TRE SCENARIOENE

### Scenario 1: En 16-åring vil lære programmering

Emma (16) søker «programmering» i LÆR. Hun får ikke 4 millioner videoer — hun får **tre kuraterte startstier**: *Python for nybegynnere*, *Lag din første nettside*, *Spillprogrammering med Scratch → Godot*. Hver sti viser tidsestimat, forkunnskapskrav og hvem som har verifisert den.

Hun velger Python-stien. Systemet spør om interessene hennes (musikk, gaming) og vinkler øvelsene deretter — første prosjekt blir en spilleliste-sorterer. Fremdriften er synlig som en sti, ikke som poeng. Når hun står fast på leksjon 3, viser «Still spørsmål»-knappen henne læringskretsen for stien — et modererat rom der andre elever og to frivillige mentorer svarer (aldersgruppe-adskilt, med voksenmoderatorer for mindreårige).

Etter fullført sti inviteres hun til å lage en «lær det videre»-gnist — og til den neste stien i progresjonen. Fordi hun er under 18, er skjermtidsbudsjettet foreldre-samstyrt, nattlåsen obligatorisk, og GNIST-temaene hennes kuratert med strengere innholdskrav.

### Scenario 2: En vennegjeng vil dele dagligdagse øyeblikk

Åtte venner oppretter kretsen «Gjengen». Hverdagen deres i Kilde: efemere øyeblikk (kaffekopper, buss-selfies, eksamensskrik) som forsvinner etter 24 timer og aldri trenger å være imponerende, pluss varige krets-innlegg for det som faktisk skal huskes (bursdagsbilder, turplaner).

Det som *ikke* finnes: ingen algoritme som bestemmer hvem som ser hva (alle ser alt, kronologisk), ingen like-tellere som gjør delingen til en konkurranse, ingen «sist aktiv»-status som skaper svarpress, ingen streaks som gjør vennskap til en forpliktelse. Når Jonas foreslår lørdagstur, konvergerer tråden i en felles avtale med «Bli med»-knapp — og appen foreslår: *«7 av 8 blir med. Vil dere gjøre kretsen stille under turen?»* Systemet heier på at de legger den bort.

### Scenario 3: En person med angst bruker plattformen

Amir (29) har sosial angst og oppgir ved oppsett at han vil ha «skånsom modus». Kilde tilpasser seg:

- **Ingen sosiale speil:** Lesebekreftelser, «skriver …»-indikatorer og aktivstatus er avslått som standard — for alle, men i skånsom modus kan de ikke engang slås på av andre overfor ham.
- **Forutsigbarhet:** Varsler leveres i én daglig, planlagt bunt (han velger kl. 17) i stedet for uforutsigbare avbrudd som trigger uro.
- **Humørsjekk med handling:** Balanse-laget spør (valgfritt) «Hvordan har du det?» ved øktstart. Svarer han «urolig», foreslår appen en 3-minutters pusteøvelse eller en LÆR-mikroleksjon om angstmestring — verifisert av psykologer, med tydelig merking: *«Dette er læringsinnhold, ikke helsehjelp»* — og en alltid synlig snarvei til reelle hjelpetjenester (Mental Helse 116 123).
- **Trygg sosial rampe:** Læringskretser lar ham delta skriftlig, i eget tempo, rundt et tema (han følger «Sjakk») — sosial kontakt med lav eksponering. Ingen algoritme dytter ham mot mer «engasjerende» (les: opprivende) innhold når han er sårbar, for algoritmen vet ikke, og bryr seg ikke om, når han er sårbar.
- **Aldri utnyttet:** Der dagens plattformer *tjener* på angst (uro → mer scrolling → flere annonser), har Kilde bokstavelig talt ingen mekanisme som profitterer på at Amir har en dårlig dag.

---

## 6. OPPSUMMERING — prinsippene bak alt

1. **Alt har en slutt.** Feeder, bunker og økter er endelige. «Du er à jour» er en designet følelse.
2. **Brukeren styrer algoritmen.** Synlige, redigerbare regler. «Hvorfor ser jeg dette?» på alt.
3. **Vekst er metrikken.** Lært, koblet, skapt — aldri minutter, visninger eller likes.
4. **Friksjon er en funksjon.** Bevisste valg ved publisering, pauser mellom leksjoner, nattlås.
5. **Data blir hjemme.** Atferdsdata lagres lokalt; serveren vet minst mulig.
6. **Kunnskap er verifisert.** Eksperter med navn og dato står bak alt læringsinnhold.
7. **Ut av skjermen.** De beste funksjonene («Foreslå tidspunkt», «gjør kretsen stille på tur») hjelper folk å *forlate* appen sammen.

> Kilde beviser at det ikke er *funksjonene* til Facebook, Snapchat, TikTok, Wikipedia og YouTube som skader — det er *insentivene*. Bytt engasjement mot vekst som mål, og de samme byggeklossene bygger noe som gjør folk klokere, nærere og friskere.
