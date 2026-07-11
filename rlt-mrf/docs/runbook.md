# RLT-MRF Runbook — pulsed / PulseLoop

## Quick reference

| Endpoint | Purpose |
|---|---|
| `GET /healthz` | Liveness (process up) |
| `GET /readyz` | Readiness (returns 503 while draining) |
| `GET /metrics` | Prometheus text metrics |
| `GET /v1/status` | JSON snapshot: workers, busy, queue depth, counters |
| `POST /v1/compute?depth=&fanout=&work_us=` | Sample recursive workload |

## Configuration (environment variables)

| Variable | Default | Notes |
|---|---|---|
| `PULSE_ADDR` | `:8080` | Listen address |
| `PULSE_MIN_WORKERS` | 4 | Pool floor; feedback controller never goes below |
| `PULSE_MAX_WORKERS` | 64 | Pool ceiling; hard cap on concurrency |
| `PULSE_QUEUE_SIZE` | 4096 | Global queue; full queue rejects *root* submissions (HTTP 429) |
| `PULSE_MAX_DEPTH` | 8 | Recursion depth budget for the whole process |
| `PULSE_DEFAULT_TIMEOUT_MS` | 30000 | Deadline applied to roots submitted without one |

## Key metrics and what they mean

- `pulseloop_tasks_rejected_total` rising → edge backpressure engaged. Not an
  error by itself; sustained growth means the pool ceiling or replica count is
  too low for offered load. Check `pulseloop_queue_depth` and
  `pulseloop_workers` (pinned at max?) before scaling replicas.
- `pulseloop_depth_exceeded_total` rising → workloads are hitting the depth
  budget. Either a workload regression (unintended recursion) or the budget is
  genuinely too small. Correlate with the offending `correlation_id` in logs.
- `pulseloop_task_panics_total` > 0 → a task panicked; the loop isolates and
  survives panics, but each one is a bug. The panic message (with correlation
  ID and depth) is in the task error.
- `pulseloop_queue_wait_seconds` p99 growing while `pulseloop_workers` sits
  below max → feedback controller misconfigured or interval too slow.
- `pulseloop_tasks_stolen_total` ≈ 0 under fan-out load → spawn locality is
  degenerate (all work on one queue); usually harmless, but worth a look if
  latency is skewed.

## Failure modes and responses

**HTTP 429 from `/v1/compute`** — root-level backpressure (`ErrQueueFull`).
Clients should retry with backoff. Operator action only if sustained: raise
`PULSE_MAX_WORKERS`, `PULSE_QUEUE_SIZE`, or replicas.

**Pod restart loops** — liveness probe hits `/healthz`; if the process
starts but immediately dies, check for port conflicts (`PULSE_ADDR`) in the
JSON logs. The PDB keeps ≥2 replicas serving during any single-pod incident.

**Slow drain on rollout** — SIGTERM flips `/readyz` to 503, then waits up to
25s for in-flight task graphs. Graphs longer than the grace period are
killed with the pod; keep `PULSE_DEFAULT_TIMEOUT_MS` below
`terminationGracePeriodSeconds`.

**Pool never scales down** — the controller shrinks only after 8 consecutive
idle ticks (~2s) with an empty queue. A trickle of tasks legitimately holds
the pool up; verify with `pulseloop_workers_busy`.

## Tuning guidance

- **CPU-bound tasks:** set `PULSE_MAX_WORKERS` ≈ GOMAXPROCS; more only adds
  context switching.
- **I/O-bound tasks:** raise `PULSE_MAX_WORKERS` well above core count and
  wrap downstream calls in a `pulseloop.CircuitBreaker` so a dead dependency
  fails fast instead of parking the whole pool.
- **Deep, narrow recursion:** raise `PULSE_MAX_DEPTH`, keep fan-out small.
  The cost of a graph is `fanout^depth`, not depth alone.
- **Bursty load:** prefer a bigger `PULSE_QUEUE_SIZE` over a bigger pool —
  the queue absorbs bursts, the feedback controller handles sustained shifts.

## Local development

```sh
cd rlt-mrf
go test ./... -race          # full suite incl. chaos-style tests
go run ./cmd/pulsed          # serve on :8080
curl -X POST 'localhost:8080/v1/compute?depth=6&fanout=2&work_us=200'
go test ./pkg/pulseloop/ -run xxx -bench . -benchtime 2s
```
