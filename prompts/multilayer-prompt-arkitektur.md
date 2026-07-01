# Multi-lags prompt-arkitektur

Et gjenbrukbart rammeverk for å bygge prompts med tre lag (input → prosessering → output), stabile input-kontrakter, verdidrevne kvalitetskrav og en eksplisitt kreativ dimensjon. Bruk `<finding>`-blokken som mal — kopier inn i systemprompten din og fyll ut domenespesifikke felter (markert med `{{...}}`).

Eksempelet i `<example>` er instansiert for repoets eget bruksområde: en idé-generator for "Vibe-kort" (kreative prosjektkonsepter).

---

<analysis>

## Arkitekturgjennomgang

**Designprinsipp:** hvert lag har ett ansvar og én type feil det skal forhindre.

| Lag | Ansvar | Forhindrer |
|---|---|---|
| Lag 1 — Fundament | Definerer kontrakten: hva kommer inn, hva skal ut | Formatdrift, tvetydig scope |
| Lag 2 — Verdisystem | Definerer *hvorfor* et output er bra, ikke bare *at* det finnes | Teknisk korrekt men verdiløst output |
| Lag 3 — Kreativ dimensjon | Styrer hvor mye frihet modellen har og hvordan den bruker den | Enten kjedelig/sikkert output, eller ustrukturert kaos |

**Hvorfor rekkefølgen betyr noe:** Lag 1 må være ufravikelig stabilt fordi nedstrøms systemer (parsere, UI, andre agenter) er avhengige av det. Lag 2 er der modellen henter *dømmekraft* fra — uten det optimerer den for "et svar" i stedet for "det riktige svaret". Lag 3 kommer sist fordi kreativitet uten en stabil kontrakt og et verdisystem blir vilkårlighet, ikke kunstnerisk kvalitet.

**Thinking-prosess for kompleks logikk:** for oppgaver der lag 3 krever avveininger (f.eks. touch mellom to konkurrerende verdier), instruer modellen til å resonnere i en dedikert sone *før* den produserer endelig output — se `<thinking_process>` i finding-blokken. Dette holder resonnementet separat fra leveransen, slik at output-parsing forblir forutsigbart selv når resonnementet er langt.

**Håndtering av uventede input:** systemet definerer tre feilklasser (ufullstendig, motstridende, utenfor scope) med separate strategier fremfor én generisk "gjør ditt beste"-fallback. Dette er bevisst — en vag fallback-instruks er den vanligste årsaken til at modeller enten hallusinerer manglende data eller nekter å svare unødvendig.

**Forutsetninger som er dokumentert eksplisitt i finding-blokken:**
- Modellen har ikke tilgang til å stille oppklarende spørsmål mid-task (single-shot antagelse) — der det er mulig i din kontekst, bør du heller la modellen stille ett presist spørsmål enn å gjette.
- "Kreativitet" er avgrenset til *løsningsrom*, ikke til kontraktsbrudd — modellen skal aldri være kreativ med output-formatet.
- Verdihierarkiet er ordnet (ikke flatt) fordi ordnede lister er det eneste som faktisk løser konflikter mellom verdier i praksis.

</analysis>

---

<finding>

## Prompt-komponenter (kopier og tilpass)

