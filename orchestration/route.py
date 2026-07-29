#!/usr/bin/env python3
"""Deterministic model router for the orchestration kernel.

Classifies a task into engine + model + effort + cost class before any expensive
work starts. Reads every weight from policy.toml — no judgement is hardcoded here.

    ./route.py "refactor the vibe-kort renderer across 12 files" --files 12 --risk high
    ./route.py "classify 400 project ideas by genre" --json

Exit codes: 0 decision emitted, 2 bad usage.
"""

from __future__ import annotations

import argparse
import json
import sys
import tomllib
from pathlib import Path
from typing import Any

ENGINES = ("claude", "codex", "foci")
DEFAULT_POLICY = Path(__file__).with_name("policy.toml")


class PolicyError(RuntimeError):
    """policy.toml is missing a key the router requires."""


def load_policy(path: Path = DEFAULT_POLICY) -> dict[str, Any]:
    with path.open("rb") as fh:
        policy = tomllib.load(fh)
    for key in ("models", "cost_class", "engine", "signal", "escalation"):
        if key not in policy:
            raise PolicyError(f"{path.name}: missing required section [{key}]")
    return policy


def match_signals(text: str, signals: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return the signals whose keywords appear in text, with the hits recorded."""
    lowered = text.lower()
    matched = []
    for signal in signals:
        hits = [kw for kw in signal.get("keywords", []) if kw in lowered]
        if hits:
            matched.append({"name": signal["name"], "hits": hits, "signal": signal})
    return matched


def _add(totals: dict[str, int], source: dict[str, Any]) -> int:
    """Accumulate per-engine weights from source into totals; return cost weight."""
    for engine in ENGINES:
        totals[engine] += int(source.get(engine, 0))
    return int(source.get("cost", 0))


def active_flags(
    policy: dict[str, Any],
    *,
    files: int,
    horizon: str,
    risk: str,
    runtime: bool,
    interactive: bool,
) -> list[str]:
    """Resolve CLI inputs into the flag names defined in policy.toml."""
    flags = policy.get("flag", {})
    names: list[str] = []

    if risk == "high":
        names.append("risk_high")
    elif risk == "medium":
        names.append("risk_medium")

    if horizon == "long":
        names.append("horizon_long")
    elif horizon == "medium":
        names.append("horizon_medium")

    if runtime:
        names.append("runtime")
    if interactive:
        names.append("interactive")

    for name in ("files_many", "files_sprawl"):
        threshold = flags.get(name, {}).get("threshold")
        if threshold is not None and files >= int(threshold):
            names.append(name)

    return [n for n in names if n in flags]


def classify_cost(policy: dict[str, Any], weight: int) -> dict[str, Any]:
    """Map a cost weight onto the cheapest class whose ceiling it fits under."""
    classes = sorted(
        policy["cost_class"].values(), key=lambda c: int(c["max_weight"])
    )
    for klass in classes:
        if weight <= int(klass["max_weight"]):
            return klass
    return classes[-1]


def pick_engine(policy: dict[str, Any], totals: dict[str, int]) -> str:
    """Highest total wins. Ties break on the engine's declared priority."""
    engines = policy["engine"]
    best = max(
        ENGINES,
        key=lambda e: (totals[e], -int(engines.get(e, {}).get("priority", 99))),
    )
    # No signal fired at all -> plan first, which is Claude's job.
    return best if totals[best] > 0 else "claude"


def pick_model(
    policy: dict[str, Any], engine: str, cost_class: dict[str, Any], explicit: str | None
) -> str:
    if explicit:
        if explicit not in policy["models"]:
            raise PolicyError(f"unknown model {explicit!r}; not in policy.toml")
        return explicit
    if engine == "codex":
        return "codex-cli"
    if engine == "foci":
        # Foci exists for footprint. It gets the cheapest capable backend unless
        # the task itself is heavy, in which case it pipes out to the class model.
        return (
            "claude-haiku-4-5"
            if cost_class["label"] == "low"
            else str(cost_class["model"])
        )
    return str(cost_class["model"])


def escalation_path(
    policy: dict[str, Any], model: str, class_model: str
) -> list[str]:
    """Where to hand off when the quality gate fails.

    On-ladder models escalate to what sits above them. An off-ladder model
    (codex-cli) has no rung, so it hands off starting at the tier the work's cost
    class already warrants — never downward to a cheaper model than the task needs.
    """
    ladder: list[str] = list(policy["escalation"]["ladder"])
    if model in ladder:
        return ladder[ladder.index(model) + 1 :]
    if class_model in ladder:
        return ladder[ladder.index(class_model) :]
    return ladder


def route(
    task: str,
    policy: dict[str, Any],
    *,
    files: int = 0,
    horizon: str = "short",
    risk: str = "low",
    runtime: bool = False,
    interactive: bool = False,
    model: str | None = None,
) -> dict[str, Any]:
    """Produce a routing decision. Pure function of its inputs and the policy."""
    totals = {engine: 0 for engine in ENGINES}
    weight = 0

    matched = match_signals(task, policy["signal"])
    for entry in matched:
        weight += _add(totals, entry["signal"])

    flags = active_flags(
        policy,
        files=files,
        horizon=horizon,
        risk=risk,
        runtime=runtime,
        interactive=interactive,
    )
    for name in flags:
        weight += _add(totals, policy["flag"][name])

    cost_class = classify_cost(policy, weight)
    engine = pick_engine(policy, totals)
    chosen = pick_model(policy, engine, cost_class, model)
    spec = policy["models"][chosen]

    plan_review = "claude-opus-5" if risk == "high" else "claude-sonnet-5"

    return {
        "task": task,
        "engine": engine,
        "engine_role": policy["engine"].get(engine, {}).get("role", ""),
        "model": chosen,
        "model_tier": spec.get("tier", "unknown"),
        "effort": cost_class["effort"],
        "cost_class": cost_class["label"],
        "cost_weight": weight,
        "engine_scores": dict(totals),
        "signals": [{"name": e["name"], "hits": e["hits"]} for e in matched],
        "flags": flags,
        "escalate_to": escalation_path(policy, chosen, str(cost_class["model"])),
        "plan_review_model": plan_review,
        "cache_min_tokens": spec.get("cache_min_tokens", 0),
        "notes": [n for n in (spec.get("note"), spec.get("unverified")) if n],
    }


def render(decision: dict[str, Any]) -> str:
    lines = [
        f"engine      {decision['engine']}  ({decision['engine_role']})",
        f"model       {decision['model']}  [{decision['model_tier']}]",
        f"effort      {decision['effort']}",
        f"cost class  {decision['cost_class']}  (weight {decision['cost_weight']})",
        f"scores      " + "  ".join(
            f"{e}={v}" for e, v in decision["engine_scores"].items()
        ),
    ]
    if decision["signals"]:
        hits = ", ".join(
            f"{s['name']}({'/'.join(s['hits'][:3])})" for s in decision["signals"]
        )
        lines.append(f"signals     {hits}")
    else:
        lines.append("signals     none matched -> defaulting to plan-first")
    if decision["flags"]:
        lines.append(f"flags       {', '.join(decision['flags'])}")
    if decision["engine"] != "claude":
        lines.append(f"plan/review {decision['plan_review_model']}")
    if decision["escalate_to"]:
        lines.append(f"escalate    {' -> '.join(decision['escalate_to'])}")
    if decision["cache_min_tokens"]:
        lines.append(
            f"cache       prefix must exceed {decision['cache_min_tokens']} tokens to cache"
        )
    for note in decision["notes"]:
        lines.append(f"note        {note}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Route a task to the cheapest engine/model that can finish it."
    )
    parser.add_argument("task", help="Task description. Norwegian or English.")
    parser.add_argument("--files", type=int, default=0, help="Files expected to change.")
    parser.add_argument(
        "--horizon", choices=("short", "medium", "long"), default="short"
    )
    parser.add_argument("--risk", choices=("low", "medium", "high"), default="low")
    parser.add_argument(
        "--runtime", action="store_true", help="Needs an always-on/realtime surface."
    )
    parser.add_argument(
        "--interactive", action="store_true", help="Human in the loop, latency matters."
    )
    parser.add_argument("--model", help="Force a model id from policy.toml.")
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    parser.add_argument("--json", action="store_true", help="Machine-readable output.")
    args = parser.parse_args(argv)

    try:
        policy = load_policy(args.policy)
        decision = route(
            args.task,
            policy,
            files=args.files,
            horizon=args.horizon,
            risk=args.risk,
            runtime=args.runtime,
            interactive=args.interactive,
            model=args.model,
        )
    except (OSError, PolicyError, tomllib.TOMLDecodeError) as exc:
        print(f"route: {exc}", file=sys.stderr)
        return 2

    print(json.dumps(decision, indent=2) if args.json else render(decision))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
