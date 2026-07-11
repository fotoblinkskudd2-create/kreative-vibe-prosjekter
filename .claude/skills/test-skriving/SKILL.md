---
name: test-skriving
description: Skriv målrettede tester som beviser at koden virker — fokus på kjernefunksjonalitet og kanttilfeller, ikke dekningsgrad for syns skyld.
---

# Test-skriving

## Fremgangsmåte
1. **Identifiser kjernen**: Hva er de 2–3 tingene som MÅ virke for at prosjektet har verdi?
2. **Skriv tester i denne rekkefølgen**:
   - Lykkelig vei (vanlig input → riktig output)
   - Kanttilfeller (tom, null, enormt, negativt, æøå/unicode)
   - Feilvei (ugyldig input skal feile pent, ikke krasje stygt)
3. **Kjør testene** og se dem passere. En test du ikke har sett feile minst én gang (ved å midlertidig ødelegge koden) beviser ingenting.

## Verktøyvalg
- Python: pytest. JS/TS: vitest eller node:test. Ingen nye rammeverk hvis prosjektet har ett.

## Regler
- Testene skal kjøre på under 30 sekunder — trege tester blir aldri kjørt.
- Ikke mock det du kan kjøre ekte lokalt.
- For kreative prosjekter (kunst/lyd) er «røyktest» nok: starter det, og produserer det output?
