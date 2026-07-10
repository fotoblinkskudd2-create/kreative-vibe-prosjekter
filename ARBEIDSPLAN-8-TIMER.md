# Strategisk arbeidsplan — 8-timers arbeidsdag

**Dato:** 10. juli 2026
**Kontekst:** Repoet `kreative-vibe-prosjekter` skal romme 100+ ideelle prosjekter, musikkidéer, satireprosjekter, videoer og Vibe-kort-apper — med prototyper, salgsmateriell og klar-til-bygg-info. Per i dag inneholder repoet kun en README. Dagens jobb er å ta porteføljen fra visjon til fungerende fundament.

---

## 1. Prioritert oppgaveliste

### 🔴 Kritisk — må gjøres i dag

| # | Oppgave | Estimat | Prioritet | Avhengigheter | Utfordringer |
|---|---------|---------|-----------|---------------|--------------|
| K1 | Etablere mappestruktur og kategorisystem for hele porteføljen (musikk, satire, video, vibe-kort-apper, salgsmateriell) | 45 min | 5 | Ingen | Strukturen må tåle 100+ prosjekter uten å bli kaotisk — feil valg nå koster dyrt senere |
| K2 | Definere prosjektmal ("klar-til-bygg"-standard): hva hvert prosjekt MÅ inneholde (idé, målgruppe, prototype-status, neste steg) | 40 min | 5 | K1 | Malen må være lett nok til at den faktisk brukes, men rik nok til å være salgbar |
| K3 | Registrere de 10 første prosjektidéene i malen — bevise at systemet virker | 60 min | 5 | K1, K2 | Fristelse til å perfeksjonere én idé i stedet for å få volum inn i systemet |
| K4 | Bygge første fungerende prototype: én Vibe-kort-app (enkel HTML/JS, kjørbar i nettleser) | 90 min | 4 | K2 | Scope-kryp — prototypen skal demonstrere konseptet, ikke være ferdig produkt |

### 🟡 Viktig — bør gjøres i dag

| # | Oppgave | Estimat | Prioritet | Avhengigheter | Utfordringer |
|---|---------|---------|-----------|---------------|--------------|
| V1 | Utkast til salgsmateriell-mal (one-pager per prosjekt: pitch, verdi, status) | 40 min | 4 | K2 | Må fungere for svært ulike prosjekttyper (musikk vs. app) |
| V2 | Oppdatere README til å bli porteføljens forside med navigasjon og status | 25 min | 3 | K1 | Holde den kort — README er utstillingsvindu, ikke arkiv |
| V3 | Prioriteringsmatrise for de neste 20 idéene (innsats vs. potensial) | 35 min | 3 | K3 | Ærlig vurdering — alle idéer føles viktige for skaperen |

### 🔵 Vedlikehold — løpende drift

| # | Oppgave | Estimat | Prioritet | Avhengigheter | Utfordringer |
|---|---------|---------|-----------|---------------|--------------|
| M1 | Git-hygiene: commit-konvensjon, branch-strategi, .gitignore | 20 min | 3 | Ingen | Ingen — men lett å utsette til det blir rot |
| M2 | Statuslogg: enkel CHANGELOG/dagbok for porteføljearbeidet | 15 min | 2 | Ingen | Disiplin over tid, ikke teknikk |

### 🟢 Strategisk — fremtidsorientert

| # | Oppgave | Estimat | Prioritet | Avhengigheter | Utfordringer |
|---|---------|---------|-----------|---------------|--------------|
| S1 | Veikart: milepæler fra 10 → 50 → 100 prosjekter, med kvartalsmål | 40 min | 3 | K3, V3 | Realistisk tempo — 100 prosjekter krever system, ikke skippertak |
| S2 | Identifisere 3 prosjekter med størst inntekts-/publikumspotensial og skissere lanseringsløp | 30 min | 3 | V3 | Krever markedsantakelser som må valideres senere |

**Sum estimert arbeid:** 440 min (7 t 20 min) → 40 min buffer innenfor 8 timer.

---

## 2. Konkret 8-timers arbeidsplan

