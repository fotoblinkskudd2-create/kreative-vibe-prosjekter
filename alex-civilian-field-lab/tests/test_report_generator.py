"""Tests for report_generator module."""
import pytest

from report_generator import (
    _score_row,
    build_sales_angle,
    render_concept_scores,
    render_prototype_plan,
    render_sales_angles,
    render_top_ideas,
)


def _scored_concept(name="Test", domain="vann", value_score=8.5,
                    sales_potential=8, prototype_speed=7, ip_potential=6,
                    customer_pain=9, civilian_safety=10, customer="kommune",
                    problem="lekkasje", solution="sensor", estimated_cost=5000):
    return {
        "name": name,
        "domain": domain,
        "value_score": value_score,
        "sales_potential": sales_potential,
        "prototype_speed": prototype_speed,
        "ip_potential": ip_potential,
        "customer_pain": customer_pain,
        "civilian_safety": civilian_safety,
        "customer": customer,
        "problem": problem,
        "solution": solution,
        "estimated_cost": estimated_cost,
    }


def _blocked_concept(name="Blocked", category="våpen", keyword="weapon"):
    return {
        **_scored_concept(name=name),
        "_blocked_category": category,
        "_blocked_keyword": keyword,
    }


class TestScoreRow:
    def test_produces_table_row(self):
        concept = _scored_concept()
        row = _score_row(concept)
        assert row.startswith("|")
        assert "Test" in row
        assert "vann" in row
        assert "8.5" in row

    def test_contains_all_score_fields(self):
        concept = _scored_concept()
        row = _score_row(concept)
        assert "8" in row   # sales_potential
        assert "7" in row   # prototype_speed
        assert "6" in row   # ip_potential
        assert "9" in row   # customer_pain
        assert "10" in row  # civilian_safety


class TestRenderConceptScores:
    def test_creates_report_file(self, tmp_path):
        path = tmp_path / "scores.md"
        render_concept_scores([_scored_concept()], [], str(path))
        assert path.exists()

    def test_report_contains_header(self, tmp_path):
        path = tmp_path / "scores.md"
        render_concept_scores([_scored_concept()], [], str(path))
        content = path.read_text()
        assert "# Concept Scores" in content

    def test_report_contains_concept_row(self, tmp_path):
        path = tmp_path / "scores.md"
        render_concept_scores([_scored_concept(name="MySensor")], [], str(path))
        content = path.read_text()
        assert "MySensor" in content

    def test_report_contains_blocked_section(self, tmp_path):
        path = tmp_path / "scores.md"
        blocked = [_blocked_concept()]
        render_concept_scores([], blocked, str(path))
        content = path.read_text()
        assert "Blokkert av risk_filter" in content
        assert "Blocked" in content

    def test_report_counts(self, tmp_path):
        path = tmp_path / "scores.md"
        scored = [_scored_concept(name="A"), _scored_concept(name="B")]
        blocked = [_blocked_concept()]
        render_concept_scores(scored, blocked, str(path))
        content = path.read_text()
        assert "3 konsepter vurdert" in content
        assert "2 godkjent" in content
        assert "1 blokkert" in content

    def test_no_blocked_section_when_empty(self, tmp_path):
        path = tmp_path / "scores.md"
        render_concept_scores([_scored_concept()], [], str(path))
        content = path.read_text()
        assert "Blokkert" not in content


class TestRenderTopIdeas:
    def test_creates_report_file(self, tmp_path):
        path = tmp_path / "top.md"
        render_top_ideas([_scored_concept()], str(path))
        assert path.exists()

    def test_limits_to_top_n(self, tmp_path):
        path = tmp_path / "top.md"
        concepts = [_scored_concept(name=f"C{i}") for i in range(10)]
        render_top_ideas(concepts, str(path), top_n=3)
        content = path.read_text()
        assert "C0" in content
        assert "C1" in content
        assert "C2" in content
        assert "C3" not in content

    def test_contains_concept_details(self, tmp_path):
        path = tmp_path / "top.md"
        concept = _scored_concept(
            name="SuperSensor",
            customer="havnevesen",
            problem="korrosjon",
            solution="sensor array",
            estimated_cost=15000,
        )
        render_top_ideas([concept], str(path))
        content = path.read_text()
        assert "SuperSensor" in content
        assert "havnevesen" in content
        assert "korrosjon" in content
        assert "15000" in content

    def test_header(self, tmp_path):
        path = tmp_path / "top.md"
        render_top_ideas([_scored_concept()], str(path))
        content = path.read_text()
        assert "# Top Ideas" in content


class TestRenderPrototypePlan:
    def test_writes_plans(self, tmp_path):
        path = tmp_path / "plan.md"
        plans = ["## Plan A\nContent A", "## Plan B\nContent B"]
        render_prototype_plan(plans, str(path))
        content = path.read_text()
        assert "Plan A" in content
        assert "Plan B" in content

    def test_separates_plans(self, tmp_path):
        path = tmp_path / "plan.md"
        plans = ["Plan1", "Plan2"]
        render_prototype_plan(plans, str(path))
        content = path.read_text()
        assert "Plan1\n\nPlan2" in content


class TestBuildSalesAngle:
    def test_returns_string(self):
        concept = _scored_concept()
        angle = build_sales_angle(concept)
        assert isinstance(angle, str)

    def test_contains_concept_name(self):
        concept = _scored_concept(name="AquaSensor")
        angle = build_sales_angle(concept)
        assert "AquaSensor" in angle

    def test_contains_customer(self):
        concept = _scored_concept(customer="havnevesen")
        angle = build_sales_angle(concept)
        assert "havnevesen" in angle

    def test_contains_estimated_cost(self):
        concept = _scored_concept(estimated_cost=12000)
        angle = build_sales_angle(concept)
        assert "12000" in angle

    def test_truncates_long_problem(self):
        long_problem = "A" * 100
        concept = _scored_concept(problem=long_problem)
        angle = build_sales_angle(concept)
        assert "..." in angle

    def test_short_problem_not_truncated(self):
        short_problem = "kort problem"
        concept = _scored_concept(problem=short_problem)
        angle = build_sales_angle(concept)
        assert "..." not in angle or short_problem in angle

    def test_contains_markdown_heading(self):
        concept = _scored_concept(name="TestProduct")
        angle = build_sales_angle(concept)
        assert angle.startswith("## TestProduct")


class TestRenderSalesAngles:
    def test_writes_angles(self, tmp_path):
        path = tmp_path / "sales.md"
        angles = ["## Angle 1\nContent", "## Angle 2\nContent"]
        render_sales_angles(angles, str(path))
        content = path.read_text()
        assert "Angle 1" in content
        assert "Angle 2" in content
