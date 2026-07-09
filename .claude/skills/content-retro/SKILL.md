---
name: content-retro
description: Ukentlig innholds-retro - mat inn engasjementstall, og content-analyst-subagenten dømmer hypoteser og oppdaterer PLAYBOOK.md. Brukes når brukeren skriver /content-retro med ukens tall (limt inn eller som CSV-fil).
---

# Content Retro

Læringssiden av Content-Factory-loopen: ukens tall dømmer hypotesene, og playbooken oppdateres så neste ukes utkast arver det som vant.

## Steg

1. Samle inndata: ukens publiserte poster (fra `content/uke-<nr>/`, inkludert `<!-- tester: ... -->`-merkene) og engasjementstallene brukeren oppga. Mangler tallene, be om dem — rangering per post holder, perfekte tall er ikke nødvendig.
2. Spawn subagenten `content-analyst` med poster + tall. Den dømmer eksisterende hypoteser (BEKREFTET/AVKREFTET/venter), kjører kontrast-analyse topp mot bunn, og formulerer maks 2 nye hypoteser i `PLAYBOOK.md`.
3. Vis brukeren playbook-diffen og analytikerens anbefaling for neste uke.
4. Ved godkjenning: commit `content-retro uke <nr>: <dommer + nye hypoteser i stikkord>`.

## Regler

- Kjør maks én gang per uke per kanal — hypoteser trenger en hel ukes data for en ærlig dom.
- Aldri oppdater playbooken uten tall. Magefølelse går inn som UPRØVD hypotese, ikke som bekreftet mønster.
