# ADR-0002: Help-first waiting instead of pool growth for recursive waits

**Status:** Accepted · 2026-07-11

## Context

A fixed worker pool deadlocks on recursive fork/join: if every worker is a
parent blocked waiting for a child, no worker remains to run the children.
Common mitigations — unbounded thread growth (resource blowup) or failing
the spawn (breaks the algorithm) — both contradict the fabric's goals.

## Decision

`Handle.Wait` and backpressured `Spawn` **help**: while blocked, they pull
and execute pending tasks (global queue first, then stealing from worker
local queues) instead of idling. Work distribution is a two-level scheme:
per-worker local queues for spawn locality, a global queue for overflow and
roots, and randomized stealing between workers, with a 1ms idle re-poll so
parked tasks on a busy sibling's queue cannot starve.

## Consequences

- Deep recursion runs to completion on a pool of any size ≥ 1; pool size
  becomes purely a throughput knob, never a correctness knob.
- A helping parent may execute an unrelated task, so task latency histograms
  include helper execution; per-task metrics remain correct because they are
  recorded per execution, not per worker.
- Priority inversion is bounded: helpers only run *pending* work that would
  otherwise delay their own children behind it.
