# Conventions

## Language

- Norwegian for user-facing prose: README, salgsmateriell, project descriptions.
- English for code, identifiers, commit messages, and system files (`CLAUDE.md`, `AGENTS.md`).

## Repo layout

- `orchestration/` — routing policy and the tools that enforce it. Python 3.11+, stdlib only.
- `memory/` — durable state. See `memory/README.md`.
- `foci/` — Foci agent identity and config templates.
- `docs/` — the kernel's own reference material: routing, cost control, operating loop.

## Code

- Python 3.11+ and standard library only in `orchestration/`. No dependency may be added there without a decision entry.
- Config is TOML, parsed with `tomllib`. No YAML, no runtime dependency for parsing.
- Tools exit 0 on success, 1 on findings, 2 on usage/config error.
- Comments state constraints the code cannot show. Never narrate the next line.

## Git

- Work on `claude/<topic>-<suffix>` branches. Never push straight to `main`.
- Commit messages: imperative subject, body explains why, not what.
- Every push opens a draft PR if one is not already open.

## Tests

- `python3 -m unittest discover -s orchestration/tests -t .` from the repo root.
- Routing changes require a test that pins the new behaviour to a signal, not to a keyword.
