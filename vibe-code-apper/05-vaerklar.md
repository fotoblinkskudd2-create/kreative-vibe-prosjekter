# VærKlar

## Problemet den løser

Ekstremvær og klima-adaptasjon på Vestlandet: regn, flom og vind blir vanligere og kraftigere. VærKlar gir både mental og praktisk beredskap – hva bør du gjøre i dag, og hva bør ligge klart i boden.

## Vibe-prompt (kopier rett inn)

```text
Bygg VærKlar – en personlig vær- og beredskapsapp for Vestland/Bergen.

Design: Atmosfærisk men rolig. Blå-grå toner, vær-ikoner, myk animasjon.

Sider:
1. I dag – lokal vær + “hva bør du gjøre?” (gå ut, bli inne, sikre ting).
2. Prognose – 7 dager med risiko for flom/vind/regn.
3. Beredskap – personlig sjekkliste (mat, lommelykt, sandsekker, etc.) + hus-tips.
4. Aktiviteter – forslag til uteaktiviteter basert på vær + mental boost (“gå en tur i regn er bra for hodet”).
5. Community-alerts – lokale tips fra naboer (valgfritt).
6. Historikk – tidligere ekstremvær + hva som fungerte.

Supabase. Enkel vær-API (mock eller OpenWeather). Norsk, mobil-first, rolig tone.
```

## Datamodell (Supabase)

| Tabell | Kolonner (utover id/user_id) | Notat |
|--------|------------------------------|-------|
| `profiles` | location_name, lat, lng, dwelling_type | For lokale råd |
| `checklist_items` | label, category (mat/utstyr/hus), done, updated_at | Personlig beredskapsliste |
| `weather_events` | type (flom/vind/regn), date, notes_what_worked | Historikk-læring |
| `community_alerts` | message, lat, lng, created_at | Valgfritt i v1, med moderasjon |

Vær-API i v1: MET/Yr sitt åpne API (gratis, norsk) eller OpenWeather – mock holder for første demo.

## MVP-sjekkliste

- [ ] Supabase auth + RLS
- [ ] «I dag»-side med vær og konkret anbefaling (gå ut / bli inne / sikre ting)
- [ ] 7-dagers prognose med risikonivå for flom/vind/regn
- [ ] Personlig beredskapssjekkliste med kategorier
- [ ] Aktivitetsforslag koblet til vær + mental boost-tekster
- [ ] Historikk over ekstremvær med «hva fungerte»-notater
- [ ] Community-alerts (kan utsettes til v2)
