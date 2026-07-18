# LÆRINGSPULS — Komplett design for et dopamindrevet lærings- og utviklingssystem

> Et lærings- og utviklingssystem som kombinerer de mest engasjerende mekanismene fra
> TikTok, Snapchat og Instagram med vitenskapelige prinsipper for læring og motivasjon.
> Bygget på fem kjerneprinsipper: **Fort, Gæler, Gøy, Smart og Intelligent.**

---

## 1. Executive Summary

Sosiale medier har løst et problem utdanningssektoren har slitt med i hundre år: å få
mennesker til å komme tilbake frivillig, hver dag, uten tvang. TikTok holder på
oppmerksomheten i gjennomsnitt 90+ minutter daglig — ikke fordi innholdet er viktig, men
fordi leveringsmekanismen er perfeksjonert rundt hjernens belønningssystem.

**Læringspuls** snur dette på hodet: Vi beholder leveringsmekanismen, men bytter ut
innholdet. Resultatet er en plattform der læring *føles* som scrolling, men *virker* som
strukturert undervisning.

Systemet bygger på fem prinsipper:

| Prinsipp | Hva det betyr | Lånt fra | Vitenskapelig forankring |
|---|---|---|---|
| **Fort** | Rask tilbakemelding, korte interaksjoner | TikTok (swipe-feed) | Operant betinging, umiddelbar forsterkning |
| **Gæler** | Følelsesmessig resonans og relevans | Snapchat (nærhet, streaks) | Emosjonell koding styrker hukommelse (amygdala–hippocampus) |
| **Gøy** | Underholdning og lystbetont læring | Instagram (estetikk, Reels) | Indre motivasjon, flow-teori (Csíkszentmihályi) |
| **Smart** | Intellektuell stimulering og reell læring | — (vår kjerne) | Spaced repetition, retrieval practice, interleaving |
| **Intelligent** | Adaptiv og personalisert progresjon | TikTok (For You-algoritmen) | Vygotskys nærmeste utviklingssone, mestringslæring |

**Nøkkelinnsikt:** Dopamin utløses ikke av belønningen selv, men av *forventningen* om
belønning — spesielt når den er variabel og uforutsigbar. Sosiale medier utnytter dette
med uendelig scrolling og variable «likes». Læringspuls bruker samme mekanisme, men
kobler forventningen til *mestring*: neste kort i feeden kan være en aha-opplevelse, en
utfordring du så vidt klarer, eller en venn som slo rekorden din.

**Etisk grunnmur:** Der sosiale medier optimaliserer for tid brukt, optimaliserer
Læringspuls for *læring per minutt*. Alle engasjementsmekanismer måles mot faktisk
kunnskapsvekst — engasjement uten læring regnes som feil, ikke suksess.

---

## 2. Systemarkitektur

### 2.1 Overordnet arkitektur (ASCII)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        KLIENTLAG (iOS / Android / Web)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Lærings- │ │  Streak- │ │ Sosial   │ │ Skaper-  │ │ Profil & │  │
│  │ feed     │ │  senter  │ │ sone     │ │ studio   │ │ progresjon│ │
│  │ (TikTok) │ │(Snapchat)│ │(IG/Snap) │ │ (TikTok) │ │(IG-grid) │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
└───────┼────────────┼────────────┼────────────┼────────────┼────────┘
        │            │      API-gateway (GraphQL + WebSocket)         
┌───────┴────────────┴────────────┴────────────┴────────────┴────────┐
│                          TJENESTELAG                                │
│ ┌─────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │ Anbefalings-│ │ Lærings-     │ │ Gamifiserings-│ │ Sosial-     │ │
│ │ motor       │ │ motor        │ │ motor         │ │ graf        │ │
│ │ "For Deg"   │ │ (spaced rep.,│ │ (XP, streaks, │ │ (venner,    │ │
│ │ -algoritme  │ │  mestringskart)│  ligaer, quests)│ │ grupper)   │ │
│ └──────┬──────┘ └──────┬───────┘ └──────┬────────┘ └──────┬──────┘ │
│        └───────────────┴───── Hendelsesbuss ───┴──────────┘        │
│ ┌─────────────┐ ┌──────────────┐ ┌───────────────┐ ┌─────────────┐ │
│ │ Innholds-   │ │ AI-tutor     │ │ Notifikasjons-│ │ Analyse &   │ │
│ │ tjeneste    │ │ (LLM-basert) │ │ orkestrator   │ │ læringsspor │ │
│ └─────────────┘ └──────────────┘ └───────────────┘ └─────────────┘ │
└────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────┐
│                            DATALAG                                  │
│  Brukergraf │ Kunnskapsgraf │ Hendelsesstrøm │ Video/CDN │ ML-features│
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Kjernekomponenter og deres funksjoner

