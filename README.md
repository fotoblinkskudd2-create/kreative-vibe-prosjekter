# kreative-vibe-prosjekter
100+ ideelle prosjekter, musikkidéer, satire prosjekter, videoer og Vibe-kort apper. Inkluderer prototyper, salgsmateriell og klar-til-bygg info. Laget for brukeren.

## Prosjekter

### [`feniks/`](./feniks) — agent 11, 12, 13 og orkestratorfunksjoner

Broen over de tre kritiske svakhetene i Føniks-arkitekturen: nettverksblokkering,
MEV-sandwiching, og gass-/friksjonsfeller.

- **Agent 11 `Portneren`** — datatilgang og oppetid via lisensierte API-er,
  kvotebudsjett, kretsbrytere og caching.
- **Agent 12 `Livvakten`** — MEV-forsvar med eksakt slippasjematematikk,
  verifisert sandwich-grense og privat eksekveringsruting.
- **Agent 13 `Skattemesteren`** — dynamiske nettverksavgifter, plattformgebyrer,
  kapitalbinding og friksjonsporten.
- **Orkestrator** — fremgangsdrevet dead man's switch, vaktbikkje med
  omstartsrasjonering, og lommebok-isolasjon i brannceller.

```bash
cd feniks
npm run sjekk    # typesjekk + 132 tester
npm run demo     # regner ut hva katalysatoren faktisk tåler
```

Se [`feniks/README.md`](./feniks/README.md) for arkitektur, de tre
matematiske rettelsene, og hva som gjenstår før systemet kan handle med ekte
penger.
