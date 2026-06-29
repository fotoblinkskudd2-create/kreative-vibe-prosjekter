"""Beregn vektet verdi-score og ROI-estimat for hvert sivilt konsept."""
import yaml

REQUIRED_WEIGHT_KEYS = [
    "sales_potential",
    "prototype_speed",
    "ip_potential",
    "customer_pain",
    "civilian_safety",
]


def load_weights(path):
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not data or "weights" not in data:
        raise ValueError(f"Mangler 'weights'-nøkkel i {path}")
    weights = data["weights"]
    missing = [k for k in REQUIRED_WEIGHT_KEYS if k not in weights]
    if missing:
        raise ValueError(f"Manglende vekter i {path}: {missing}")
    return weights


def score_concept(concept, weights):
    prototype_speed = 11 - concept["prototype_difficulty"]
    score = (
        concept["sales_potential"] * weights["sales_potential"]
        + prototype_speed * weights["prototype_speed"]
        + concept["ip_potential"] * weights["ip_potential"]
        + concept["customer_pain"] * weights["customer_pain"]
        + concept["civilian_safety"] * weights["civilian_safety"]
    )
    return round(score, 2), prototype_speed


def estimate_annual_revenue(concept):
    """Grovkalkyle av potensiell førsteyears-omsetning basert på scoring.

    Bruker sales_potential og customer_pain som markedsindikatorer,
    og prototype_difficulty (invertert) som time-to-market-faktor.
    """
    market_size_nok = concept["estimated_cost"] * _market_multiplier(concept)
    revenue_capture = concept["sales_potential"] / 10.0 * 0.15
    return round(market_size_nok * revenue_capture)


def _market_multiplier(concept):
    pain = concept["customer_pain"]
    if pain >= 9:
        return 800
    elif pain >= 7:
        return 400
    elif pain >= 5:
        return 150
    return 60


def payback_months(concept):
    """Estimert tilbakebetalingstid i måneder basert på prototypekostnad og projisert månedsinntekt."""
    annual = estimate_annual_revenue(concept)
    if annual <= 0:
        return 999
    monthly = annual / 12
    return round(concept["estimated_cost"] / monthly, 1)


def score_concepts(concepts, weights):
    scored = []
    for concept in concepts:
        score, prototype_speed = score_concept(concept, weights)
        annual_rev = estimate_annual_revenue(concept)
        pb_months = payback_months(concept)
        scored.append({
            **concept,
            "value_score": score,
            "prototype_speed": prototype_speed,
            "est_annual_revenue_nok": annual_rev,
            "payback_months": pb_months,
        })
    scored.sort(key=lambda c: c["value_score"], reverse=True)
    return scored
