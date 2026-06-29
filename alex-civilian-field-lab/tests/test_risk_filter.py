"""Tests for risk_filter module."""
import pytest
import yaml

from risk_filter import _concept_text, _find_hit, load_risk_rules, screen_concepts


def _write_yaml(data, path):
    with open(path, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True)


def _make_concept(name="Safe Sensor", domain="vann", problem="lekkasje", solution="sensor"):
    return {
        "name": name,
        "domain": domain,
        "problem": problem,
        "solution": solution,
    }


class TestLoadRiskRules:
    def test_loads_rules(self, tmp_path):
        path = tmp_path / "risk_rules.yaml"
        rules = [{"category": "våpen", "keywords": ["weapon"]}]
        _write_yaml({"blocked_categories": rules}, path)
        result = load_risk_rules(path)
        assert len(result) == 1
        assert result[0]["category"] == "våpen"

    def test_raises_on_missing_key(self, tmp_path):
        path = tmp_path / "rules.yaml"
        _write_yaml({"other": "data"}, path)
        with pytest.raises(KeyError):
            load_risk_rules(path)


class TestConceptText:
    def test_concatenates_fields(self):
        concept = _make_concept(name="A", domain="B", problem="C", solution="D")
        result = _concept_text(concept)
        assert result == "a b c d"

    def test_lowercases_output(self):
        concept = _make_concept(name="UPPER", domain="CaSe")
        result = _concept_text(concept)
        assert "upper" in result
        assert "case" in result

    def test_handles_missing_fields(self):
        concept = {"name": "Test"}
        result = _concept_text(concept)
        assert "test" in result


class TestFindHit:
    def test_finds_matching_keyword(self, sample_risk_rules):
        hit = _find_hit("this contains a weapon keyword", sample_risk_rules)
        assert hit is not None
        assert hit[0] == "våpen"
        assert hit[1] == "weapon"

    def test_returns_none_for_safe_text(self, sample_risk_rules):
        hit = _find_hit("this is a safe water sensor", sample_risk_rules)
        assert hit is None

    def test_matches_whole_words_only(self, sample_risk_rules):
        hit = _find_hit("weaponry is different", sample_risk_rules)
        assert hit is None

    def test_case_insensitive_via_lowered_text(self, sample_risk_rules):
        hit = _find_hit("this has jamming equipment", sample_risk_rules)
        assert hit is not None
        assert hit[0] == "jamming"

    def test_matches_first_category(self, sample_risk_rules):
        hit = _find_hit("weapon and jamming combined", sample_risk_rules)
        assert hit[0] == "våpen"

    def test_matches_norwegian_keywords(self, sample_risk_rules):
        hit = _find_hit("dette er et våpen", sample_risk_rules)
        assert hit is not None
        assert hit[0] == "våpen"
        assert hit[1] == "våpen"


class TestScreenConcepts:
    def test_safe_concept_passes(self, sample_risk_rules):
        concept = _make_concept()
        safe, blocked = screen_concepts([concept], sample_risk_rules)
        assert len(safe) == 1
        assert len(blocked) == 0

    def test_blocked_concept_flagged(self, sample_risk_rules):
        concept = _make_concept(solution="uses weapon technology")
        safe, blocked = screen_concepts([concept], sample_risk_rules)
        assert len(safe) == 0
        assert len(blocked) == 1
        assert blocked[0]["_blocked_category"] == "våpen"
        assert blocked[0]["_blocked_keyword"] == "weapon"

    def test_mixed_concepts(self, sample_risk_rules):
        safe_concept = _make_concept(name="SafeSensor")
        blocked_concept = _make_concept(name="DangerousTool", solution="a jammer device")
        safe, blocked = screen_concepts([safe_concept, blocked_concept], sample_risk_rules)
        assert len(safe) == 1
        assert len(blocked) == 1
        assert safe[0]["name"] == "SafeSensor"
        assert blocked[0]["name"] == "DangerousTool"

    def test_empty_list(self, sample_risk_rules):
        safe, blocked = screen_concepts([], sample_risk_rules)
        assert safe == []
        assert blocked == []

    def test_blocked_preserves_original_fields(self, sample_risk_rules):
        concept = _make_concept(name="BadTool", domain="weapon area")
        safe, blocked = screen_concepts([concept], sample_risk_rules)
        assert blocked[0]["name"] == "BadTool"
        assert blocked[0]["domain"] == "weapon area"

    def test_checks_all_text_fields(self, sample_risk_rules):
        concept_name = _make_concept(name="weapon sensor")
        concept_domain = _make_concept(domain="weapon tech")
        concept_problem = _make_concept(problem="weapon issue")
        concept_solution = _make_concept(solution="weapon fix")

        for concept in [concept_name, concept_domain, concept_problem, concept_solution]:
            safe, blocked = screen_concepts([concept], sample_risk_rules)
            assert len(blocked) == 1, f"Should block on field containing 'weapon' in {concept}"

    def test_keyword_in_name_triggers_block(self, sample_risk_rules):
        concept = _make_concept(name="personsporing device")
        safe, blocked = screen_concepts([concept], sample_risk_rules)
        assert len(blocked) == 1
        assert blocked[0]["_blocked_category"] == "personsporing"
