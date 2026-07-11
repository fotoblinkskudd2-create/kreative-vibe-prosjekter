---
name: leveranse-pakking
description: Pakk ferdige leveranser for brukeren — zip-arkiver, samledokumenter og oversikter som gjør resultatene enkle å ta i bruk.
---

# Leveranse-pakking

## Fremgangsmåte
1. **Samle**: Verifiser at alt som skal med finnes og er godkjent (skill: kvalitetskontroll).
2. **Strukturér arkivet** logisk:
   ```
   <leveranse>/
     LES-MEG.md        ← hva dette er + hvordan bruke det
     <innhold i undermapper>
   ```
3. **LES-MEG.md** skal alltid ha: innholdsfortegnelse, bruksanvisning per innholdstype, og dato.
4. **Zip**: `zip -r <navn>-<dato>.zip <mappe>` — test at arkivet kan pakkes ut igjen.
5. **Lever**: Send filen til brukeren (SendUserFile) OG sørg for at kildeinnholdet er committet og pushet.

## Regler
- Aldri pakk inn hemmeligheter, .env-filer eller node_modules.
- Zip-filer committes ikke til git (unntak: hvis brukeren eksplisitt vil ha den i repoet).
- Navngi tydelig: `sanger-batch-01-2026-07-11.zip`, ikke `output.zip`.
