# ADR-0003: Stateless replicated core; state and consensus deferred to v1.1

**Status:** Accepted · 2026-07-11

## Context

The evaluation phase showed blanket replication (MPRSM) and recursive
consensus hierarchies (FRCG, TBRTM) impose cost and complexity most
workloads never repay. The synthesis calls for *selective* redundancy:
replicate the critical path, delegate state to proven external systems.

## Decision

The v1.0 PulseLoop core is stateless: all task state lives in the request
scope of the caller. Redundancy is provided by Kubernetes primitives — three
replicas with pod anti-affinity and zone spread, a PodDisruptionBudget floor
of two, and probe-driven self-healing. etcd-backed control state, Raft
leader election for hierarchical controllers, and a persistent event log are
scoped to v1.1 behind the existing layer interfaces.

## Consequences

- Failover is trivial (any replica serves any request) and rollouts are safe
  by construction; there is no custom replication protocol to get wrong.
- Durable workflows (survive-a-crash task graphs) are not a v1.0 feature —
  callers retry the root submission. This is the accepted trade-off for
  shipping a correct, observable core first.
- The v1.1 state layer plugs in beneath the loop without changing the task
  API: `Submit`/`Spawn` signatures already carry the correlation IDs and
  contexts a durable log needs.
