# REGNVIKING-30H-MAX

OpenClaw Orchestrator + Codex MSX Multi-Agent Empire Optimizer — en 30-timers arbeidsloop
med state, agent-rotasjon, scoringsmodell og logg. Bygget for én person som jobber alene og
skal ha ferdige ting ut, ikke flere planer.

## Kom i gang på 60 sekunder

```bash
python3 openclaw/runner/openclaw.py init --energi 8   # nullstill, start 30t-klokka
python3 openclaw/runner/openclaw.py start             # skriver ut syklusprompten — lim i din LLM
# ... arbeid i 90-120 min ...
python3 openclaw/runner/openclaw.py end --verdi 8 \
    --deliverable "Det du faktisk ble ferdig med" \
    --carry "Det som henger igjen" \
    --neste "Fokus neste syklus"
python3 openclaw/runner/openclaw.py status            # hvor står du
python3 openclaw/runner/openclaw.py report            # sluttrapport
```

**Kjører du for første gang: ta 6-timers testen først** — `prompts/6h-testrun.md`. Den koster
en kveld og forteller deg om 30 timer er verdt det, før du bruker dem.

## Hva som ligger her

```
config/regnviking-30h.json   Kanonisk config — faser, vekter, rotasjonsregler, terskler
config/regnviking-30h.yaml   Generert eksport for OpenClaw (rediger JSON-en, ikke denne)
prompts/master-prompt.md     Master-prompten + tabell over hva som er endret fra utkastet og hvorfor
prompts/6h-testrun.md        Kortversjon: 4 sykluser, med dom på om 30t bør kjøres
agents/*.md                  De fem sub-agentene — rolle, protokoll, deliverable-former, forbud
runner/openclaw.py           CLI: state, agent-rotasjon, logg, rapport
runner/scoring.py            Vektet scoringsmodell
runner/test_runner.py        14 enhetstester — kjør etter enhver endring i configen
memory/core-inputs.md        Loopens minne. Limes inn i hver syklusprompt. Oppdater den.
docs/scoring-modell.md       Aksene, vektene, hvorfor de er som de er
docs/patent-notat-mal.md     Mal + rekkefølgen dokumentér → mål → vurdér → publisér
logs/                        state.json, LOGG.md, sluttrapport.md
```

## De fem sub-agentene

| ID | Navn | Aktiveres |
|---|---|---|
| `codex-msx` | Codex MSX Multi-Agent Empire Optimizer | **Alltid** — fase 2, obligatorisk |
| `drone-sovereign` | Arctic Biomimicry Drone Sovereign | Drone/hardware/biomimicry i topp 3 |
| `gonzo-forge` | Gonzo Raw Justice Creative Forge | Satire/musikk/tekst — eller når loopen er tørr |
| `panicsafe` | PanicSafe Biohack Mental Architect | **Automatisk** ved energi ≤ 4 eller to svake sykluser |
| `ide-jakt` | Ide-Jakt Value Incubator | Minimum hver 3. syklus |

Maks 3 aktive per syklus. Ingen agent mer enn 3 sykluser på rad. Runneren håndhever begge —
`velg_agenter()` i `runner/openclaw.py`.

## Scoringsmodellen

| Akse | Vekt |
|---|---|
| `brukbarhet_48h` | 0.30 |
| `selgbarhet` | 0.30 |
| `robusthet` | 0.15 |
| `patent_potensial` | 0.15 |
| `energi_kost` (invertert) | 0.10 |

≥ 7.5 **BYGG NÅ** · 5.0–7.4 **PARKER + NOTER** · < 5.0 **DREP** (med skriftlig dødsårsak).

```bash
python3 openclaw/runner/openclaw.py score openclaw/runner/ideer.eksempel.json
```

Full begrunnelse for vektene: `docs/scoring-modell.md`. Kjent svakhet fra syklus 1: modellen
straffer enablere. Se `prosjekter/syklus-01/ide-jakt/idebank-scoret.md`.

## Definition of done

En deliverable teller kun hvis alle fire er sanne:

1. Den kan brukes uten at du skriver noe mer
2. Den har en navngitt neste fysisk handling
3. Den er scoret
4. Den ligger på disk, ikke bare i chatten

Alt annet er en skisse. Skisser telles ikke i loggen. Dette er den enkeltregelen som skiller
en loop fra støy.

## Menneskekrav

En 30-timers loop **må** inneholde minst én 4–6 timers søvnblokk. Sykluser etter 18 timer våken
produserer målbart dårligere output, og du merker det ikke selv — det er hele problemet.
`panicsafe` har vetorett og aktiveres automatisk ved energi ≤ 4.

## Endre configen

Rediger `config/regnviking-30h.json`, kjør så:

```bash
python3 openclaw/runner/test_runner.py           # 14 tester — vektene må summere til 1.0
python3 openclaw/runner/openclaw.py export-yaml  # oppdater YAML-eksporten
```
