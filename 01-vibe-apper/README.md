# Prosjekt 1 — Ti "Vibe Code" Apper

Ti apper der gamification, alvor og praktisk nytte smelter sammen. Hver løser et reelt
problem, men er bygget så folk faktisk *vil* åpne den igjen i morgen. Felles teknisk
fundament på tvers av alle ti, med app-spesifikke avvik der det gir mening.

## Felles teknisk fundament

- **Mobil (iOS + Android):** React Native + Expo (managed workflow der mulig, bare
  eject når native moduler krever det — f.eks. AR-kamera i app 6).
- **Web:** Next.js (App Router) + TypeScript, delt design-system med mobil via
  Tamagui eller NativeWind slik at komponenter kan gjenbrukes ~70 %.
- **Backend:** Supabase (Postgres + Auth + Row Level Security + Realtime) som
  standardvalg — åpen kildekode, selv-hostbar, og dekker auth/db/storage/realtime
  i ett. Tunge bakgrunnsjobber (varsler, matching, AI-analyse) kjøres i egne
  Node/Deno edge functions.
- **State/data:** TanStack Query for server-state, Zustand for lokal UI-state.
- **Design-inspirasjon:** mønstre fra kjente OSS-prosjekter — Duolingo-stilens
  streak/XP-system, Home Assistant sitt device-dashboard-mønster for IoT/strøm-appen,
  Signal sin ende-til-ende-krypterte meldingsarkitektur for trygghets- og
  helse-appene, og Mastodon sin føderative community-modell som inspirasjon for
  nabolags-appene.
- **Analytics/etikk:** ingen invasiv tracking; PostHog (self-hosted) med opt-in.

---

## App 1 — "Pusterom" (mental helse)

**Problem:** Angst og panikk rammer i øyeblikket, terapikø er lang, folk trenger noe *nå*.

- **Konsept:** Pusteøvelser og grounding-teknikker presentert som et rolig,
  ikke-manipulerende "reise"-spill. Ingen poeng for å presse bruk — progresjon
  måles i ro, ikke skjermtid.
- **Kjernefunksjoner:** Guidet pust med haptisk feedback synkronisert til
  pustesyklus; "SOS"-knapp som starter en 90-sekunders nedtrappingssekvens;
  anonymisert peer-støtte-feed moderert av frivillige med klinisk bakgrunn;
  valgfri deling av mønstre med terapeut via eksportert PDF.
- **UI/UX:** Mobil — mørkt, lavkontrast tema som standard, store trykkflater
  (motorikk svekkes under panikk), ingen røde varselfarger. Web — rolig
  ressursbibliotek + terapeut-portal for oppfølging. Gamification er subtil:
  et voksende "pusterom" (rom man selv innreder) i stedet for XP-jag.
- **Implementeringsplan:** (1) MVP med pusteøvelser + SOS-knapp, offline-first.
  (2) Peer-støtte-feed med moderasjonsverktøy. (3) Terapeut-portal og
  eksport. (4) Integrasjon med Apple Health / Health Connect for HRV-data.

## App 2 — "Matrester" (matsvinn)

**Problem:** Norske husholdninger kaster ca. 42 kg spiselig mat per person årlig.

- **Konsept:** Skann kjøleskapet, få "restemat-oppdrag" (lag en rett av det du har
  før det blir dårlig), og del overskuddsmat med naboer.
- **Kjernefunksjoner:** Strekkode/bilde-skanning med holdbarhetsestimat (on-device
  ML-modell, ingen bilde sendes til sky); AI-generert oppskrift fra det som står
  i kjøleskapet; nabolagskart for gratis matdeling (inspirert av Too Good To Go,
  men peer-to-peer og gratis); ukentlig "svinn-score" med husholdninger man
  konkurrerer vennlig mot.
