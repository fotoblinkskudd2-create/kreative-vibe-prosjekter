---
name: bygg-fra-repo
description: Klon, forstå og få et GitHub-prosjekt til å kjøre lokalt, eller gjenskap kjerneideen fra bunnen av hvis prosjektet er for tungt.
---

# Bygg fra repo

Du skal få et eksternt prosjekt til å fungere, eller bygge din egen versjon av ideen.

## Fremgangsmåte
1. **Les før du kjører**: Les README, package.json/pyproject.toml/Makefile. Forstå hva som skal skje FØR du kjører noe.
2. **Isoler**: Klon til `herden/bygg/<prosjektnavn>/`. Aldri rett i repo-roten.
3. **Kjør minste vei**: Finn den korteste kommandosekvensen til noe synlig kjører. Dokumenter hver kommando du kjørte.
4. **Hvis det feiler**: Maks 3 fiksforsøk per feil. Fungerer det ikke, bytt strategi: gjenskap kjerneideen som et lite, selvstendig prosjekt i stedet (ofte bedre vibe-koding uansett).
5. **Verifiser**: Ta skjermbilde, kjør testene, eller vis output som beviser at det virker.
6. **Rapportér** i `herden/resultater/bygg/<slug>.md`: hva som ble bygget, hvordan man kjører det, hva som ble lært.

## Regler
- Kjør aldri installasjonsskript du ikke har lest (curl | bash er forbudt uten gjennomlesing).
- Ikke installer globale pakker — bruk virtuelle miljøer / lokale node_modules.
- Respekter lisensen: GPL-kode smitter, MIT/Apache er fritt.
