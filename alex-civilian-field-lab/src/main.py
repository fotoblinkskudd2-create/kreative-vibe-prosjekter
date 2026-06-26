"""Run the full civilian field-lab pipeline:
load concepts -> screen for civilian safety -> score -> plan -> report.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from concept_loader import load_concepts
from prototype_planner import build_plan
from report_generator import (
    build_sales_angle,
    render_concept_scores,
    render_prototype_plan,
    render_sales_angles,
    render_top_ideas,
)
from risk_filter import load_risk_rules, screen_concepts
from scorer import load_weights, score_concepts

ROOT = Path(__file__).parent.parent
DATA = ROOT / "data"
REPORTS = ROOT / "reports"

TOP_N_IDEAS = 5
TOP_N_PROTOTYPES = 3


def main():
    concepts = load_concepts(DATA / "concepts.yaml")
    risk_rules = load_risk_rules(DATA / "risk_rules.yaml")
    weights = load_weights(DATA / "scoring_weights.yaml")

    safe, blocked = screen_concepts(concepts, risk_rules)
    scored = score_concepts(safe, weights)

    REPORTS.mkdir(exist_ok=True)
    render_concept_scores(scored, blocked, REPORTS / "concept_scores.md")
    render_top_ideas(scored, REPORTS / "top_ideas.md", top_n=TOP_N_IDEAS)

    plans = [build_plan(c) for c in scored[:TOP_N_PROTOTYPES]]
    render_prototype_plan(plans, REPORTS / "prototype_plan.md")

    angles = [build_sales_angle(c) for c in scored[:TOP_N_IDEAS]]
    render_sales_angles(angles, REPORTS / "sales_angles.md")

    print(f"Lastet {len(concepts)} konsepter: {len(safe)} godkjent, {len(blocked)} blokkert.")
    print(f"Toppidé: {scored[0]['name']} (score {scored[0]['value_score']})")
    print(f"Rapporter skrevet til {REPORTS}/")


if __name__ == "__main__":
    main()
