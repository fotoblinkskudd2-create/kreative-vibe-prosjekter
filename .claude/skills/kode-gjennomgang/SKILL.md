---
name: kode-gjennomgang
description: Gjennomgå kode for feil, sikkerhetshull og unødvendig kompleksitet før commit eller etter at en agent har bygget noe.
---

# Kode-gjennomgang

## Sjekkliste (i prioritert rekkefølge)
1. **Virker det?** Kjør koden/testene. En gjennomgang uten kjøring er en gjetning.
2. **Sikkerhet**: Hardkodede nøkler? Uvalidert input som når shell/SQL/filsti? Hemmeligheter i logg?
3. **Feilhåndtering**: Hva skjer ved tom fil, manglende nett, ugyldig input?
4. **Kompleksitet**: Kan 50 linjer bli 15? Finnes det et standardbibliotek som gjør jobben?
5. **Lesbarhet**: Ville en fremmed forstå dette om tre måneder?

## Format på funn
```
[ALVORLIG|BØR FIKSES|FORSLAG] fil:linje — én setning om problemet, én om løsningen
```

## Regler
- Maks 10 funn — prioriter det som faktisk betyr noe.
- Ikke flisespikk på stil når koden er et kreativt eksperiment; spar strengheten til det som skal gjenbrukes.
