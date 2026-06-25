# Fem briljante produktidéer – enkle å bygge, løser konkrete problemer

Hver idé er valgt fordi den er **enkel å prototype** (en helg–to ukers arbeid),
løser et **reelt, gjenkjennelig problem**, og har en klar vei til betalende brukere.

---

## 1. Kvittering → Budsjett
**Problem:** Folk samler kvitteringer i lommen/skuffen og gir opp på budsjett fordi
manuell registrering tar for lang tid.

**Løsning:** Ta bilde av kvittering → AI leser beløp, butikk og dato → sorteres
automatisk i kategorier (mat, transport, abonnement) → ukentlig oppsummering.

**Hvorfor enkelt:** OCR + et LLM-kall for kategorisering, ingen kompleks backend
nødvendig for MVP. Kan bygges som ren mobil-app med lokal lagring først.

**Inntekt:** Gratis for 20 kvitteringer/mnd, abonnement for ubegrenset + eksport
til Excel/regnskap.

---

## 2. Nabohjelp – mikrojobber i nærmiljøet
**Problem:** Småoppgaver (hente pakke, gå med hund, montere IKEA-møbel) er for
små for Finn.no/proffe tjenester, men folk vil gjerne tjene litt ekstra lokalt.

**Løsning:** Enkel kart-basert app: legg ut en jobb med pris og varighet, folk i
nærheten (innen X km) kan ta den. Betaling og chat innebygd.

**Hvorfor enkelt:** Kjent mønster (oppdrag + kart + chat), kan bygges på
standard rammeverk uten egen logistikk eller lagerhåndtering.

**Inntekt:** Provisjon (10–15%) per fullført jobb.

---

## 3. Plantedoktor
**Problem:** Folk dreper stueplanter fordi de ikke vet hva som er feil (for mye
vann, lys, skadedyr).

**Løsning:** Ta bilde av planten → bildemodell identifiserer art og sannsynlig
problem → enkel handlingsplan ("vann hver 10. dag, flytt nærmere vindu").

**Hvorfor enkelt:** Ett bilde-API-kall + en strukturert prompt. Ingen
brukerkontoer nødvendig for å teste konseptet.

**Inntekt:** Freemium – gratis diagnose, betalt for påminnelser/historikk per
plante.

---

## 4. Møtenotater på autopilot
**Problem:** Folk bruker tid på å skrive møtereferat og glemmer
oppfølgingspunkter etter Teams/Zoom-møter.

**Løsning:** Nettleser-utvidelse som tar opp lyd, transkriberer og lager
automatisk en kort oppsummering + action-items rett etter møtet, sendt på e-post.

**Hvorfor enkelt:** Transkripsjon + LLM-oppsummering, ingen integrasjon med
møteplattformen nødvendig (kun lydopptak lokalt i nettleseren).

**Inntekt:** Gratis for 5 møter/mnd, abonnement for bedrifter med ubegrenset
bruk og deling i team.

---

## 5. Matrest – stopp matsvinn
**Problem:** Folk kaster mat fordi de ikke vet hva de kan lage med det som er
igjen i kjøleskapet.

**Løsning:** Skriv inn (eller fotografer) ingrediensene du har → få 3 enkle
oppskriftsforslag sortert etter "bruker mest av det som snart går ut".

**Hvorfor enkelt:** Ren tekst/bilde-input til et LLM med en god prompt, ingen
egen oppskriftsdatabase nødvendig i starten.

**Inntekt:** Annonser fra matbutikker/dagligvarekjeder, eller affiliate til
nettbutikker for manglende ingredienser.

---

### Felles for alle fem
- Kan bygges som **MVP på 1–2 uker** med eksisterende AI-API'er.
- Løser et problem folk **allerede prøver å løse manuelt** i dag.
- Har en **naturlig oppgradering** fra gratis til betalt (mer bruk, mer historikk,
  flere brukere).
