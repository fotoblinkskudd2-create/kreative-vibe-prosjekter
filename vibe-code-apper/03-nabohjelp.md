# NaboHjelp

## Problemet den løser

Ensomhet + praktiske hverdagsbehov – særlig for eldre og småbarnsfamilier i områder som Askøy/Bergen. Demografi-krisen i praksis: folk bor tettere enn noen gang, men kjenner naboene dårligere. NaboHjelp kobler «jeg trenger hjelp» med «jeg kan hjelpe» – trygt, lokalt og uten penger i første versjon.

## Vibe-prompt (kopier rett inn)

```text
Bygg NaboHjelp – en hyper-lokal nabolags-hjelpeapp for Bergen/Askøy-området.

Design: Varm, tillitsvekkende, nordisk. Jordfarger + blått, kart-fokus, store knapper.

Sider:
1. Kart/hjem – se åpne forespørsler og tilbud i nærheten (radius 2–5 km).
2. Opprett – “Jeg trenger hjelp” eller “Jeg kan hjelpe” (kategorier: handle, snø, verktøy, selskap, barnepass, transport).
3. Matching – enkel chat + status (åpen → akseptert → ferdig).
4. Min profil – rating, tidligere hjelp, verifisering (valgfritt BankID-inspirert).
5. Community – anonyme tips og “takk”-tavle.
6. For eldre – ekstra enkel “ring meg”-knapp.

Auth med Supabase. Geolocation + RLS. Tabeller: posts, matches, ratings, profiles.
Trygghet først: moderering, blokkering, ingen penger i første versjon. 100 % norsk.
```

## Datamodell (Supabase)

| Tabell | Kolonner (utover id/user_id) | Notat |
|--------|------------------------------|-------|
| `profiles` | display_name, area, verified, avg_rating | Verifisering valgfri i v1 |
| `posts` | type (trenger/tilbyr), category, description, lat, lng, status (åpen/akseptert/ferdig), created_at | Radius-filter i query |
| `matches` | post_id, helper_id, status, created_at | Chat knyttes hit |
| `ratings` | match_id, score (1–5), comment | Etter fullført hjelp |

Trygghet: rapporter/blokker-funksjon fra dag én, moderasjonskø for community-innlegg.

## MVP-sjekkliste

- [ ] Supabase auth + RLS + geolocation på posts
- [ ] Kartside med åpne forespørsler/tilbud (2–5 km radius)
- [ ] Opprett forespørsel/tilbud med kategorier
- [ ] Matching med enkel chat og statusflyt (åpen → akseptert → ferdig)
- [ ] Rating etter fullført hjelp
- [ ] «Ring meg»-knapp for eldre (ekstra stor, ekstra enkel)
- [ ] Rapportering og blokkering
