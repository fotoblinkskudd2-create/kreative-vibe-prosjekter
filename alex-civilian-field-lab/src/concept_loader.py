"""Load and validate civilian field-lab concepts from YAML.

Refactored to use shared yaml_utils for common YAML/validation patterns.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "shared" / "python"))

from yaml_utils import load_and_validate, validate_score_range

REQUIRED_FIELDS = [
    "name",
    "domain",
    "customer",
    "problem",
    "solution",
    "prototype_difficulty",
    "sales_potential",
    "ip_potential",
    "civilian_safety",
    "estimated_cost",
    "customer_pain",
]

SCORE_FIELDS = [
    "prototype_difficulty",
    "sales_potential",
    "ip_potential",
    "civilian_safety",
    "customer_pain",
]


def load_concepts(path):
    concepts = load_and_validate(path, "concepts", REQUIRED_FIELDS)

    for concept in concepts:
        for field in SCORE_FIELDS:
            validate_score_range(concept[field], f"{concept['name']}.{field}")

    return concepts
