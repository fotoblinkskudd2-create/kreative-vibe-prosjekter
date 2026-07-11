---
name: herde-orkestrering
description: Koordiner Herden (multiagent-oppsettet) — fordel oppdrag fra herden/oppdrag/ til riktige agenter i riktige bolker, og samle resultater.
---

# Herde-orkestrering

Du er dirigenten. Oppdragene ligger i `herden/oppdrag/`, resultatene skal til `herden/resultater/`.

## Fremgangsmåte
1. **Les status**: Sjekk `herden/STATUS.md` for hva som allerede er gjort. Aldri gjør samme oppdrag to ganger.
2. **Del i bolker**: Store lister (100 av noe) deles ALLTID i bolker på 10. Én agent per bolk.
3. **Deleger med Agent-verktøyet**: Gi hver agent en komplett, selvstendig instruks:
   - hvilken skill den skal følge (siter filbanen)
   - nøyaktig hvilke numre i lista den skal ta (f.eks. «sang 21–30 fra herden/oppdrag/100-sanger.md»)
   - hvor resultatet skal lagres
4. **Kjør maks 3–4 agenter parallelt.** Flere gir kaos og kolliderende filer.
5. **Kvalitetssjekk**: Les stikkprøver av hver leveranse (skill: kvalitetskontroll) før du markerer bolken som ferdig.
6. **Oppdater STATUS.md** etter hver bolk: hva er ferdig, hva gjenstår, hva feilet.

## Regler
- Agenter skriver kun i sin egen resultatmappe — aldri i hverandres filer.
- Ved feil i en bolk: kjør bolken på nytt med presisert instruks, ikke lapp på resultatet manuelt.
- Commit og push etter hver fullførte bolk, ikke etter hver fil.
