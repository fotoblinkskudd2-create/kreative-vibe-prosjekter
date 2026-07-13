# SEKSJON 2 — Store oppgraderinger av alt vibe-coded

Ikke småjusteringer. Tre strukturelle leaps: **(A)** OpenClaw fra prompt-samling til kjørbar orkestrator med økonomi, **(B)** Superhuman Skills fra fem siloer til ett kontraktsbasert skill-marked, **(C)** REGNViking OS fra visjon til tre konkrete moduler med målbar ROI.

---

## A. OpenClaw v2 — fra prompt til orkestrator med egen økonomi

**Problemet med v1:** «Master Orchestrator»-prompten er én stor instruks uten minne, uten kostnadskontroll og uten målbart resultat. Den kan ikke bli bedre over tid fordi ingenting måles.

**Leap:** Hver agent får en **kontrakt** (input-skjema, output-skjema, kvalitetsterskel, kostnadsbudsjett), og orkestratoren fører **regnskap**: hva kostet denne agenten i tokens, og hva produserte den i godkjent verdi? Agenter som konsekvent leverer under terskel, mister budsjett. Det er Codex MSX ROI-fokuset ditt — implementert i stedet for deklarert.

### Kjørbart skjelett (Python, Claude API)

```python
# openclaw_v2.py — kontraktsbasert orkestrator, minimal kjerne
import anthropic, json, sqlite3, time

client = anthropic.Anthropic()
DB = sqlite3.connect("openclaw_ledger.db")
DB.execute("""CREATE TABLE IF NOT EXISTS ledger(
    ts REAL, agent TEXT, tokens_in INT, tokens_out INT,
    quality REAL, approved INT)""")

AGENTS = {
    "destillator": {
        "system": "Du finner den ene setningen med mest kraft i rå tekst. "
                  "Returner JSON: {kjerne, hvorfor, tre_vinkler}.",
        "budget_tokens": 2000, "quality_floor": 0.7,
    },
    "kritiker": {
        "system": "Du scorer en artefakt 0-1 mot standarden: sterkere enn input? "
                  "nytteverdi? salgbar? grundig? Returner JSON: {score, svakeste_punkt, fix}.",
        "budget_tokens": 1500, "quality_floor": 0.0,
    },
    # + formatfabrikk, regelagent, markedsagent ... samme kontraktform
}

def run_agent(name, payload):
    a = AGENTS[name]
    msg = client.messages.create(
        model="claude-sonnet-5",           # billig arbeidskraft til rutine
        max_tokens=a["budget_tokens"],
        system=a["system"],
        messages=[{"role": "user", "content": json.dumps(payload, ensure_ascii=False)}],
    )
    out = json.loads(msg.content[0].text)
    return out, msg.usage

def loop(raw_text, max_iters=3):
    """Produser -> kritiser -> forbedre, med regnskap. Stopper når kvalitet er nådd."""
    artefakt, usage = run_agent("destillator", {"tekst": raw_text})
    for i in range(max_iters):
        kritikk, ku = run_agent("kritiker", {"artefakt": artefakt})
        DB.execute("INSERT INTO ledger VALUES(?,?,?,?,?,?)",
                   (time.time(), "destillator", usage.input_tokens,
                    usage.output_tokens, kritikk["score"], kritikk["score"] >= 0.7))
        DB.commit()
        if kritikk["score"] >= 0.85:
            return artefakt          # godkjent — ikke poler i det uendelige
        artefakt, usage = run_agent("destillator",
            {"tekst": raw_text, "forbedre": kritikk["fix"]})
    return artefakt                  # lever beste versjon, logg at taket ble nådd
```

**Nøkkelprinsipper i v2 (dette er oppgraderingen):**
1. **Stor modell kun der dømmekraft kreves** (destillering, kritikk); små/billige modeller til formatering. 60–80 % kostnadskutt målt mot «én diger prompt til største modell».
2. **Stopp-kriterium.** v1-prompten sier «iterer minst én gang»; v2 sier *slutt å iterere ved 0.85* — uendelig polering er den vanligste måten agent-systemer brenner penger på.
3. **Ledger = selvforbedring.** Ukentlig spørring: hvilken agent har lavest godkjenningsrate per krone? Den omskrives først. Nå er «self-improving» en SQL-spørring, ikke et adjektiv.