- **UI/UX:** Mobil-først med kamera i sentrum; kortbasert "matchmaking" for
  restemat (swipe-lignende, men for løk og halve paprika). Web-versjon for
  familieplanlegging og handleliste på tvers av husstand.
- **Implementeringsplan:** (1) Skanning + holdbarhetsdatabase. (2) Oppskrift-AI.
  (3) Nabolagsdeling med geofencing og trygghetsverifisering (BankID-lignende
  ID-sjekk for deling). (4) Svinn-score og husholdningsstatistikk til kommune
  (anonymisert, for avfallsplanlegging).

## App 3 — "Wattkrig" (strømsparing)

**Problem:** Høye og volatile strømpriser rammer særlig lavinntektshusholdninger.

- **Konsept:** Sanntids strømforbruk visualisert som et "slag" mellom
  husholdninger/nabolag — spar strøm, vinn territorium.
- **Kjernefunksjoner:** Integrasjon mot Tibber/Elhub API for sanntidsforbruk og
  spotpris; "kraftfelt"-kart der nabolag farges etter kollektiv sparing; konkrete,
  personaliserte spare-quests ("skru av vannvarmer i 3 timer i kveld — spar 12 kr");
  varsling før pristopper.
- **UI/UX:** Web-dashboard (mye data, bedre på stor skjerm) med mobil for varsler
  og quests. Dashboard-mønster inspirert av Home Assistant sine energikort.
  Konkurranseelementet er opt-in og kan skrus helt av for de som bare vil ha
  sparetips.
- **Implementeringsplan:** (1) Elhub/Tibber-integrasjon + prisvarsler. (2)
  Quest-motor med personalisert sparepotensial. (3) Nabolagskonkurranse med
  anonymisert aggregering. (4) Smarthjem-styring (smart plugs) for automatiske
  tiltak.

## App 4 — "Gjeldsfri" (personlig økonomi)

**Problem:** Gjeldsspiraler og forbrukslån er en stille krise; skam hindrer folk
i å søke hjelp tidlig.

- **Konsept:** Nedbetalingsplan fremstilt som et RPG — hver gjeld er et "monster"
  med helsepoeng (restsaldo), hvert nedbetalt beløp er et angrep.
- **Kjernefunksjoner:** Automatisk gjeldsoversikt via Open Banking (PSD2/Bank ID);
  snøball- eller skred-metode-kalkulator; "monster"-visualisering av gjeld uten
  å bagatellisere alvoret (tekst forblir saklig, kun visualisering er lekent);
  direkte lenke til NAV/gjeldsrådgiver ved tegn på betalingsproblemer.
- **UI/UX:** Mobil for daglig oversikt og "angrep" (ekstra nedbetaling); web for
  dyp budsjettplanlegging og eksport til gjeldsrådgiver. Viktig UX-prinsipp:
  aldri gamify på en måte som oppfordrer til mer lån — kun nedbetaling og
  sparing gir "poeng".
- **Implementeringsplan:** (1) Manuell gjeldsregistrering + nedbetalingsplan.
  (2) Open Banking-integrasjon for automatisk saldo. (3) RPG-visualisering og
  motivasjonssystem. (4) Varslingsterskel og varm overlevering til
  gjeldsrådgivningstjenester.

## App 5 — "Ensomhetsknappen" (sosial isolasjon)

**Problem:** Ensomhet blant eldre og isolerte er en av de største helserisikoene
i den vestlige verden — verre enn røyking, ifølge flere studier.

- **Konsept:** Én stor knapp: trykk for å bli koblet til en frivillig for en
  telefonprat/videoprat innen 10 minutter. Ingen profiler å optimalisere, ingen
  "matching"-press.
- **Kjernefunksjoner:** Én-trykks samtaleforespørsel med kø-system; frivillig-app
  med bakgrunnssjekk og opplæringsmodul; "faste venner"-funksjon for gjentakende
  kontakt med samme frivillig; automatisk varsling til pårørende (opt-in) ved
  lengre perioder uten aktivitet — en varsom "er alt i orden?"-funksjon.