1. **Læringsfeeden («Pulsen»)** — hjertet i systemet. En vertikal, fullskjerms feed à la
   TikTok der hvert «kort» er en læringsenhet på 15–90 sekunder: mikrovideo, quiz,
   flashkort, kodeutfordring eller diskusjonsspørsmål. Swipe opp = neste. Swipe høyre =
   lagre. Hold inne = «forklar dypere» (AI-tutor ekspanderer).

2. **Anbefalingsmotoren («For Deg-læring»)** — TikToks viktigste innovasjon, gjenbrukt:
   en algoritme som lærer hva du kan, hva du sliter med, og hva som holder deg engasjert.
   Forskjellen: den optimaliserer en *tovariabel* funksjon — engasjement × læringseffekt —
   ikke bare visningstid.

3. **Læringsmotoren** — den pedagogiske hjernen. Holder en kunnskapsgraf per bruker
   (hvilke konsepter er mestret, på vei, glemt) og styrer spaced repetition (SM-2/FSRS-
   algoritme), interleaving og vanskelighetsgrad.

4. **Gamifiseringsmotoren** — XP, nivåer, streaks, ligaer, quests, badges og
   overraskelsesbelønninger. Alle regler er sentralisert her slik at balansering kan
   justeres uten app-oppdatering.

5. **Sosialgrafen** — venner, studygrupper, klasser, mentorer. Driver streaks-med-venner,
   duellmodus og delte mål.

6. **AI-tutoren («Puls»)** — en LLM-basert veileder tilgjengelig fra ethvert kort:
   forklarer på nytt med annen vinkling, lager analogier tilpasset dine interesser,
   genererer nye øvingsoppgaver on-demand.

7. **Skaperstudioet** — lar lærere, eksperter og viderekomne elever lage læringskort med
   TikTok-enkle verktøy (maler, teleprompter, auto-teksting, quiz-bygger). Innhold
   kvalitetssikres via fagfellevurdering + AI-faktasjekk før det når feeden.

8. **Notifikasjonsorkestratoren** — bestemmer *når* og *hva* som sendes av push-varsler,
   basert på brukerens optimale læringstidspunkt og glemmekurve (ikke bare «kom tilbake!»).

### 2.3 Slik integreres elementene fra de tre plattformene

| Kilde | Mekanisme | Vår implementering |
|---|---|---|
| **TikTok** | Vertikal fullskjerms-feed, swipe | Læringsfeeden — én læringsenhet per skjerm |
| **TikTok** | For You-algoritmen | For Deg-læring: engasjement × læringseffekt |
| **TikTok** | Duetter/remixer | «Forklar videre»: elever bygger på andres forklaringer |
| **TikTok** | Lyd/trender | Læringstrender: ukens utfordring («Forklar fotosyntese på 30 sek») |
| **Snapchat** | Streaks | Læringsstreaks — individuelle OG parvise (du + venn må begge fullføre) |
| **Snapchat** | Flyktighet | «Dagens drops»: eksklusive bonusleksjoner som forsvinner ved midnatt |
| **Snapchat** | Bitmoji/AR | Lærings-avatar som utvikler seg visuelt med kunnskapen din; AR-labber |
| **Snapchat** | Nære venner-fokus | Små studygrupper (3–8) fremfor offentlige følgertall |
| **Instagram** | Profil-grid | Kunnskapsportefølje: visuelt rutenett av mestrede emner og prosjekter |
| **Instagram** | Stories | Læringsstories: del dagens fremgang, quiz vennene dine |
| **Instagram** | Estetikk/kuratering | Vakre, samlebare kunnskapskort; temasamlinger («boards») |
| **Instagram** | Utforsk-side | Utforsk fag: visuell inngang til nye fagfelt |

### 2.4 Teknologistakk

- **Klient:** React Native (iOS/Android) + Next.js (web). Delt designsystem.
  Videoavspilling med forhåndsbufring av neste 3 kort (kritisk for «Fort»).
- **API:** GraphQL for spørringer, WebSocket for sanntid (dueller, live-quiz, streaks).
- **Backend:** Node.js/TypeScript-mikrotjenester + Python for ML-tjenester.
  Hendelsesdrevet arkitektur (Kafka) — hver interaksjon er en hendelse som mater både
  gamifisering, anbefaling og analyse.
- **AI/ML:** LLM-API (Claude) for AI-tutor og innholdsgenerering; egen
  rankingmodell (two-tower + reranker) for feeden; FSRS for spaced repetition.
