# Handlingsplan: Verdivurdering og prioritering (7–8 timers økt)

> Strategisk plan for å gå fra idé-liste til konkrete, demonstrerbare resultater
> innenfor én fokusert arbeidsøkt.

## Situasjonsvurdering

Repoet inneholder per i dag kun en README med visjonen: 100+ ideelle prosjekter,
musikkidéer, satireprosjekter, videoer og Vibe-kort apper. Ingen prosjekter er
konkretisert ennå. Den største verdien på 7–8 timer ligger derfor i:

1. **Ferdigstillbarhet** — hva kan bli demonstrerbart på under 8 timer?
2. **Gjenbrukbar struktur** — hva gjør de 100+ idéene håndterbare fremover?
3. **Salgbarhet** — hva støtter deling og salg etterpå?

Musikk- og videoproduksjon er produksjonstunge og gir halvferdige resultater på
så kort tid — de nedprioriteres denne økten, men registreres i katalogen.

## Prioriterte prosjekter

### Prioritet 1: Vibe-kort app — fungerende prototype (MVP)

Eneste kategori som kan gå fra null til demonstrerbart produkt på én økt.
Ren web-app (én HTML-fil med inline CSS/JS, ingen backend, ingen avhengigheter):
kreative vibe-kort man trekker, blar gjennom og deler. Kjører rett i nettleser
og kan deles som lenke samme dag.

**MVP-definisjon (låst):** trekk kort → vis kort → neste kort. Alt annet er v2.

### Prioritet 2: Prosjektkatalog med prioriteringsrammeverk

De 100+ idéene mangler struktur — det er flaskehalsen for alt videre arbeid.
Katalog (`PROSJEKTKATALOG.md`) med felt for kategori, innsats, verdi og status,
pluss skåringsmodell: **skår = verdi ÷ innsats** (begge 1–5). Hver fremtidig økt
starter da med et ferdig prioritert valg. Lav innsats, varig effekt.

### Prioritet 3: Salgs-/presentasjonsside for Vibe-kort appen

Én HTML-landingsside: hva appen er, skjermbilde, call-to-action. Gjenbruker
appens styling for å spare designtid. Bygges kun *etter* at prototypen finnes.

## Tidsplan (7–8 timer)

| Tid | Fase | Aktivitet |
|---|---|---|
| 0:00–0:45 | Input og datasamling | Brain-dump av alle idéer inn i katalogen; velg konsept for Vibe-kort appen |
| 0:45–1:30 | Websøk og forskning | Kort research på eksisterende kort-apper og delingsmekanismer. **Hard stopp etter 45 min** |
| 1:30–2:15 | Design og planlegging | Kortdesign, fargepalett, flyt (trekk → vis → neste/del); datamodell for kortene |
| 2:15–2:45 | Beregninger og analyse | Skår alle idéer (verdi/innsats); lås prioriteringslisten |
| 2:45–5:45 | Prototype/byggefase | Bygg Vibe-kort appen: kortdata, trekk-logikk, styling, mobilvennlig layout |
| 5:45–7:00 | Implementering | Test, feilfiks, landingsside, commit og push |
| 7:00–8:00 | Buffer | Flyter til bygging ved behov; ellers flere kort, polish, deling |

## Konkrete leveranser

1. **Fungerende Vibe-kort web-app** — 20–30 kort, trekk/bla-funksjon, mobilvennlig, committet til repoet
2. **PROSJEKTKATALOG.md** — alle idéer med kategori, skår og status; topp 10 rangert
3. **Landingsside** — én side med presentasjon og call-to-action
4. **Oppdatert README** — peker til katalog og prototype

## Kritiske milepæler

- [ ] Katalogstruktur opprettet og idéer ført inn (innen 0:45)
- [ ] Prioriteringsliste låst (innen 2:45)
- [ ] Appens kjerneflyt fungerer i nettleser (innen 5:00)
- [ ] Alt committet og pushet (innen 7:00)

## Gjennomføringssteg

1. Opprett katalogstruktur; brain-dump først, sortering etterpå
2. Skår hver idé (verdi 1–5, innsats 1–5); ranger etter verdi ÷ innsats
3. Definer kortenes datamodell som enkel JS-array — utvidbar uten kodeendring
4. Bygg appen som én HTML-fil med inline CSS/JS — null byggverktøy
5. Test på mobil-bredde før du går videre
6. Landingsside med gjenbrukt styling
7. Commit ved hver ferdig milepæl — ikke én stor commit til slutt

## Risiko og løsninger

| Risiko | Løsning |
|---|---|
| Research-fasen sluker tid | Hard tidsboks 45 min; «interessant, men senere»-funn noteres i katalogen |
| Scope-kryp i appen (deling, lagring, kontoer) | MVP-definisjonen er låst; alt annet føres som v2 i katalogen |
| Perfeksjonisme i design | Én fargepalett, ett fontpar — bestemmes i designfasen og røres ikke |
| Katalogen føles aldri «komplett» | 30–50 idéer er nok til å bevise skåringsmodellen; resten legges til løpende |
| Byggefasen sprekker | Bufferen dekker; sprekker den også, kuttes landingssiden — aldri prototypen |
