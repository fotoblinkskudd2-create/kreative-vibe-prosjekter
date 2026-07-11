# ADR-0002: All recursion is budgeted, structured, and help-first

## Status
Accepted

## Context
The single most common weakness across the evaluated ideas (HRAF, ARWC,
SRMFA) was recursion without enforced bounds: stack exhaustion, exponential
fan-out, orphaned work, and the classic bounded-pool deadlock where every
worker waits on children no free worker can execute.

## Decision
1. **Depth budgets.** Spawning past `MaxDepth` fails with a typed error
   (`ErrDepthExceeded`). Failure is *degradable*: callers are expected to fall
   back to inline computation (see the fib demo), so exhausting the budget
   changes the execution shape, not the result.
2. **Structured concurrency.** A task handle resolves only when its whole
   subtree resolves; child errors join into the parent; cancellation flows
   down the tree. No fire-and-forget spawns exist in the API.
3. **Help-first waiting.** A worker that must wait for children executes
   other queued tasks meanwhile. This makes parent-waits-for-child recursion
   deadlock-free at any pool size, including 1.

## Consequences
- Termination is provable: the task tree is finite (depth × width bounds) and
  every task resolves exactly once, even under cancellation or panic.
- Helping nests task execution on the worker's stack; nesting is bounded by
  live (unresolved) tasks, which the depth budget and bounded queue keep
  finite. Verified empirically with 27k-task trees under the race detector.
- Depth budgets are per-subtree, not global: width explosion is bounded by
  queue backpressure and the deadline, not by depth. Deadlines are therefore
  mandatory by default (30s).
