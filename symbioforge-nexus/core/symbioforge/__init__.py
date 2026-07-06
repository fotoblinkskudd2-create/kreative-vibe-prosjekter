"""SymbioForge Nexus — autonomt, selv-evoluerende DeSci-økosystem.

Referanseimplementasjon av kjernen: multi-agent swarm, digitale tvillinger
for fem globale gruppekriser, og en lukket Discovery-to-Action-løkke.

Alt er deterministisk og kjørbart uten eksterne avhengigheter (kun stdlib),
slik at hele løkka kan reproduseres bit-for-bit — 100 % reproduserbarhet
er et designkrav, ikke et mål.
"""

from .bus import MessageBus, Message
from .twins import (
    DigitalTwin,
    HungerTwin,
    ElderTwin,
    ADHDTwin,
    BoyCrisisTwin,
    GirlMentalTwin,
    TWIN_REGISTRY,
)
from .agents import (
    Agent,
    DataHunterAgent,
    HypothesisGenAgent,
    CausalInferAgent,
    TwinSimulatorAgent,
    BiasGuardAgent,
    CitizenValidatorAgent,
    PolicyPilotAgent,
)
from .orchestrator import NexusOrchestrator, DiscoveryResult

__version__ = "0.1.0"
__all__ = [
    "MessageBus",
    "Message",
    "DigitalTwin",
    "HungerTwin",
    "ElderTwin",
    "ADHDTwin",
    "BoyCrisisTwin",
    "GirlMentalTwin",
    "TWIN_REGISTRY",
    "Agent",
    "DataHunterAgent",
    "HypothesisGenAgent",
    "CausalInferAgent",
    "TwinSimulatorAgent",
    "BiasGuardAgent",
    "CitizenValidatorAgent",
    "PolicyPilotAgent",
    "NexusOrchestrator",
    "DiscoveryResult",
]
