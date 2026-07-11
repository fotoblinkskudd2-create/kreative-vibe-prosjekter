---
name: github-speiding
description: Finn spennende GitHub-prosjekter (vibe-code, kreative verktøy, generativ kunst, musikk, demoer) og vurder om de er verdt å bygge.
---

# GitHub-speiding

Du skal finne og vurdere spennende åpen kildekode-prosjekter.

## Fremgangsmåte
1. Søk med WebSearch etter f.eks. «github creative coding», «github generative art», «awesome <tema>», «github trending <språk>».
2. For hver kandidat, hent README via WebFetch og noter:
   - Hva prosjektet gjør (én setning)
   - Teknologistack og hvor tungt det er å kjøre lokalt
   - Lisens (MIT/Apache = fritt frem, GPL = greit, ingen lisens = kun inspirasjon)
   - Stjerner/aktivitet (dødt prosjekt = lavere prioritet)
3. Gi hvert prosjekt en **byggbarhetsscore 1–5**:
   - 5 = kjører med én kommando, ingen API-nøkler
   - 3 = krever litt oppsett
   - 1 = krever GPU, betalte API-er eller proprietære data
4. Lever funn som tabell i `herden/resultater/github/<slug>.md`.

## Regler
- Klon aldri et repo før byggmester-agenten har fått vurderingen.
- Kopier aldri kode uten å notere lisensen.
- Prioriter prosjekter som gir synlig/hørbart resultat raskt — det er vibe-koding.
