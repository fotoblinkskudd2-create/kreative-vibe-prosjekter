---
name: verifisering
description: Bevis at noe faktisk virker før det rapporteres som ferdig — kjør det ekte, observer resultatet, dokumenter beviset.
---

# Verifisering

«Det burde virke» er ikke en status. Dette er siste trinn før noe markeres ferdig.

## Fremgangsmåte
1. **Definer beviset først**: Hva må jeg SE for å vite at dette virker? (Output i terminal, fil på disk, side i nettleser, grønn test.)
2. **Kjør ende-til-ende**: Ikke bare enhetstester — kjør selve tingen slik brukeren ville gjort: åpne siden, kjør scriptet på ekte input, pakk ut zip-filen.
3. **Observer og dokumenter**: Lim inn faktisk output / ta skjermbilde. Beviset legges i rapporten eller commit-meldingen.
4. **Negativt tilfelle**: Sjekk minst én feilvei (feil input, manglende fil) — krasjer det pent?

## Regler
- Rapporter ALDRI «ferdig» uten gjennomført trinn 2. Hvis noe ikke kan verifiseres i dette miljøet (f.eks. krever API-nøkkel), si eksplisitt HVA som er uverifisert og hvorfor.
- Feil funnet under verifisering: gå til skill feilsoking, ikke lapp over.
- For innholdsleveranser er verifisering = kvalitetskontroll-skillen.
