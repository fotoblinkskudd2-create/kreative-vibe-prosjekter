"""Shared fixtures for alex-civilian-field-lab tests."""
import os
import sys

import pytest

# Make src/ importable without installing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))


@pytest.fixture()
def valid_concept():
    return {
        "name": "TestSensor",
        "domain": "vann",
        "customer": "kommune",
        "problem": "Lekkasje i rør",
        "solution": "Sensor som varsler",
        "prototype_difficulty": 4,
        "sales_potential": 8,
        "ip_potential": 6,
        "civilian_safety": 10,
        "estimated_cost": 5000,
        "customer_pain": 9,
    }


@pytest.fixture()
def default_weights():
    return {
        "sales_potential": 0.30,
        "prototype_speed": 0.20,
        "ip_potential": 0.20,
        "customer_pain": 0.20,
        "civilian_safety": 0.10,
    }


@pytest.fixture()
def sample_risk_rules():
    return [
        {
            "category": "våpen",
            "keywords": ["våpen", "weapon", "ammunisjon"],
        },
        {
            "category": "jamming",
            "keywords": ["jamming", "jammer"],
        },
        {
            "category": "personsporing",
            "keywords": ["personsporing", "stalking"],
        },
    ]
