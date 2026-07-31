# Autonomt Multi-Agent-System — Systemdesign for 24/7-drift

**Versjon:** 1.0 · **Dato:** 2026-07-31 · **Status:** Design, klar for implementering

---

## 0. Premisser (les denne først)

Fire realiteter former hele designet. De er ikke forbehold — de er designdrivere.

| Realitet | Konsekvens for arkitekturen |
|---|---|
| Kjøremiljøet er **ephemeral**. Containeren rives når sesjonen dør. | "24/7" kan ikke være én prosess som lever evig. Det må være **mange korte, planlagte sesjoner** som deler tilstand via git. Repoet *er* databasen. |
| Datainnhenting skjer over web, med **sekunder til minutters latens**. | Systemet kan ikke jakte *utførelses-arbitrage* (millisekunder, HFT). Det jakter **informasjons-arbitrage**: gap som lever i dager til uker fordi ingen har koblet to offentlige datapunkter ennå. Dette er faktisk det eneste feltet hvor en LLM-flåte har edge. |
| LLM-er hallusinerer selvsikkert, særlig om tall og tickere. | **Verifikasjon er en egen agent med vetorett**, ikke en instruksjon i en prompt. Ingen funn når rapporten uten primærkilde. |
| Systemet **utfører ikke handler**. | Output er research-artefakter for menneskelig beslutning. Ingen API-nøkler til børser, ingen ordreflyt. Dette er ikke investeringsrådgivning. |

---

## 1. Arkitektur

Kaskade i fire lag. Bredt og billig øverst, smalt og dyrt nederst.

```
                    ┌──────────────────────────────┐
                    │      L0  ORCHESTRATOR        │
                    │  døgnhjul · budsjett · dedup │
                    └───────────────┬──────────────┘
                                    │
        ┌───────────────┬───────────┴───────┬────────────────┐
        ▼               ▼                   ▼                ▼
  ┌───────────┐  ┌─────────────┐   ┌──────────────┐  ┌─────────────┐
  │ L1 SCOUTS │  │             │   │              │  │             │
  │ bredt     │  │ market-     │   │ crypto-      │  │ equity-     │
  │ billig    │  │ scout       │   │ analyst      │  │ scout       │
  │ 100-500   │  │             │   │              │  │             │
  │ signaler  │  └─────────────┘   └──────────────┘  └─────────────┘
  └───────────┘         │                  │                │
                        └──────────┬───────┴────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │   L2  VERIFIER  (vetorett)   │
                    │  primærkilde · kill-gates    │
                    │  100-500 → 10-30 overlever   │
                    └───────────────┬──────────────┘
                                    ▼
        ┌───────────────────────────┴──────────────────────┐
        ▼                          ▼                       ▼
  ┌──────────────┐        ┌─────────────────┐     ┌───────────────┐
  │ L3 SYNTESE   │        │ product-        │     │ content-      │
  │ dypt, dyrt   │        │ architect       │     │ forge         │
  │ 10-30 → 3-7  │        │ (AI + arkeologi)│     │ (innhold)     │
  └──────────────┘        └─────────────────┘     └───────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │   L4  DAGSRAPPORT + LEDGER   │
                    │   kalibrering mot utfall     │
                    └──────────────────────────────┘
```

**Trakten er poenget.** 300 råsignaler inn, 5 rapporterte funn ut. Alt annet ender i killfilen med begrunnelse, slik at systemet ikke gjenoppdager samme blindvei neste uke.

---

## 2. Agentflåten (6 agenter)

Alle sju operative områder er dekket, men slått sammen der arbeidet bruker samme muskulatur.

### A1 · `market-scout` — Arbitrage & markedsineffektivitet
**Dekker område 1 + 7.**
- Skanner markedsplasser (Finn.no, eBay, Discogs, StockX, Catawiki, auksjonshus, domenemarkeder) for prisdifferanser mellom likvide og illikvide kanaler.
- Jakter tre gap-typer: **geografisk** (samme vare, ulikt marked), **temporal** (sesong/hype-syklus), **informasjons** (feilkategorisert eller dårlig beskrevet vare).
- Krever alltid: to samtidige, verifiserbare prisobservasjoner + estimert transaksjonskostnad. Uten fraktkostnad, avgift og likviditetsestimat er ikke et "gap" et gap.
- Fører også løpende benchmarking-loggen: hvem er best i klassen i hver vertikal, og hvorfor.

