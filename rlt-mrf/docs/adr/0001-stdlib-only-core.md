# ADR-0001: The concurrency core depends only on the Go standard library

## Status
Accepted

## Context
The 20-idea evaluation repeatedly found that custom infrastructure loses to
mature platforms (Kafka/Flink vs. EDLM/RRSF, Temporal vs. ARWC, Istio vs.
HROB). The corollary is that anything we *do* build custom must be small,
auditable, and free of moving parts we don't control.

## Decision
`internal/pulse` imports nothing outside the standard library. Prometheus
exposition is hand-rendered text format (~50 lines) instead of the client
library; tracing is correlation-ID plumbing rather than an OpenTelemetry SDK
dependency; the tuner is a simple asymmetric proportional controller, not an
optimisation framework.

Platform concerns stay on platforms: replication, placement, probing, and
disruption management belong to Kubernetes (`deploy/k8s/`), not the core.

## Consequences
- The core is fully auditable (~1,200 lines including tests) and builds to a
  static distroless image.
- OpenTelemetry export, when needed, wraps the existing correlation IDs at
  the application layer without touching the core (v1.1 backlog).
- We accept re-implementing ~50 lines of exposition format in exchange for a
  zero-CVE-surface dependency graph.
