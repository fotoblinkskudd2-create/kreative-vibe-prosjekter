# Rammeverk for beste praksis i produktutvikling

> Implementeringsklart system for porteføljen i `kreative-vibe-prosjekter`:
> mange små, kreative prosjekter (apper, musikk, satire, video, salgsmateriell)
> som skal gå fra idé til lansering med minimal sløsing og maksimal gjennomstrømning.

Dokumentet er strukturert i fire deler: **Planlegging**, **Simulering**,
**Optimalisering** og **Konklusjon**. Alt er dimensjonert for en liten bemanning
(1–3 personer) med AI-assistert utvikling, men skalerer til større team.

---

## 1. `<planning>` — Detaljert designplan

### 1.1 Overordnet rammeverk: «Trakt + Bane»

Porteføljen har to grunnproblemer: (a) idémengden (100+) er langt større enn
byggekapasiteten, og (b) kreative prosjekter dør oftest av *uavklart scope*,
ikke av tekniske hindre. Rammeverket løser dette med en **trakt** som filtrerer
idéer billig, og en **bane** som tar de utvalgte gjennom faste faser med
eksplisitte exit-kriterier.

```
IDÉBANK (100+) ──▶ TRIAGE ──▶ PROTOTYPE ──▶ VALIDERING ──▶ BYGG ──▶ LANSERING ──▶ DRIFT/ARKIV
   gratis          15 min      ≤ 2 dager     ≤ 1 uke       tidsboks   sjekkliste    beslutning
```

**Prinsipper (i prioritert rekkefølge):**

1. **Kill cheap** — en idé skal kunne forkastes etter 15 minutter, ikke etter to ukers bygging.
2. **Tidsboks alt** — hver fase har maksimal varighet; overskridelse tvinger frem beslutning (kutt scope, pivoter, eller arkiver).
3. **Én definisjon av «ferdig» per fase** — exit-kriteriene under er kontrakten.
4. **WIP-grense** — maks 2 prosjekter i BYGG samtidig (se optimalisering, del 3).
5. **Alt er reverserbart unntatt lansering** — arkiverte prosjekter beholdes med notat om hvorfor, slik at læring ikke går tapt.

### 1.2 Nøkkelfaser og milepæler

| Fase | Formål | Tidsboks | Exit-kriterium (milepæl) |
|---|---|---|---|
| **0. Idébank** | Fange idéer uten friksjon | løpende | Idé registrert med én setning + kategori |
| **1. Triage** | Filtrere billig | 15 min/idé | Score ≥ 12/20 på ICE+ (se 1.3), ellers arkiv |
| **2. Prototype** | Bevise kjerneopplevelsen | ≤ 2 dager | Noe demonstrerbart eksisterer (klikkbar skisse, demo-låt, manus) |
| **3. Validering** | Bevise at noen bryr seg | ≤ 1 uke | ≥ 3 eksterne reaksjoner innhentet og dokumentert |
| **4. Bygg** | Lage lanserbar versjon | 1–3 uker (satt i forkant) | Sjekkliste 1.5 grønn |
| **5. Lansering** | Publisere + måle | 1 dag | Publisert + måleoppsett aktivt |
| **6. Drift/Arkiv** | Beslutte videre liv | 30 dager etter lansering | Eksplisitt beslutning: videreutvikle / vedlikehold / arkiver |

**Milepælsregel:** en fase er ikke «nesten ferdig» — den er ferdig når
exit-kriteriet er oppfylt, ellers er den ikke ferdig. Dette fjerner den vanligste
formen for selvbedrag i soloprosjekter.

### 1.3 Triage-scoring: ICE+ (0–5 per akse, maks 20)

- **Impact** — hvor mye glede/verdi/oppmerksomhet gir dette hvis det lykkes?
- **Confidence** — hvor sikker er du på at kjerneidéen fungerer?
- **Ease** — hvor billig er prototypen? (5 = under en time, 0 = uker)
- **Energy** — hvor lysten er du selv? (kreative prosjekter uten indre driv dør; dette er en reell prediktor, ikke kos)

Terskel: **≥ 12 går videre**, 8–11 legges i «senere»-kø med dato for re-triage,
< 8 arkiveres med én linjes begrunnelse.

### 1.4 Ressurskrav og -optimalisering

Knappeste ressurs er **fokustimer**, ikke penger eller verktøy. Budsjettér slik:

- **70 %** av ukens fokustimer til det ene prosjektet i BYGG.
- **20 %** til validering/prototyping av neste kandidat (pipelinen skal aldri gå tom).
- **10 %** til triage, idébank og vedlikehold av lanserte prosjekter.

