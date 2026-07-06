"""Discovery-to-Action-løkka: spørsmål inn → policy-brief ut.

Orkestratoren kjører agentene i fast rekkefølge over meldingsbussen:

    DataHunter → HypothesisGen → CausalInfer → TwinSimulator
              → BiasGuard → CitizenValidator → PolicyPilot

Hele kjøringen er deterministisk: samme spørsmål gir samme brief og
samme audit-hash. Det er reproduserbarhets-garantien i praksis.
"""

from __future__ import annotations

from dataclasses import dataclass, field

from .bus import MessageBus, Message
from .agents import (
    DataHunterAgent, HypothesisGenAgent, CausalInferAgent, TwinSimulatorAgent,
    BiasGuardAgent, CitizenValidatorAgent, PolicyPilotAgent,
)
from .twins import SimulationResult


@dataclass
class DiscoveryResult:
    question: str
    twins: list[str]
    hypotheses: list[str]
    simulations: list[SimulationResult]
    bias_flags: list[str]
    citizen_scores: dict[str, float]
    brief_markdown: str
    audit_hash: str
    trace: list[Message] = field(default_factory=list)


class NexusOrchestrator:
    def __init__(self) -> None:
        self.bus = MessageBus()
        self.data_hunter = DataHunterAgent(self.bus)
        self.hypothesis_gen = HypothesisGenAgent(self.bus)
        self.causal_infer = CausalInferAgent(self.bus)
        self.twin_simulator = TwinSimulatorAgent(self.bus)
        self.bias_guard = BiasGuardAgent(self.bus)
        self.citizen_validator = CitizenValidatorAgent(self.bus)
        self.policy_pilot = PolicyPilotAgent(self.bus)

    def discover(self, question: str, coverage: float = 0.8) -> DiscoveryResult:
        twins = self.data_hunter.run(question)
        hypotheses = self.hypothesis_gen.run(twins)
        edges = self.causal_infer.run(twins)
        sims = self.twin_simulator.run(twins, coverage=coverage)
        flags = self.bias_guard.run(twins)
        scores = self.citizen_validator.run(twins)
        brief = self.policy_pilot.run(question, twins, hypotheses, edges, sims, flags, scores)
        return DiscoveryResult(
            question=question,
            twins=[t.key for t in twins],
            hypotheses=hypotheses,
            simulations=sims,
            bias_flags=flags,
            citizen_scores=scores,
            brief_markdown=brief,
            audit_hash=self.bus.audit_chain(),
            trace=list(self.bus.trace),
        )
