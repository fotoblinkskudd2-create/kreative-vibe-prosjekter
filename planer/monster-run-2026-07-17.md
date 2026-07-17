# Monster-Run: 17. juli 2026

## 1. Gjennomgang og analyse

### Hva som faktisk finnes per i dag

| Kilde | Funn |
|---|---|
| Git-historikk | Én commit («Initial commit») — ingen tidligere arbeidsmønstre å analysere |
| Filer i repoet | Kun `README.md` |
| Tidligere sesjoner/minner | Ingen tilgjengelige — denne sesjonen starter uten historikk |
| Ekstrahert verdi hittil | Én ting: **visjonen i README** — «100+ ideelle prosjekter, musikkidéer, satire prosjekter, videoer og Vibe-kort apper. Inkluderer prototyper, salgsmateriell og klar-til-bygg info.» |

### Konklusjon fra analysen

Det finnes ingen prosess å optimalisere ennå — det finnes en **visjon uten struktur**.
Den største verdilekkasjen akkurat nå er ikke ineffektive loops, men at idéer ikke har
noe sted å lande, ingen mal å fylle, og ingen vei fra «idé» til «klar-til-bygg».

Dagens monster-run er derfor en **grunnleggings-run**: bygg maskineriet som alle
fremtidige runs skal kjøre gjennom. Verdien av dagens arbeid måles i hvor billig
*neste* run blir.

---

## 2. Hovedmål og deliverables for dagen

**Hovedmål:** Repoet går fra «README med visjon» til «fungerende idéfabrikk» —
struktur, seedet katalog, én ferdig prototype, salgsmal og en gjenbrukbar loop.

**Deliverables:**
1. Full mappestruktur med maler (idékort, prototype-spec, salgs-one-pager)
2. Idékatalog seedet med minimum 25 kategoriserte idéer
3. Første Vibe-kort-prototype (kjørbar HTML, null avhengigheter)
4. Salgs-one-pagers for de 3 høyest scorede idéene
5. Loop-systemet dokumentert + lærdomslogg opprettet (se `system/loop-system.md`)

---

## 3. Prioriterte oppgaver i rekkefølge

### Oppgave 1 — Fundament: struktur og maler *(45 min)*
Opprett mappestrukturen og malene alt annet skal fylles inn i:

```
kreative-vibe-prosjekter/
├── ideer/                  # ett idékort per idé (mal: _mal-idekort.md)
│   ├── musikk/
│   ├── satire/
│   ├── video/
│   └── vibe-kort-apper/
├── prototyper/             # kjørbare prototyper, én mappe per prosjekt
├── salgsmateriell/         # one-pagers og pitch-tekster
├── planer/                 # monster-run-planer (denne filen)
└── system/                 # loop-system + lærdomslogg
```

Idékort-malen skal ha faste felter: *Tittel, Kategori, Én-setnings-pitch,
Målgruppe, Innsats (S/M/L), Verdi (1–5), Klar-til-bygg? (ja/nei), Neste steg.*
Faste felter er det som gjør Layer 3 (verdiutvinning) mulig — uten dem kan
ingenting scores eller sammenlignes.

**Ferdig når:** strukturen er committet og malene kan fylles ut uten å tenke.

### Oppgave 2 — Idé-dump: seed katalogen *(1,5 t)*
Kjør Layer 2-loopen (se loop-systemet) i 4 iterasjoner — én per kategori
(musikk, satire, video, vibe-kort-apper). Mål: 25+ idékort totalt, hvert med
utfylt innsats/verdi-score. Kvantitet først, kuratering etterpå.

**Ferdig når:** `ideer/` inneholder 25+ kort og en `INDEX.md` med score-tabell.

### Oppgave 3 — Første prototype: Vibe-kort MVP *(2,5 t)*
Velg idéen med best verdi/innsats-forhold fra kategorien vibe-kort-apper og bygg
en kjørbar prototype: én selvstendig `index.html` (inline CSS/JS, ingen
avhengigheter) som kan åpnes rett i nettleser. Omfang: kortvisning, bla/stokk,
én «vibe»-mekanikk. Ikke mer.

**Ferdig når:** prototypen kjører i nettleser og har en README med skjermbilde-
beskrivelse og «klar-til-bygg»-notat.

### Oppgave 4 — Salgsmateriell for topp 3 *(1 t)*
Ta de 3 høyest scorede idéene fra INDEX.md og skriv én one-pager per idé etter
malen: *Problem → Løsning → Hvem betaler/bryr seg → Hvorfor nå → Neste steg.*
Maks én side hver — lengde er ikke verdi her.

**Ferdig når:** 3 one-pagers ligger i `salgsmateriell/`.

### Oppgave 5 — Lukk loopen: lærdomslogg *(30 min)*
Kjør Layer 4: fyll ut `system/laerdomslogg.md` med dagens innsikter, hva som ga
høy verdi per time, og hva neste monster-run skal starte med. Commit og push alt.

**Ferdig når:** loggen har en datert seksjon for i dag og alt er pushet.

### Total estimert tid: ~6 timer og 15 min

---

## 4. Forventet verdiutvinning

- **Umiddelbart:** 25+ idéer gjort sammenlignbare, 1 kjørbar prototype,
  3 salgsklare one-pagers.
- **Strukturelt:** neste run trenger null oppsett — den åpner loggen, leser
  «neste steg» og kjører Layer 2 direkte. Estimert oppstartskostnad for run #2:
  under 5 minutter.
- **Målbart:** score-tabellen i INDEX.md gjør at hver fremtidige run kan svare
  på «hva er det mest verdifulle jeg kan gjøre nå?» med data i stedet for magefølelse.