- **Data:** PostgreSQL (kjerne), Redis (streaks/leaderboards i sanntid), ClickHouse
  (hendelsesanalyse), Neo4j eller Postgres-graf (kunnskapsgraf), S3+CDN (video).
- **Infra:** Kubernetes, multi-region CDN med edge-caching av video, feature flags
  (LaunchDarkly-type) for kontinuerlig eksperimentering.

### 2.5 Brukerflyt fra onboarding til avansert bruk

```
Nedlasting → 60-sek onboarding → Første feed-økt (dag 1)
   → Streak etableres (dag 2–7) → Venner inviteres (uke 1–2)
      → Første liga & studygruppe (uke 2–4) → Kunnskapsportefølje vokser (mnd 1–3)
         → Skapermodus låses opp (mestringsnivå) → Mentor/bidragsyter (mnd 3+)
```

Detaljer i seksjon 5 (Brukeropplevelse).

---

## 3. Dopamin-motivasjonsdesign

Dopaminsystemet responderer sterkest på tre ting: **umiddelbarhet**, **variabilitet** og
**sosial validering**. Hvert av de fem prinsippene er designet rundt dette — men alltid
koblet til reell læring.

### 3.1 FORT — øyeblikkelig tilbakemelding og korte interaksjoner

Prinsipp: Avstanden mellom handling og respons skal være så nær null som mulig.
Hver interaksjon skal kunne fullføres på under 90 sekunder.

**Konkrete responstider (harde krav):**
- Svar på quiz → visuell + haptisk feedback på **< 100 ms** (grønn puls / rød risting).
- Neste kort i feeden → **0 ms opplevd** (forhåndsbufret; swipe er alltid momentan).
- XP-teller animeres **umiddelbart** ved fullført kort, ikke ved øktslutt.
- AI-tutor begynner å strømme svar innen **< 1 sekund** (streaming-respons).
- Riktig svar-rekke: hver riktig på rad øker en synlig «combo-multiplikator» i sanntid
  (x1 → x1.2 → x1.5 → x2) — lånt fra spillverdenen, samme mekanikk som gjør Tetris
  vanedannende.

**Notifikasjoner (eksempler):**
- «⚡ Kim svarte på duellen din — du har 2 timer på å slå 7/8!» (tidsavgrenset → urgency)
- «🔥 Streaken din på 12 dager ryker om 3 timer» (tapsaversjon — sterkere enn gevinst)
- «🧠 3 kort er i ferd med å glemmes — 90 sekunder redder dem» (glemmekurve-basert,
  ærlig og nyttig: varselet ER pedagogikken)
- Maks 2 push per dag, alltid med konkret, fullførbar handling på under 2 minutter.

**Mikroøkter:** Alt innhold er designet for «lomme-øyeblikk» — bussholdeplassen, køen,
reklamepausen. En full læringsøkt = 5–7 kort = 3–5 minutter. Fem slike per dag slår én
45-minutters økt på både retensjon (spacing-effekten) og gjennomføringsgrad.

### 3.2 GÆLER — følelsesmessig resonans og relevans

Prinsipp: Vi husker det vi *føler*. Emosjonelt ladet innhold kodes dypere (amygdala
forsterker hippocampus-konsolidering). Snapchats geni var å gjøre alt personlig og nært.

**Personalisering av innholdets *innpakning*:**
- Onboarding kartlegger interesser (gaming, fotball, musikk, mote...). AI-tutoren bruker
  dette aktivt: brøk forklares med spilletid-fordeling for gameren, med ballbesittelse
  for fotballspilleren. Samme pensum, personlig innpakning.
- Eksempler og oppgavetekster bruker navnet ditt, byen din, tingene du bryr deg om.

**Sosiale bånd som læringsdriver:**
- **Parvise streaks** (Snapchats sterkeste mekanisme): du og en venn holder streaken
  *sammen* — begge må fullføre dagens økt. Å svikte streaken = å svikte vennen.
  Gjensidig forpliktelse er dokumentert sterkere enn individuell.
- **Studygrupper (3–8 personer):** felles ukesmål, delt fremgangsbar, gruppe-chat med
  reaksjoner på hverandres milepæler.
- **Heiarop:** Når du fullfører noe vanskelig, får vennene dine mulighet til å sende en
  reaksjon (emoji + valgfri 5-sek video). Å *motta* sosial anerkjennelse for innsats er
  den mest presise dopaminutløseren vi kjenner.

