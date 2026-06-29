# OpenClaw AgentOps

Local-first black box recorder for AI agent runs (Claude Code, Codex, OpenClaw, or anything else that produces a run log). It tells you where your agents are wasting time, money, and context, and what to fix.

No cloud dependency. Everything runs against a local SQLite file.

## Stack

- Next.js 14 (App Router) + TypeScript
- SQLite via `better-sqlite3`
- Tailwind CSS
- Vitest for unit tests

## Getting started

```bash
npm install
npm run seed   # populate data/agentops.db with demo runs
npm run dev    # http://localhost:3000
```

Or seed from the UI: open the dashboard and click **Seed demo data**.

To import a real log file instead of (or in addition to) the seed data:

```bash
curl -X POST http://localhost:3000/api/runs \
  -H "Content-Type: application/json" \
  --data @data/demo-logs.json
```

`data/demo-logs.json` is itself a working example of the import format -- it's the same data the seed script writes into SQLite, just as a flat file you could imagine exporting from a real agent harness.

## Core features

1. **Import agent run logs** -- `POST /api/runs` accepts `{ "runs": [...] }` (or a bare array) and validates every entry before inserting it.
2. **Run timeline** -- the dashboard (`/`) lists every run with status, failure class, score, cost, and duration, newest first.
3. **Failure classification** -- every run is classified into one of:
   - `tool_error`
   - `hallucination`
   - `timeout`
   - `bad_prompt`
   - `missing_context`
   - `cost_spike`
   - `none` (healthy run)
4. **0-100 scoring** -- deterministic, rule-based (see `src/lib/scoring.ts`).
5. **Improvement recommendations** -- one human-readable fix per failure class, plus a generated prompt rewrite (`src/lib/recommendations.ts`).
6. **Weekly report** -- `/report` renders it, `GET /api/report?format=md` downloads it as Markdown.

## API

| Route | Method | Description |
|---|---|---|
| `/api/seed` | `POST` | Wipes the table and inserts demo data |
| `/api/runs` | `GET` | List all runs, scored and classified |
| `/api/runs` | `POST` | Import runs: `{ "runs": AgentRunInput[] }` |
| `/api/runs/:id` | `GET` | Single run detail |
| `/api/report` | `GET` | Weekly report. `?days=N` (default 7), `?format=md` for Markdown |

## Database schema

See `src/lib/schema.sql` for the reference copy of the `runs` table (the live schema is inlined in `src/lib/db.ts` since Next.js doesn't reliably bundle non-JS assets read via `__dirname` at runtime).

## Failure classification & scoring rules

Classification precedence (most specific signal wins): error-message pattern match (`missing_context`, `hallucination`) > recorded tool errors > duration over the timeout threshold > cost over the spike threshold > short/vague prompt on a failed run > generic failure fallback > `none` for successful runs with no signal. Thresholds live in `src/lib/thresholds.ts`.

Scoring starts at 100 (success) or 55 (failure) and subtracts a per-class penalty plus penalties for tool errors, slow duration, and elevated cost, clamped to [0, 100]. See `src/lib/scoring.ts`.

These are intentionally simple, explainable, rule-based heuristics -- not a model -- so they're auditable and cheap to run on every import.

## Tests

```bash
npm test
```

21 Vitest unit tests cover the classifier (every branch and its precedence order), the scorer, the recommendation/prompt-rewrite generator, and the weekly report (window filtering, top-failure selection, and the Markdown template).

## Known limitations

- Scoring and classification are rule-based heuristics tuned against the demo dataset, not learned from real production data. Re-tune the thresholds in `src/lib/thresholds.ts` and the penalties in `src/lib/scoring.ts` once real runs start flowing in.
- `next@14.2.35` is the latest patched release on the 14.x line, but several Next.js advisories (cache poisoning, RSC-related DoS, image-optimizer issues) are only fully resolved in Next 16, which requires breaking changes (e.g. async dynamic route params) not made here. Low risk for this local-first MVP; revisit before any public-facing deployment.
- The dev-only `esbuild`/`vite` advisory pulled in by Vitest 2.x (malicious site can talk to your local dev server) is unfixed without a Vitest 4 major upgrade; it only matters while `npm run dev`/`vitest` is running on a machine that also browses the open web.
- No auth -- this is meant to run on `localhost` for a single user, not be exposed publicly.

## Next build steps

1. Add a CLI/watcher that tails a real agent harness's log directory and POSTs new runs to `/api/runs` automatically.
2. Add a cost/duration baseline per agent (rolling average) so `cost_spike`/`timeout` thresholds adapt instead of using fixed constants.
3. Wire the weekly Markdown report into a scheduled export (cron + email/Slack) instead of requiring a manual visit to `/report`.
