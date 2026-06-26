# alex-civilian-field-lab

Et komplett, kjørbart prosjekt for å teste, dokumentere og rangere sivile
felt-produkter innen vann, kommunal infrastruktur, oppdrett, havn, is/kulde,
ROV/sivil drone, byggesak, anbud og AI-agentverktøy.

Alle konsepter er sivile og lovlige. Et automatisk filter
(`src/risk_filter.py`) blokkerer alt som handler om våpen, skjult
overvåkning, personsporing, jamming, militær taktikk, skadefunksjon eller
autonom angrepsevne - se `docs/civilian_use_policy.md`.

## Hvordan kjøre

```bash
pip install pyyaml
python src/main.py
```

Dette leser `data/concepts.yaml`, filtrerer gjennom `risk_filter.py`,
poengsetter alle godkjente konsepter, genererer 14-dagers prototypeplaner for
topp 3 og salgsvinkler for topp 5, og skriver fire rapporter til `reports/`:

- `reports/concept_scores.md` - alle konsepter rangert etter value_score.
- `reports/top_ideas.md` - topp 5 konsepter med full kontekst.
- `reports/prototype_plan.md` - konkret 14-dagers byggeplan for topp 3.
- `reports/sales_angles.md` - pitch, e-post-emne, telefonåpning og
  "hvorfor dette ikke er bullshit" for topp 5.

## Struktur

```
alex-civilian-field-lab/
  README.md
  data/
    concepts.yaml          18 konsepter med full kontekst og scoring-input
    test_protocols.yaml    domenespesifikke felttest-protokoller
    customer_segments.yaml kundesegmenter med beslutningstaker og kanal
    risk_rules.yaml         blokkerte kategorier/nøkkelord
    scoring_weights.yaml    vekter for value_score-formelen
  src/
    main.py                 orkestrerer hele pipelinen
    concept_loader.py        leser og validerer concepts.yaml
    scorer.py                regner ut value_score per konsept
    risk_filter.py            blokkerer ulovlige/militære konsepter
    prototype_planner.py      genererer 14-dagers byggeplan per konsept
    report_generator.py       skriver de fire markdown-rapportene
  reports/                   genereres av main.py (ikke håndskrevet)
  docs/
    clean_room_rules.md       regler for uavhengig idéutvikling
    civilian_use_policy.md    hva som er innenfor/utenfor scope
    field_test_checklist.md   generell sjekkliste for felttest
```

## Scoring-formel

```
value_score =
  sales_potential   * 0.30 +
  prototype_speed   * 0.20 +
  ip_potential       * 0.20 +
  customer_pain       * 0.20 +
  civilian_safety      * 0.10
```

`prototype_speed` beregnes i `scorer.py` som `11 - prototype_difficulty`, slik
at konsepter som er lette å bygge gir høyest fart-score. Alle delscorer er på
en 1-10 skala fra `data/concepts.yaml`.

## Legge til et nytt konsept

1. Legg til en ny oppføring i `data/concepts.yaml` med alle feltene som de
   eksisterende konseptene (`name`, `domain`, `customer`, `problem`,
   `solution`, `prototype_difficulty`, `sales_potential`, `ip_potential`,
   `civilian_safety`, `estimated_cost`, `customer_pain`).
2. Les `docs/civilian_use_policy.md` og bekreft manuelt at konseptet er
   innenfor scope - `risk_filter.py` er et sikkerhetsnett, ikke den eneste
   kontrollen.
3. Kjør `python src/main.py` på nytt - rapportene oppdateres automatisk.