**Identitet og stolthet:**
- Lærings-avataren («Kunnskapsvesenet») vokser og endrer utseende med det du lærer —
  lærer du astronomi får den stjernekart, lærer du biologi får den botaniske detaljer.
  Den blir et visuelt, delbart symbol på hvem du er i ferd med å bli.
- Kunnskapsporteføljen (IG-grid) gjør fremgang til noe estetisk du er stolt av å vise.

**Relevans-loop:** Hvert kort kan markeres «hvorfor lærer jeg dette?» — AI-en svarer med
en konkret kobling til *dine* mål («Du sa du vil bli spillutvikler — vektorer er
grunnlaget for all bevegelse i spill»). Opplevd relevans er blant de sterkeste
prediktorene for indre motivasjon (selvbestemmelsesteorien, Deci & Ryan).

### 3.3 GØY — underholdning og lystbetont læring

Prinsipp: Flow oppstår når utfordring møter ferdighet, og når aktiviteten er belønnende
i seg selv. Gøy er ikke pynt — det er leveringsmekanismen.

**Gamifiseringselementer (konkrete):**
- **XP og nivåer:** Alt gir XP, men vektet mot læringsverdi: nytt konsept mestret = 50 XP,
  repetisjon = 10 XP, hjelpe en annen = 30 XP. (Belønner det som virker, ikke det som er lett.)
- **Variable belønninger («lootbox light», uten betaling):** Etter fullført dagsmål
  ruller et «Kunnskapshjul»: kosmetikk til avataren, XP-boost, en «streak-frys»
  (forsikring mot å miste streak), eller et sjeldent «gullkort» (eksklusiv minileksjon
  med en kjent fagperson). Variabiliteten er dopaminmotoren; innholdet er alltid
  lærings- eller kosmetikk-relatert, aldri pay-to-win.
- **Ligaer (fra Duolingo, foredlet):** Ukentlige ligaer på 25 personer med opp/nedrykk.
  Rangering etter *læringspoeng* (mestring + konsistens), ikke rå tidsbruk.
- **Quests:** «Ukens ekspedisjon» — tematiske oppdrag («Romuka: fullfør 5 kort om
  verdensrommet, lås opp AR-solsystemet»).
- **Dueller:** Utfordre en venn i sanntids-quiz (beste av 8 spørsmål, 10 sek per
  spørsmål) — samme adrenalin som Kahoot, men i lomma.

**Underholdningsverdi i selve innholdet:**
- Skapere premieres for *retention + læringseffekt* — humor, cliffhangers («men så
  oppdaget forskerne noe rart — swipe»), og fortelling er eksplisitt del av
  skaperopplæringen. Kunnskap levert som historie huskes 6–7 ganger bedre enn fakta alene.
- **Læringstrender:** Ukentlige formater («Forklar det på 3 nivåer: 5-åring, tenåring,
  professor») som skapere og elever remixer — TikToks trendmekanikk i kunnskapsdrakt.

### 3.4 SMART — pedagogiske metoder og kunnskapsprogresjon

Prinsipp: Alt det ovennevnte er verdiløst hvis det ikke gir varig læring. Smart-laget er
de evidensbaserte metodene som kjører under panseret:

- **Retrieval practice:** Feeden er quiz-tung. Å *hente frem* kunnskap slår passiv
  gjenlesing med stor margin (Roediger & Karpicke). Minst 40 % av alle kort krever
  aktiv respons.
- **Spaced repetition (FSRS):** Læringsmotoren beregner glemmekurven per konsept per
  bruker og flettar repetisjonskort inn i feeden akkurat idet du er i ferd med å glemme
  («ønskelig vanskelighet»).
- **Interleaving:** Feeden blander bevisst relaterte temaer i stedet for blokklæring —
  føles vanskeligere, gir dypere læring.
- **Elaborativ læring:** «Hold inne»-gesten åpner AI-tutoren for «hvorfor?»-kjeder.
  «Forklar videre»-formatet (remix) tvinger elever til å formulere kunnskap selv —
  protégé-effekten: å undervise er den beste måten å lære på.
- **Kunnskapsgraf med forkunnskapskrav:** Hvert konsept har definerte forutsetninger.
  Systemet slipper deg ikke videre til algebra hvis brøk-noden er rød — men det pakker
  reparasjonen inn som «hurtig oppfriskning», aldri som nederlag.
- **Mestringsbasert progresjon:** Et konsept regnes mestret først ved korrekt gjenkalling
  på tre tidspunkter med økende avstand — ikke ved én riktig quiz.
- **Metakognisjon:** Ukentlig «Innsiktssøndag»: en vakker, delbar oppsummering (IG-stil)
  av hva du lærte, hva som var vanskelig, og hva hjernen din er klar for neste uke.

