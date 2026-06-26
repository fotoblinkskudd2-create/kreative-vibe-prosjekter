"""Load and validate civilian field-lab concepts from YAML."""
import yaml

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
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)

    concepts = data.get("concepts") if data else None
    if not concepts:
        raise ValueError(f"No concepts found in {path}")

    for concept in concepts:
        missing = [field for field in REQUIRED_FIELDS if field not in concept]
        if missing:
            raise ValueError(f"Concept '{concept.get('name', '?')}' missing fields: {missing}")
        for field in SCORE_FIELDS:
            value = concept[field]
            if not isinstance(value, (int, float)) or not (1 <= value <= 10):
                raise ValueError(
                    f"Concept '{concept['name']}' field '{field}' must be a number 1-10, got {value!r}"
                )

    return concepts
