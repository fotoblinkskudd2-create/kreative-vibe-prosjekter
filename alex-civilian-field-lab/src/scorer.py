"""Compute the weighted civilian field-lab value score for each concept."""
import yaml


def load_weights(path):
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data["weights"]


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


def score_concepts(concepts, weights):
    scored = []
    for concept in concepts:
        score, prototype_speed = score_concept(concept, weights)
        scored.append({**concept, "value_score": score, "prototype_speed": prototype_speed})
    scored.sort(key=lambda c: c["value_score"], reverse=True)
    return scored