### A2 · `crypto-analyst` — Kryptovaluta & on-chain
**Dekker område 2.**
- Markedsdata (pris, volum, likviditetsdybde), on-chain (aktive adresser, TVL-endring, holderkonsentrasjon, unlock-kalendere), sentimentdivergens.
- Kjernetese den jakter: **divergens mellom on-chain-aktivitet og pris**. Fundamentalbruk opp mens pris flat = kandidat. Pris opp mens aktivitet flat = mulig distribusjon.
- Obligatoriske drapskriterier: >50 % supply hos topp-10 adresser, token-unlock innen 30 dager uten prising, under 100k USD daglig dybde, anonymt team uten revidert kontrakt.

### A3 · `equity-scout` — Små- og midcap aksjer
**Dekker område 3.**
- Universet: Oslo Børs / Euronext Growth, nordiske smallcaps, utvalgte US-smallcaps. Grunnen til å starte nordisk er at analytikerdekningen er tynn — det er der informasjons-arbitrage faktisk finnes.
- Signaler: innsidekjøp, endring i eierregister, kontraktsmeldinger som ikke er priset inn, avvik mellom guidance og faktisk leveranse, spin-off/restrukturering.
- Krever primærkilde: børsmelding, kvartalsrapport, prospekt eller innsideregister. Aldri forum, aldri fintwit alene.

### A4 · `product-architect` — AI-produkter & teknologiarkeologi
**Dekker område 4 + 5.** Disse hører sammen: begge er *rekombinasjon*. Å hente en utløpt patent fra 1974 inn i dag er samme kognitive operasjon som å koble to eksisterende AI-byggeklosser til et nytt produkt.
- **Fremover:** markedsgap → produktkonsept → vurdering av kommersialiseringsvei (hvem betaler, hvor mye, hvor dyp er vollgraven).
- **Bakover:** utløpte patenter (Google Patents, Espacenet), forlatte standarder, teknologier som feilet på grunn av en flaskehals som *ikke lenger finnes* (båndbredde, batteritetthet, beregningskost). Denne siste linsen er den mest produktive: finn ideer som var riktige og for tidlige.

### A5 · `content-forge` — Kreativ produksjon
**Dekker område 6.**
- Produserer tekst, bildekonsepter og videokonsepter forankret i trender flåten allerede har verifisert — ikke i egen synsing om hva som er populært.
- Hver leveranse har eksplisitt distribusjonsteori: hvilken plattform, hvilket publikum, hvorfor det spres eller selger.
- Kobles til dette repoets eksisterende prosjektportefølje (musikkidéer, satire, Vibe-kort) framfor å starte på null.

### A6 · `verifier` — Sannhetsvakt med vetorett
**Tverrgående. Den viktigste agenten i systemet.**
- Kjører etter L1, før L3. Får ikke se den opprinnelige tesen som "sann" — den får påstanden og skal forsøke å **falsifisere** den.
- Sjekker: eksisterer kilden, sier kilden faktisk det som påstås, er tallet fra riktig periode, er tickeren riktig, er funnet allerede offentlig kjent (da er edgen borte).
- Vetorett er absolutt. Orchestrator kan ikke overstyre et veto.

**Hvorfor seks og ikke åtte:** hver ekstra agent koster koordinering og dobbeltarbeid. Seks dekker alle sju områder med null overlapp. Utvidelse skjer først når kalibreringsdataene viser at en agent er overbelastet — ikke før.

---

## 3. Dynamiske skills

Hver agent har en **basis-skill** (alltid aktiv) og **situasjonsmoduler** som orchestrator laster inn basert på markedsregime. Dette holder kontekstvinduet skarpt: en agent som ikke trenger on-chain-forensikk i dag, får den ikke.

```
agent-system/skills/
├── core/
│   ├── source-verification/     # primærkilde-hierarki, sitatkontroll
│   ├── opportunity-scoring/     # scoringsmodellen i §5
│   └── report-format/           # rapportkontrakten i §6
├── conditional/
│   ├── onchain-forensics/       # lastes ved krypto-volatilitet > terskel
│   ├── earnings-season/         # lastes i rapporteringssesong
│   ├── patent-search/           # lastes i arkeologi-vinduet
│   ├── liquidity-analysis/      # lastes når en kandidat er illikvid
│   └── viral-mechanics/         # lastes ved innholdsproduksjon
└── meta/
    └── calibration/             # lastes ukentlig ved backtest
```

**Utløsere for lasting** er datadrevne, ikke tilfeldige: BTC 24t-volatilitet over 5 % laster `onchain-forensics`; kalenderuke i rapporteringssesong laster `earnings-season`; en kandidat med under 500k daglig volum laster `liquidity-analysis` automatisk.

