"""Agent-svermen: sju spesialiserte agenter som samarbeider over meldingsbussen.

Hver agent gjør én ting, publiserer resultatet på bussen, og neste agent
bygger videre. I referanseimplementasjonen er «intelligensen» regelbasert
og deterministisk; i produksjon byttes hver ``run()`` ut med LLM-kall +
verktøy, mens kontrakten (topic inn → topic ut) står fast.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from .bus import MessageBus
from .twins import TWIN_REGISTRY, CROSS_LINKS, DigitalTwin

# Nøkkelord → tvilling. Norsk + engelsk, små bokstaver.
_KEYWORDS: dict[str, list[str]] = {
    "hunger": ["sult", "matmangel", "underernæring", "famine", "hunger", "skolemat", "stunting"],
    "elder": ["eldre", "ensomhet", "demens", "pensjon", "aldrende", "elder", "loneliness"],
    "adhd": ["adhd", "nevrodivergen", "neurodiverg", "konsentrasjon", "eksekutiv"],
    "boycrisis": ["gutt", "gutter", "unge menn", "neet", "dropout", "frafall", "boy"],
    "girlmental": ["jente", "jenter", "unge kvinner", "angst", "depresjon",
                   "spiseforstyrrelse", "sosiale medier", "girl", "kroppspress"],
}


@dataclass
class Agent:
    bus: MessageBus
    name: str = "Agent"

    def emit(self, topic: str, payload: dict[str, Any]) -> None:
        self.bus.publish(self.name, topic, payload)


class DataHunterAgent(Agent):
    """Finner relevante tvillinger og henter baseline-data + kilder."""

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "DataHunter")

    def run(self, question: str) -> list[DigitalTwin]:
        q = question.lower()
        hits = [key for key, words in _KEYWORDS.items() if any(w in q for w in words)]
        twins = [TWIN_REGISTRY[k] for k in hits] or list(TWIN_REGISTRY.values())[:1]
        self.emit("data.baseline", {
            "question": question,
            "twins": [t.key for t in twins],
            "baselines": {t.key: {"indikator": t.indicator, "2026": t.baseline_2026,
                                  "enhet": t.unit, "kilder": t.sources} for t in twins},
        })
        return twins


class HypothesisGenAgent(Agent):
    """Genererer testbare hypoteser, inkludert kryssforbindelser mellom kriser."""

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "HypothesisGen")

    def run(self, twins: list[DigitalTwin]) -> list[str]:
        keys = {t.key for t in twins}
        hypotheses = [
            f"H{i+1}: «{t.interventions[list(t.interventions)[0]].name}» reduserer "
            f"{t.indicator.lower()} målbart innen 2030."
            for i, t in enumerate(twins)
        ]
        n = len(hypotheses)
        for src, dst, why in CROSS_LINKS:
            if src in keys and dst in keys:
                n += 1
                hypotheses.append(f"H{n} (kryss): {why} — kombinert intervensjon gir "
                                  f"superadditiv effekt.")
        self.emit("hypotheses.generated", {"hypoteser": hypotheses})
        return hypotheses


class CausalInferAgent(Agent):
    """Bygger en enkel kausal graf (DAG) for de valgte tvillingene."""

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "CausalInfer")

    def run(self, twins: list[DigitalTwin]) -> list[dict[str, str]]:
        keys = {t.key for t in twins}
        edges = [
            {"fra": iv.name, "til": t.indicator, "type": "intervensjon",
             "effekt": f"-{iv.effect:.0%}/år ved full dekning"}
            for t in twins for iv in t.interventions.values()
        ]
        edges += [
            {"fra": TWIN_REGISTRY[src].indicator, "til": TWIN_REGISTRY[dst].indicator,
             "type": "kryssforbindelse", "effekt": why}
            for src, dst, why in CROSS_LINKS if src in keys and dst in keys
        ]
        self.emit("causal.dag", {"kanter": edges})
        return edges


class TwinSimulatorAgent(Agent):
    """Kjører virtuelle RCT-er: baseline vs. full intervensjonspakke."""

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "TwinSimulator")

    def run(self, twins: list[DigitalTwin], coverage: float = 0.8):
        results = [t.simulate(chosen=list(t.interventions), coverage=coverage) for t in twins]
        self.emit("simulation.done", {
            "dekning": coverage,
            "resultater": [{
                "tvilling": r.twin, "indikator": r.indicator,
                "2035_baseline": r.baseline[-1], "2035_med_tiltak": r.intervened[-1],
                "endring_pst": r.outcome_delta_pct, "kostnad_mrd_nok": r.total_cost_bnok,
            } for r in results],
        })
        return results


class BiasGuardAgent(Agent):
    """Flagger regioner der datadekningen er for lav til å konkludere.

    Kjernen i equity-garantien: et funn er ikke gyldig for en region
    modellen knapt har data fra — da kreves felt-innsamling og co-design
    før policy-anbefaling.
    """

    THRESHOLD = 0.4

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "BiasGuard")

    def run(self, twins: list[DigitalTwin]) -> list[str]:
        flags = [
            f"{t.name}: datadekning i {region} er {cov:.0%} (< {self.THRESHOLD:.0%}) — "
            f"funn kan ikke generaliseres dit uten felt-innsamling og lokal co-design."
            for t in twins for region, cov in sorted(t.data_coverage.items())
            if cov < self.THRESHOLD
        ]
        self.emit("bias.flags", {"advarsler": flags})
        return flags


class CitizenValidatorAgent(Agent):
    """Simulert borgerpanel: berørte grupper skårer relevans og verdighet.

    Deterministisk her; i produksjon er dette faktiske panelrunder via
    appen, med Impact Tokens som kompensasjon og DAO-avstemming.
    """

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "CitizenValidator")

    def run(self, twins: list[DigitalTwin]) -> dict[str, float]:
        # Skår avledet deterministisk av intervensjonsmiks: tiltak nær
        # hverdagen (skole, besøk, app) skårer høyere enn strukturtiltak.
        proximate = {"skolemat", "besok", "aikompis", "wearables", "mentor",
                     "digitalkbt", "skoletilpasning", "jentescreening"}
        scores = {}
        for t in twins:
            near = sum(1 for k in t.interventions if k in proximate)
            scores[t.key] = round(0.6 + 0.35 * near / len(t.interventions), 2)
        self.emit("citizen.validation", {"skår": scores, "skala": "0–1"})
        return scores


class PolicyPilotAgent(Agent):
    """Syr alt sammen til et policy-brief (markdown)."""

    def __init__(self, bus: MessageBus):
        super().__init__(bus, "PolicyPilot")

    def run(self, question: str, twins, hypotheses, edges, sims, flags, scores) -> str:
        lines = [
            f"# Policy-brief: {question}",
            "",
            "*Generert av SymbioForge Nexus — full sporbarhet i meldingsloggen.*",
            "",
            "## Hovedfunn (digital tvilling-simulering, 2026–2035, 80 % dekning)",
            "",
        ]
        for r in sims:
            t = TWIN_REGISTRY[r.twin]
            lines.append(
                f"- **{t.name}** ({t.group}): {r.indicator} endres "
                f"**{r.outcome_delta_pct:+.1f} %** innen 2035 "
                f"({r.baseline[-1]:.0f} → {r.intervened[-1]:.0f} {r.unit}). "
                f"Samlet kostnad: **{r.total_cost_bnok:.0f} mrd. NOK** over perioden."
            )
        lines += ["", "## Hypoteser", ""]
        lines += [f"- {h}" for h in hypotheses]
        lines += ["", "## Kausale forbindelser", ""]
        lines += [f"- {e['fra']} → {e['til']} ({e['type']}): {e['effekt']}" for e in edges]
        if flags:
            lines += ["", "## ⚠ Equity-forbehold (BiasGuard)", ""]
            lines += [f"- {f}" for f in flags]
        lines += ["", "## Borgerpanel-validering", ""]
        lines += [f"- {TWIN_REGISTRY[k].name}: {v:.2f} / 1.00" for k, v in scores.items()]
        brief = "\n".join(lines)
        self.emit("policy.brief", {"lengde_tegn": len(brief)})
        return brief
