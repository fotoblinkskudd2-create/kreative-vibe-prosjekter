"""Blokker konsepter som berører våpen, skjult overvåkning, sporing,
jamming, militær taktikk, skadefunksjoner eller autonom angrepskraft.
"""
import re

import yaml


def load_risk_rules(path):
    with open(path, encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if not data or "blocked_categories" not in data:
        raise ValueError(
            f"Mangler 'blocked_categories'-nøkkel i {path}. "
            "Sjekk at risk_rules.yaml er korrekt formatert."
        )
    rules = data["blocked_categories"]
    for rule in rules:
        if "category" not in rule or "keywords" not in rule:
            raise ValueError(
                f"Ugyldig riskoregel i {path}: mangler 'category' eller 'keywords' — {rule}"
            )
    return rules


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
    """Del opp konsepter i (godkjent, blokkert).

    Blokkerte oppføringer inneholder matched kategori og nøkkelord
    slik at rapporten kan forklare avvisningen.
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