- **UI/UX:** Ekstremt forenklet mobil-UI for eldre brukere — store knapper,
  ingen nesting, valgfri stemmestyring. Web brukes kun av frivillig-koordinatorer
  for administrasjon og skiftplanlegging.
- **Implementeringsplan:** (1) Kø-system + telefon/video-samtale (WebRTC). (2)
  Frivillig-onboarding og bakgrunnssjekk. (3) "Faste venner"-matching. (4)
  Passiv trygghetsvarsling til pårørende.

## App 6 — "Sorteringshelten" (kildesortering)

**Problem:** Feilsortering er utbredt fordi regler varierer per kommune og er
vanskelige å huske.

- **Konsept:** Pek kameraet på en gjenstand, få augmented reality-pil som viser
  riktig dunk — med poeng og "sorteringsstreak" for husstanden.
- **Kjernefunksjoner:** On-device objektgjenkjenning + kommune-spesifikk
  sorteringsdatabase (API mot norske renovasjonsselskaper der tilgjengelig);
  AR-overlegg via ARKit/ARCore (native modul, eneste app i settet som krever
  full native eject fra Expo); familie-leaderboard; "hva skjer med dette"-
  utdanningsinnhold (sirkulær økonomi-sporing av faktisk materiale).
- **UI/UX:** Rendyrket mobil-kamera-app. Web er kun en enkel oppslagsside for
  kommuner uten app-installasjon.
- **Implementeringsplan:** (1) Statisk oppslag per kommune (ikke-AR MVP). (2)
  Objektgjenkjenningsmodell trent på vanlig norsk husholdningsavfall. (3)
  AR-overlegg. (4) Familie/skole-leaderboard og undervisningsmateriell.

## App 7 — "Medisinvakt" (medisinetterlevelse)

**Problem:** Manglende etterlevelse av medisinering er en ledende årsak til
sykehusinnleggelser blant kronikere og eldre.

- **Konsept:** Medisinpåminnelser med lav terskel for å faktisk trykke "tatt",
  og en varsom sikkerhetsnett-funksjon for pårørende/hjemmesykepleie.
- **Kjernefunksjoner:** Resept-skanning (bilde av eske → automatisk oppsett av
  påminnelse og dosering); "streak" for etterlevelse uten skam ved brutt streak
  (ingen "du feilet"-språk); eskalerende varsling til definert pårørende ved
  uteblitt bekreftelse; interaksjonsvarsel mot Felleskatalogen-API.
- **UI/UX:** Mobil med ekstremt lav friksjon (én-trykks bekreftelse fra
  lock screen-widget); web-portal for pårørende/hjemmesykepleier med
  aggregert (ikke journalpliktig) status.
- **Implementeringsplan:** (1) Manuell påminnelse + bekreftelse. (2)
  Resept-skanning og dosering-parsing. (3) Pårørende-eskalering. (4)
  Interaksjonsvarsel og integrasjon mot kjernejournal (langsiktig, krever
  helsegodkjenning).

## App 8 — "Språkbro" (integrering)

**Problem:** Språklæringsapper lærer ord, men ikke lokalsamfunn — mange
nyankomne mangler praktisk kontakt med nordmenn for å faktisk øve.

- **Konsept:** Språklæring koblet direkte til ekte, lavterskel møter i
  lokalsamfunnet (gåturer, matlaging, dugnad) — spillet er selve møtet, ikke
  bare quiz-poeng.
- **Kjernefunksjoner:** Adaptiv ordforrådstrening (spaced repetition) med
  tema hentet fra kommende lokale arrangementer; "øv sammen"-matching med
  frivillige norsktalende; kalenderintegrasjon mot frivilligsentraler og
  bibliotek; foreldrenes/barnas fremgang synlig for lærere ved samtykke.
