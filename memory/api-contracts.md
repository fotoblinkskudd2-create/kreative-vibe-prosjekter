# API contracts

> Interfaces we depend on or expose. Shapes, not prose.

## Exposed: `orchestration/route.py`

- `route(task: str, policy: dict, *, files, horizon, risk, runtime, interactive, model) -> dict` is pure and is the stable entry point for other tools.
- Decision dict keys: `engine`, `model`, `effort`, `cost_class`, `cost_weight`, `engine_scores`, `signals`, `flags`, `escalate_to`, `plan_review_model`, `cache_min_tokens`, `notes`.
- `--json` emits that dict verbatim; treat key names as the contract and add rather than rename.
- Engine values are exactly `claude`, `codex`, `foci`.

## Exposed: `orchestration/memlint.py`

- `check_file(path: Path, memory: dict) -> list[Finding]` where `Finding` carries `path`, `line`, `rule`, `message`.
- Rule names: `budget`, `secret`, `date`, `format`, `length`, `unreadable`.

## Consumed: `orchestration/policy.toml`

- Required top-level sections: `models`, `cost_class`, `engine`, `signal`, `escalation`, `flag`, `cache`, `memory`.
- Each `[[signal]]` needs `name`, `keywords`, and integer weights for `claude`, `codex`, `foci`, `cost`.
- Each `[cost_class.*]` needs `max_weight`, `effort`, `model`, `label`.
- Each `[models.*]` needs `engine`, `tier`, `cache_min_tokens`.

## Consumed: Anthropic Messages API

- Model ids carry no date suffix: `claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5`, `claude-fable-5`.
- `effort` is nested: `output_config: {effort: "low"|"medium"|"high"|"xhigh"|"max"}`, default `high`.
- Thinking is `thinking: {type: "adaptive"}`; `budget_tokens` returns 400 on current models.
- Cache read costs 0.1x input; cache write costs 1.25x (5m TTL) or 2.0x (1h TTL); max 4 breakpoints.
- Prompt cache is a prefix match rendered `tools -> system -> messages`; any byte change invalidates everything after it.
