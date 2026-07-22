# SinnRo – Tankens kraft-app

## Problemet den løser

Stigende psykisk uhelse blant unge og voksne i Norge – særlig vinterdepresjon og stress i regnfulle Bergen. SinnRo gir daglig støtte uten å føles klinisk. Ingen diagnoser, ingen pekefinger – bare rolig, praktisk hjelp til å ta tilbake tankens kraft.

## Vibe-prompt (kopier rett inn)

```text
Bygg en full-stack app kalt SinnRo – en rolig norsk mental helse- og stress-app.

Design: Nordisk, rolig, minimalistisk. Dempede blå-grå-grønne toner, mye whitespace, myke skygger, store lesbare fonter. Føles som en trygg hytte i fjellene.

Sider:
1. Landing/hjem – enkel hero med “Hvordan har du det i dag?” + stor knapper for rask check-in (emoji + 1–10).
2. Daglig sjekk-in – mood, energi, søvn, kort journal (max 300 tegn). Lagre med timestamp.
3. AI-støtte – chat med en rolig, støttende AI (bruk Vercel AI SDK eller OpenAI) som gir pusteøvelser, reframing og norske tips. Ingen diagnose, bare støtte.
4. Øvelser – 5–6 korte guidede øvelser (pust, grounding, body scan) med timer og progress.
5. Innsikt – enkel graf over humør siste 7/30 dager + personlige mønstre.
6. Ressurser – lokal liste for Bergen/Vestland (krisetelefon, kommunale tjenester, selvhjelpsgrupper) + anonym deling av tips (moderasjon).

Auth: Supabase email/password + magic link. Hver bruker har egne data med RLS.
Database: profiles, checkins (mood, energy, note, created_at), exercises_completed, chat_history.
Ekstra: Push-notifikasjon om morgenen “Hvordan er tankene i dag?” (valgfritt).
Mobil-first, mørk/lys modus, 100 % norsk språk.
```

## Datamodell (Supabase)

| Tabell | Kolonner (utover id/user_id) | Notat |
|--------|------------------------------|-------|
| `profiles` | display_name, created_at | Opprettes ved registrering |
| `checkins` | mood (1–10), energy (1–10), sleep_hours, note (max 300), created_at | Én per dag, men tillat flere |
| `exercises_completed` | exercise_slug, duration_seconds, completed_at | For progress-visning |
| `chat_history` | role, content, created_at | For AI-støtte-samtalen |

RLS: alle tabeller låses til `auth.uid() = user_id`.

## MVP-sjekkliste

- [ ] Supabase-prosjekt med auth (e-post + magic link) og RLS
- [ ] Hjem med rask check-in (emoji + skala 1–10)
- [ ] Daglig sjekk-in med journal
- [ ] AI-chat med rolig norsk tone (systemprompt: støtte, aldri diagnose)
- [ ] 5–6 øvelser med timer
- [ ] Humørgraf 7/30 dager
- [ ] Ressursside for Bergen/Vestland (statisk liste holder i v1)
- [ ] Mørk/lys modus, mobil-first
