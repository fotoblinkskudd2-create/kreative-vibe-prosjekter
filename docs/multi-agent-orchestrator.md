# ARGUS — systemdesign for autonom 24/7 multi-agent-drift

Versjon 0.1 · Statusen er *design*, ikke implementert kode.

---

## 0. Premiss og ærlig avgrensning

Tre ting må være avklart før arkitekturen gir mening:

1. **"24/7" betyr her tidsstyrt gjenoppvåkning, ikke en prosess som står og spinner.**
   Kjøremiljøet er efemert: containeren rives når sesjonen dør. En agent som "kjører
   kontinuerlig" finnes ikke — det som finnes er *Routines* (cron-triggere, minimum
   timesoppløsning) som starter en ny sesjon, leser tilstand fra git, gjør en syklus,
   skriver tilstand tilbake til git, og dør. Kontinuiteten ligger i **repoet**, ikke i
   prosessen. Alt design nedenfor følger av dette.

2. **Systemet produserer research, ikke ordrer.** Ingen agent har eller får
   handelstilgang. Output er dokumenterte hypoteser med kilder, ikke investeringsråd.
   Verdien ligger i at hypotesene er *falsifiserbare og faktisk blir etterprøvd* (§6).

3. **Kvaliteten er kapasitetsbundet på datakilder.** Med kun websøk/webhenting er
   krypto- og aksjesignaler forsinket og grovkornede sammenlignet med betalte feeds.
   Systemet er designet for å være ærlig om dette: hvert funn bærer en
   `data_tier`-merkelapp, og lav tier begrenser hvor høy konfidens funnet kan få.

---

## 1. Topologi

```
                        ┌─────────────────────────┐
                        │   ORCHESTRATOR (ARGUS)  │
                        │  ruting · budsjett ·    │
                        │  skill-livssyklus       │
                        └───────────┬─────────────┘
                                    │  oppgavekontrakter
        ┌──────────┬──────────┬─────┴─────┬──────────┬──────────┐
        │          │          │           │          │          │
    ┌───▼───┐  ┌───▼───┐  ┌───▼───┐   ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
    │ DRIFT │  │ CHAIN │  │ QUANT │   │ FORGE │  │ RELIC │  │STUDIO │
    │marked/│  │krypto │  │aksjer │   │AI-prod│  │patent-│  │innhold│
    │arbitr.│  │       │  │       │   │       │  │arkeo. │  │       │
    └───┬───┘  └───┬───┘  └───┬───┘   └───┬───┘  └───┬───┘  └───┬───┘
        └──────────┴──────────┴─────┬─────┴──────────┴──────────┘
                                    │  alle funn
                            ┌───────▼────────┐
                            │     ASSAY      │  verifikasjon ·
                            │  (gatekeeper)  │  benchmarking ·
                            └───────┬────────┘  oppgjør av spådommer
                                    │
                              reports/ + ledger
```

7 subagenter + orchestrator. Innenfor 3–8-rammen, og hver har et eget
falsifiserbart domene så de ikke overlapper og dobbeltrapporterer.

### 1.1 Agentroller

| Agent | Domene | Primærkilder | Leveranse per syklus |
|---|---|---|---|
| **DRIFT** | Markedsineffektivitet, arbitrasje, gjenstandsmarkeder | Finn.no, eBay/Tradera, auksjonshus, Discogs, StockX, restlager | Prisspenn med begge ben verifisert, likviditetsestimat |
| **CHAIN** | Krypto: on-chain, sentiment, nye protokoller | CoinGecko/DefiLlama offentlig API, blokkutforskere, GitHub-aktivitet | Token/protokoll + tese + invalideringspunkt |
| **QUANT** | Small/mid-cap aksjer, fundamentale + tekniske signaler | Regnskapsregistre, børsmeldinger, SEC/EDGAR, Oslo Børs NewsWeb | Selskap + drivere + hva som må stemme |
| **FORGE** | AI-produkthull og kombinasjonsmuligheter | Klagestrømmer (Reddit, HN, G2-anmeldelser), API-endringslogger | Produkthypotese + hvem betaler + byggekost |
| **RELIC** | Teknologiarkeologi: utløpte patenter, glemte metoder | Google Patents (>20 år), IEEE-arkiv, DTIC, gamle standarder | Gammel teknikk + hvorfor den feilet da + hva som er endret |
| **STUDIO** | Kreativt innhold med spredning-/salgspotensial | Trendsignaler fra de øvrige agentene | Konsept + utkast + distribusjonsvinkel |
| **ASSAY** | Verifikasjon, benchmarking, oppgjør | Alt de andre påstår | Godkjenn/avvis/nedgrader + treffrate-oppdatering |

