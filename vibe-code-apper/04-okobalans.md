# ØkoBalans

## Problemet den løser

Privatøkonomi-bekymring – særlig blant unge: strøm, bolig, mat og rente spiser både lommeboka og hodet. ØkoBalans gir oversikt og tankekraft tilbake, uten skam og uten bankintegrasjon i v1.

## Vibe-prompt (kopier rett inn)

```text
Bygg ØkoBalans – en rolig norsk personlig økonomi-app.

Design: Klar, rolig, tillitsvekkende. Grønne og nøytrale toner, store positive tall når man sparer.

Sider:
1. Oversikt – saldo, månedlig forbruk, “pusterom” (hvor mye buffer).
2. Transaksjoner – rask registrering (kategori + beløp + notat).
3. Budsjett – sett grenser per kategori (mat, strøm, transport, fritid). Vis rødt/grønt.
4. AI-råd – “Hvor kan du kutte 2000 kr denne måneden?” basert på data.
5. Mål – spar til ferie, buffer, bolig.
6. Innsikt – grafer + norske tips (skatt, strømstøtte, etc.).

Supabase auth + tabeller: transactions, budgets, goals.
Enkel, ingen bankintegrasjon i v1. Mobil-first, norsk.
```

## Datamodell (Supabase)

| Tabell | Kolonner (utover id/user_id) | Notat |
|--------|------------------------------|-------|
| `transactions` | category, amount_nok, note, created_at | Rask manuell registrering |
| `budgets` | category, month, limit_nok | Rødt/grønt mot faktisk forbruk |
| `goals` | name (ferie/buffer/bolig), target_nok, saved_nok, deadline | Store positive tall når man sparer |

«Pusterom» = saldo minus resten av månedens budsjetterte utgifter – appens signaturtall.

## MVP-sjekkliste

- [ ] Supabase auth + RLS
- [ ] Oversikt med saldo, månedsforbruk og «pusterom»
- [ ] Rask transaksjonsregistrering (3 trykk eller færre)
- [ ] Budsjett per kategori med rød/grønn status
- [ ] AI-råd basert på faktiske data («hvor kutte 2000 kr?»)
- [ ] Sparemål med progresjon
- [ ] Innsiktsside med grafer og norske tips (skatt, strømstøtte)