- **UI/UX:** Mobil for daglig øving og "møt noen i dag"-varsler; web for
  frivilligsentraler til å publisere arrangementer og følge deltakelse.
- **Implementeringsplan:** (1) Kjernepensum + spaced repetition-motor. (2)
  Frivillig-matching og arrangementskalender. (3) Lærer/koordinator-dashboard.
  (4) Flerspråklig utvidelse utover de mest brukte språkene i norske mottak.

## App 9 — "Krisekompasset" (beredskap)

**Problem:** DSB anbefaler egenberedskap for 7 dager, men de fleste husstander
har mindre enn 2.

- **Konsept:** Bygg opp hjemmeberedskapen gjennom små, ukentlige "quests" i
  stedet for én overveldende handletur.
- **Kjernefunksjoner:** Persontilpasset beredskapssjekkliste (basert på
  husstandsstørrelse, allergier, kjæledyr, medisiner) hentet fra DSB/Sivilforsvarets
  offisielle råd; ukentlig mikro-quest ("kjøp 6 liter vann denne uken");
  varselintegrasjon mot DSB CIM/Varsom for reelle hendelser; nabolags-
  beredskapskart (hvem har generator, hvem kan dele ressurser i en krise —
  strengt opt-in og privat).
- **UI/UX:** Mobil for quests og varsler; web for husstandsplanlegging og
  utskriftsvennlig sjekkliste (fungerer også uten strøm/nett).
- **Implementeringsplan:** (1) Sjekkliste + quest-motor. (2) DSB/Varsom-
  varselintegrasjon. (3) Nabolagsressurskart. (4) Offline-modus med lokalt
  lagrede kriseinstrukser (fungerer uten nett/strøm når det trengs mest).

## App 10 — "Trygg Vei Hjem" (personlig trygghet)

**Problem:** Utrygghet på vei hjem alene om kvelden, særlig for kvinner —
mange bruker allerede ad-hoc-løsninger som å ringe en venn, uten struktur.

- **Konsept:** Del en "trygghetsøkt" med noen du stoler på — de ser din rute
  live og får varsel hvis du avviker fra forventet ankomsttid.
- **Kjernefunksjoner:** Live lokasjonsdeling med tidsavgrenset økt (auto-slutt,
  ingen permanent sporing); "trygg ankomst"-bekreftelse med automatisk eskalering
  (SMS til kontakt, deretter mulighet for å varsle 112) ved uteblitt bekreftelse;
  diskret "late som jeg ringer noen"-lydavspilling; community-rapporterte
  utrygge soner (moderert, ikke stigmatiserende av områder/grupper).
- **UI/UX:** Mobil-only, designet for rask aktivering med én hånd i mørket
  (stor knapp, høy kontrast, fungerer med skjermlås-widget). Ende-til-ende
  kryptert lokasjonsdeling (Signal-arkitektur som forbilde).
- **Implementeringsplan:** (1) Tidsavgrenset lokasjonsdeling + trygg
  ankomst-bekreftelse. (2) Eskaleringskjede til kontakter. (3) Diskré
  falsk-samtale-funksjon. (4) Community-varslede soner med streng
  moderasjon mot misbruk/stigmatisering.

---

## Tverrgående prioritering

1. **Fase 1 (uke 1–4):** MVP for app 1, 2, 3 og 10 — høyest daglig bruksfrekvens,
   lavest teknisk risiko.
2. **Fase 2 (uke 5–8):** App 4, 7, 9 — krever integrasjon mot eksterne API-er
   (Open Banking, Felleskatalogen, DSB) — mer forarbeid på partnerskap/tilgang.
3. **Fase 3 (uke 9–12):** App 5, 8 — avhengige av et fungerende
   frivillig-nettverk, altså go-to-market før full kodefunksjonalitet.
4. **Fase 4 (uke 13+):** App 6 — eneste app som krever native AR-eject fra
   Expo, gjøres sist for å ikke bremse resten av porteføljen.
