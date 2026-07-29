# Operating loop

Six steps, every task. Skipping step 4 is how the kernel loses value between
sessions; skipping step 1 is how it overspends.

## 1. Classify

Complexity, risk, horizon, engine, cost class. Do not guess the engine:

```bash
python3 orchestration/route.py "the task" --files N --risk R --horizon H --json
```

State the cost class out loud before heavy work.

## 2. Load minimal context

The task, plus the one memory file that bears on it. Not all of `memory/`.
Usually `conventions.md` or `preferences.md`; `decisions.md` when you are about to
re-open something already settled.

## 3. Plan → execute → review

- **Plan** on Claude. Architecture, tradeoffs, the shape of the change.
- **Execute** on Codex for long loops and mechanical multi-file work; on Claude directly for small or judgement-heavy edits.
- **Review** cross-model when stakes are high. `plan_review_model` in the routing decision names the reviewer — Opus when risk is high, Sonnet otherwise.

Hand back rather than thrash: ambiguous spec, architecture in question, or three
failed attempts on one root cause all mean stop and escalate.

## 4. Extract durable lessons

Before compacting anything, write what was learned into the right file:

| Learned | Goes to |
| --- | --- |
| A choice and its reason | `memory/decisions.md` |
| How this repo does something | `memory/conventions.md` |
| Confirmed broken or surprising behaviour | `memory/known-issues.md` |
| An interface shape | `memory/api-contracts.md` |
| A standing user preference | `memory/preferences.md` |

One fact per bullet, ISO dates, under 200 chars. Then:

```bash
python3 orchestration/memlint.py
```

## 5. Compact

At 60% window used. Preserve goals, corrections, preferences, and technical
state. Discard intermediate reasoning, tool noise, and failed attempts whose
lesson is now written down.

## 6. Report

- Exact changes made
- Real results, including failures with their output
- Remaining risks
- Next atomic actions
- Cost note

Structure: Goal → Constraints → Actions taken → Results → Memory updates → Next
steps. If a step was skipped, say so. If tests failed, say so with the output.

## Verification gate

Nothing is "done" until both pass, with real output pasted:

```bash
python3 -m unittest discover -s orchestration/tests -t orchestration
python3 orchestration/memlint.py
```