| Tid | Blokk | Innhold |
|------|-------|---------|
| 08:00–08:45 | **Fundament** | K1: Mappestruktur og kategorisystem |
| 08:45–09:25 | **Fundament** | K2: Prosjektmal / klar-til-bygg-standard |
| 09:25–09:35 | Pause | |
| 09:35–10:35 | **Volum** | K3: Registrere 10 første prosjektidéer |
| 10:35–11:00 | **Synlighet** | V2: README som porteføljeforside |
| 11:00–11:30 | Lunsj | |
| 11:30–13:00 | **Bygging** | K4: Prototype av første Vibe-kort-app (dypt fokus, ingen avbrudd) |
| 13:00–13:40 | **Salg** | V1: Salgsmateriell-mal + one-pager for prototypen |
| 13:40–13:50 | Pause | |
| 13:50–14:25 | **Prioritering** | V3: Prioriteringsmatrise for neste 20 idéer |
| 14:25–15:05 | **Strategi** | S1: Veikart 10 → 50 → 100 prosjekter |
| 15:05–15:35 | **Strategi** | S2: Topp 3-prosjekter og lanseringsløp |
| 15:35–15:55 | **Drift** | M1 + M2: Git-hygiene og statuslogg |
| 15:55–16:30 | **Buffer / avslutning** | Uforutsett, gjennomgang, commit og push av dagens arbeid |

**Grupperingslogikk:** Formiddagen bygger fundamentet (struktur → mal → innhold) fordi alt annet avhenger av det. Den mest krevende byggejobben (prototypen) ligger rett etter lunsj i én uavbrutt blokk. Strategiarbeidet ligger sist — det krever innsikten fra dagens tidligere arbeid for å bli treffsikkert. Bufferen på slutten fanger opp overskridelser uten å velte planen.

---

## 3. Begrunnelse per hovedoppgave

- **K1 (struktur):** Uten kategorisystem blir 100+ prosjekter et arkiv ingen finner frem i. Alt annet arbeid i dag og fremover bygger på dette — derfor først.
- **K2 (mal):** «Klar-til-bygg» er repoets kjerneløfte. En standard mal er det som skiller en idéliste fra en salgbar portefølje.
- **K3 (10 idéer):** Systemet er verdiløst til det er testet med ekte innhold. Ti idéer i dag beviser at malen holder og gir momentum.
- **K4 (prototype):** Én fungerende Vibe-kort-app forvandler repoet fra dokumentasjon til demonstrasjon — det sterkeste salgsargumentet som finnes.
- **V1/V2 (salg og synlighet):** Porteføljen skal selge prosjekter; materiellet må vokse i takt med innholdet, ikke ettermonteres.
- **S1/S2 (strategi):** Uten veikart blir 100-prosjekter-målet et skippertak som dør. En time strategi i dag sparer uker med retningsløst arbeid.

---

## 4. Strategisk analyse av dagens aksjoner

**Situasjonen:** Porteføljen har en tydelig visjon men null infrastruktur. Største risiko er ikke mangel på idéer (visjonen lover 100+), men mangel på system — idéer uten struktur, mal og prioritering forvitrer.

**Dagens strategi angriper dette i tre lag:**

1. **System før innhold** (K1–K2): De to første timene bygger beholderen som gjør at hver idé fremover koster minutter å registrere, ikke timer.
2. **Bevis før volum** (K3–K4): Ti registrerte idéer og én kjørende prototype beviser at konseptet fungerer ende-til-ende — fra idé via mal til demonstrerbart produkt med salgsmateriell.
3. **Retning før fart** (V3, S1–S2): Prioriteringsmatrise og veikart sikrer at morgendagens energi går til prosjektene med høyest potensial, ikke de som tilfeldigvis føles morsomst.

**Risikohåndtering:** Scope-kryp på prototypen er dagens største felle — derfor hard tidsboks (90 min) og buffer sist på dagen. Alt arbeid committes og pushes ved dagens slutt slik at ingenting går tapt.

**Suksesskriterium for dagen:** Ved 16:30 skal en utenforstående kunne åpne repoet, forstå porteføljen på 30 sekunder, bla i 10 strukturerte prosjektidéer, prøve én fungerende prototype — og se et veikart for de neste 90.