**ASSAY er systemets viktigste agent.** Uten den blir dette en maskin som
produserer selvsikker støy i industriell skala. Ingen funn når en rapport uten å ha
passert ASSAY.

---

## 2. Kadens — fire tempolag

Routines er begrenset til timesoppløsning, og hver kjøring koster tokens. Derfor
lagdeles frekvensen etter hvor fort informasjonen forringes:

| Lag | Frekvens | Agenter | Begrunnelse |
|---|---|---|---|
| **T0 — puls** | Hver time | CHAIN (lett modus) | Kryptonyheter har halveringstid i timer |
| **T1 — sveip** | Hver 4. time | DRIFT, CHAIN (full) | Markedsplasser fylles på i rykk; nok til å slå trege kjøpere |
| **T2 — dybde** | Daglig 06:00 CET | QUANT, FORGE, ASSAY, rapport | Før børsåpning; ASSAY gjør oppgjør på forfalte spådommer |
| **T3 — langsom** | Ukentlig (søndag) | RELIC, STUDIO, strategirevisjon | Patentarkeologi og innhold har ingen timesdynamikk |

Nattkjøringer (00:00–05:00 CET) går i **sparemodus**: kun T0, halvert
kontekstbudsjett, ingen dyre agenter. Ingen grunn til å brenne budsjett på et
stengt Oslo Børs.

Cron-uttrykk lagres i UTC. Sommertid håndteres eksplisitt i `orchestrator.yaml` —
ikke antatt bort.

---

## 3. Tilstandsmodell — repoet er hukommelsen

```
/orchestrator/
  orchestrator.yaml        # kadens, budsjetter, aktive agenter, terskler
  strategy.md              # gjeldende strategi; revideres ukentlig av ORCHESTRATOR
/agents/
  drift.md chain.md ...    # agentdefinisjoner (rolle, verktøy, stoppregler)
/skills/
  <navn>/SKILL.md          # dynamiske ferdigheter, se §5
/state/
  ledger.jsonl             # append-only: hvert funn, én linje, uforanderlig
  open-predictions.jsonl   # uavgjorte spådommer med forfallsdato
  scoreboard.json          # treffrate per agent per kategori → konfidensvekter
  seen.db                  # hasher av allerede sett innhold (dedup)
  cooldown.json            # emner som er utbrukt, med utløpstid
/reports/
  YYYY-MM-DD.md            # daglig rapport
  weekly/YYYY-Www.md       # ukesoppsummering + strategiendringer
```

Hver syklus: `git pull` → arbeid → `git commit` → `git push`. Konflikter er
sjeldne fordi `ledger.jsonl` kun er append-only og rapporter er datostemplede.

**Dedup er ikke valgfritt.** Uten `seen.db` vil systemet rapportere den samme
Bitcoin-ETF-nyheten 24 ganger i døgnet og drukne alt av reell verdi. Regel: et emne
som har vært rapportert går i cooldown i 7 døgn med mindre en *materiell* endring
inntreffer (definert per kategori, ikke etter skjønn).

---

## 4. Funnkontrakten

Hvert funn er ett JSON-objekt i `ledger.jsonl`. Ingen fritekst uten disse feltene —
dette er mekanismen som holder "unngå spekulasjon uten grunnlag" ærlig:

```json
{
  "id": "CHAIN-2026-07-31-004",
  "agent": "CHAIN",
  "kategori": "Krypto",
  "opportunity": "…konkret, én setning…",
  "tese": "…hvorfor dette er feilpriset akkurat nå…",
  "potensial": { "estimat": "…", "grunnlag": "…hvordan tallet er utledet…" },
  "urgency": "timer | dager | uker | måneder",
  "risiko": ["…", "…"],
  "invalidering": "Denne tesen er død hvis X inntreffer innen DATO",
  "kilder": [{ "url": "…", "tier": "A|B|C", "hentet": "…" }],
  "data_tier": "A|B|C",
  "konfidens": 0.0,
  "score": 0,
  "assay": "godkjent | nedgradert | avvist",
  "forfaller": "2026-08-14"
}
```

