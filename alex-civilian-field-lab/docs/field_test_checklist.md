# Field Test Checklist

Generell sjekkliste som gjelder uavhengig av domene, i tillegg til den
domenespesifikke protokollen i `data/test_protocols.yaml`.

## Før felttest

- [ ] Innhent tillatelse fra grunneier/anleggsansvarlig for testlokasjonen.
- [ ] Bekreft at testen ikke krever dronetillatelse fra Luftfartstilsynet
      utover det som allerede er på plass (gjelder DroneNet Inspector V2).
- [ ] Sjekk værmelding - avlys/flytt test ved vind over 10 m/s for drone/ROV-tester.
- [ ] Lad alt utstyr fullt og ta med minst ett reservebatteri.
- [ ] Sett opp loggingsark (tid, måling, observasjon, avvik) før du reiser ut.

## Under felttest

- [ ] Logg baseline-måling før noe avvik introduseres.
- [ ] Noter eksakt klokkeslett for hver hendelse (lekkasje startet, varsel
      mottatt, osv.) - responstid er en kjernemetrikk i alle protokoller.
- [ ] Ta bilde/video av fysisk oppsett for dokumentasjon til kunde-pitch.
- [ ] Test minst én "edge case" (svakt signal, ekstremvær, støy) i tillegg
      til normalforholdet.

## Etter felttest

- [ ] Fyll ut pass/fail mot `pass_criteria` for domenet i
      `data/test_protocols.yaml`.
- [ ] Oppdater `prototype_difficulty` i `data/concepts.yaml` hvis testen
      avdekket at bygget var lettere eller vanskeligere enn antatt.
- [ ] Skriv ett konkret forbedringspunkt og én konkret styrke til bruk i
      neste pitch.
- [ ] Arkiver rådata (logg, bilder, video) i et eget mappenavn per test:
      `YYYY-MM-DD_konseptnavn/`.
