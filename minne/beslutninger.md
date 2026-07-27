# Beslutninger

Hva som ble valgt bort, og hvorfor. Formålet er å hindre omkamp: en agent som
vurderer samme retning på nytt om tre måneder skal finne begrunnelsen her først.

Format:

## ÅÅÅÅ-MM-DD — <beslutning>
**Valgt:** ...
**Forkastet:** ...
**Fordi:** ...

---

## 2026-07-27 — Én kontraktfil, ikke to
**Valgt:** `AGENTS.md` som kilde, `CLAUDE.md` importerer den med `@AGENTS.md`.
**Forkastet:** Separat innhold i begge filene.
**Fordi:** To filer med overlappende regler divergerer innen få uker. Cursor og Codex
leser `AGENTS.md`, Claude Code leser `CLAUDE.md` — import gir alle verktøy samme
kontrakt uten duplisering.

## 2026-07-27 — Rangering på verdi/innsats, ikke på status
**Valgt:** `bygg-indeks.py` sorterer porteføljen på `verdi / innsats`.
**Forkastet:** Sortering på fase eller sist endret.
**Fordi:** 100+ prosjekter gjør flaskehalsen til utvelgelse, ikke oversikt. Køen må
svare på «hva gjør jeg i kveld», og det spørsmålet avgjøres av avkastning per time.
