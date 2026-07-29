# Routing

How a task becomes an engine + model + effort + cost class. Weights live in
`orchestration/policy.toml`; this explains the mechanism.

## Ask, don't guess

```bash
python3 orchestration/route.py "refactor the vibe-kort renderer" --files 12 --risk high
```

```
engine      claude  (Plan, architect, review. ...)
model       claude-opus-5  [frontier]
effort      xhigh
cost class  high  (weight 10)
scores      claude=6  codex=3  foci=0
signals     architecture(refactor), ...
flags       risk_high, files_many, files_sprawl
escalate    (top of ladder)
cache       prefix must exceed 512 tokens to cache
```

`--json` gives the same decision as a dict. Key names are a contract — see
`memory/api-contracts.md`.

## Mechanism

1. **Signal match.** Each `[[signal]]` in policy has keywords (lowercase, Norwegian and English) matched as case-insensitive substrings against the task text. A match contributes per-engine weights plus a cost weight.
2. **Flags.** `--risk`, `--horizon`, `--files`, `--runtime`, `--interactive` map onto `[flag.*]` entries and add their own weights. File thresholds (`files_many` at 5, `files_sprawl` at 20) come from policy, not from code.
3. **Engine.** Highest total wins; ties break on the engine's declared `priority` (Claude 1, Codex 2, Foci 3). No signal at all defaults to Claude, because the first move on an unclassified task is to plan.
4. **Cost class.** The summed cost weight falls into the cheapest `[cost_class.*]` whose `max_weight` it fits under: low ≤2, medium ≤6, else high. That class carries both the effort level and the default model.
5. **Model.** Claude routes take the class model. Codex routes take `codex-cli`. Foci takes Haiku when the class is low, otherwise the class model. `--model` forces a choice and errors on an unknown id.

## Engine lanes

| Engine | Takes | Hands off when |
| --- | --- | --- |
| Claude | Architecture, multi-file refactor, deep review, context-heavy analysis, memory authoring | The work is mechanical iteration against a clear spec |
| Codex | Until-green loops, TDD, large PRs, git/terminal work | Spec is ambiguous, architecture is in question, or three attempts failed on one root cause |
| Foci | Always-on surfaces, tool piping, session branching, cheap bulk calls | The request exceeds the cheap path |

Hybrid is the normal shape for non-trivial work: Claude plans → Codex executes →
Claude reviews.

## Risk raises the reviewer, not the executor

`risk_high` contributes 3 to cost weight but only 1 to Claude's engine score.
That is deliberate. A high-risk "iterate on CI until green" task still executes on
Codex — it just gets `plan_review_model: claude-opus-5` instead of Sonnet.
Letting risk out-vote the executor would have collapsed the hybrid pattern into
"expensive model does everything," which is the failure mode the kernel exists to
prevent. Pinned by `test_codex_route_still_names_a_claude_reviewer`.

## Escalation

Ladder is cheapest-first and price-ordered (asserted by a test):

```
claude-haiku-4-5 → claude-sonnet-5 → claude-opus-5
```

`escalate_to` lists only what is *above* the chosen model. Escalate on a failed
quality gate, never on a hunch. `claude-fable-5` sits off the ladder as `top` and
is never auto-selected — its pricing exceeds Opus tier, so it requires
`--model claude-fable-5`. A test asserts no combination of signals and flags can
reach it implicitly.

## Changing routing

Edit `policy.toml`. Then add a test that pins the new behaviour to a *signal*, not
to a single keyword — keyword lists churn, semantics should not.

```bash
python3 -m unittest discover -s orchestration/tests -t orchestration
```

The suite also validates the policy itself: every signal well-formed, keywords
lowercase (an uppercase keyword can never match), every cost-class model real,
ladder price-ordered.