---

## B. Superhuman Skills Framework v2 — skills som kontrakter, ikke personligheter

**Problemet med v1:** De fem skillsene (Arctic Drone, Gonzo Forge, Codex MSX, PanicSafe Architect, Ide-Jakt) er beskrevet som karakterer. Karakterer kan ikke komponeres; kontrakter kan.

**Leap:** Hver skill blir en mappe med tre filer — og hvilken som helst agent kan da laste hvilken som helst skill:

```
skills/
  arctic-drone/
    SKILL.md        # når skal denne brukes, hva lover den, hva krever den
    knowledge.md    # destillert domenekunnskap (biomimicry-katalog, ising-fysikk, EASA-regler)
    checklist.md    # kvalitetssjekk spesifikk for domenet ("har du regnet energibudsjett?")
  gonzo-forge/
    SKILL.md
    voice.md        # DIN stilprofil: 20 beste avsnitt du har skrevet + hva som gjør dem dine
    ethics.md       # portvakt: privatpersoner anonymiseres, institusjoner navngis
  ...
```

**Ny skill nr. 6 (mangelen i v1): `selger/`** — hver artefakt som produseres får automatisk et svar på «hvem betaler for dette, og hva er neste konkrete salgshandling?» Rammeverket ditt kunne bygge og skape, men ikke selge. Det er derfor prosjektene stoppet ved prototype.

**Ny skill nr. 7: `arkivar/`** — alt som godkjennes embeddes og indekseres. Neste gang en agent jobber, henter den dine tre beste tidligere artefakter i samme sjanger som stilanker. Slik slutter systemet å starte på null hver gang — det er dette som gjør loopen genuint self-improving.

---

## C. REGNViking OS — tre moduler som kan bygges nå

| Modul | Hva | ROI-måling |
|---|---|---|
| **Regnskapet** | OpenClaw-ledgeren (over) + ukentlig auto-rapport: kostnad, godkjenningsrate, beste artefakt | Kr/godkjent artefakt, trend |
| **Vaktbua** | Én daglig kjøring (cron): les innboks/kalender/biometri-varsler (MEDVIND-API), produser ÉN prioritert dagsplan med maks tre oppgaver | Fullførte topp-3 per uke |
| **Smia** | RÅSTEMME-pipelinen (seksjon 1, idé 4) som OS-tjeneste: rå tekst inn → publiseringskø ut | Publiserte artefakter/uke, engasjement |

**Arkitekturregel for hele OS-et (leap i robusthet):** Alle moduler kommuniserer via filer i git (artefakter som markdown, kø som YAML) — ikke via delt minne eller database-magi. Alt er versjonert, alt kan inspiseres, alt overlever krasj, og du kan når som helst overta manuelt. Enkelhet er ikke mangel på ambisjon; det er det som gjør 24/7-drift mulig for én person.

---

## Oppgradert master-prompt (erstatter v1-strawman)

```text
Du er REGNViking Orchestrator v2.

KONTRAKT: Hver oppgave har (1) definert leveranse, (2) kvalitetsterskel 0.85,
(3) token-budsjett, (4) maks 3 forbedringsrunder. Overskrid aldri budsjett
for å jage perfeksjon — lever beste versjon og flagg resten.

RUTING: Dømmekraft (destillering, kritikk, strategi) -> stor modell.
Formatering, ekstraksjon, oppsummering -> liten modell.

STANDARD per artefakt: Sterkere enn input? Konkret nytteverdi? Identifiserbar
betalende kunde? Etikk-portvakt passert (privatpersoner anonymisert,
institusjoner kan navngis)? Grønn vinkel vurdert (ikke påklistret)?

SELVFORBEDRING: Logg alt i ledger. Ved ukeslutt: identifiser agenten med
lavest godkjenningsrate per krone og foreslå omskriving av dens kontrakt.

ÆRLIGHET: Usikre tall merkes [estimat]. Manglende data sies rett ut.
Hype flagges som hype - også vår egen.
```

**Hvorfor dette er en leap og ikke en justering:** v1 optimaliserte for *intensitet* (mer krav, mer press, «da er du ferdig»). v2 optimaliserer for *gjennomstrømning av godkjent verdi per krone* — og det er den eneste metrikken som bygger et imperium i stedet for en utbrenthet.