---

## 4. Døgnhjulet — hvordan 24/7 faktisk kjøres

Planlagte sesjoner (cron/routines), tidssone Europe/Oslo. Hver sesjon er kald start som leser tilstand fra repoet.

| Tid (CET) | Fase | Aktive agenter | Hensikt |
|---|---|---|---|
| **00:00–06:00** | Dyp-fase | A4, A5, A6 | Ikke-tidskritisk arbeid mens vestlige markeder sover: patentarkeologi, produktdesign, innhold. Billigste timene, tyngste tenkningen. |
| **06:00** | Rapport | L0 + A6 | Dagsrapport genereres og committes. Klar før brukeren står opp. |
| **07:00–09:00** | Pre-market EU | A1, A3 | Nattens nyheter, asiatisk økt, børsmeldinger før åpning. |
| **09:00–15:30** | EU-økt | A1, A3, A6 | Puls hver 30 min: kun deltaer mot watchlist. Ingen full skanning. |
| **15:30–22:00** | US-økt | A2, A3, A6 | Overlappstimene 15:30–17:30 er høyest signaltetthet i døgnet — dobbelt budsjett her. |
| **22:00–00:00** | Produksjon | A5, A1 | Innholdsproduksjon, benchmarking, opprydding i watchlist. |
| **Kontinuerlig** | Krypto | A2 | Krypto sover ikke. Puls hver time hele døgnet, eskalerer ved volatilitetsutløser. |
| **Søndag 12:00** | Kalibrering | L0 + A6 | Backtest av forrige ukes funn. Justerer agentbudsjetter. |

**Tre kadenser:**
- **Puls** (30–60 min): kun endringer mot eksisterende watchlist. Billig.
- **Sweep** (hver 4. time): full bredskanning i aktive domener.
- **Dykk** (2×/døgn): full analyse på kandidater som overlevde verifisering.

---

## 5. Scoringsmodellen — hvordan "potensial" slutter å være synsing

Hvert funn får fire tall, hver 1–5, satt av **verifier**, ikke av agenten som fant det.

```
Conviction = (E × V × T) / R          Skala: 0,2 – 125
```

| Faktor | Betydning | 1 | 5 |
|---|---|---|---|
| **E** — Edge | Størrelse på gapet | Marginal, under transaksjonskostnad | Stor, dokumenterbar feilprising |
| **V** — Verifiserbarhet | Kildekvalitet | Én sekundærkilde | Flere uavhengige primærkilder |
| **T** — Timing | Handlingsvindu | Lukket eller ukjent | Åpent, definert, snart |
| **R** — Risiko | Nedside | Begrenset og kvantifisert | Total tap mulig |

**Rapporteringsterskel: Conviction ≥ 20.** Under terskel går funnet i ledgeren, ikke i rapporten. Maks 7 funn per dagsrapport uansett hvor mange som passerer — knapphet tvinger fram prioritering.

### Harde drapskriterier (evalueres før scoring, ingen appell)
1. Ingen primærkilde → drept.
2. Eneste kilde er sosiale medier, forum eller en aggregator uten opphav → drept.
3. Ikke handlebart: for illikvid, ikke tilgjengelig fra Norge, eller minsteinvestering over rimelighet → drept.
4. Allerede i killfilen siste 30 dager → drept uten ny analyse.
5. Nyheten er over 72 timer gammel og bredt dekket → edgen er borte, drept.
6. Agenten kan ikke formulere et **falsifiseringskriterium** → drept. Hvis du ikke kan si hva som ville bevise at du tar feil, har du ikke en tese, du har en følelse.

---

## 6. Rapportkontrakten

Én fil per dag: `agent-system/reports/YYYY-MM-DD.md`. Hvert funn:

```markdown
### [F-2026-0731-03] Kort tittel

- **Kategori:**      Krypto | Aksjer | Marked | AI | Arkeologi | Innhold
- **Opportunity:**   Hva er funnet, konkret. Hvem, hva, hvor, hvor mye.
- **Potensial:**     Estimert verdi/ROI med regnestykket synlig, ikke bare tallet.
- **Urgency:**       Handlingsvindu med dato. "Snart" er ikke et svar.
- **Risiko:**        Rangerte risikofaktorer + hva som utløser exit.
- **Conviction:**    E4 × V5 × T3 / R3 = 20,0
- **Kilder:**        Primærkilder med URL og hentedato.
- **Falsifisering:** Hva ville bevise at denne tesen er feil.
- **Status:**        NY | OPPFØLGING | UTLØPT | TRUFFET | BOMMET
```

