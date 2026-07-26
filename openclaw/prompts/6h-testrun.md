# REGNVIKING-6H-TEST — kortversjon

Kjør denne FØR du binder deg til 30 timer. Fire sykluser à 90 min. Formålet er ikke å
produsere maksimalt, men å finne ut om loopmekanikken holder for deg — og hva som ryker først.

## Oppsett

```bash
python3 openclaw/runner/openclaw.py init --force --energi 8
```

Deretter, i `openclaw/logs/state.json`, sett:
```json
"runtime_hours": 6,
"target_cycles": 4
```

## Fast syklusplan for testkjøringen

| Syklus | Agenter | Mål | Suksesskriterium |
|---|---|---|---|
| 1 | codex-msx + ide-jakt | 15 ideer inn, scoret, én BYGG NÅ ut | Du har én idé du faktisk vil bygge |
| 2 | codex-msx + drone-sovereign | Bygg v0 av BYGG NÅ-ideen | Noe som kjører |
| 3 | codex-msx + gonzo-forge | Distribusjon: tekst/Suno/salgsvinkel for det du bygde | Noe som kan publiseres |
| 4 | codex-msx + panicsafe | Refleksjon + 7-dagers plan | Ærlig dom på om 30t er verdt det |

## Det testkjøringen faktisk måler

1. **Holder 90 minutter?** Hvis fase 3 konsekvent renner over, øk til 120 min i configen før 30t-kjøringen — ikke under.
2. **Består deliverables definition-of-done?** Tell hvor mange av syklus 1–3s leveranser som fortsatt fungerer uten mer arbeid dag etter. Under 50 % = kravene er for løse, ikke du.
3. **Hvor faller energien?** Noter energinivå ved start av hver syklus. Kurven her er den eneste pålitelige prediktoren for hvordan time 18–30 vil gå.
4. **Hvilken agent bar mest?** Den agenten skal ha mest plass i 30t-kjøringen. De andre roterer rundt den.

## Dommen etter 6 timer

- **≥ 3 av 4 sykluser med verdi ≥ 7** → kjør 30t-loopen som den står.
- **2 av 4** → kjør 30t, men øk syklustid til 120 min og kutt til 2 agenter per syklus.
- **≤ 1 av 4** → ikke kjør 30t. Problemet er input-pullen, ikke utholdenheten. Bruk en kveld på `openclaw/memory/core-inputs.md` først — loopen er aldri bedre enn det minnet den trekker fra.
