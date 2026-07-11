# PulseLoop Runbook

## Health surface

| Endpoint | Meaning |
|---|---|
| `GET /healthz` | Process liveness. Failing → kubelet restarts the pod. |
| `GET /readyz` | Serving readiness. Returns 503 during graceful drain so the Service stops routing before shutdown. |
| `GET /metrics` | Prometheus text exposition. |

## Key metrics and what to do about them

| Signal | Healthy | Investigate when | Action |
|---|---|---|---|
| `pulseloop_queue_depth` | ~0 at steady state | Sustained > QueueSize/2 | Raise `PULSE_MAX_WORKERS`, or scale replicas; check for tasks blocking on external I/O without deadlines |
| `pulseloop_tasks_rejected_total` | Flat | Increasing | Backpressure is engaging. Confirm callers back off; scale before raising `PULSE_QUEUE_SIZE` (a bigger queue only hides latency) |
| `pulseloop_depth_exceeded_total` | Low, stable | Sudden growth | A workload's recursion got deeper than budgeted. Check whether its inline fallback is correct before raising `PULSE_MAX_DEPTH` |
| `pulseloop_task_panics_total` | 0 | Any increase | Panics are isolated but always bugs. Grep JSON logs for the correlation ID and fix the task function |
| `pulseloop_tasks_failed_total` ÷ `completed_total` | < 1% | Higher | Split by cause: `cancelled_total` rising too → deadline pressure; otherwise task-level errors |
| `pulseloop_workers` vs `workers_target` | Converged | Diverged for minutes | Workers retire only when their local deque is empty; long-running tasks delay shrink. Expected during load, stuck otherwise → capture goroutine dump |
| `pulseloop_scale_ups_total` / `scale_downs_total` | Occasional | Rapid alternation | Tuner oscillation: lengthen `PULSE_TUNE_INTERVAL`; the asymmetric policy makes this rare |
| `pulseloop_task_duration_seconds` p99 | Workload-dependent | Step change | Correlate with `tasks_stolen_total` (skew) and queue depth (saturation) |

## Tuning guide

- **CPU-bound recursive workloads:** `MaxWorkers` ≈ GOMAXPROCS. More adds
  contention, not throughput.
- **I/O-bound tasks:** raise `MaxWorkers` well past GOMAXPROCS; the tuner
  only grows the pool when backlog exists, so a high ceiling is cheap.
- **Depth budget:** budget = expected recursion depth + small headroom.
  Recursion past the budget degrades to inline execution (if the workload
  implements the fallback pattern), so err on the tight side.
- **Deadlines:** never disable `PULSE_DEFAULT_TIMEOUT` in production; it is
  the width-explosion backstop (see ADR-0002).

## Failure drills

**Pod kill:** `kubectl delete pod` one replica. Expect: Service routes to the
two survivors (PDB guarantees 2), replacement pod ready in seconds, no client
errors beyond in-flight requests to the killed pod.

**Saturation:** flood `/demo/fanout?width=8&depth=6`. Expect: queue fills,
`429 Too Many Requests` from rejected submissions, tuner scales to
`MaxWorkers`, recovery to steady state after load stops, pool shrinks within
~4× `TuneInterval`.

**Graceful deploy:** rolling update. Expect: old pods flip `/readyz` to 503 on
SIGTERM, drain up to 25s, log `"shutdown complete"`. If logs show
`"loop shutdown forced cancellation"` frequently, in-flight task trees exceed
the drain budget — lower task deadlines or raise `terminationGracePeriodSeconds`.

## Debugging a stuck task tree

1. Find the correlation ID in the caller's error or the JSON logs.
2. `grep <correlation_id>` across pod logs — every log line for the subtree
   carries it.
3. Check `pulseloop_tasks_inflight` vs. queue depth: inflight high + queue
   zero means tasks are blocked inside their own functions (external I/O
   without honouring `tc.Context()` — the one contract task authors must keep).
4. Last resort: `kill -QUIT <pid>` dumps all goroutine stacks; workers are
   parked in `worker.run`, helpers in `waitChildren`/`helpUntil`.
