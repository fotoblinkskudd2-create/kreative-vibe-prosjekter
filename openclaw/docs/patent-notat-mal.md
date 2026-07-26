# Patentnotat — mal

Kopier denne til `prosjekter/syklus-XX/patent/patentnotat-NNN-<kortnavn>.md` i det øyeblikket
en teknisk effekt oppdages. Ikke etter syklusen. Datoen på notatet er hele poenget.

> **Dette er en arbeidsmal for dokumentasjon, ikke juridisk rådgivning.** Før du publiserer
> noe som helst om en oppfinnelse: snakk med en patentrådgiver. Norsk/europeisk praksis
> krever **absolutt nyhet** — én offentlig visning, ett forum-innlegg, én video før
> søknadsdato kan ødelegge patenterbarheten permanent. USA har 12 måneders frist, EPO har
> ingen. Rekkefølgen er alltid: dokumentér → vurdér søknad → publisér.

---

## Notat NNN — `<tittel>`

**Dato:** ÅÅÅÅ-MM-DD
**Oppfinner:** Alexander, Bergen
**Syklus:** X/17
**Vitne / tidsstempel:** `<git-commit-hash, e-post til deg selv, eller signert PDF>`

### 1. Problemet
Hva er det tekniske problemet? Ikke markedsproblemet — det tekniske. Én til tre setninger.

### 2. Den tekniske effekten
Hva skjer fysisk som ikke skjedde før? Med tall og enhet.
Eksempel: «Skjærmotstand i turbulent grensesjikt reduseres 6–8 % ved rilleavstand s⁺ = 15–20.»

### 3. Løsningen
Hvordan oppnås effekten? Konkret nok til at en fagperson kan gjenskape den.
- Geometri / dimensjoner:
- Materiale:
- Prosess / metode:
- Parameterområde der effekten gjelder:

### 4. Hva er nytt
Hva har du ikke funnet publisert? List konkret hva du har sjekket:
- [ ] Google Patents (søkeord: `<...>`)
- [ ] Espacenet
- [ ] Google Scholar / arXiv
- [ ] Produkter på markedet
Funn som ligner, og hvorfor ditt er forskjellig:

### 5. Hvorfor det ikke er åpenbart
Hvorfor har ikke en fagperson gjort dette allerede? Vanlige gyldige svar:
uventet parameterområde · kombinasjon på tvers av felt · effekt som går motsatt av forventning ·
mulig først med ny produksjonsteknikk.

### 6. Kravskisse (rå)
> 1. En `<innretning/fremgangsmåte>` for `<formål>`, **kjennetegnet ved** `<det nye trekket>`.
> 2. `<Innretning>` ifølge krav 1, der `<parameter>` er mellom `<X>` og `<Y>`.
> 3. `<Innretning>` ifølge krav 1 eller 2, der `<materiale/prosess>`.

Det som står etter «kjennetegnet ved» er det du faktisk eier. Alt før er kjent teknikk.

### 7. Bevis
- [ ] Måledata / simulering vedlagt: `<sti>`
- [ ] Bilder / CAD: `<sti>`
- [ ] Kildekode ved commit: `<hash>`
- [ ] Uavhengig repetisjon: `<dato>`

### 8. Publiseringssperre
- [ ] **INGENTING publiseres om dette før patentvurdering er gjort**
- Sperren gjelder til: `<dato>`
- Hva som er greit å publisere i mellomtiden: `<f.eks. resultatet uten geometri>`

### 9. Neste handling
Én linje. Med dato.

---

## Praktisk rekkefølge for en solopreneur

1. **Notat + tidsstempel** (gratis, gjør det i dag — git-commit er et brukbart tidsstempel)
2. **Nyhetssøk** (gratis, 2 timer i Espacenet og Google Patents)
3. **Prototype + måledata** (uten måledata er kravene gjetning)
4. **Vurdering med rådgiver** — Patentstyret har veiledningstjeneste, og Innovasjon Norge har
   støtteordninger for IPR-rådgivning for enkeltpersonforetak
5. **Søknad** (norsk søknad først gir 12 måneders prioritet til PCT — billigste vei til
   internasjonal opsjon)
6. **Så** publiser, demonstrer, selg