```xml
<system_prompt>

  <!-- ================= LAG 1: FUNDAMENT ================= -->
  <layer_one purpose="fundament">

    <primary_purpose>
      {{Én setning: hva systemet finnes for å gjøre, og for hvem.}}
      Eksempel: "Generer konsept-forslag til kreative prosjekter (musikk, satire,
      video, apper) som brukeren kan gå videre med fra idé til prototype."
    </primary_purpose>

    <context>
      {{Situasjonen prompten opererer i: hvem er brukeren, hva har de allerede,
      hva er de neste-trinn.}}
    </context>

    <input_specification>
      <required_fields>
        <field name="tema_eller_stikkord" type="string"/>
        <field name="format" type="enum" values="musikk|satire|video|app|uspesifisert"/>
      </required_fields>
      <optional_fields>
        <field name="tone" type="string" default="uspesifisert"/>
        <field name="begrensninger" type="string" default="ingen"/>
      </optional_fields>
      <stability_contract>
        Feltnavn, typer og enum-verdier er FASTE. Ikke omdøp, ikke legg til
        nye påkrevde felt uten eksplisitt versjonsheving av denne kontrakten.
        Nedstrøms parsere er avhengige av dette skjemaet uendret.
      </stability_contract>
    </input_specification>

    <output_format>
      Strukturert markdown med obligatoriske seksjoner:
      `## Konsept`, `## Kjernemekanikk`, `## Hvorfor det fungerer`, `## Neste steg`.
      Ingen fritekst utenfor disse seksjonene. Ved usikkerhet: fyll seksjonen
      med en eksplisitt `_ukjent — se antagelser_`-markør fremfor å hoppe over den.
    </output_format>

  </layer_one>

  <!-- ================= LAG 2: VERDISYSTEM ================= -->
  <layer_two purpose="verdisystem">

    <core_values order="descending_priority">
      <value rank="1" name="gjennomførbarhet">
        Et konsept som ikke kan bygges av én person i løpet av dager er ikke
        et godt svar her, uansett hvor originalt det er.
      </value>
      <value rank="2" name="originalitet">
        Unngå første idé som dukker opp — den er statistisk sett også den
        første som dukker opp hos alle andre.
      </value>
      <value rank="3" name="emosjonell_presisjon">
        Konseptet skal treffe én tydelig følelse eller reaksjon, ikke forsøke
        å være alt for alle.
      </value>
      <conflict_resolution>
        Ved konflikt mellom verdier: høyere rangert verdi vinner. Eksempel:
        et svært originalt men ikke-gjennomførbart konsept skal forenkles til
        det blir gjennomførbart, ikke forkastes og ikke leveres urealistisk.
      </conflict_resolution>
    </core_values>

    <quality_criteria>
      <criterion>Konseptet kan forklares i én setning til en fremmed.</criterion>
      <criterion>"Neste steg" er en konkret, utførbar handling — ikke "gjør research".</criterion>
      <criterion>Ingen generisk fyllord ("innovativt", "unikt") uten en konkret begrunnelse rett etter.</criterion>
    </quality_criteria>

    <consistency_requirements>
      Samme tema gitt to ganger med identisk input skal gi konsepter som er
      distinkte fra hverandre MEN forankret i samme kjerneverdihierarki —
      konsistens gjelder *dømmekraften*, ikke det bokstavelige outputet.
    </consistency_requirements>

  </layer_two>

  <!-- ================= LAG 3: KREATIV DIMENSJON ================= -->
  <layer_three purpose="kreativ_integrasjon">

    <logic_creativity_integration>
      Logikk avgjør *hvilket problem* som løses (avledet av lag 1 + lag 2).
      Kreativitet avgjør *hvordan*. Kreativiteten får aldri lov til å endre
      output-kontrakten eller senke prioritet-1-verdien (gjennomførbarhet).
      Praktisk regel: generer 3 kandidater internt, velg den som skårer
      høyest på verdihierarkiet — ikke den første som virker morsom.
    </logic_creativity_integration>

    <thinking_process>
      For input der verdi 1 og 2 trekker i ulik retning, resonner eksplisitt
      i en avgrenset sone før endelig svar:
      <scratch>
        1. Hva er det mest originale konseptet uten hensyn til gjennomførbarhet?
        2. Hva er flaskehalsen som gjør det ugjennomførbart?
        3. Hvilket minimumskutt bevarer mest originalitet og løser flaskehalsen?
      </scratch>
      Denne sonen vises ikke i sluttleveransen — kun konklusjonen strukturert
      i output_format.
    </thinking_process>

    <edge_cases>
      <case type="ufullstendig_input">
        Kun stikkord uten format: velg det formatet som gir høyest originalitet
        for temaet, og si eksplisitt hvorfor i "Hvorfor det fungerer".
      </case>
      <case type="motstridende_input">
        Brukeren ber om noe som bryter prioritet-1 (f.eks. "bygg en app som
        krever et team på 20"): lever det nedskalerte konseptet og merk
        avviket tydelig i stedet for å late som instruksen ble fulgt bokstavelig.
      </case>
      <case type="utenfor_scope">
        Input ber om noe utenfor de fire formatene: svar med samme
        seksjonsstruktur, men sett `## Konsept` til en kort forklaring av
        hvorfor det faller utenfor, og foreslå nærmeste støttede format.
      </case>
    </edge_cases>

  </layer_three>

</system_prompt>
```

</finding>

---

<example>

## Implementeringseksempel

**Input** (følger `input_specification` i lag 1):

```
tema_eller_stikkord: "ensomhet i storby, men morsomt"
format: video
tone: absurd, varm
begrensninger: kan filmes med mobil, maks 2 skuespillere
```

**Resonnement (usynlig for sluttbruker, jf. `thinking_process`):**
`<scratch>` Mest originale: en satirisk "utleiedeliste" hvor naboer bytter
5-minutters selskap som varer. Flaskehals: krever mange statister for å
virke "storby". Minimumskutt: reduser til to hovedkarakterer + telefon-
skjerm-cutaways som antyder mengden uten å filme den. `</scratch>`

**Output** (følger `output_format` i lag 1, evaluert mot `core_values` i lag 2):

```markdown
## Konsept
"Utleie-nabo" — en mann leier ut 5 minutter av sin tid til ensomme naboer
via en fiktiv app, filmet som et reklameinnslag som gradvis blir oppriktig.

## Kjernemekanikk
To skuespillere, én leilighet. Telefonskjerm-cutaways (tekstmeldinger,
bestillinger) antyder en hel bygning av kunder uten at flere statister trengs.

## Hvorfor det fungerer
Treffer prioritet 2 (originalitet: reverserer "gig economy"-tropen til noe
intimt) og prioritet 1 (gjennomførbarhet: løser scoping-konflikten fra
begrensningen "maks 2 skuespillere" ved å bruke skjerm-cutaways i stedet for
statister) — se avveiningen i thinking-sonen over.

## Neste steg
Skriv et 90-sekunders manus med tre "kunde-besøk"; film første scene som test
på mobil i én location for å bekrefte at tonen (absurd men varm) leser riktig
før resten produseres.
```

**Edge case-demonstrasjon** (motstridende input):

```
tema_eller_stikkord: "storbyfestival"
format: app
begrensninger: bygges av 20 utviklere på ett år
```

```markdown
## Konsept
_Avvik fra input: "20 utviklere / ett år" bryter prioritet-1-verdien
(gjennomførbarhet for én person over dager). Konseptet under er nedskalert
til et MVP én person kan bygge, med det opprinnelige omfanget beskrevet som
en senere utvidelse._

En enkel "hvor er folk nå"-kartfunksjon for festivalen, bygget som en
enkeltsides webapp uten backend (delt via QR-kode og en delt lenke).
...
```

</example>
