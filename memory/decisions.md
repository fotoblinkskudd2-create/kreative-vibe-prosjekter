# Decisions

> One decision per bullet. Dated. Append, never rewrite.

- (2026-07-29) Repo runs on a three-engine kernel: Claude plans and reviews, Codex executes long loops, Foci hosts always-on runtime.
- (2026-07-29) Routing weights live in `orchestration/policy.toml`, not in Python — the tools read policy, they do not encode judgement.
- (2026-07-29) Model prices in `policy.toml` are Anthropic first-party rates cached 2026-06-24; treat them as stale until re-verified.
- (2026-07-29) Codex's model version is deliberately not pinned in policy — read it from the installed CLI rather than asserting a version we cannot verify.
- (2026-07-29) `claude-fable-5` is never auto-selected by the router; it requires an explicit request because its pricing exceeds Opus tier.
- (2026-07-29) Memory budget is 300 lines/file, enforced by `orchestration/memlint.py` and a test, not by convention. The repo has no CI workflow yet, so the gate is manual until one exists.
- (2026-07-29) `risk_high` raises the cost tier and reviewer model but only nudges Claude's engine score, so a high-risk execution loop still runs on Codex with Opus reviewing.
- (2026-07-29) Off-ladder models (`codex-cli`) escalate starting at the cost class's own tier, never downward to a cheaper model than the task warrants.
- (2026-07-29) Tests live in `orchestration/tests/` with an `__init__.py`; discovery needs `-t orchestration` as the top-level dir, not the repo root.
- (2026-07-29) Foci config is shipped as `foci/config.example.toml` and marked unverified — the real schema must be checked against the installed Foci build before use.
