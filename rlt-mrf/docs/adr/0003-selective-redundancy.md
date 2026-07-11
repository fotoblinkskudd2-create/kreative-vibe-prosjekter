# ADR-0003: Selective redundancy over blanket replication

## Status
Accepted

## Context
The evaluation showed blanket replication schemes (MPRSM's three planes,
TBRTM's tiered BFT, FRCG's per-tier quorums) paying enormous resource and
complexity costs for resilience most workloads don't need.

## Decision
Redundancy is applied only where it buys availability:

- **Process level:** each PulseLoop instance is self-contained and stateless
  across requests, so redundancy is simply N=3 replicas with pod
  anti-affinity (host- and zone-preferred) and a PodDisruptionBudget of
  minAvailable=2. No leader election, no consensus, no replicated state.
- **Task level:** no speculative duplication or result voting (ATPRO's
  weakness). A failed subtree reports a typed, correlated error; retry policy
  belongs to the caller, optionally behind the provided circuit breaker.
- **Within a process:** panic isolation per task and cooperative worker
  retirement mean a single failure never costs more than its own subtree.

## Consequences
- Failover is instant (Service endpoints) and the redundancy overhead is
  exactly 2 extra pods — no quorum traffic, no replication lag to debug.
- If replicated control state is ever genuinely required (e.g. a distributed
  scheduler on top of PulseLoop), it should come from etcd/Raft as an
  explicit new component (v1.1 backlog), not be woven into the core.