Verktøykrav holdes bevisst minimale: git-repo (dette), én mappe per prosjekt,
én `STATUS.md` per aktivt prosjekt med fase, tidsboks-frist og neste handling.
Ingen prosjektstyringsverktøy før porteføljen har > 5 samtidige aktive prosjekter.

### 1.5 «Klar til lansering»-sjekkliste (fase 4 → 5)

- [ ] Kjerneopplevelsen fungerer ende-til-ende for en fremmed uten forklaring
- [ ] Navn, én-setnings pitch og ett visuelt uttrykk (bilde/cover/skjermbilde) finnes
- [ ] Publiseringskanal valgt og testet (App/web/YouTube/Spotify/sosiale medier)
- [ ] Én måleindikator definert (avspillinger, nedlastinger, svar, salg)
- [ ] Kjente feil listet — og eksplisitt akseptert eller fikset
- [ ] 30-dagers beslutningsdato satt i kalenderen

---

## 2. `<simulation>` — Scenarioanalyse med resultater

Tre scenarioer, fra enkelt til maksimal belastning, kjørt som skrivebordssimulering
mot rammeverket over. Antakelser: 20 fokustimer/uke, én person.

### Scenario A (enkelt): Ett Vibe-kort-app-prosjekt, ingen konkurranse om tid

- **Forløp:** Triage (15 min, score 16) → prototype på 1,5 dag → 4 venner tester
  → bygg tidsbokset til 2 uker → lansering dag 18.
- **Resultat:** Rammeverket tilfører nesten ingen overhead (< 1 time totalt
  administrasjon). Verdien ligger i tidsboksen: uten den viser erfaring at
  «polering» typisk dobler byggetiden uten målbar effekt.
- **Funn:** Ingen flaskehals. Systemet skal være usynlig når belastningen er lav — og er det.

### Scenario B (middels): Tre prosjekter i ulike faser samtidig

- **Forløp:** Musikkidé i validering, satirevideo i bygg, app i triage.
  70/20/10-fordelingen gir videoen 14 t/uke, musikken 4 t/uke, appen 2 t/uke.
- **Resultat:** Videoen lanseres uke 3. Musikken består validering uke 2 og rykker
  inn i BYGG-plassen som blir ledig. Appen scorer 10 og går i «senere»-kø.
- **Funn:** Første reelle flaskehals er **kontekstbytte**: målt som tapt oppvarmingstid
  utgjør tre samtidige spor anslagsvis 15–20 % av fokustimene. Håndteres med
  dagtematisering (se optimalisering O3).

### Scenario C (maksimal belastning): 100+ idéer inn, 10 aktive kandidater, én lansering under oppfølging

- **Forløp:** Full triage av idébanken: 100 idéer × 15 min = 25 timer ≈ 1,5 ukes
  fokustid. Deretter presser 10 kandidater med score ≥ 12 på mot prototype-fasen.
- **Resultat uten WIP-grense (kontrollkjøring):** alle 10 startes «litt», ingenting
  når exit-kriterier, porteføljen fryser. Dette er dagens sannsynlige utfall og
  grunnen til at repoet har 100+ idéer og få lanseringer.
- **Resultat med rammeverket:** WIP-grensen tvinger sekvensering. Med snitt
  2,5 uker per bygg og 2 BYGG-plasser lanseres ~3 prosjekter/måned i teoretisk
  maksimum; realistisk 1,5–2/måned når validering feller halvparten av kandidatene
  (som er ønsket — validering *skal* felle prosjekter billig).
- **Dokumenterte flaskehalser under maks belastning, i rekkefølge:**
  1. **Triage-køen** (25 timer er for dyrt i én bolk) → løses med batch-triage, O1.
  2. **Valideringsfasen** (venting på eksterne reaksjoner blokkerer) → løses med parallell venting, O2.
  3. **Kontekstbytte** (som i scenario B, forsterket) → O3.
  4. **Beslutningsvegring ved 30-dagerspunktet** (lanserte prosjekter «henger igjen» og stjeler 10 %-potten) → løses av at beslutningsdatoen er exit-kriterium, ikke valgfri.

### Ytelsesmål fra simuleringen

| Måltall | Uten system | Med system |
|---|---|---|
| Idé → beslutning (triage) | udefinert/aldri | 15 min |
| Andel startede prosjekter som lanseres | erfaringsmessig < 10 % | 50–60 % (validering feller resten *før* bygg) |
| Lanseringer per måned ved full pipeline | ~0 | 1,5–2 |
| Fokustid tapt til administrasjon | 0 (men alt annet tapt) | < 5 % |

---

## 3. `<optimization>` — Effektiviseringstiltak og beregninger

Tiltakene under angriper flaskehalsene fra del 2, i prioritert rekkefølge.
Prinsippet er Littles lov: gjennomstrømning = WIP / syklustid — vi kan ikke øke
timetallet, så vi senker WIP og syklustid.