### 3.5 INTELLIGENT — adaptiv og personalisert progresjon

Prinsipp: TikToks For You-side er verdens mest effektive personaliseringsmaskin. Vår
versjon optimaliserer for læring i «den nærmeste utviklingssonen» (Vygotsky) — alltid
passe vanskelig.

**Signaler algoritmen lærer av:**
- Svarhistorikk (riktig/galt, svartid, nølemønstre)
- Engasjement (fullføringsgrad per kort, re-watch, lagring, «forklar dypere»-bruk)
- Tidsmønstre (når på døgnet lærer du best — måles, ikke antas)
- Frustrasjonssignaler (raske feilsvar på rad, økt-avbrudd midt i kort)

**Adaptive mekanismer:**
- **Dynamisk vanskelighet:** Målet er ~80 % suksessrate — nok mestring til motivasjon,
  nok motstand til læring. Tre feil på rad → automatisk innskutt «bro-kort» som
  reforklarer grunnlaget med ny vinkling.
- **Formatadaptasjon:** Lærer du best av video, tekst, eller interaktive oppgaver?
  Algoritmen A/B-tester på deg og vekter feeden deretter (målt på retensjon, ikke preferanse).
- **AI-generert innhold on-demand:** Når kunnskapsgrafen finner et hull det ikke finnes
  godt innhold for, genererer AI-tutoren skreddersydde oppgaver umiddelbart — med dine
  interesser som ramme.
- **Prediktiv intervensjon:** Modellen predikerer churn-risiko og lærings-platåer.
  Respons er ikke masete varsler, men innholdsgrep: et gullkort, en lettere økt, en
  duell-invitasjon fra en venn på samme nivå.
- **To-lags optimalisering (det etiske grepet):** Rankingmodellen maksimerer
  `engasjement × forventet læringseffekt`. Innhold som engasjerer uten å lære bort noe,
  demoteres — det motsatte av TikToks rene oppmerksomhetsoptimalisering.

---

## 4. Funksjoner og Features

### 4.1 Innholdsformater

| Format | Varighet | Beskrivelse |
|---|---|---|
| **Mikrovideo** | 15–60 sek | Kjerneformatet. Ett konsept, én hook, én forklaring, én cliffhanger |
| **Lynquiz** | 10–30 sek | 1–3 spørsmål med umiddelbar feedback og forklaring |
| **Flashkort** | 5–15 sek | Spaced repetition-kort, flettes automatisk inn i feeden |
| **Interaktiv sim** | 60–90 sek | Dra-og-slipp, kodeceller, grafer du manipulerer, AR-labber |
| **Historiekjeder** | 3–5 kort | Sammenhengende fortelling med cliffhangers mellom kortene |
| **Duell** | 90 sek | Sanntids 1v1-quiz mot venn eller jevnbyrdig fremmed |
| **Dagens drop** | 24 t levetid | Eksklusiv bonusleksjon (Snapchat-flyktighet) |
| **Gullkort** | Sjelden | Premium-minileksjon med kjent fagperson, vinnes via Kunnskapshjulet |
| **Forklar videre** | 30–60 sek | Remix-format: bygg din egen forklaring oppå en annens |

### 4.2 Sosiale og kollaborative funksjoner

- **Parvise streaks** og individuelle streaks med streak-frys (2 per måned gratis).
- **Studygrupper (3–8):** felles mål, delt fremdrift, gruppeutfordringer mot andre grupper.
- **Dueller og turneringer:** ukentlige fagturneringer med bracket-visning.
- **Læringsstories:** del milepæler; vennene kan svare med quizspørsmål tilbake.
- **Heiarop:** reaksjoner på venners gjennombrudd (kun positive reaksjoner finnes).
- **Mentorskap:** brukere med mestringsnivå kan bli fagfaddere; fadderarbeid gir XP og
  en egen badge-linje. (Protégé-effekten satt i system.)
- **Klasserom-modus:** lærere kan opprette klasser, tildele quests og se aggregert
  (ikke invaderende) fremdrift.

### 4.3 Progresjons- og belønningssystemer

- **XP → nivåer → opplåsing:** Skaperstudio låses opp på nivå 10, mentorrolle ved
  dokumentert mestring — status må *fortjenes* faglig.
- **Kunnskapsporteføljen:** IG-inspirert grid der hvert mestret emne blir en visuell
  flis; samlinger kan deles som «kunnskaps-CV» (eksporterbar — reell verdi utenfor appen).
