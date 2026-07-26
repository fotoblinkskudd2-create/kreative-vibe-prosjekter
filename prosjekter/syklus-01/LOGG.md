# Syklus 1/17 — 2026-07-26

**Agenter:** codex-msx · drone-sovereign · ide-jakt
**Energi ved start:** 8/10
**Verdi levert:** 8/10

---

## 1. MAX INPUT PULL

Loopen startet fra null: tomt repo, ingen tidligere state. Input var master-prompt-utkastet,
Superhuman Skills-rammeverket og fokusområdene.

**Topp 3 prioriteringer satt:**
1. **agent** — bygge selve loop-maskineriet, ellers har de neste 16 syklusene ingenting å kjøre i
2. **drone** — én konkret 48h-prototype som beviser at loopen produserer bruksting, ikke planer
3. **creative** — én distribusjonsklar leveranse, fordi et verktøy uten rekkevidde er en hobby

## 2. CODEX MSX ANALYSE

**Flaskehals identifisert (klasse: verktøy):** master-prompten definerte ikke hva en «deliverable»
er. En 30-timers loop uten definition-of-done produserer 200 skisser og null ferdige ting. Dette
var den eneste tingen som måtte løses før noe annet hadde verdi.

**Andre funn i originalutkastet:**
- Faseminuttene summerte til 70–100 min i et 90–120-min-vindu — fase 3 ville konsekvent renne over
- «Aktiver relevante sub-agenter» hadde ingen øvre grense → garantert spredning
- Scoringsaksene var uvektede → patent-potensial fikk like mye makt som selgbarhet
- Loopen kunne kun stoppe på tid, ikke fordi den hadde gått tom — som er den sannsynligste feilmodusen
- Ingen søvnkrav i en 30-timers kjøring

Alle fem er rettet i `openclaw/prompts/master-prompt.md`, med begrunnelsestabell.

**Scoring kjørt:** 15 ideer. 1 BYGG NÅ, 11 PARKER, 3 DREP. Tabell i
`ide-jakt/idebank-scoret.md`.

**Agent-miks anbefalt for fase 3:** drone-sovereign (bygg), ide-jakt (screen).

## 3. OPENCLAW ACTION WAVE

Fire leveranser, alle bestått definition-of-done:

| # | Leveranse | Bevis på at den er ferdig |
|---|---|---|
| 1 | **OpenClaw-runner** — state, agent-rotasjon, scoring, logg, sluttrapport | 14 enhetstester grønne; syklus 1 kjørt gjennom den |
| 2 | **Riblet-Kalkulator** — web + CLI | 10 enhetstester; Python og JS gir identiske tall (260.3 µm); verifisert mot håndregning |
| 3 | **Gonzo Suno-pakke «SAKSNUMMER»** — 3 komplette spor + 20 hooks | Style-prompts under Sunos 200-tegnsgrense, strukturtagger på plass, limes rett inn |
| 4 | **Idébank** — 15 ideer scoret med dom og dødsårsak | Regenererbar fra `ideer.json` med én kommando |

Pluss patentnotat 001 skrevet samme øyeblikk som den tekniske vinkelen dukket opp — ikke etterpå.

**48h-prototype:** Riblet-Kalkulatoren. Den er ikke et forslag om et verktøy; den er verktøyet.

## 4. SELF-REFLECTION

### Hva fungerte

**Å bygge maskineriet før innholdet.** Runneren tok tid, men den gjorde syklus 1 målbar. Uten
den ville «verdi levert: 8» vært en følelse.

**Å kjøre scoringsmodellen på ekte data med én gang.** Det avdekket en systematisk feil i
modellen (se under) som ren gjennomlesing aldri ville funnet. Kjør alltid det du bygger.

**Å skrive patentnotatet med en ærlig dom.** Notat 001 konkluderer med at kalkulatoren *ikke*
er patenterbar. Det er mer verdt enn et notat som later som — det peker på nøyaktig hvilke to
ting som må måles for at det skal bli noe.

### Hva var svakt

**Scoringsmodellen straffer enablere.** Vindtunnel-riggen fikk 4.65 → DREP, selv om hvert eneste
tall i riblet-sporet er ubekreftet uten den. Modellen måler produkter og er blind for
infrastruktur. Foreslått rettelse — ny akse `enabler_verdi`, vekt 0.10 — ligger i
`ide-jakt/idebank-scoret.md` og går til codex-msx i syklus 2.

**Ingen idé scoret over 8.** Alle 15 startet fra en teknologi og jobbet framover. Ingen startet
fra en kunde og jobbet bakover. Det er et mønster, ikke et uhell, og neste ide-jakt-syklus må
tvinge fram minst fem av den andre typen.

**DR-tallet i kalkulatoren er svakere enn geometrien.** Geometrien følger av teori; prosenten er
en kurveform lånt fra et annet Reynolds-regime. Det er flagget tydelig i både README og verktøy,
men det er fortsatt den svakeste delen av leveransen.

### State oppdatert

Carry-over til syklus 2 (3 punkter, under taket på 5):
1. Nyhetssøk Google Patents/Espacenet — 2 timer, frist 2026-08-02
2. Vindtunnel-riggen: DREP-dommen manuelt overstyrt, den overlever som enabler
3. `enabler_verdi`-aksen til vurdering

## 5. OUTPUT LOG

```
Syklus 1/17 | Verdi levert: Riblet-Kalkulator (fungerende, testet, med produksjonsdom) +
Suno-pakke SAKSNUMMER + 15 scorede ideer + hele loop-maskineriet med 24 tester + patentnotat 001 |
Neste fokus: nyhetssøk, deretter batteri-derating-kalkulator — samme kjøper, bygger «Verktøykassa»
```

**Neste syklus, anbefalt miks:** codex-msx (obligatorisk) + gonzo-forge + panicsafe.
drone-sovereign og ide-jakt har gått én runde; rotasjonsregelen holder dem tilgjengelige, men
distribusjon er nå flaskehalsen — ikke flere verktøy.