**O1 — Batch-triage i stedet for kontinuerlig.**
Triage av 100 idéer gjøres i økter à 10 idéer (2,5 t/økt), én økt per uke.
Beregning: kontekstlasting for triage-modus koster ~15 min per økt; 10 økter gir
2,5 t overhead mot ~25 t (15 min × 100) hvis hver idé triageres enkeltvis ved
innfall. **Besparelse ≈ 90 % av overheaden**, og idébanken er ferdig prioritert på 10 uker
uten å fortrenge byggetid.

**O2 — Parallell venting i validering.**
Venting på eksterne reaksjoner (fase 3) er ren dødtid for prosjektet, men skal
ikke være dødtid for *deg*: i det øyeblikket et prosjekt går i «venter på svar»,
frigjøres tiden til neste kandidats prototype. Regel: et prosjekt i passiv venting
teller ikke mot WIP-grensen. Beregning: med typisk 3–4 dagers ventetid per
validering gjenvinnes 30–40 % av 20 %-potten — nok til én ekstra prototype per måned.

**O3 — Dagtematisering mot kontekstbytte.**
Faste temadager (f.eks. man/tir/tor = bygg, ons = validering + triage, fre = lansering/drift)
reduserer antall kontekstbytter fra ~3/dag til ~1/dag. Med 20–25 min tapt
oppvarming per bytte: 2 unngåtte bytter × 5 dager × ~22 min ≈ **3,5 t/uke gjenvunnet**,
dvs. ~17 % av total fokustid — den største enkeltgevinsten i hele systemet.

**O4 — Gjenbruksbibliotek (minimer redundans).**
Etter hver lansering trekkes gjenbrukbare komponenter ut til en felles
`felles/`-mappe: app-maler, cover-maler, lanseringssjekkliste, promotekster.
Beregning: hvis 30 % av byggetiden i et typisk prosjekt er oppsett/boilerplate,
kutter gjenbruk anslagsvis 20 % av syklustiden fra og med tredje prosjekt i samme
kategori. Med 2,5 ukers snittbygg: **~2,5 dager spart per prosjekt**.

**O5 — Stegvis innføring (ikke alt på én gang).**
- *Uke 1:* Opprett idébank + kjør første triage-økt. (Ingen annen endring.)
- *Uke 2:* Innfør WIP-grense og `STATUS.md` for aktive prosjekter.
- *Uke 3:* Innfør dagtematisering.
- *Uke 4+:* Første lansering gjennom full bane; deretter O4 (gjenbruk) ved behov.

Hvert steg evalueres etter én uke med ett spørsmål: «Lanserte eller avklarte jeg
mer enn uken før?» Hvis nei to uker på rad, fjern det siste steget — systemet
skal tjene arbeidet, ikke omvendt.

**Samlet effekt (beregnet):** O1–O4 kombinert gir estimert 25–35 % høyere effektiv
byggekapasitet av samme timetall, og — viktigere — flytter fellingen av svake
prosjekter fra «etter ukers bygging» til «etter 15 minutter eller én ukes validering».

---

## 4. `<conclusion>` — Oppsummering og anbefalinger

**Kjernediagnosen:** Med 100+ idéer og begrenset tid er problemet aldri idétørke —
det er at alt konkurrerer om samme fokustimer uten filter. Systemets verdi ligger
90 % i tre mekanismer: **billig triage**, **WIP-grense på 2**, og **tidsbokser med
harde exit-kriterier**. Alt annet er støtte.

**Anbefalinger, i rekkefølge:**

1. **Start med triage-økt nr. 1 denne uken** (10 idéer, 2,5 timer). Ikke bygg noe
   før minst 20 idéer er scoret — de to første BYGG-plassene skal gå til de best
   scorende, ikke de nyeste.
2. **Respekter WIP-grensen som en fysisk lov.** Hver gang den brytes, faller
   lanseringsraten mot null (scenario C, kontrollkjøringen).
3. **La validering felle prosjekter.** Et prosjekt som dør etter én ukes validering
   er en suksess for systemet — det sparte 2,5 ukers bygging.
4. **Mål én ting:** lanseringer per måned. Alle andre måltall er diagnostikk.
5. **Revider selve systemet hver 4. uke** med O5-spørsmålet. Rammeverket er også
   et produkt og følger sin egen bane.

**Forventet resultat etter 90 dager:** ferdig prioritert idébank, 4–6 lanserte
prosjekter, et gjenbruksbibliotek som gjør prosjekt nr. 7 raskere enn nr. 1, og —
viktigst — en portefølje der hvert prosjekt enten beviselig lever eller er
bevisst arkivert, i stedet for 100+ idéer i limbo.
