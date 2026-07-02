# Skill-definisjon: TicShield MNS-Hack

Notat-format til bruk i egen skill/agent-oppsett (skill-factory-stil) for
å automatisere logging og iterasjon rundt TicShield-testing.

## Formål

Ta imot hendelseslogg fra `ticshield.ino` (Serial/BLE), strukturere den, og
gi tilbakemelding på deteksjonskvalitet + burst-frekvens over tid.

## Input

Linjer på formatet fra firmwaren, f.eks.:

```
event=burst_detected,count=3,t_ms=182340
event=manual_marker,t_ms=182900
```

## Oppgaver skillen skal utføre

1. **Parse logg** til en enkel tidsserie (hendelsestype + tidspunkt).
2. **Match** `burst_detected`-hendelser mot nærmeste `manual_marker` innen
   et vindu (f.eks. ±2 sek) for å regne ut treffrate (sann positiv) og
   falske positiver/negativer.
3. **Oppsummer per økt**: antall bursts, gjennomsnittlig intervall,
   treffrate, forslag til justering av `BURST_THRESHOLD_MULT` /
   `BURST_WINDOW_MS`.
4. **Sammenlign økter over tid** (uke 1 vs. uke 2) for å se om frekvensen
   av tics/urge-bursts endrer seg.

## Grenser

- Skillen gir kun tekniske/statistiske observasjoner om loggdata — ikke
  medisinske vurderinger eller diagnoser.
- All data er lokal/personlig; ikke del identifiserbar helsedata uten at
  brukeren eksplisitt ber om det.

## Neste steg for implementasjon

Når det finnes reell loggdata fra MVP-testene (dag 2–3), kan denne skillen
kobles til en enkel parser (Python/Node) som leser Serial-output eller en
eksportert CSV, og produserer sammendraget over.