Feltet **Falsifisering** er systemets viktigste anti-spekulasjonsmekanisme, og det er også det som gjør ukentlig kalibrering mulig.

---

## 7. Tilstand og hukommelse — repoet som database

Fordi containeren er flyktig, er alt av verdi commitet.

```
agent-system/
├── SYSTEM-DESIGN.md            # dette dokumentet
├── state/
│   ├── ledger.jsonl            # append-only, alle funn noensinne
│   ├── watchlist.json          # aktive kandidater under oppfølging
│   ├── killfile.json           # avviste + begrunnelse + utløpsdato
│   └── calibration.json        # treffrate per agent, per kategori
├── reports/YYYY-MM-DD.md       # daglige rapporter
├── agents/A1..A6.md            # agentdefinisjoner
└── skills/                     # se §3
```

**Dedup:** hvert funn hashes på `(aktivum + tese-kjerne)`. Kollisjon innen 30 dager → oppfølging, ikke nytt funn. Dette er det som hindrer at systemet rapporterer samme aksje 14 dager på rad som om det var nytt.

---

## 8. Den lukkede sløyfen — hvorfor systemet blir bedre

Uten dette er flåten en meningsmaskin. Med det er den et instrument som kan kalibreres.

1. Hvert funn logges med predikert utfall og tidshorisont.
2. Ved T+7 og T+30 gjenbesøkes funnet automatisk og merkes **TRUFFET** eller **BOMMET** mot faktiske data.
3. Søndagens kalibreringskjøring beregner treffrate per agent og per kategori.
4. **Neste ukes tokenbudsjett fordeles etter etterslepende treffrate**, med et gulv på 10 % per agent slik at ingen agent sultes ut og mister muligheten til å bevise seg igjen.
5. Kategorier med treffrate under 30 % over fire uker settes i karantene og får omdesignet tese før de slipper inn i rapporten igjen.

Dette er kravet «oppdater strategier basert på markedsendringer», implementert som en målesløyfe framfor en instruksjon.

---

## 9. Feilmoduser og mottiltak

| Feilmodus | Mottiltak |
|---|---|
| Hallusinerte tickere, tall eller sitater | `verifier` med vetorett; sitatkontroll mot hentet kildetekst |
| Rapport-inflasjon (fyller kvoten med svake funn) | Hard terskel Conviction ≥ 20; tom rapport er et **gyldig og godt** utfall |
| Ekkokammer (agenter forsterker hverandre) | `verifier` ser aldri opprinnelig tese, kun påstanden; falsifiseringsplikt |
| Gjenoppdaging av samme blindvei | Killfile med 30-dagers karantene |
| Kilde-drift (nettsted endrer struktur) | Hentedato på alle kilder; feilende henting logges, ikke gjettes rundt |
| Rate-limiting / ToS-brudd | Kun offentlige APIer og tillatt henting; backoff; ingen omgåelse av tilgangskontroll |
| Tilstandstap ved containerdød | Commit etter hver fase, ikke bare ved dagsslutt |

---

## 10. Implementeringsrekkefølge

| Fase | Innhold | Verdi |
|---|---|---|
| **1** | Tilstandsstruktur, rapportmal, scoringsmodell, `verifier` | Rammeverket som gjør alt annet troverdig |
| **2** | A2 `crypto-analyst` + A3 `equity-scout` alene, manuelt trigget | Best datatilgang, raskest tilbakemeldingssløyfe |
| **3** | Planlagte kjøringer: dagsrapport 06:00 + krypto-puls | Første ekte 24/7-drift |
| **4** | A1 `market-scout` og A4 `product-architect` | Bredden i mandatet |
| **5** | Kalibreringssløyfen + budsjettallokering | Systemet begynner å forbedre seg selv |
| **6** | A5 `content-forge` koblet mot eksisterende prosjektportefølje | Produksjonsutgang |

Fase 1–3 er det som må bygges for at systemet skal ha reell verdi. Fase 4–6 er skalering.

---

## 11. Grenser

- Systemet **utfører ikke handler** og kobles ikke til børs- eller lommebok-API-er med skriverettigheter.
- Output er research for menneskelig beslutning, ikke investeringsrådgivning.
- Ingen henting som bryter en tjenestes vilkår eller omgår tilgangskontroll.
- Ved konflikt mellom «rapportér noe» og «rapportér bare verifiserbart» vinner det siste. **En tom rapport er et gyldig utfall.**
