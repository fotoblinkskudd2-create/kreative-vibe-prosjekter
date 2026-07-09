---
name: heal
description: Fiks alle røde tester via test-healer-subagenten, som gjenbruker og bygger fikse-mønsterbiblioteket HEALING.md. Brukes når brukeren skriver /heal eller ber om å få testene grønne.
---

# Heal

Få testsuiten grønn — og gjør neste helbredelse raskere ved å høste fikse-mønstre.

## Steg

1. Finn prosjektets testkommando (sjekk `package.json` scripts, `Makefile`, `pyproject.toml`, CI-config). Hvis flere suiter: bruk den raskeste som dekker endringene, men verifiser til slutt med full suite.
2. Spawn subagenten `test-healer` med testkommandoen og eventuell kontekst om hva som nylig ble endret. Den leser `HEALING.md`, fikser via rask sti (kjente mønstre) eller treg sti (fri debugging), og oppdaterer mønsterbiblioteket.
3. Vis brukeren: diffen (fikser + HEALING.md-endringer) og healerens sluttlinje `Rask sti: X/Y feil`.
4. Ved godkjenning: commit fikser og HEALING.md sammen, melding `heal: <N> tester fikset (<X> via kjent mønster)`.

## Regler

- Grønn full suite er eneste akseptable sluttilstand. Delvis grønn = ikke ferdig.
- Rask-sti-andelen er loopens helsemetrikk — rapporter den alltid, også når den er 0.
