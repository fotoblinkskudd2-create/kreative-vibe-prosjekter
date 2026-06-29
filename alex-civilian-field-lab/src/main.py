"""Kjør den fullstendige sivile feltlab-pipelinen:
last konsepter → sil mot sivil trygghet → score → simuler ROI → planlegg → rapport.

Bruk:
  python src/main.py                    # standard kjøring
  python src/main.py --top 10           # vis topp 10 i stedet for 5
  python src/main.py --simulate         # kjør Monte Carlo ROI-simulering
  python src/main.py --segment all      # inkluder segmentanalyse
"""
import argparse
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
    render_roi_simulation,
    render_segment_analysis,
)
from risk_filter import load_risk_rules, screen_concepts
from scorer import load_weights, score_concepts
from roi_simulator import simulate_roi_batch

ROOT = Path(__file__).parent.parent
DATA = ROOT / "data"
REPORTS = ROOT / "reports"


def parse_args():
    parser = argparse.ArgumentParser(
        description="Sivil feltlab: score og planlegg prototypekonsepter."
    )
    parser.add_argument(
        "--top", type=int, default=5, metavar="N",
        help="Antall topp-idéer i rapportene (standard: 5)",
    )
    parser.add_argument(
        "--simulate", action="store_true",
        help="Kjør Monte Carlo ROI-simulering for topp-N konsepter",
    )
    parser.add_argument(
        "--segment", choices=["all", "none"], default="none",
        help="Inkluder segmentanalyse i rapporten (standard: none)",
    )
    parser.add_argument(
        "--data-dir", type=Path, default=DATA, metavar="DIR",
        help="Mappe med YAML-datafiler",
    )
    parser.add_argument(
        "--reports-dir", type=Path, default=REPORTS, metavar="DIR",
        help="Mappe der rapporter skrives",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    data_dir = args.data_dir
    reports_dir = args.reports_dir
    top_n = max(1, args.top)
    top_prototypes = min(3, top_n)

    try:
        concepts = load_concepts(data_dir / "concepts.yaml")
    except FileNotFoundError as e:
        sys.exit(f"FEIL: Datafil ikke funnet — {e}")
    except ValueError as e:
        sys.exit(f"FEIL: Ugyldig konseptdata — {e}")

    try:
        risk_rules = load_risk_rules(data_dir / "risk_rules.yaml")
        weights = load_weights(data_dir / "scoring_weights.yaml")
    except (FileNotFoundError, ValueError, KeyError) as e:
        sys.exit(f"FEIL: Kunne ikke laste konfigfiler — {e}")

    safe, blocked = screen_concepts(concepts, risk_rules)
    scored = score_concepts(safe, weights)

    if not scored:
        print(
            f"ADVARSEL: Alle {len(concepts)} konsepter ble blokkert av risikofilteret. "
            "Ingen rapport generert. Sjekk data/risk_rules.yaml."
        )
        sys.exit(0)

    reports_dir.mkdir(parents=True, exist_ok=True)

    render_concept_scores(scored, blocked, reports_dir / "concept_scores.md")
    render_top_ideas(scored, reports_dir / "top_ideas.md", top_n=top_n)

    plans = [build_plan(c) for c in scored[:top_prototypes]]
    render_prototype_plan(plans, reports_dir / "prototype_plan.md")

    angles = [build_sales_angle(c) for c in scored[:top_n]]
    render_sales_angles(angles, reports_dir / "sales_angles.md")

    if args.simulate:
        sim_results = simulate_roi_batch(scored[:top_n])
        render_roi_simulation(sim_results, reports_dir / "roi_simulation.md")
        print(f"ROI-simulering skrevet til {reports_dir / 'roi_simulation.md'}")

    if args.segment == "all":
        try:
            import yaml
            seg_path = data_dir / "customer_segments.yaml"
            with open(seg_path, encoding="utf-8") as f:
                seg_data = yaml.safe_load(f)
            segments = {s["id"]: s for s in seg_data.get("segments", [])}
            render_segment_analysis(scored[:top_n], segments, reports_dir / "segment_analysis.md")
            print(f"Segmentanalyse skrevet til {reports_dir / 'segment_analysis.md'}")
        except Exception as e:
            print(f"ADVARSEL: Kunne ikke generere segmentanalyse — {e}")

    print(
        f"Lastet {len(concepts)} konsepter: {len(safe)} godkjent, {len(blocked)} blokkert."
    )
    print(f"Toppidé: {scored[0]['name']} (score {scored[0]['value_score']})")
    print(f"Rapporter skrevet til {reports_dir}/")


if __name__ == "__main__":
    main()
