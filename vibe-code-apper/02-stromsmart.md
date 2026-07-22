# StrømSmart

## Problemet den løser

Høye og volatile strømpriser + klimabevissthet. Folk flest har ikke oversikt over eget forbruk og betaler unødvendig mye. StrømSmart gir enkel oversikt og konkrete, AI-genererte spare-tips – uten komplisert IoT.

## Vibe-prompt (kopier rett inn)

```text
Bygg StrømSmart – en norsk husholdnings-energi-app.

Design: Rent, teknisk men vennlig. Blå og grønne toner, store tall, enkle grafer.

Sider:
1. Dashboard – dagens strømpris (mock eller Nord Pool-inspirert), forbruk i kWh/kr, prognose for neste 24 t.
2. Forbruk – legg inn manuell tracking (vaskemaskin, elbil, varme, etc.) eller enkel import. Vis ukentlig/månedlig.
3. Tips & optimalisering – AI-genererte tips basert på forbruk + priser (“kjør vaskemaskin kl 02–05”).
4. Mål & sparing – sett månedsbudsjett, se besparelse i kr og CO2.
5. Historikk – grafer over forbruk vs pris.
6. Innstillinger – husstandstype, elbil ja/nei, varmekilde.

Auth + Supabase. Tabeller: households, consumption_logs, goals.
Enkel, ingen komplisert IoT – manuell tracking først. Norsk språk, mobil-først.
```

## Datamodell (Supabase)

| Tabell | Kolonner (utover id/user_id) | Notat |
|--------|------------------------------|-------|
| `households` | type, has_ev, heating_source, price_area (NO1–NO5) | Én per bruker i v1 |
| `consumption_logs` | category (vask/elbil/varme/…), kwh, cost_nok, logged_at | Manuell registrering |
| `goals` | month, budget_nok, saved_nok, saved_co2_kg | Månedsbudsjett |

Strømpris i v1: mock-data eller gratis spotpris-API (f.eks. hvakosterstrommen.no) – ingen avtale med Nord Pool nødvendig.

## MVP-sjekkliste

- [ ] Supabase auth + RLS
- [ ] Dashboard med dagens pris (mock/API) og prognose 24 t
- [ ] Manuell forbruksregistrering per kategori
- [ ] AI-tips basert på forbruk + prisprofil
- [ ] Månedsbudsjett med besparelse i kr og CO2
- [ ] Historikk-grafer (forbruk vs pris)
- [ ] Innstillinger for husstand
