# 3. STILLEPROP
## Lavstøypropell for urbane droner
### Sider 9–11

---

## SIDE 9 — IDÉ OG DESIGN

### Kilde
Dronedesign møter lydproduksjon. Jeg har bygd droner og jeg har analysert
lyd i årevis, og det slående er at dronebransjen behandler støy som et
datablad-tall (dBA på 1 m) mens øret behandler støy som psykoakustikk:
tonalitet, modulasjon, skarphet. En drone er ikke plagsom fordi den er høy.
Den er plagsom fordi den *syter* — smalbåndet, modulert, i det mest
irriterende frekvensområdet øret har.

### Problem
Dronestøy er den reelle flaskehalsen for urban droneoperasjon — inspeksjon,
levering, foto — og operatørene kan ikke gjøre noe med den fordi propellene
de får kjøpt er optimalisert for skyvekraft per gram, aldri for øret.

### Produkt
Ettermarkedspropeller for de vanligste kommersielle plattformene (DJI
Matrice-klassen først), designet for minimal *opplevd* støy, solgt med
dokumentert psykoakustisk måling per propell — ikke bare dBA.

### Design
- **Geometri:** større diameter, lavere turtall. 11″ tre-blad erstatter
  9,5″ to-blad; samme skyvekraft ved 30 % lavere tipphastighet (side 10).
- **Bakkant:** serratert (sagtann) bakkant, biomimetisk fra ugleving —
  bryter opp den koherente virvelavløsningen som lager bredbåndshveset.
- **[ORIGINAL] Psykoakustisk optimering som salgbar spesifikasjon:**
  hver propellmodell leveres med målt Zwicker-lydhet (sone), skarphet
  (acum) og tonalitet — ikke bare dB. Optimeringsmålet i designet er
  minimert lydhet × tonalitet, og bladene på samme aksel har bevisst
  ulik bladvinkel-fordeling slik at blade-passing-tonene fra de fire
  rotorene desynkroniseres og smøres ut i stedet for å summere til én
  sytende tone. Ingen ettermarkedsaktør selger propeller spesifisert i
  psykoakustiske enheter. Det er lydkompetansen som blir produktet.
- **Materiale:** glassfiberfylt nylon (sprøytestøpt i volum, SLS i proto),
  balansert parvis fra fabrikk.

Master Airscrew og Mejzlik selger «low noise»-varianter med dBA-påstander.
Ingen dokumenterer psykoakustikk, ingen desynkroniserer bevisst. Det er
hullet.

---

## SIDE 10 — SIMULERING

Kjøring: `simulering/sim_alle_produkter.py`, seksjon 3.

### Tipphastighet
| Propell | Tipp | Mach | BPF |
|---|---|---|---|
| Referanse 9,5×5 to-blad, 8 000 rpm | 101,1 m/s | 0,29 | 267 Hz |
| STILLEPROP 11×4 tre-blad, 5 600 rpm | 81,9 m/s | 0,24 | 280 Hz |

### Støyskalering
Rotasjonsstøy skalerer empirisk med tipphastighet i femte–sjette potens.
Med v⁵: **−4,6 dB** fra hastighetsreduksjonen alene. Serratert bakkant gir
konservativt −2 dB bredbånd (litteraturen viser 2–5). Sum ≈ **−7 dB** —
subjektivt godt over en halvering, siden lydhet i tillegg faller når
tonaliteten brytes opp av desynkroniseringen.

Blade-passing-frekvensen flytter seg marginalt (267→280 Hz). Det bekrefter
designfilosofien: gevinsten skal hentes i amplitude og tonalitetsoppbryting,
ikke i frekvensflytting. Frekvensflytting er det konkurrentene prøver på,
og det hører man.

### Kostnaden ved stillhet
Større diameter gir høyere treghetsmoment → tregere gasspons → målbart
slakkere regulering i vindkast. Simulert som ren treghetsskalering:
~35 % høyere rotortreghet. Håndterbart for inspeksjon/foto (rolige
manøvre), feil produkt for FPV/racing. Målgruppen er valgt deretter.
Flytid: lavere skivebelastning gir faktisk 3–6 % *lengre* flytid ved
lik vekt. Stillhet og effektivitet drar samme vei her. Sjelden luksus.

### Det simuleringen ikke fanger
Interaksjonsstøy mellom propell og armprofil (kan dominere på noen ramme-
geometrier), motorens jernstøy ved lavere turtall, og den faktiske Zwicker-
lydheten — den *må* måles, det er hele poenget. Målerigg: kalibrert
målemikrofon, lydisolert uterom, MOSQITO (open source) for beregning.
Utstyret finnes allerede i lydriggen min. Marginalkostnad nær null.

### Verifikasjon i prototyp
Pass/fail: ≥5 dBA reduksjon OG ≥25 % lydhetsreduksjon (sone) mot
originalpropell på samme rigg ved samme skyvekraft, målt, publisert.

---

## SIDE 11 — MARKED OG PROTOTYP

### Marked
Norge: ~4 000 registrerte operatører i spesifikk/åpen kategori som flyr
kommersielt (inspeksjon, foto, kartlegging). Norden + DACH som reelt
adresserbart: titusener. Kjøpsutløser er konkret: naboklager, kommunale
støykrav, operasjoner nær sykehus/skole, og EASA-krav der støy inngår i
SORA-vurderingen for bytettflygning.

Prissetting: DJI-originaler 400–900 NOK/par. STILLEPROP: **1 490 NOK/par**
med målerapport. Premie rettferdiggjort av dokumentasjon operatøren kan
legge ved i søknader — papiret er halve produktet. SLS-proto: ~180 NOK/blad.
Sprøytestøpt ved 1 000+ par: ~90 NOK/par produsert. Margin er ikke
problemet; distribusjon er. Kanal: direktesalg + de to store norske
droneforhandlerne, deretter EU-nettbutikker.

Risiko som må sies høyt: DJI kan endre festedesign når som helst, og
plattformlåsing gjør produktet til en katt-og-mus-lek. Mottrekk: første
design på festesystemet med størst installert base, og rask CAD-pipeline
for nye fester (48 timer fra oppmåling til SLS-fil).

### Prototyp
| Post | NOK |
|---|---|
| CAD/CFD-lett iterasjon (XFLR5/åpne verktøy) | 0 |
| SLS-print, 4 iterasjoner × 8 blad | 5 800 |
| Skyvekraftrigg (lastcelle, RPM, effektmåling) | 3 200 |
| Målemikrofon-kalibrering + vindskjerm | 1 800 |
| Balanseringsutstyr | 900 |
| Testdrone (brukt Matrice-kompatibel ramme) | 9 500 |
| **Sum** | **21 200** |

Byggetid 6 uker: uke 1–2 geometri og print, uke 3 rigg, uke 4–5 måle-
iterasjon, uke 6 flygende A/B-test med video- og lyddokumentasjon.
Den videoen — samme drone, propellbytte, hørbar forskjell — er hele
markedsføringen. Regulatorisk: ettermarkedspropell på egen risiko i åpen
kategori; for typegodkjente operasjoner kreves operatørens egen SORA-
oppdatering. Dokumentasjonen min gjør den oppdateringen lettere. Selgsargument.

### Dom
**BYGG.** Lavest prototypkost av maskinvareproduktene, unik kompetanse-
overlapp (aero + psykoakustikk finnes sjelden i samme hode), og målingen
er differensiatoren ingen kan kopiere uten å bygge lydlab først.