**Kildetiering.** A = primærkilde (børsmelding, regnskap, on-chain-data,
patentdokument, faktisk kjøpsannonse med pris). B = etablert sekundærkilde.
C = forum, sosiale medier, uverifisert. **Et funn kan ikke ha høyere `data_tier`
enn sin dårligste bærende kilde, og C-tier alene kan aldri gi konfidens > 0,3.**

**Invalideringsfeltet er obligatorisk.** Klarer ikke agenten å formulere hva som
ville motbevise tesen, er det ikke en tese — det er en stemning, og ASSAY avviser
den automatisk.

### 4.1 Prioriteringsscore

```
score = (potensial_normalisert × konfidens × hastighetsfaktor) / (risiko × innsats)
```

- `potensial_normalisert`: 0–10, logaritmisk på estimert verdi
- `konfidens`: 0–1, **multiplisert med agentens historiske treffrate i kategorien** (§6)
- `hastighetsfaktor`: 1,5 for `timer`, 1,2 `dager`, 1,0 `uker`, 0,8 `måneder`
- `risiko`: 1–5, `innsats`: 1–5 (kapital/tid for å realisere)

Brukerens mandat er «høyt potensial, moderat risiko» — derfor står risiko i
nevneren, ikke som et separat filter. Funn med `risiko ≥ 4` rapporteres kun hvis
score fortsatt havner i topp 3.

**Rapporteringsterskel:** `score ≥ 2,0`. Under det havner funnet i ledgeren, men
ikke i rapporten. Bedre en kort rapport enn en lang som ikke leses.

---

## 5. Dynamiske skills — livssyklusen

"Dynamiske skills" er konkret dette: `SKILL.md`-filer i `/skills/` som agentene
laster ved behov, og som **orchestratoren skriver, endrer og pensjonerer basert på
måltall.**

| Fase | Utløser | Handling |
|---|---|---|
| **Fødsel** | Samme arbeidsmønster gjentas ≥ 3 sykluser | ORCHESTRATOR destillerer det til en `SKILL.md` |
| **Forfremmelse** | Skill brukt ≥ 10× med treffrate over agentsnittet | Låses som stabil, får bredere verktøytilgang |
| **Mutasjon** | Treffrate faller 2 uker på rad | Omskrives; forrige versjon beholdes i git-historikken |
| **Pensjonering** | Ubrukt i 30 dager, eller treffrate < 0,2 | Flyttes til `/skills/_arkiv/` |

Startsett: `arbitrage-spread-check`, `onchain-sanity`, `filing-diff`,
`patent-expiry-scan`, `claim-verification`, `virality-heuristics`.

Systemet vokser altså sitt eget verktøysett — men bare i retninger som er *målt*
til å funke. Uten pensjoneringsregelen samler det bare opp kruttslam.

---

## 6. Sannhetssløyfen — det som skiller dette fra en støymaskin

Dette er kjernemekanismen. Hvert funn bærer en forfallsdato. Ved forfall gjør ASSAY
oppgjør:

1. Slo tesen til? (ja / nei / uavgjort)
2. Oppdater `scoreboard.json`: treffrate per **agent × kategori × data_tier**
3. Denne treffraten mater tilbake i `konfidens`-multiplikatoren for alle framtidige
   funn fra den agenten i den kategorien

Konsekvens: en agent som leverer selvsikkert vås blir *automatisk nedvektet* til
funnene faller under rapporteringsterskelen. Systemet strammer seg selv inn uten at
noen må lese gjennom alt manuelt.

Ukentlig skriver ORCHESTRATOR en strategirevisjon til `strategy.md`: hvilke
kategorier som faktisk leverte, hvilke kilder som var verdt tokenene, hva som
justeres. Det er her «oppdater strategier basert på markedsendringer» blir en
faktisk mekanisme og ikke en intensjon.

