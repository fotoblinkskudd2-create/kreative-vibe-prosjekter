# Fra prototype til marked: Full-stack guide for iOS + React

> Praktisk, actionable veiledning for å bygge en rask, skalerbar MVP med React/iOS-teknologi — og få den ut i markedet. Skrevet for gründere som vil bevege seg fort uten å bygge seg inn i et hjørne.

---

## 1. Research og analyse: Lær av de beste open-source-prosjektene

Ikke finn opp arkitekturen selv. De beste svarene ligger allerede åpent på GitHub. Slik gjør du research effektivt:

### Slik researcher du (metoden)

- **Søk etter produksjonskodebaser, ikke tutorials.** Søk på GitHub etter `topic:react-native stars:>5000` eller `language:typescript topic:fullstack` og sorter på aktivitet, ikke bare stjerner.
- **Les issues og discussions, ikke bare koden.** Der ser du hvilke problemer (ytelse, skalering, state management) teamet faktisk sliter med — og hvordan de løser dem.
- **Se på mappestruktur og PR-er.** Hvordan organiserer de features? Hvordan tester de? Hvordan ruller de ut?

### Repoer som er verdt å studere

**Arkitektur og best practices:**

- [`alan2207/bulletproof-react`](https://github.com/alan2207/bulletproof-react) — Gullstandarden for React-arkitektur: feature-basert struktur, state management, testing. Les denne først.
- [`t3-oss/create-t3-app`](https://github.com/t3-oss/create-t3-app) — Typesikker full-stack (Next.js + tRPC + Prisma). Perfekt startpunkt for web-MVP.
- [`calcom/cal.com`](https://github.com/calcom/cal.com) — Ekte produksjonskodebase (Next.js, tRPC, Prisma) fra en finansiert startup. Se hvordan et kommersielt produkt faktisk struktureres.

**iOS + kryssplattform:**

- [`bluesky-social/social-app`](https://github.com/bluesky-social/social-app) — Bluesky sin app: React Native + Expo som driver iOS, Android **og** web fra én kodebase, i millionskala. Den beste referansen som finnes for stacken anbefalt under.
- [`expo/examples`](https://github.com/expo/examples) — Offisielle eksempler på alt fra auth til push-varsler.
- [`pointfreeco/swift-composable-architecture`](https://github.com/pointfreeco/swift-composable-architecture) — Hvis du går ren native SwiftUI: den mest gjennomtenkte arkitekturen for iOS.

**Lag/latency-problemer (ytelse) spesifikt:**

- [`Shopify/flash-list`](https://github.com/Shopify/flash-list) — Løser det vanligste lag-problemet i React Native: trege lister. Drop-in-erstatning for FlatList.
- [`software-mansion/react-native-reanimated`](https://github.com/software-mansion/react-native-reanimated) — Animasjoner som kjører på UI-tråden, ikke JS-tråden. Dette er forskjellen på "føles som web" og "føles native".
- [`TanStack/query`](https://github.com/TanStack/query) — Caching, bakgrunnsoppdatering og optimistiske oppdateringer. Skjuler nettverkslatency for brukeren.
- [`excalidraw/excalidraw`](https://github.com/excalidraw/excalidraw) — Casestudie i React-ytelse: canvas-rendering, minimal re-rendering, følelsen av null lag.

**Praktisk tips:** Klon 1–2 av disse, kjør dem lokalt, og bruk mappestrukturen som mal. Du sparer uker.

---

## 2. Teknisk stack: Minimal lag, maksimal skalerbarhet

### Anbefalt stack (én kodebase → iOS + web)

| Lag | Teknologi | Hvorfor |
|---|---|---|
| App-rammeverk | **React Native + Expo** (Expo Router) | iOS, Android og web fra én TypeScript-kodebase. Bluesky beviser at det skalerer. |
| Web (alternativ/i tillegg) | **Next.js** på Vercel | SSR/edge = rask first paint, god SEO for landingssiden. |
| Data-henting | **TanStack Query** | Cache + optimistiske oppdateringer = opplevd null-latency. |
| Backend | **Supabase** (Postgres + auth + realtime + storage) | Ferdig auth og database på dag 1. Ren Postgres under panseret = ingen lock-in når du skalerer. |
| API (når du trenger custom logikk) | tRPC eller Hono på edge/serverless | Typesikkert ende-til-ende, autoskalerer. |
| Animasjon/lister | Reanimated + FlashList | Fjerner de to vanligste kildene til lag. |
| Utrulling | **EAS Build/Update** + TestFlight, Vercel for web | Push JS-oppdateringer uten App Store-review (innenfor Apples regler). |
| Overvåking | Sentry (feil) + PostHog (produktanalyse) | Du kan ikke fikse lag du ikke måler. |

### Gyldent alternativ: Ren native

Hvis appen er ekstremt animasjons-/sensortung (kamera, AR, audio): **SwiftUI + Composable Architecture** for iOS, Next.js for web. Kostnad: to kodebaser, tregere iterasjon. Velg dette kun hvis React Native beviselig ikke klarer kravet ditt — test først.

### Anti-lag-sjekkliste (de 6 grepene som faktisk betyr noe)

1. **Optimistiske oppdateringer** — oppdater UI umiddelbart, synk mot server i bakgrunnen (TanStack Query gjør dette trivielt).
2. **Aldri tunge beregninger på JS-tråden** — bruk Reanimated worklets for animasjon/gestures.
3. **FlashList for alle lister** over ~20 elementer.
4. **Hermes-motoren på** (standard i nye Expo-prosjekter) — raskere oppstart og lavere minnebruk.
5. **Mål før du optimaliserer**: React DevTools Profiler + Sentry Performance. 90 % av lag kommer fra 1–2 komponenter som re-rendrer for mye.
6. **Edge/CDN for API-et** (Vercel Edge, Cloudflare Workers) — fjerner 100–300 ms nettverkslatency for brukere langt fra serveren.

### Skalerbarhet uten overengineering

- Start med **én Postgres-database** (Supabase). Den håndterer de første 100 000 brukerne dine uten problemer.
- **Ikke** bygg mikrotjenester, Kubernetes eller egen infra før du har et skaleringproblem du kan måle. Det er den vanligste måten startups kaster bort runway på.
- Skaleringsstien er kjent og trygg: Supabase → dedikert Postgres + read replicas → sharding. Du krysser den broen når du har inntektene som krever det.

---

## 3. Prototype til marked

### Fase A: Bygg MVP-en raskt (mål: 2–6 uker)

1. **Definér ÉN kjernehandling.** Skriv setningen: «Brukeren åpner appen for å ____.» Alt som ikke direkte støtter det tomrommet, kuttes.
2. **Kutt brutalt.** Ingen innstillinger-side, ingen dark mode, ingen onboarding-karusell, ingen «del til alle plattformer». Auth? Bruk Apple/Google-innlogging via Supabase — én knapp, null skjemaer.
3. **Start fra mal, ikke blankt ark:** `npx create-expo-app` med Expo Router-template, eller `create-t3-app` for web. Kopier struktur fra bulletproof-react.
4. **Timeboxing:** Sett en hard lanseringsdato 4 uker frem. En OK app i markedet slår en perfekt app på maskinen din, hver gang.
5. **Distribuér fra uke 1:** TestFlight-build og Vercel-preview fra første uke, så venner/testere gir feedback løpende — ikke som en «big bang» på slutten.

### Fase B: Markedsfør prototypen

- **Landingsside før appen er ferdig.** Én side: problem → løsning → 15-sekunders demovideo → e-postliste. Bygg den på dag 1 og begynn å samle interessenter mens du koder.
- **Demovideo er valutaen din.** 30–60 sekunder skjermopptak av kjerneflyten, med tekst-overlays. Denne gjenbrukes overalt: landingsside, pitch, sosiale medier, DM-er.
- **Gå dit brukerne dine allerede er:** relevante subreddits, Discord-servere, Facebook-grupper, LinkedIn. Ikke «lansér» — del problemet du løser og spør om feedback. Feedback-spørsmål konverterer bedre enn salgspitch.
- **Product Hunt + Hacker News (Show HN)** når du har en stabil versjon. Forbered launch-dagen: assets klare, 5–10 personer briefet til å teste og kommentere ærlig.
- **Bygg i det åpne:** korte poster underveis («uke 2: løste latency-problemet med optimistiske oppdateringer, her er før/etter-video») bygger publikum *før* lansering. Dette er den billigste markedsføringen som finnes.

### Fase C: Få brukere og investorer til å forstå verdien

- **Led med problemet, ikke teknologien.** Ingen bryr seg om stacken din. De bryr seg om: «Dette tok meg 2 timer. Nå tar det 4 minutter.»
- **Vis, ikke fortell:** live demo eller video > skjermbilder > tekst. Alltid.
- **Kvantifisér tidlig traction, uansett hvor liten:** «120 på venteliste på 2 uker», «40 % ukentlig retention blant beta-testere», «12 brukere som bruker den daglig uten purring». Retention-tall imponerer investorer mer enn nedlastingstall.
- **Samle sitater:** Ett ekte sitat fra en betatester («jeg blir irritert når den er nede») er verdt mer enn ti features på en slide.

### Fase D: Pitchen (10-slide-strukturen som fungerer)

1. **Problemet** — konkret, gjerne en historie om én person
2. **Løsningen** — demovideoen din (60 sek)
3. **Hvorfor nå** — hva har endret seg som gjør dette mulig/nødvendig
4. **Marked** — hvem, hvor mange, hva betaler de i dag for alternativer
5. **Traction** — venteliste, retention, sitater
6. **Forretningsmodell** — hvordan tjener dere penger (enkelt, én modell)
7. **Konkurrenter** — og hvorfor dere vinner (vær ærlig, investorer sjekker)
8. **Team** — hvorfor akkurat dere klarer dette
9. **Veikart** — neste 6–12 måneder
10. **The ask** — hva du trenger (beløp/intro/piloter) og hva det gir

**Pitch-tips:** Øv til du klarer hele pitchen på 3 minutter uten slides. Slides er støtte, ikke manus. Og avslutt alltid med en konkret ask — folk vil hjelpe, men de må vite hvordan.

---

## 4. Case studies: Fra prototype til marked

### Bluesky — React Native + Expo i millionskala

- **Stack:** Nøyaktig stacken anbefalt over: React Native + Expo som driver iOS, Android og web fra én kodebase, med et lite team.
- **Hva de gjorde riktig:** Lanserte invite-only — kunstig knapphet skapte enorm etterspørsel og FOMO, samtidig som de kunne skalere infrastruktur kontrollert. Vokste til 30+ millioner brukere.
- **Lærdom for deg:** Én TypeScript-kodebase er nok, selv i massiv skala. Og en venteliste/invite-modell er både markedsføring og lasthåndtering på samme tid. Kodebasen er open source ([`bluesky-social/social-app`](https://github.com/bluesky-social/social-app)) — studer den.

### Linear — ytelse som selve produktet

- **Stack:** React/TypeScript-webapp med lokal-først synk-motor: all data ligger lokalt, UI-et svarer momentant, synk skjer i bakgrunnen. «Null lag» var ikke en feature — det var hele pitchen.
- **Hva de gjorde riktig:** Lanserte med privat venteliste og bygde hype gjennom design- og utviklermiljøet på Twitter/X før noen fikk tilgang. Da folk slapp inn, var forventningene skyhøye — og produktet leverte, fordi hastighet var det første du merket.
- **Lærdom for deg:** Hvis du løser lag-/latency-problemer, *gjør hastigheten til historien*. «Raskeste X som finnes» er en pitch folk umiddelbart forstår og deler. Optimistiske oppdateringer + lokal cache er Linear-oppskriften i miniatyr.

### Instagram — brutal MVP-kutting

- **Historien:** Startet som Burbn, en overlesset check-in-app med mange features. Analyserte bruken og så at folk kun brukte bildedeling. De kuttet **alt annet** og bygde Instagram — kun bilder, filtre, likes og kommentarer — på ca. 8 uker. 25 000 brukere første dag.
- **Lærdom for deg:** MVP-en din er sannsynligvis fortsatt for stor. Spørsmålet er ikke «hva kan vi legge til?», men «hva kan vi fjerne og fortsatt levere kjerneverdien?». Og: data fra en «mislykket» prototype er gull — Burbn feilet ikke, den fortalte dem hva de skulle bygge.

---

## Din 30-dagers handlingsplan

- **Uke 1:** Definér kjernehandlingen. Sett opp Expo + Supabase fra mal. Landingsside med venteliste live. Første TestFlight-build (uansett hvor rå).
- **Uke 2–3:** Bygg kjerneflyten. FlashList + TanStack Query fra start (ikke som opprydding senere). 5 testbrukere inne via TestFlight. Post fremdrift offentlig 2× i uken.
- **Uke 4:** Spill inn demovideo. Fiks de 3 største tingene testerne klager på — ignorér resten. Del i 2–3 relevante communities.
- **Uke 5+:** Product Hunt / Show HN-lansering. Begynn pitch-samtaler med traction-tallene fra uke 1–4.

**Det viktigste rådet:** Hastighet er din eneste fordel som liten aktør. Store selskaper har mer penger, flere folk og bedre distribusjon — men de kan ikke shippe, lære og pivotere på en uke. Det kan du. Bruk det.
