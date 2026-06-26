# Clean-Room Rules

Disse reglene gjelder for alle konsepter i `data/concepts.yaml` og alt videre
utviklingsarbeid i dette prosjektet.

## 1. Uavhengig utledning

Hvert konsept skal være utledet fra:
- et observert problem hos en navngitt kundetype, og
- et teknisk prinsipp Alex/teamet kan forklare fra grunnen (ikke kopiert fra
  en eksisterende patentert løsning).

Det er ikke tillatt å starte fra et konkurrentprodukts patentskrift eller
datablad og bygge en nær kopi. Bruk konkurrentinformasjon kun til å forstå
markedet, ikke til å kopiere mekanisme eller utforming.

## 2. Prior-art-sjekk før bygg

Før en prototype går fra "Dag 3-4: Komponentvalg" til faktisk bygging, skal
det gjøres et grovsøk (se `PatentWhiteSpace Finder`-konseptet eller et
manuelt søk i Espacenet/Google Patents) for å avklare om kjernemekanismen
allerede er beskyttet. Resultatet logges i et eget notat per konsept.

## 3. Dokumentasjon av kilder

Alle tekniske valg (sensortype, kommunikasjonsprotokoll, mekanisk løsning)
skal kunne spores til en åpen kilde: datablad, åpne standarder (LoRaWAN,
Matrikkel-API, Doffin-API), eller egne målinger. Ingen "svart boks"-løsninger
uten forklart prinsipp.

## 4. Sivilt og lovlig først

Et konsept som ikke kan forklares fullt ut som sivilt og lovlig bruk, skal
ikke inn i `concepts.yaml`. Se `civilian_use_policy.md` for de absolutte
grensene som `risk_filter.py` håndhever automatisk.

## 5. Endring av eksisterende konsept

Hvis et konsept i `concepts.yaml` endres til å ligge nærmere en kjent
patentert løsning, skal det flagges i commit-meldingen og begrunnes i
samme PR/commit.
