---
name: feilsoking
description: Systematisk feilsøking når noe ikke virker — les feilen, reproduser, isoler, fiks årsaken (ikke symptomet), verifiser.
---

# Feilsøking

## Metode (i rekkefølge, ikke hopp over trinn)
1. **Les hele feilmeldingen.** Nederste linje i en traceback er som regel svaret. Google/søk eksakt melding hvis den er kryptisk.
2. **Reproduser**: Finn den korteste kommandoen som utløser feilen. Kan du ikke reprodusere, kan du ikke fikse.
3. **Isoler**: Halver problemet — kommenter ut, bruk print/logging på grenseflatene, test antakelsene dine én og én.
4. **Fiks årsaken**: En try/except rundt symptomet er ikke en fiks. Spør «hvorfor skjedde dette?» til du treffer bunnen.
5. **Verifiser**: Kjør reproduksjonen på nytt + én test til for å sjekke at fiksen ikke ødela noe annet.

## Regler
- Maks 3 forsøk på samme hypotese — feiler tredje, formuler en NY hypotese i stedet for å prøve hardere.
- Endre én ting om gangen. To endringer samtidig = du vet ikke hva som hjalp.
- Noter rotårsaken i commit-meldingen (`fix: <symptom> — årsak var <rotårsak>`).
