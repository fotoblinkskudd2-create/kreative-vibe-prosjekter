---
name: ny-laat
description: Lag en komplett låtpakke (konsept, tekst, Suno-prompt, variasjoner) fra en musikkidé. Bruk når brukeren vil lage en låt, sang, album eller musikk, f.eks. «/ny-laat idé 3» eller «/ny-laat en trist countrylåt om ferjekø».
---

# Ny låt — komplett låtpakke

Lag en låtpakke klar for AI-musikkverktøy (Suno o.l.). Svar på norsk.

## Steg

1. **Finn idéen.** Nummer → slå opp i `ideer/musikk.md`. Ny beskrivelse → legg den først til i katalogen (samme format), så lages låten derfra.

2. **Bygg pakka** i `musikk/<låtnavn>/` (deleger gjerne til subagenten `musikk-produsent`):
   - `konsept.md` — tittel, sjanger, stemning, målgruppe, hva låten handler om
   - `tekst.md` — komplett låttekst med struktur ([Vers 1], [Refreng], [Bro]...)
   - `suno-prompt.md` — klar-til-bruk: stilbeskrivelse (sjanger, BPM-område, instrumentering, vokaltype, stemning, produksjonsreferanser) + tekst med metatagger
   - `variasjoner.md` — 2–3 alternative retninger

3. **Kvalitet:** Ekte følelser eller ekte humor — aldri generisk fyll. Norske tekster i naturlig talemål. Ikke tving rim.

4. **Oppdater `STATUS.md`, commit og push.**

## Sluttrapport
Låtens hook (siter refrenget), hvor pakka ligger, og nøyaktig hva brukeren skal lime inn i Suno.
