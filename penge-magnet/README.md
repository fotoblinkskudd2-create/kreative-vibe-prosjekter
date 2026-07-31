# ⚡ Penge-Magnet 1.0

Finner pengelekkasjene i bankutskriften din, og gir deg en plan du kan gjennomføre samme dag.

Alt kjører lokalt i nettleseren. Ingen server, ingen bankinnlogging, ingen data ut.

```bash
npm install
npm run dev      # utvikling på http://localhost:5173
npm test         # 29 tester på parser og regelmotor
npm run build    # produksjonsbygg i dist/
npm run preview  # server dist/ lokalt
```

Vil du bare prøve den: trykk **«Prøv med demodata»** på forsiden. Demoen genererer 120 dager
med realistiske norske banklinjer og kjører dem gjennom nøyaktig samme kode som en ekte fil.

## Hva den gjør

1. **Import** — leser CSV fra nettbanken. Takler semikolon, komma og tab; norske tallformat
   (`1 234,56`), engelske (`1,234.56`), regnskapsparenteser og unicode-minus; datoer som
   `31.01.2025`, `2025-01-31` og `20250131`; UTF-8 og windows-1252 (æøå fra eldre eksporter).
   Kjenner igjen både «Beløp»-kolonner og delte «Ut fra konto»/«Inn på konto». Topptekst med
   kontonummer over kolonneoverskriftene hoppes over. Har du bare PDF, limer du inn linjene
   i tekstfeltet — da tolkes de linje for linje.
2. **Gjenkjenning** — kobler hver linje til et brukersted og en kategori via regelsettet i
   `src/lib/merchants.ts` (rundt 80 norske kjeder og tjenester), etter at referansenumre,
   kortmasker og datoer er strippet bort fra teksten.
3. **Faste trekk** — grupperer per brukersted og ser etter jevne mellomrom og stabile beløp.
   Klassifiserer ukentlig, månedlig, kvartalsvis, halvårlig og årlig, regner alt om til
   månedspris, og oppdager stille prisøkninger ved å sammenligne første og siste tredjedel.
4. **Lekkasjeregler** — 13 regler i `src/lib/leaks.ts`: overlappende strømme-, musikk-, sky-,
   mobil- og treningstjenester, prisøkninger, sovende småabonnementer, takeaway- og
   kioskmønstre, gebyrer og kredittrenter, dyre strøm- og forsikringsavtaler, småkjøp på nett,
   kontantuttak og pengespill.
5. **Plan** — hver lekkasje får konkrete steg og, der det passer, en ferdig skrevet oppsigelse.
   «Fiks alt» laster ned hele planen som tekstfil. Appen sender ingenting selv.
6. **Oppfølging** — kryss av det du har gjort. Rapporten viser hva du faktisk har spart, og
   historikken viser om lekkasjen krymper mellom skanningene.

## Hvor tallene kommer fra

Hver lekkasje er merket:

- **Tall fra utskriften** — beløpet står svart på hvitt i filen. To strømmetjenester som
  trekkes samme måned er to trekk du kan se.
- **Anslag** — appen kan se at du brukte 4 600 kr på levering i måneden, men ikke hvor mye du
  ville kuttet. Anslagene er begrunnet i teksten på hvert kort, og ingen lekkasje foreslår å
  spare mer enn den faktisk koster.

To regler kan treffe samme abonnement — for eksempel både «bruker du treningssenteret?» og
«prisen har økt 10 %». Da beholder den største regelen abonnementet, slik at samme krone ikke
telles to ganger i totalen (`claims` i `src/lib/leaks.ts`).

## Sikkerhet

- Appen har ingen backend. Siden setter `connect-src 'none'` i sin egen Content-Security-Policy,
  så den kan ikke sende noe ut selv om den ville.
- Den ber aldri om BankID, passord eller kortnummer, og kan ikke flytte penger.
- Transaksjonene lagres ikke. Det eneste som havner i nettleserens lagring er hvilke lekkasjer
  du har krysset av, og et lite historikk-spor med totalsummer. Begge deler slettes med
  «Slett alt appen har lagret».
- Oppsigelsene skrives av appen, men sendes av deg.
- Service worker cacher kun appens egne filer, slik at den fungerer offline etter første besøk.

## Kode

```
src/lib/csv.ts         tegnsett, skilletegn, CSV-parsing
src/lib/money.ts       beløpstolking og formatering (alt regnes i øre)
src/lib/dates.ts       datoformater
src/lib/statement.ts   kolonnegjenkjenning + fritekstlinjer fra PDF
src/lib/merchants.ts   brukersteder og kategorier
src/lib/recurring.ts   deteksjon av faste trekk
src/lib/leaks.ts       lekkasjereglene
src/lib/plan.ts        fiksplan som tekstfil
src/lib/demo.ts        demodata (generert, ikke ekte)
tests/                 29 tester: parser, beløp, datoer, deteksjon, hele analysen
```

Beløp regnes gjennomgående i hele øre som heltall, slik at avrunding aldri driver.

## Veikart

| Fase | Innhold | Status |
| --- | --- | --- |
| V1.0 | CSV-import, kategorisering, faste trekk, lekkasjeregler, fiksplan, offline-app | Ferdig |
| V1.1 | PDF-import direkte i appen | Ikke startet |
| V1.2 | Egne regler: legg til brukersteder og terskler selv | Ikke startet |
| V1.3 | Varsler før månedsslutt: «du ligger an til å bruke X på levering» | Ikke startet |
| V2.0 | Bankkobling via PSD2 (kun lesetilgang, krever konsesjonspartner) | Vurderes |

Bankkobling er bevisst sist. Det krever avtale med en PSD2-aktør og flytter data ut av
maskinen din — hele poenget med V1 er at det ikke skjer.

Appen gir ikke finansiell rådgivning. Sjekk oppsigelsestid og bindingstid før du sier opp noe.
