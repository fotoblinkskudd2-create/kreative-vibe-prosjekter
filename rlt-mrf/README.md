# RLT-MRF — Recursive Loop-Threaded Multi-Layered Resilience Fabric

RLT-MRF v1.0 is the synthesis of a 20-idea architecture exploration: a
multi-layered fabric for running **bounded recursive workloads** on an
**elastic, work-stealing worker pool**, governed by **closed feedback loops**
for self-tuning and self-healing.

The heart of the system is the **PulseLoop** (`internal/pulse`): a
dependency-free Go concurrency core that makes every one of the design's
promises concrete and testable.

## What is implemented

| Design promise | Implementation |
|---|---|
| Bounded recursion | Every task carries a depth budget (`MaxDepth`); `Spawn` fails with `ErrDepthExceeded` past it, letting callers degrade gracefully |
| Structured concurrency | A task never resolves before its spawned subtree; child errors join into the parent's result; cancelling a parent cancels the whole tree |
| Deadlock-free waiting | Workers "help" — execute queued tasks — while waiting on children (`TaskCtx.Await`), so a fully loaded pool of waiting parents still progresses |
| Work stealing | Per-worker LIFO deques with FIFO stealing by idle siblings, instrumented via the `pulseloop_tasks_stolen_total` counter |
| Closed feedback loop | A tuner samples queue depth and utilisation every `TuneInterval` and elastically resizes the pool (fast up, hysteretic down) |
| Backpressure | Bounded submission queue; `Submit` returns `ErrQueueFull` instead of accepting unbounded work |
| Self-healing | Panic isolation per task, three-state circuit breaker (`Breaker`), graceful drain-then-force shutdown |
| Observability | Correlation IDs across whole task trees, structured JSON logs, Prometheus metrics (counters, gauges, latency histogram) with zero dependencies |
| Selective redundancy | 3-replica Deployment with pod anti-affinity and a PodDisruptionBudget — replication only where it buys resilience |

## Quickstart

```bash
cd rlt-mrf
go test -race ./...          # full suite incl. load, stealing, chaos tests
go run ./cmd/pulseloop       # serves :8080
```

Exercise it:

```bash
curl 'localhost:8080/demo/fib?n=30'                          # recursive spawn w/ graceful degradation
curl 'localhost:8080/demo/fanout?width=4&depth=5&sleep_ms=0' # synthetic recursive load
curl 'localhost:8080/metrics'                                # Prometheus exposition
```

Measured on a development container: 20 parallel fan-out requests (27,300
recursive tasks) complete in ~74 ms — roughly **370k tasks/s**, far beyond the
plan's 5k ops/s acceptance target, with zero failures and active stealing.

## Using the library

```go
loop, _ := pulse.New(pulse.Config{MaxDepth: 8, DefaultTimeout: 30 * time.Second})
loop.Start()
defer loop.Shutdown(ctx)

handle, err := loop.Submit("index-site", func(tc *pulse.TaskCtx) error {
    for _, page := range pages {
        child, err := tc.Spawn("index-page", indexPage(page))
        if errors.Is(err, pulse.ErrDepthExceeded) {
            return indexInline(page) // degrade instead of recursing
        }
        _ = child // subtree is awaited automatically (structured concurrency)
    }
    return nil
})
err = handle.Wait() // resolves after the entire task tree completes
```

## Configuration (environment variables for `cmd/pulseloop`)

| Variable | Default | Meaning |
|---|---|---|
| `PULSE_MIN_WORKERS` | 2 | Elastic pool floor |
| `PULSE_MAX_WORKERS` | 4×GOMAXPROCS | Elastic pool ceiling |
| `PULSE_MAX_DEPTH` | 8 | Recursion depth budget |
| `PULSE_QUEUE_SIZE` | 1024 | Submission queue bound (backpressure) |
| `PULSE_DEFAULT_TIMEOUT` | 30s | Deadline inherited by each task tree |
| `PULSE_TUNE_INTERVAL` | 250ms | Feedback tuner sampling period |
| `PULSE_HTTP_PORT` | 8080 | HTTP listen port |

## Layout

```
rlt-mrf/
├── cmd/pulseloop/     # HTTP service: probes, /metrics, demo workloads
├── internal/pulse/    # PulseLoop core: loop, pool, tuner, breaker, metrics
├── deploy/k8s/        # Namespace, Deployment (3× anti-affine), Service, PDB
├── docs/
│   ├── architecture.md
│   ├── runbook.md
│   └── adr/           # Architecture Decision Records
└── Dockerfile         # distroless, non-root, static binary
```

## Deploying

```bash
docker build -t pulseloop:v1 rlt-mrf/
kubectl apply -f rlt-mrf/deploy/k8s/
```

## Scoped for follow-on sprints (v1.1 backlog)

Deliberately deferred, per the ADRs: OpenTelemetry trace export (correlation
IDs are already plumbed), Raft-backed control state (single-instance loops
don't need consensus), NATS/Kafka cross-service feedback bus, ML-driven
tuning (the PID-like controller is deliberately simple and pluggable), and
multi-region active-active.
