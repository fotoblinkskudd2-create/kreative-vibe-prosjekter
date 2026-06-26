"""Block concepts that touch weapons, covert surveillance, tracking,
jamming, military tactics, harm functions or autonomous attack capability.
"""
import re

import yaml


def load_risk_rules(path):
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    return data["blocked_categories"]


def _concept_text(concept):
    return " ".join(
        [
            concept.get("name", ""),
            concept.get("domain", ""),
            concept.get("problem", ""),
            concept.get("solution", ""),
        ]
    ).lower()


def _find_hit(text, risk_rules):
    for category in risk_rules:
        for keyword in category["keywords"]:
            pattern = r"\b" + re.escape(keyword.lower()) + r"\b"
            if re.search(pattern, text):
                return category["category"], keyword
    return None


def screen_concepts(concepts, risk_rules):
    """Split concepts into (safe, blocked). Blocked entries carry the
    matched category and keyword so the report can explain the rejection.
    """
    safe, blocked = [], []
    for concept in concepts:
        hit = _find_hit(_concept_text(concept), risk_rules)
        if hit:
            category, keyword = hit
            blocked.append({**concept, "_blocked_category": category, "_blocked_keyword": keyword})
        else:
            safe.append(concept)
    return safe, blocked
