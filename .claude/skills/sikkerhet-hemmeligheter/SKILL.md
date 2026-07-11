---
name: sikkerhet-hemmeligheter
description: Håndter nøkler, tokens og persondata trygt — og sjekk at ingenting sensitivt lekker til git, logger eller leveranser.
---

# Sikkerhet og hemmeligheter

## Grunnregler
1. **Alle hemmeligheter i `.env`**, og `.env` skal stå i `.gitignore` FØR første nøkkel legges inn.
2. **Sjekk før hver commit**: `git diff --staged | grep -iE "api[_-]?key|secret|token|passord|password"` — treff = stopp.
3. **Logger**: Skriv aldri nøkler, tokens eller e-postadresser til logg eller konsoll. Masker: `sk-...a3f9`.
4. **Leveranser**: Zip-filer og dokumenter skannes for hemmeligheter før de sendes.

## Hvis en nøkkel har lekket
1. Regenerer nøkkelen hos leverandøren UMIDDELBART (den gamle er brent for alltid — git-historikk glemmer ikke).
2. Fjern fra kode og legg i `.env`.
3. Fortell brukeren hva som skjedde.

## Persondata
- Samle aldri inn, lagre aldri, generer aldri innhold om identifiserbare privatpersoner.
- Satire retter seg mot makt og systemer, ikke naboer.
