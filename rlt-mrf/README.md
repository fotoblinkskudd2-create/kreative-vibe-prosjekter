# RLT-MRF — Recursive Loop-Threaded Multi-Layered Resilience Fabric

A layered Go runtime for **bounded recursive task graphs** with closed
feedback loops, selective redundancy and first-class observability. This is
the v1.0 implementation of the RLT-MRF design synthesized from a 20-idea
architecture exploration.

```
rlt-mrf/
├── cmd/pulsed/          # Daemon: HTTP API, health, metrics, sample recursive workload
├── pkg/pulseloop/       # The PulseLoop core (library, stdlib-only)
│   ├── loop.go          #   Work-stealing pool, bounded queues, graceful drain
│   ├── task.go          #   TaskContext: depth budget, deadlines, Spawn/SpawnWait
│   ├── feedback.go      #   Closed-loop pool auto-sizing (proportional + hysteresis)
│   ├── circuit.go       #   Circuit breaker for downstream calls
│   └── metrics.go       #   Prometheus text metrics
├── deploy/k8s/          # 3-replica Deployment, Service, PodDisruptionBudget
├── docs/                # Architecture blueprint, ADRs, runbook
└── Dockerfile           # Distroless, non-root
```

## What it guarantees

- **Bounded recursion** — every task graph carries a depth budget, a deadline
  and a cancellation token. Runaway recursion is structurally impossible
  ([ADR-0001](docs/adr/0001-bounded-recursion.md)).
- **Deadlock-free fork/join** — blocked parents help execute pending work, so
  recursion completes on a pool of any size
  ([ADR-0002](docs/adr/0002-help-first-scheduling.md)).
- **Origin-aware backpressure** — overload rejects at the edge (root
  submissions) and throttles inside (spawns slow down, never fail on load).
- **Closed feedback loop** — the pool resizes itself from live queue depth
  and utilization; every adjustment is observable.
- **Selective redundancy** — the stateless core runs 3× with anti-affinity
  and a disruption floor of 2; state is delegated, not reinvented
  ([ADR-0003](docs/adr/0003-stateless-core-selective-redundancy.md)).

## Quick start

```sh
go test ./... -race                 # full test suite
go run ./cmd/pulsed                 # serve on :8080
curl -X POST 'localhost:8080/v1/compute?depth=6&fanout=2&work_us=200'
curl localhost:8080/metrics | grep pulseloop
```

As a library:

```go
loop := pulseloop.New(pulseloop.Config{MaxDepth: 6})
h, _ := loop.Submit(ctx, "job-42", func(tc *pulseloop.TaskContext) error {
    return tc.SpawnWait(func(tc *pulseloop.TaskContext) error {
        // runs at depth 1, inherits deadline + cancellation + correlation ID
        return nil
    })
})
err := h.Wait(ctx)
```

Measured baseline: **~740k recursive tasks/s** sustained on a 4-vCPU
container (`BenchmarkRecursiveTree`). See
[docs/architecture.md](docs/architecture.md) for the full blueprint and
[docs/runbook.md](docs/runbook.md) for operations.
