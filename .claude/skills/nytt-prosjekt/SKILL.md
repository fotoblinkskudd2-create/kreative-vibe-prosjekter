---
name: nytt-prosjekt
description: Ta en idé fra idékatalogen (eller en ny idé) hele veien fra konsept til ferdig prototype med salgsmateriell. Bruk når brukeren vil starte, bygge eller realisere et prosjekt, f.eks. «/nytt-prosjekt idé 12 fra apper» eller «/nytt-prosjekt lag en app som...».
---

# Nytt prosjekt — fra idé til leveranse

Kjør hele produksjonslinja for ett prosjekt. Svar brukeren på norsk.

## Steg

1. **Finn idéen.** Hvis brukeren oppga et nummer/navn, slå den opp i riktig fil under `ideer/`. Hvis brukeren beskrev noe nytt, skriv den først inn i riktig kategorifil (samme format som resten) så katalogen holdes komplett.

2. **Velg produksjonsspor** ut fra idétypen:
   - App/vibe-kort/verktøy → bruk subagenten `prototype-bygger`
   - Musikk → bruk subagenten `musikk-produsent`
   - Satire/video-manus → bruk subagenten `satire-skribent`

3. **Bygg.** Start riktig subagent med en presis bestilling: idéteksten ordrett, målmappe, og studioets standarder (selvstendig HTML for prototyper, komplett låtpakke for musikk, osv.).

4. **Salgsmateriell.** Når leveransen finnes, start subagenten `tekstforfatter` for å lage salgspakke under `salgsmateriell/<prosjektnavn>/` basert på `salgsmateriell/MAL.md`. (Kan kjøres parallelt med steg 5.)

5. **Kvalitetssjekk.** Start subagenten `kvalitetssjef` på leveransen. Fiks det den finner.

6. **Oppdater statustavla.** Legg prosjektet inn i `STATUS.md` med status og dato.

7. **Commit og push** med en beskrivende melding på norsk.

## Sluttrapport til brukeren
Hva som ble bygget, hvor det ligger, hvordan prøve det (f.eks. «åpne prototyper/X/index.html i nettleseren»), og ett anbefalt neste steg.
