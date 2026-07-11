# ADR-0001: All recursion is bounded by depth budget, deadline and cancellation

**Status:** Accepted · 2026-07-11

## Context

The design exploration surfaced uncontrolled recursion as the single most
recurring failure mode across candidate architectures (HRAF, ARWC, EDLM):
stack exhaustion, exponential resource blowup and non-terminating graphs
under partial failure.

## Decision

Every task in the PulseLoop carries three mandatory bounds:

1. A **depth budget** (`Config.MaxDepth`, default 8). `TaskContext.Spawn`
   past the budget fails with `ErrDepthExceeded` — the failure is a normal,
   typed error the parent handles, not a crash.
2. A **deadline**. Root submissions without one receive
   `Config.DefaultTimeout`; children always inherit the parent context.
3. A **cancellation token** shared by the whole graph via `context.Context`.

There is deliberately no "unbounded" escape hatch.

## Consequences

- Termination is guaranteed structurally: a graph is at most
  `fanout^MaxDepth` nodes and lives at most `DefaultTimeout`.
- Algorithms needing more depth must raise the budget explicitly in config —
  a reviewed, observable decision rather than an accident.
- The deepest observed depth is exported as a gauge, so budget pressure is
  visible before it becomes an outage.
