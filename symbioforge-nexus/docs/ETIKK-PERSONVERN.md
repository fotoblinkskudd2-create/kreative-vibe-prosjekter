# Etikk og personvern — GDPR+ som designkrav

SymbioForge Nexus forsker på sårbare grupper: sultne barn, ensomme eldre,
nevrodivergente unge, gutter og jenter i krise. Da er etikk ikke et
compliance-lag — det er arkitektur.

## De fem garantiene

### 1. Data forlater aldri kilden (føderert læring)
Modeller reiser til dataen. FHI-data blir hos FHI, sudanske felt-data blir hos
den sudanske partneren. Kun modellvekter og differensielt private aggregater
krysser grenser, med homomorf kryptering på aggregeringssteget.

### 2. BiasGuard kan ikke skrus av
Equity-vernet er et obligatorisk steg i Discovery-løkka, ikke en policy:
generalisering til regioner med datadekning under 40 % **blokkeres i kode**
(se `core/symbioforge/agents.py`, `BiasGuardAgent`). Et funn fra norske
registre er ikke gyldig for Sahel før Sahel-data og lokal co-design finnes.

### 3. Berørte grupper har makt, ikke bare stemme
- **CitizenValidator** er obligatorisk steg: panelrunder med berørte, kompensert
  med Impact Tokens.
- **DAO-vetorett:** gruppen en studie handler om kan stanse den. En studie om
  jenters psykiske helse kan vetoes av jentepanelet.
- Tokens kan **kun** veksles til hjelpetjenester eller doneres — aldri
  børsnoteres. Det fjerner spekulasjonsinsentivet.

### 4. Full sporbarhet, ingen etterpåklokskap
Hver melding mellom agenter er innholdsadressert (SHA-256); hele kjeden
kondenseres til én audit-hash som ankres offentlig. Alle kan verifisere at
policy-briefen faktisk følger av dataene og modellene som er oppgitt —
og at ingenting er endret i etterkant.

### 5. Simulering designer piloter — den erstatter dem aldri
Virtuelle RCT-er i tvillingene brukes til å *prioritere og dimensjonere* ekte
piloter (som godkjennes av REK/etikk-komité per land). Ingen policy-anbefaling
uten minst én ekte måling bak seg fra fase 1 og utover.

## Regulatorisk posisjon

- **EU AI Act:** systemet antas høyrisiko-klassifisert fra dag 1
  (helse + sårbare grupper). Kravene — logging, menneskelig tilsyn,
  robusthet — er allerede arkitekturkrav over.
- **GDPR / Helseregisterloven:** norsk MVP kjører utelukkende på godkjent
  analyseinfrastruktur; dataminimering ved at agentene spør, ikke kopierer.
- **Barnekonvensjonen art. 12:** barns rett til å bli hørt er implementert
  som CitizenValidator-plikten, med alderstilpasset samtykke.

## Kjente dilemmaer (åpne, med vilje)

1. **Wearables på barn:** ADHD-tvillingens biofeedback-gren krever
   foreldresamtykke + barnets løpende assent, og rådata slettes på enheten.
2. **Stemmeanalyse hos eldre:** depresjon-deteksjon uten uttrykkelig forståelse
   er overvåkning. Kun opt-in, med jevnlig re-samtykke og pårørende-innsyn
   styrt av den eldre selv.
3. **VR Empathy Labs:** å «bli» en sulten gutt kan bli empati-turisme.
   Scenarioene co-designes av berørte, og labs kobles alltid til en
   konkret beslutning (budsjett, lov), aldri ren opplevelse.
