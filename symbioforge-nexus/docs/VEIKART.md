# Veikart 2026–2030

## Fase 0 — Fundament (dette repoet, uke 0)

- [x] Arkitektur og agentkontrakter definert
- [x] Fem digitale tvillinger med baselines fra FN/WFP/UNICEF/Lancet/GBD
- [x] Discovery-to-Action-løkke kjørbar ende-til-ende (deterministisk)
- [x] BiasGuard og CitizenValidator som obligatoriske steg
- [x] Interaktiv konsoll (dashboard) for demonstrasjon og medvirkning

## Fase 1 — MVP Norge (mnd. 1–6, ~15 mill. NOK)

**Mål:** én virkelig Discovery-løkke med ekte data, Norge som etisk testland.

- LLM-drevne agenter bak samme buss-kontrakt (Claude Agent SDK)
- RAG over UN/WHO/Lancet + FHI-publikasjoner (DataHunter i produksjon)
- ADHDTwin og GirlMentalTwin kalibrert mot norske registerdata
  (NPR/FHI, via godkjent analyseinfrastruktur — data forlater aldri kilden)
- Pilot: «skoletilpasning + jentescreening i to fylker» designet av PolicyPilot,
  godkjent av REK, målt i sanntid
- Borgerpanel v1: 200 ungdommer rekruttert, kompensert (fiat først, tokens senere)
- **Milepæl:** første policy-brief levert til et departement med audit-hash

## Fase 2 — Kryssforbindelser + LMIC-partnerskap (mnd. 6–18, ~50 mill. NOK)

- HungerTwin live mot satellitt-NDVI + FEWS NET-strømmer
- Føderert læring med 2–3 LMIC-partnere (dataeierskap hos partner)
- Sult ↔ ADHD-kryssstudien: Norge vs. Sahel-kohort, co-designet lokalt
- Voice-first app v1 (20 språk), Impact Tokens i lukket pilot
- VR Empathy Lab v1 (HungerTwin-scenario) for beslutningstakere
- **Milepæl:** første kryssforbindelse-funn publisert open access

## Fase 3 — Skalering + DAO (år 2–3, ~100 mill. NOK/år)

- Alle fem tvillinger live med sanntidsstrømmer
- DAO-styring aktiv: berørte grupper har vetorett over studier på egen gruppe
- Scenario Engine med usikkerhetskvantifisering (PyMC) og portefølje-optimering
- 200+ språk i appen, 10+ landpartnere
- **Milepæl:** dokumentert 10× raskere hypotese-til-pilot-syklus enn baseline

## Fase 4 — Selv-evolusjon (år 3–5)

- Agenter foreslår og A/B-tester forbedringer av egne kontrakter
- Automatisk replikasjon: hvert funn re-kjøres i minst to uavhengige kohorter
- Målet fra visjonen: **10–50× kunnskapsgenerering**, 98 % reproduserbarhet

## Finansiering

| Kilde | Fase | Kommentar |
|-------|------|-----------|
| Forskningsrådet / EU Horizon | 1–2 | DeSci + helse passer utlysninger |
| Impact-investorer | 2–3 | tokens gir målbar impact-avkastning |
| UNICEF / WHO / AI for Good | 2–4 | partner, ikke bare finansiør |
| Filantropi (Wellcome, Gates) | 3–4 | ungdoms psykisk helse er underfinansiert (2,4 %) |

## Risikoer og mottiltak

| Risiko | Mottiltak |
|--------|-----------|
| LLM-hallusinasjon i hypoteser | alt verifiseres mot tvilling-sim + replikasjon; audit-hash |
| Token-spekulasjon | tokens kan kun veksles til tjenester/donasjon, ikke børsnoteres |
| Datakolonialisme | BiasGuard hardkodet; LMIC-eierskap; DAO-vetorett |
| Regulatorisk (EU AI Act) | høyrisiko-klassifisering antas fra dag 1; Norge-first er strategien |
| Overtro på simulering | virtuelle RCT-er designer piloter, de erstatter dem aldri |