- **Badge-linjer:** Konsistens (streaks), Dybde (mestring), Bredde (fagfelt),
  Fellesskap (hjelpe andre) — fire parallelle stiger så ulike personligheter har hver
  sin vei til status.
- **Kunnskapshjulet:** variabel belønning etter dagsmål (se 3.3).
- **Sesonger:** 6-ukers sesonger med tema, sesongpass-estetikk (gratis) og
  sesongavsluttende «Kunnskapsfestival» — live quiz-event for hele plattformen.

### 4.4 Analytics og læringssporing

**For eleven (synlig, motiverende):**
- Mestringskart: visuell kunnskapsgraf med grønne/gule/røde noder.
- Glemme-radar: «disse 4 konseptene trenger deg denne uken».
- Innsiktssøndag: ukentlig delbar oppsummering.

**For lærere/foreldre (med samtykke):**
- Aggregert fremdrift, tidsbruk, styrker/hull — aldri detaljert overvåking av feed-atferd.

**For plattformen:**
- Nordstjerne-metrikk: **Ukentlig Verifisert Læring (UVL)** — antall konsepter per bruker
  som beviselig gikk fra ukjent til mestret (tre-punkts gjenkalling) per uke.
- Guardrail-metrikker: tid-i-app skal *ikke* vokse raskere enn UVL (avhengighets-vakt),
  frustrasjonsrate < 15 %, andel passiv scrolling < 40 %.

### 4.5 Personalisering og anbefaling

Oppsummert fra 3.5: to-tower rankingmodell med reranker, optimalisert på
engasjement × læringseffekt; FSRS-basert repetisjonsfletting; interesse-basert
innpakning via AI; formatadaptasjon; prediktiv intervensjon. Brukeren kan alltid se
og justere «Hvorfor ser jeg dette?» (algoritme-transparens — tillitsbygger og
GDPR-vennlig).

---

## 5. Brukeropplevelse

### 5.1 Grensesnitt og navigasjon

Fem faner (gjenkjennelig fra alle tre inspirasjonskildene):

```
┌────────────────────────────────────┐
│        [ LÆRINGSFEED ]             │  ← Fullskjerm, vertikal swipe
│                                    │
│   ○ Fremdriftsring (øverst)        │  ← Dagens mål, alltid synlig
│   🔥 12  ⚡ x1.5  (diskret HUD)    │  ← Streak + combo
│                                    │
│   [kortinnhold]                    │
│                                    │
│   ❤️ Lagre   💬 Diskuter   ↪ Del   │  ← Høyre kant (TikTok-mønster)
│   🤖 Hold inne = AI-tutor          │
├────────────────────────────────────┤
│  🏠Feed 🧭Utforsk ⚔️Sosialt 📚Meg  ➕Skap │
└────────────────────────────────────┘
```

- **Feed:** standardvisning — appen åpner alltid rett i læring (null friksjon).
- **Utforsk:** IG-utforsk for fagfelt; visuelle samlinger, trender, turneringer.
- **Sosialt:** streaks, dueller, grupper, stories.
- **Meg:** kunnskapsportefølje, mestringskart, avatar, statistikk.
- **Skap:** skaperstudio (låses opp ved nivå 10).

Gestene er identiske med TikTok/Snapchat-konvensjoner (null læringskurve for
grensesnittet — all kognitiv kapasitet spares til innholdet).

### 5.2 Onboarding (målsatt: under 60 sekunder til første læringsopplevelse)

1. **0–10 sek:** «Hva vil du bli bedre på?» — visuelle fag-fliser, velg 1–3.
2. **10–25 sek:** «Hva bryr du deg om?» — interesser (for innpakning), velg 3–5.
3. **25–40 sek:** Tre lynspørsmål for grov nivåplassering (føles som quiz, ikke test).
4. **40–60 sek:** Rett inn i feeden — første kort er kalibrert lett (garantert mestring
   = første dopamintreff), tredje kort gir første XP-burst og avataren klekkes.
5. Konto-opprettelse utsettes til *etter* første økt (verdi før forpliktelse).
6. Dag 2: første streak-varsel. Dag 3: forslag om å invitere en venn til parvis streak
   (invitasjon sendes som en duell-utfordring — vekst mekanikk med substans).

### 5.3 Typiske brukerreiser

**«Eksamensleseren» (19, medisinstudent):** Importerer pensumliste → systemet mapper til
kunnskapsgraf → feeden prioriterer hull, FSRS flettar repetisjon → dueller med
studiegruppen på anatomi → Innsiktssøndag viser at nervesystemet trenger en runde til
→ mestringskartet er grønt før eksamen.

