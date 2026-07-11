---
name: kvalitetskontroll
description: Kvalitetssikre leveranser fra agenter (tekster, prompts, kode, research) før de godkjennes — stikkprøver, sjekklister og retur ved feil.
---

# Kvalitetskontroll

## Fremgangsmåte
1. **Tell**: Stemmer antallet? (Bestilt 10, levert 10?)
2. **Stikkprøve**: Les minst 3 av 10 leveranser i en bolk grundig, resten skummes.
3. **Sjekk mot skillen**: Hver leveransetype har sin skill — følger leveransen malen og reglene der?
4. **Sjekk særkrav**:
   - Sangtekster: sjangertro? norsk som faktisk er norsk? minst én overraskende metafor?
   - Prompts: limbare uten redigering? ingen artistnavn/ekte personer?
   - Kode: kjører den? (Kjør, ikke anta.)
   - Research: kilder oppgitt? påstander kryssjekket?
5. **Dom**: GODKJENT eller RETUR med konkret mangelliste (maks 5 punkter).

## Regler
- Duplikater og nesten-duplikater i 100-lister er RETUR — hver enhet skal være distinkt.
- Ikke fiks manglene selv — returner til produserende agent med presis beskjed. (Unntak: trivielle skrivefeil.)
- Loggfør dommen i `herden/STATUS.md`.
