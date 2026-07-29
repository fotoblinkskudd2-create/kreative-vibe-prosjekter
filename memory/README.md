# memory/ — durable state

Authoritative, versioned, human-editable. This is the layer that survives
sessions. Everything else in a session is disposable.

## Files

| File | Holds |
| --- | --- |
| `decisions.md` | Choices made and why. Dated. Never rewrite history — append a superseding entry. |
| `conventions.md` | How this repo does things. Naming, structure, style. |
| `known-issues.md` | Confirmed broken or surprising behaviour, with the workaround. |
| `api-contracts.md` | Interfaces we depend on or expose. Shapes, not prose. |
| `preferences.md` | Standing user preferences that shape output. |

## Write rules

- One fact per `- ` bullet. If it needs a comma-spliced second clause, it is two facts.
- Date it when the fact has a shelf life: `- (2026-07-29) Fact.`
- Durable only: decisions, conventions, known issues, contracts, preferences.
- Never: credentials, tokens, ephemeral state, third-party noise, intermediate reasoning.
- After every significant decision or correction, update the right file in the same turn.
- Superseding beats editing. Add the new fact, mark the old one `(superseded YYYY-MM-DD)`.

## Read rules

- Load the file you need at the moment you need it. Do not dump `memory/` into context.
- `conventions.md` and `preferences.md` are the usual cheap reads.
- `decisions.md` is for when you are about to re-litigate something already settled.

## Budgets

300 lines per file, 200 chars per entry. Enforced:

```bash
python3 orchestration/memlint.py
```

At budget, compact: merge duplicates, drop facts the code now states plainly,
delete anything proven wrong. Preserve goals, corrections, and technical state.
Discard pure reasoning traces.