**«Hverdagslæreren» (34, jobber i butikk, vil lære koding):** 4 mikroøkter daglig
(buss, lunsj, kveld) → interesse-innpakning bruker gaming-eksempler → interaktive
kodeceller rett i feeden → etter 6 uker: første prosjekt-flis i porteføljen → deler
kunnskaps-CV på LinkedIn.

**«Skoleeleven» (14, mattelei):** Læreren tildeler ukens quest → parvis streak med
bestevennen holder henne inne → brøk forklares via fotball → duellseier over
sidemannen → tre uker senere er brøk-noden grønn og selvbildet («jeg er dårlig i
matte») har fått sin første sprekk.

### 5.4 Friksjonspunkter og løsninger

| Friksjon | Løsning |
|---|---|
| «Jeg orker ikke i dag» | Streak reddes med 90-sek minimumsøkt («redd streaken»-knapp i varselet) |
| Mistet streak → gir opp | Streak-frys (2/mnd) + «comeback-bonus»: 3 dager dobbel XP etter brudd — fallet gjøres mykt |
| For vanskelig → frustrasjon | Bro-kort etter 3 feil; «vis meg på en annen måte»-knapp (AI) på alle kort |
| For lett → kjedsomhet | 80 %-regelen; «utfordr meg»-sveip som hopper frem i grafen |
| Sosial angst i ligaer | Ligadeltakelse er valgfri; studygrupper er små og lukkede; ingen offentlige følgertall |
| Passiv scrolling uten læring | Etter 5 passive kort flettes aktivt kort inn; passivitet demoteres i ranking |
| Avhengighetsatferd | Myk stopp ved dagsmål nådd («Hjernen din trenger pause for å konsolidere — vi sees i morgen 🌙»), sesjonsgrense-innstilling, ingen belønning for tid utover mål |
| Kaldstart (ny bruker, tomt sosialt lag) | Algoritmisk matching til jevnbyrdig studygruppe etter uke 1 |

---

## 6. Implementeringsstrategi

### 6.1 Faser

**Fase 1 — MVP «Feeden som virker» (mnd 0–6):**
- Læringsfeed med mikrovideo + lynquiz + flashkort
- Enkel heuristisk anbefaling (nivå + spacing), FSRS-repetisjon
- XP, nivåer, individuelle streaks, dagsmål
- Onboarding, mestringskart v1
- Ett fagvertikal (f.eks. matematikk for 13–19) med 500 kuraterte kort
- Plattform: iOS + Android (React Native)

**Fase 2 — «Sosialt og smart» (mnd 6–14):**
- Parvise streaks, studygrupper, dueller, stories, heiarop
- ML-basert rankingmodell (engasjement × læringseffekt)
- AI-tutor v1 (forklar på nytt, hvorfor-kjeder, interesse-innpakning)
- Ligaer, quests, Kunnskapshjulet, avatar
- 3–4 fagvertikaler, skaperstudio i lukket beta med 50 inviterte skapere

**Fase 3 — «Plattform og økosystem» (mnd 14–24):**
- Åpent skaperstudio med fagfellevurdering + AI-faktasjekk
- AI-generert innhold on-demand for grafhull
- Klasserom-modus, kunnskaps-CV-eksport, sesonger og festivaler
- AR-labber, prediktiv intervensjon, formatadaptasjon
- Internasjonalisering

### 6.2 MVP vs. full visjon — prioriteringslogikk

MVP-testen er én hypotese: *«Kommer folk frivillig tilbake daglig for å lære?»*
Alt som ikke tester den hypotesen (skaperøkosystem, AR, ligaer) utsettes. Streaks og
feed er med i MVP fordi de ER hypotesen; sosiale lag venter fordi de krever kritisk
masse for å virke.

### 6.3 Ressursbehov

| Fase | Team | Nøkkelroller |
|---|---|---|
| 1 | 8–10 | 4 utviklere, 1 ML, 1 designer, 1 læringsdesigner (PhD-nivå), 1 PM, innholdsteam 2 |
| 2 | 15–20 | + 2 ML, + 2 utviklere, + community/skaper-ansvarlig, + dataanalytiker |
| 3 | 25–35 | + skaperstøtte, moderering/faktasjekk, internasjonalisering, salg (skole) |

### 6.4 Måling av suksess

