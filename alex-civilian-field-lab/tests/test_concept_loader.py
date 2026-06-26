"""Tests for concept_loader module."""
import os
import tempfile

import pytest
import yaml

from concept_loader import REQUIRED_FIELDS, SCORE_FIELDS, load_concepts


def _write_yaml(data, path):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True)


def _make_concept(**overrides):
    base = {
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
    base.update(overrides)
    return base


class TestLoadConcepts:
    def test_loads_valid_concepts(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept()]}, path)
        result = load_concepts(path)
        assert len(result) == 1
        assert result[0]["name"] == "TestSensor"

    def test_loads_multiple_concepts(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        concepts = [
            _make_concept(name="SensorA"),
            _make_concept(name="SensorB"),
            _make_concept(name="SensorC"),
        ]
        _write_yaml({"concepts": concepts}, path)
        result = load_concepts(path)
        assert len(result) == 3
        assert [c["name"] for c in result] == ["SensorA", "SensorB", "SensorC"]

    def test_raises_on_empty_file(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        path.write_text("")
        with pytest.raises(ValueError, match="No concepts found"):
            load_concepts(path)

    def test_raises_on_no_concepts_key(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"other": "data"}, path)
        with pytest.raises(ValueError, match="No concepts found"):
            load_concepts(path)

    def test_raises_on_empty_concepts_list(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": []}, path)
        with pytest.raises(ValueError, match="No concepts found"):
            load_concepts(path)

    def test_raises_on_missing_required_field(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        concept = _make_concept()
        del concept["customer"]
        _write_yaml({"concepts": [concept]}, path)
        with pytest.raises(ValueError, match="missing fields.*customer"):
            load_concepts(path)

    def test_raises_on_multiple_missing_fields(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        concept = _make_concept()
        del concept["customer"]
        del concept["domain"]
        _write_yaml({"concepts": [concept]}, path)
        with pytest.raises(ValueError, match="missing fields"):
            load_concepts(path)

    def test_raises_on_score_field_out_of_range_zero(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept(sales_potential=0)]}, path)
        with pytest.raises(ValueError, match="must be a number 1-10"):
            load_concepts(path)

    def test_raises_on_score_field_out_of_range_eleven(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept(sales_potential=11)]}, path)
        with pytest.raises(ValueError, match="must be a number 1-10"):
            load_concepts(path)

    def test_raises_on_score_field_not_numeric(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept(sales_potential="high")]}, path)
        with pytest.raises(ValueError, match="must be a number 1-10"):
            load_concepts(path)

    def test_accepts_float_score_values(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept(sales_potential=7.5)]}, path)
        result = load_concepts(path)
        assert result[0]["sales_potential"] == 7.5

    def test_accepts_boundary_score_values(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept(sales_potential=1)]}, path)
        result = load_concepts(path)
        assert result[0]["sales_potential"] == 1

        _write_yaml({"concepts": [_make_concept(sales_potential=10)]}, path)
        result = load_concepts(path)
        assert result[0]["sales_potential"] == 10

    def test_raises_on_negative_score(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        _write_yaml({"concepts": [_make_concept(customer_pain=-1)]}, path)
        with pytest.raises(ValueError, match="must be a number 1-10"):
            load_concepts(path)

    def test_preserves_all_fields(self, tmp_path):
        path = tmp_path / "concepts.yaml"
        concept = _make_concept()
        _write_yaml({"concepts": [concept]}, path)
        result = load_concepts(path)
        for field in REQUIRED_FIELDS:
            assert field in result[0]

    def test_file_not_found(self):
        with pytest.raises(FileNotFoundError):
            load_concepts("/nonexistent/path.yaml")


class TestModuleConstants:
    def test_required_fields_includes_name(self):
        assert "name" in REQUIRED_FIELDS

    def test_score_fields_are_subset_of_required(self):
        for field in SCORE_FIELDS:
            assert field in REQUIRED_FIELDS
