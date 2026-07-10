# Strategisk arbeidsplan – 8-timers arbeidsperiode

**Dato:** 10. juli 2026
**Kontekst:** Repositoriet `kreative-vibe-prosjekter` er i oppstartsfasen. Visjonen er definert i README (100+ ideelle prosjekter, musikkidéer, satireprosjekter, videoer og Vibe-kort-apper med prototyper og salgsmateriell), men ingenting er bygget ennå. Dagens strategiske hovedmål: **gå fra idé til fungerende fundament** – struktur, prioritering og første synlige leveranse.

---

## 1. Prioritert oppgaveliste

### 🔴 Kritisk – må gjøres i dag

| # | Oppgave | Tid (min) | Prioritet | Avhengigheter | Utfordringer |
|---|---------|-----------|-----------|---------------|--------------|
| K1 | Etablere mappestruktur og kategorisystem for de 100+ prosjektene (musikk, satire, video, vibe-kort, salgsmateriell) | 45 | 5 | Ingen | Feil struktur nå gir dyr omorganisering senere |
| K2 | Idéfangst: dokumentere og registrere eksisterende idéer i et felles register (`IDEBANK.md`) med status per idé | 90 | 5 | K1 | Idéene finnes trolig spredt (hoder, notater); risiko for tap |
| K3 | Prioriteringsmatrise: score alle idéer på innsats vs. verdi, velg 3–5 kandidater for første prototype | 60 | 5 | K2 | Fristelsen til å starte for mange ting samtidig |

**Begrunnelse:** Uten struktur og et samlet idéregister er «100+ prosjekter» bare støy. Alt annet arbeid i dag og fremover avhenger av at dette fundamentet legges først. Dette er dagens forretningskritiske behov.

### 🟠 Viktig – bør gjøres i dag

| # | Oppgave | Tid (min) | Prioritet | Avhengigheter | Utfordringer |
|---|---------|-----------|-----------|---------------|--------------|
| V1 | Bygge første prototype av Vibe-kort-appen (enkel HTML/JS, klikkbar demo) | 120 | 4 | K3 | Scope-krig: hold det til én kjernefunksjon |
| V2 | Utkast til salgsmateriell-mal (én pitch-side per prosjekt: problem, løsning, målgruppe) | 45 | 3 | K1 | Må være gjenbrukbar, ikke skreddersydd per idé |

**Begrunnelse:** En synlig, klikkbar prototype ved dagens slutt beviser konseptet, skaper momentum og gir noe konkret å vise frem. Salgsmateriell-malen gjør at hver fremtidig idé kan «pakkes» på minutter i stedet for timer.

### 🟡 Vedlikehold – løpende oppgaver

| # | Oppgave | Tid (min) | Prioritet | Avhengigheter | Utfordringer |
|---|---------|-----------|-----------|---------------|--------------|
| M1 | Git-hygiene: .gitignore, bidragsregler, commit-konvensjoner | 20 | 3 | Ingen | Lav – men lett å glemme |
| M2 | Oppdatere README med struktur, status og veikart | 25 | 3 | K1, K3 | Må holdes kort og levende |
| M3 | Commit + push av dagens arbeid i logiske bolker | 15 | 4 | Løpende | Ikke vent til dagens slutt med alt |

**Begrunnelse:** Operasjonell drift. Små investeringer nå som hindrer teknisk gjeld og gjør repoet forståelig for andre (og for deg selv om tre uker).

### 🔵 Strategisk – fremtidsorientert arbeid

| # | Oppgave | Tid (min) | Prioritet | Avhengigheter | Utfordringer |
|---|---------|-----------|-----------|---------------|--------------|
| S1 | Veikart Q3/Q4: milepæler for de 3–5 prioriterte prosjektene | 40 | 3 | K3 | Usikkerhet – hold det på milepælsnivå, ikke detaljplan |
| S2 | Risikovurdering: identifisere de 3 største risikoene (idéspredning, manglende fullføring, ingen publiseringskanal) med tiltak | 20 | 3 | K3 | Ærlighet om egne svakheter |
| S3 | Teamutvikling/kompetanse: notere hvilke verktøy og ferdigheter som trengs (f.eks. musikkproduksjon, videoredigering, app-distribusjon) | 20 | 2 | S1 | Kan bli en ønskeliste – knytt til konkrete prosjekter |

**Begrunnelse:** Én dag med struktur er bortkastet hvis det ikke finnes en retning videre. Veikartet og risikolisten sikrer at momentum fra i dag overlever til i morgen.

---

## 2. Konkret 8-timers arbeidsplan

| Tid | Blokk | Innhold |
|------|-------|---------|
| 08:00–08:45 | **Fundament** | K1: Mappestruktur og kategorisystem |
| 08:45–10:15 | **Idéfangst** | K2: Idébank – registrere og statussette alle idéer |
| 10:15–10:30 | ☕ Pause | Hjernehvile før prioritering |
| 10:30–11:30 | **Prioritering** | K3: Innsats/verdi-matrise, velg 3–5 satsinger |
| 11:30–11:50 | **Drift** | M1: Git-hygiene + M3: commit av formiddagens arbeid |
| 11:50–12:30 | 🍽️ Lunsj | |
| 12:30–14:30 | **Bygging** | V1: Vibe-kort-prototype (dagens dype fokusblokk – ingen avbrytelser) |
| 14:30–15:15 | **Pakketering** | V2: Salgsmateriell-mal + M2: README-oppdatering |
| 15:15–15:30 | ☕ Pause | |
| 15:30–16:10 | **Strategi** | S1: Veikart Q3/Q4 |
| 16:10–16:50 | **Risiko & kompetanse** | S2 + S3, deretter M3: siste commit/push |
| 16:50–17:20 | **Buffer** | 30 min reservert for overskridelser eller uventede problemer |
| 17:20–17:30 | **Avslutning** | Dagslogg: hva ble gjort, hva er første oppgave i morgen |

**Designprinsipper for planen:**
- **Tenkearbeid før lunsj, byggearbeid etter** – prioritering krever fersk hjerne; prototyping tåler ettermiddagen bedre.
- **Relaterte oppgaver er gruppert** (fundament → idéfangst → prioritering er én sammenhengende kjede; strategi-blokkene ligger samlet).
- **Buffer på ~40 min totalt** (dedikert blokk + slakk i overgangene) for uventede situasjoner.
- **Commit underveis**, ikke bare på slutten – arbeid som ikke er pushet, finnes ikke.

---

## 3. Strategisk analyse av dagens aksjoner

**Situasjon:** Prosjektet har en sterk visjon, men null infrastruktur. Den største risikoen er ikke mangel på idéer – det er *idéspredning*: 100+ prosjekter uten prioritering betyr at ingen blir ferdige.

**Dagens tre strategiske grep:**

1. **Struktur før innhold (K1–K2).** Et idéregister med status gjør porteføljen styrbar. Dette er forskjellen på en idémyldring og en produktportefølje.
2. **Brutal prioritering (K3).** Å velge 3–5 satsinger betyr å *velge bort* 95+. Det er dagens vanskeligste og viktigste beslutning – og grunnen til at den ligger på formiddagen.
3. **Én synlig leveranse (V1).** En klikkbar Vibe-kort-prototype ved dagens slutt konverterer strategi til bevis. Momentum bygges av ferdige ting, ikke av planer.

**Suksesskriterium kl. 17:30:** Repoet har struktur, en idébank, 3–5 prioriterte satsinger, én fungerende prototype og et veikart – alt committet og pushet.
