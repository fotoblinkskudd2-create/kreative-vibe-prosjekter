---
name: optimize-prompt
description: Kjør én forbedringsiterasjon på en promptfil - mål baseline mot eval-cases, la prompt-optimizer-subagenten gjøre ÉN endring, mål igjen, behold bare ved forbedring. Brukes når brukeren skriver /optimize-prompt <promptfil> [eval-fil].
---

# Optimize Prompt

Én kontrollert forbedringsiterasjon: mål → endre én ting → mål → behold bare hvis bedre. Monotont stigende kvalitet, garantert av prosessen.

Argumenter: `<sti til promptfil> [sti til eval-JSONL]`. Mangler eval-stien, let etter `evals/cases.jsonl` ved siden av promptfilen; finnes ingen, hjelp brukeren å lage 10 cases fra ekte eksempler først (format under) — uten evals finnes ingen loop.

## Eval-format (JSONL, én case per linje)

```jsonl
{"input": "...", "must_include": ["..."], "must_avoid": ["..."], "weight": 1}
```

## Steg

1. **Baseline:** For hver case: generer svar med promptens instruks + casens input. Score casen: 1 hvis alle `must_include` finnes (semantisk, ikke bare eksakt streng) og ingen `must_avoid` — ellers 0. Baseline = vektet sum / total vekt. Noter hvilke cases som tapte.
2. **Endre:** Spawn subagenten `prompt-optimizer` med promptfilens sti og de tapte casene. Den gjør nøyaktig én endring i filen og oppgir hypotesen sin.
3. **Mål igjen:** Kjør evals på nytt, samme metode, alle cases.
4. **Behold eller forkast:**
   - Ny score > baseline → behold; commit `prompt-opt: <fil> <gammel> → <ny> (<hypotese>)`.
   - Ny score ≤ baseline → `git checkout -- <promptfil>`, og logg hypotesen i promptfilen under `<!-- FEILEDE HYPOTESER -->` (opprett kommentarseksjonen nederst hvis den mangler) med commit `prompt-opt: forkastet hypotese (<hypotese>)`.
5. Rapporter: begge scorer, hypotesen, utfallet, og de 3 casene som fortsatt taper høyest vekt.

## Regler

- Rør ALDRI eval-filen for å bedre scoren. Brukeren eier gullstandarden.
- Én endring per iterasjon. Vil brukeren ha mer, kjør skillen flere ganger.
- Vær konsistent i dømmingen mellom baseline og re-måling — samme tolkningsstrenghet begge ganger.
