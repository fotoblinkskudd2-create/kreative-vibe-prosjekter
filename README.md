# kreative-vibe-prosjekter

100+ ideelle prosjekter, musikkidéer, satire prosjekter, videoer og Vibe-kort apper.
Inkluderer prototyper, salgsmateriell og klar-til-bygg info. Laget for brukeren.

---

## Planner — to verktøy for å planlegge før agenten koder

To webverktøy som kjører i nettleseren. Det meste av tokens går med til at agenten
gjetter hva du mente, bygger noe du ikke ba om, og gjør det om igjen. Verktøyene
fjerner den runden.

| Fil | Verktøy | Hva du får |
|---|---|---|
| `index.html` | Start | Oversikt og forklaring av flyten |
| `vibe-planner.html` | **Vibe Code Planner** | Løs idé → tett brief, faseplan og første prompt |
| `agent-planner.html` | **Agent Run Planner** | Oppgaver → modellvalg, kjøreplan i bølger og budsjett |

### Kom i gang

Ingen avhengigheter, ingen byggesteg.

```bash
git clone https://github.com/fotoblinkskudd2-create/kreative-vibe-prosjekter.git
cd kreative-vibe-prosjekter
# åpne index.html i nettleseren, eller:
npx http-server -p 8080
```

Skal det ligge på nett: slå på GitHub Pages for `main` / rotmappa i
*Settings → Pages*. Alt er statisk, så det er alt som skal til.

---

### Vibe Code Planner

Du fyller ut prosjektet én gang: hva det er, hva som må være med, hva som er
kjekt å ha — og hva som **ikke** skal bygges. Det siste er der de fleste tokens
spares, fordi innlogging, database og admin-panel er tingene en agent bygger
uoppfordret.

Ut kommer fire ferdige tekster:

- **`BRIEF.md`** — den tette briefen. Omfang, regler, akseptansekriterier.
- **`CLAUDE.md`** — kontekstfil som blir liggende i repoet.
- **`PLAN.md`** — faseplan med foreslått modell per oppgave.
- **Første prompt** — én melding du limer rett inn, med brief og første oppgave.

Faseplanen foreslås ut fra prosjekttype og må-ha-listen. Oppgaver du har rettet
på kan låses 🔒 så de overlever at du genererer resten på nytt.

### Agent Run Planner

Tar imot oppgaver — enten fra Vibe Code Planner med ett klikk, eller lagt inn
manuelt — og svarer på tre spørsmål før du starter kjøringen:

- **Hvilken modell fortjener hver oppgave?** Automatisk forslag ut fra arbeidstype,
  størrelse og hvor kritisk oppgaven er. Standarden er den billigste modellen som
  holder. Du kan overstyre per oppgave.
- **Hva kan gå samtidig?** Avhengigheter gir bølger. Med et tak på samtidige
  agenter deles brede bølger i puljer, og tiden regnes deretter.
- **Hva koster det?** Kostnad per modell, med og uten prompt caching, målt mot
  referansen «alt på den største modellen uten caching».

Ut kommer `RUNBOOK.md`, én ferdig prompt per oppgave, og kostnaden som CSV.

Verktøyet advarer også når noe ser skjevt ut: oppgaver som fyller for mye av
kontekstvinduet, for mange L-oppgaver, for mye Opus, eller manglende fast kontekst.

---

### Om anslagene

Tallene er **anslag, ikke fakturering.** De er der for å vise størrelsesorden og
forskjellen mellom to måter å jobbe på — ikke hva en konkret kjøring faktisk koster.

- Tokens telles som tegn delt på 3,7. Det er en tommelfingerregel for
  norsk/engelsk blandet med kode, ikke en ekte tokenizer.
- Modellprisene er **redigerbare standardverdier** i USD per million tokens.
  Sjekk gjeldende priser hos leverandøren og rett dem i tabellen under *Priser*.
- Caching regnes som 125 % av inn-prisen for skriving og 10 % for lesing.
- Forutsetningene bak sammenligningen — runder per oppgave med og uten plan,
  kontekst per runde, påslag for feilkjøringer — kan du selv endre.

### Personvern

Alt kjører lokalt i nettleseren. Ingen konto, ingen server, ingenting sendes noe
sted. Arbeidet ligger i nettleserens `localStorage` og kan eksporteres som `.json`
eller markdown.

### Struktur

```
index.html            Startside
vibe-planner.html     Vibe Code Planner
agent-planner.html    Agent Run Planner
assets/
  styles.css          Felles stil, lyst og mørkt tema
  core.js             Tokenestimering, modellruting, kostnad, bølger, lagring
  vibe-planner.js     Brief-generering og faseplan
  agent-planner.js    Kjøreplan, budsjett og prompts
```