- **Nordstjerne: Ukentlig Verifisert Læring (UVL)** — konsepter mestret per aktiv bruker per uke.
- **Engasjement:** D1/D7/D30-retensjon (mål fase 1: 55/35/20 %), gjennomsnittlige økter/dag (mål: 3+), streak-lengde-median.
- **Læringseffekt:** pre/post-tester per emne mot kontrollgruppe; 30-dagers retensjonsrate på mestrede konsepter (mål: > 70 %).
- **Guardrails:** tid-i-app vs. UVL-ratio (skal være flat eller synkende), frustrasjonsrate, andel brukere som treffer myk stopp og faktisk stopper.
- **Fase 2+:** viral koeffisient via duell-invitasjoner, skaperretensjon, andel innhold som består faktasjekk.

Alle nye features skipper bak feature-flag med A/B-test mot både engasjements- OG
læringsmetrikker; en feature som løfter engasjement men senker UVL rulles tilbake.

---

## 7. Eksempler på konkrete brukerinteraksjoner

**Interaksjon 1 — morgenøkta (2 min):**
Push kl. 07:40 (brukerens målte gullvindu): «🧠 3 kort er i ferd med å glemmes.»
→ Åpner rett i feed → flashkort: «Hva er derivasjonen av x²?» → sveiper svaret «2x» på
plass → grønn puls + haptikk på 80 ms → combo x1.2 → to kort til → fremdriftsringen
lukkes 30 % → «Streak dag 13 🔥» → lukker appen. Total tid: 1 min 50 sek.

**Interaksjon 2 — duellen:**
Varsel: «⚡ Kim utfordret deg i cellebiologi!» → trykk → 3-2-1 → 8 spørsmål, 10 sek
hver, live motstander-bar → vinner 6–5 på siste spørsmål → konfetti + 40 XP → Kim får
revansj-knapp → begge har nettopp repetert 8 konsepter uten å tenke på det som lesing.

**Interaksjon 3 — aha-øyeblikket:**
Mikrovideo om renters rente stopper på cliffhanger: «...og det er derfor 18-åringen
slår 30-åringen med halvparten av innsatsen. Men hvordan?» → holder inne → AI-tutor:
«Du liker gaming — tenk på XP-boost som stacker...» → «Vis meg med mine tall» →
interaktiv graf med brukerens egne sparetall → lagrer kortet → kortet dukker opp som
flashkort om 2 dager, 9 dager og 23 dager (FSRS) → konseptet markeres mestret.

**Interaksjon 4 — skaperøyeblikket (fase 2+):**
Elev på nivå 12 ser dårlig forklart kort om fotosyntese → trykker «Forklar videre» →
spiller inn 40-sek remix med egen analogi → fagfellevurdering + AI-faktasjekk →
publiseres → 2 400 visninger, 89 % fullføringsgrad → 300 XP + «Formidler»-badge →
har selv lært fotosyntese på dybdenivå (protégé-effekten).

---

## 8. Konklusjon — unike fordeler

1. **Leveringsmekanismen fra sosiale medier, verdikjernen fra pedagogikken.**
   Konkurrenter velger side: Duolingo er gamifisert men rigid; TikTok er engasjerende
   men lærer bort tilfeldigheter; Khan Academy er pedagogisk men friksjonsfull.
   Læringspuls er første system designet fra bunnen med *begge* optimert samtidig —
   håndhevet i selve rankingfunksjonen (engasjement × læringseffekt).

2. **Dopamin koblet til mestring, ikke distraksjon.** Variable belønninger, streaks og
   sosial validering — hele verktøykassen — men hver utløser er festet til reell
   kunnskapsvekst, målt med tre-punkts gjenkalling.

3. **Tapsaversjon og sosiale bånd som forpliktelse:** parvise streaks gjør læring til
   et løfte til en venn — den sterkeste retensjonsmekanismen Snapchat fant, gjenbrukt
   for noe som betyr noe.

4. **En algoritme man kan stole på:** transparent («hvorfor ser jeg dette?»), med
   guardrails som aktivt bremser avhengighet (myk stopp, tid/UVL-vakt). Det er ikke
   bare etikk — det er posisjonering: plattformen foreldre og skoler kan si ja til.

5. **Selvforsterkende innholdsøkosystem:** protégé-effekten satt i system — de beste
   elevene blir skapere og mentorer, og lærer mest selv av det. Innholdstilfanget
   skalerer med brukerbasen, kvalitetssikret av fagfeller + AI.

6. **Kunnskap som identitet:** avatar, portefølje og kunnskaps-CV gjør læring til noe
   man *er* og *viser frem* — Instagrams identitetsmekanikk pekt mot vekst i stedet
   for fasade.

Sosiale medier beviste at milliarder av mennesker frivillig gir 90 minutter av dagen
sin til en feed. Læringspuls er svaret på det åpenbare spørsmålet ingen har bygget
skikkelig ennå: *hva om de minuttene gjorde dem klokere?*