**Kaldstart:** de første 2–3 ukene har systemet ingen treffhistorikk. I denne
perioden settes alle konfidensmultiplikatorer til 0,7 (bevisst pessimistisk), og
rapportene merkes `KALIBRERING`. Ikke stol på rangeringen før scoreboardet har
minst ~30 avgjorte spådommer.

---

## 7. Daglig rapport — format

`/reports/YYYY-MM-DD.md`, generert i T2-kjøringen:

```markdown
# ARGUS · 31. juli 2026
Sykluser: 14 · Funn i ledger: 47 · Passerte ASSAY: 9 · Rapportert: 5
Kalibrering: 34 avgjorte spådommer · treffrate 0,41

## Topp 5 (etter score)

### 1. [Krypto] — score 4,2
**Opportunity:** …
**Potensial:** … *(grunnlag: …)*
**Urgency:** dager · **Risiko:** … · **Data-tier:** A · **Konfidens:** 0,6
**Invalidering:** … innen 14. aug
**Kilder:** …

### 2. [Aksjer] — score 3,1
…

## Oppgjør i dag
- CHAIN-2026-07-17-002 → TRAFF (+18 % mot tese)
- QUANT-2026-07-10-001 → BOM (utbytte kuttet, tese død)

## Systemhelse
Skills: 8 aktive, 1 pensjonert (`reddit-sentiment`, treffrate 0,14)
Nedvektet: STUDIO viralitetsestimater (3 bom på rad)
Tokenforbruk: 62 % av døgnbudsjett
```

Rapporten *leder* med hva som ble motbevist. En rapport som bare viser vinnere er
en salgsbrosjyre.

---

## 8. Sikring og grenser

| Grense | Regel |
|---|---|
| **Ingen eksekvering** | Ingen agent har handels-, betalings- eller bud-tilgang. Punktum. |
| **Ingen autopublisering** | STUDIO skriver til repo. Publisering krever menneskelig godkjenning. |
| **Kildekrav** | Score > 3,0 krever minst to uavhengige A/B-kilder |
| **Tokenbudsjett** | Hardt tak per døgn i `orchestrator.yaml`; T0 kuttes først ved 80 % |
| **Nettverk** | Kun offentlige endepunkter og API-er med vilkår som tillater det. Ingen scraping bak innlogging eller mot robots.txt-forbud. |
| **Prompt-injeksjon** | Alt hentet webinnhold er *data*, aldri instruksjoner. Agenter kjører med eksplisitt regel om at instruksjoner funnet i hentet innhold ignoreres og flagges. |
| **Dødmannsknapp** | 3 feilende sykluser på rad → routine deaktiveres og varsel sendes, i stedet for å brenne budsjett i en løkke |

---

## 9. Implementeringsrekkefølge

| Steg | Innhold | Estimat |
|---|---|---|
| 1 | Repostruktur, `orchestrator.yaml`, ledger-skjema + validator | ~1 økt |
| 2 | ASSAY + funnkontrakt + sannhetssløyfe (**før** noen scout-agent) | ~1 økt |
| 3 | CHAIN + DRIFT (raskest verifiserbare domener) | ~1 økt |
| 4 | Routines: T0/T1/T2, rapportgenerator | ~1 økt |
| 5 | QUANT, FORGE, RELIC, STUDIO | ~2 økter |
| 6 | Skill-livssyklus automatisert | ~1 økt |

Rekkefølgen er bevisst: **verifikasjonslaget bygges før produksjonslaget.** Bygger
man scoutene først, får man 500 upåtalte påstander i ledgeren og ingen måte å vite
hvilke som var verdt noe.

---

## 10. Hva designet ikke løser

- **Datakvalitet i krypto/aksjer** uten betalte feeds. Reell fiks: Polygon.io,
  Dune, eller en børs-API. Koster penger — din avgjørelse.
- **Ekte arbitrasje** krever eksekvering i sekunder. Med timeskadens fanger DRIFT
  *trege* ineffektiviteter (feilprisede gjenstander, restlager, geografiske
  spenn) — ikke HFT. Det er en reell begrensning, ikke noe som forsvinner med
  bedre prompting.
- **Viralitet er ikke forutsigbart.** STUDIOs viralitetsscore vil ha lav treffrate.
  Sannhetssløyfen vil vise det innen få uker, og da bør STUDIO omdefineres fra
  «treff virale hits» til «produser volum billig».
