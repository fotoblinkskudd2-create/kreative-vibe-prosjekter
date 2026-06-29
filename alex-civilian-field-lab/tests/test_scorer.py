"""Tests for scorer module."""
import tempfile

import pytest
import yaml

from scorer import load_weights, score_concept, score_concepts


def _write_yaml(data, path):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f)


class TestLoadWeights:
    def test_loads_weights_from_yaml(self, tmp_path):
        path = tmp_path / "weights.yaml"
        weights = {
            "sales_potential": 0.30,
            "prototype_speed": 0.20,
            "ip_potential": 0.20,
            "customer_pain": 0.20,
            "civilian_safety": 0.10,
        }
        _write_yaml({"weights": weights}, path)
        result = load_weights(path)
        assert result == weights

    def test_raises_on_missing_key(self, tmp_path):
        path = tmp_path / "weights.yaml"
        _write_yaml({"other": "data"}, path)
        with pytest.raises(KeyError):
            load_weights(path)


class TestScoreConcept:
    def test_basic_score_computation(self, valid_concept, default_weights):
        score, proto_speed = score_concept(valid_concept, default_weights)
        # prototype_difficulty=4 => prototype_speed=11-4=7
        assert proto_speed == 7
        expected = (
            8 * 0.30   # sales_potential
            + 7 * 0.20   # prototype_speed
            + 6 * 0.20   # ip_potential
            + 9 * 0.20   # customer_pain
            + 10 * 0.10  # civilian_safety
        )
        assert score == round(expected, 2)

    def test_prototype_speed_inversion(self, valid_concept, default_weights):
        valid_concept["prototype_difficulty"] = 1
        _, proto_speed = score_concept(valid_concept, default_weights)
        assert proto_speed == 10

        valid_concept["prototype_difficulty"] = 10
        _, proto_speed = score_concept(valid_concept, default_weights)
        assert proto_speed == 1

    def test_all_max_scores(self, default_weights):
        concept = {
            "sales_potential": 10,
            "prototype_difficulty": 1,
            "ip_potential": 10,
            "customer_pain": 10,
            "civilian_safety": 10,
        }
        score, proto_speed = score_concept(concept, default_weights)
        assert proto_speed == 10
        expected = 10 * 0.30 + 10 * 0.20 + 10 * 0.20 + 10 * 0.20 + 10 * 0.10
        assert score == round(expected, 2)
        assert score == 10.0

    def test_all_min_scores(self, default_weights):
        concept = {
            "sales_potential": 1,
            "prototype_difficulty": 10,
            "ip_potential": 1,
            "customer_pain": 1,
            "civilian_safety": 1,
        }
        score, proto_speed = score_concept(concept, default_weights)
        assert proto_speed == 1
        assert score == 1.0

    def test_custom_weights(self, valid_concept):
        weights = {
            "sales_potential": 1.0,
            "prototype_speed": 0.0,
            "ip_potential": 0.0,
            "customer_pain": 0.0,
            "civilian_safety": 0.0,
        }
        score, _ = score_concept(valid_concept, weights)
        assert score == valid_concept["sales_potential"] * 1.0


class TestScoreConcepts:
    def test_sorts_by_score_descending(self, default_weights):
        concepts = [
            {
                "name": "Low",
                "sales_potential": 1,
                "prototype_difficulty": 10,
                "ip_potential": 1,
                "customer_pain": 1,
                "civilian_safety": 1,
            },
            {
                "name": "High",
                "sales_potential": 10,
                "prototype_difficulty": 1,
                "ip_potential": 10,
                "customer_pain": 10,
                "civilian_safety": 10,
            },
        ]
        scored = score_concepts(concepts, default_weights)
        assert scored[0]["name"] == "High"
        assert scored[1]["name"] == "Low"

    def test_adds_value_score_and_prototype_speed(self, valid_concept, default_weights):
        scored = score_concepts([valid_concept], default_weights)
        assert "value_score" in scored[0]
        assert "prototype_speed" in scored[0]

    def test_preserves_original_fields(self, valid_concept, default_weights):
        scored = score_concepts([valid_concept], default_weights)
        assert scored[0]["name"] == "TestSensor"
        assert scored[0]["domain"] == "vann"

    def test_empty_list(self, default_weights):
        scored = score_concepts([], default_weights)
        assert scored == []

    def test_multiple_same_score(self, default_weights):
        concept = {
            "name": "Same",
            "sales_potential": 5,
            "prototype_difficulty": 5,
            "ip_potential": 5,
            "customer_pain": 5,
            "civilian_safety": 5,
        }
        scored = score_concepts([concept.copy(), concept.copy()], default_weights)
        assert scored[0]["value_score"] == scored[1]["value_score"]
