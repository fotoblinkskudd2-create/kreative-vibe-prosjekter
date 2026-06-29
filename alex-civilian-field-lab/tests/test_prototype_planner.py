"""Tests for prototype_planner module."""
import pytest

from prototype_planner import (
    DOMAIN_COMPONENTS,
    GENERIC_COMPONENTS,
    _components_for,
    build_plan,
)


class TestComponentsFor:
    def test_known_domain_returns_specific_components(self):
        components = _components_for("havn")
        assert components == DOMAIN_COMPONENTS["havn"]

    def test_case_insensitive_matching(self):
        components = _components_for("Havn")
        assert components == DOMAIN_COMPONENTS["havn"]

    def test_partial_domain_match(self):
        components = _components_for("vann / kommunal infrastruktur")
        assert components == DOMAIN_COMPONENTS["vann"]

    def test_unknown_domain_returns_generic(self):
        components = _components_for("unknown domain")
        assert components == GENERIC_COMPONENTS

    def test_oppdrett_domain(self):
        components = _components_for("oppdrett")
        assert components == DOMAIN_COMPONENTS["oppdrett"]

    def test_drone_domain(self):
        components = _components_for("drone")
        assert components == DOMAIN_COMPONENTS["drone"]

    def test_rov_domain(self):
        components = _components_for("rov")
        assert components == DOMAIN_COMPONENTS["rov"]

    def test_is_domain(self):
        components = _components_for("is")
        assert components == DOMAIN_COMPONENTS["is"]

    def test_composite_domain_matches_first_key(self):
        # "is / kulde / havn" matches "havn" first (dict insertion order)
        components = _components_for("is / kulde / havn")
        assert components == DOMAIN_COMPONENTS["havn"]

    def test_patent_domain(self):
        components = _components_for("patent")
        assert components == DOMAIN_COMPONENTS["patent"]


class TestBuildPlan:
    def test_returns_string(self, valid_concept):
        plan = build_plan(valid_concept)
        assert isinstance(plan, str)

    def test_contains_concept_name(self, valid_concept):
        plan = build_plan(valid_concept)
        assert valid_concept["name"] in plan

    def test_contains_customer(self, valid_concept):
        plan = build_plan(valid_concept)
        assert valid_concept["customer"] in plan

    def test_contains_problem(self, valid_concept):
        plan = build_plan(valid_concept)
        assert valid_concept["problem"] in plan

    def test_contains_estimated_cost(self, valid_concept):
        plan = build_plan(valid_concept)
        assert str(valid_concept["estimated_cost"]) in plan

    def test_contains_14_day_plan_structure(self, valid_concept):
        plan = build_plan(valid_concept)
        assert "Dag 1-2" in plan
        assert "Dag 3-4" in plan
        assert "Dag 5-7" in plan
        assert "Dag 8-10" in plan
        assert "Dag 11-12" in plan
        assert "Dag 13" in plan
        assert "Dag 14" in plan

    def test_contains_domain_specific_components(self):
        concept = {
            "name": "DroneScanner",
            "domain": "drone",
            "customer": "inspeksjonsfirma",
            "problem": "manuell inspeksjon",
            "solution": "automatisk drone",
            "estimated_cost": 20000,
        }
        plan = build_plan(concept)
        for component in DOMAIN_COMPONENTS["drone"]:
            assert component in plan

    def test_uses_generic_components_for_unknown_domain(self):
        concept = {
            "name": "GenericTool",
            "domain": "something new",
            "customer": "anyone",
            "problem": "any problem",
            "solution": "any solution",
            "estimated_cost": 1000,
        }
        plan = build_plan(concept)
        for component in GENERIC_COMPONENTS:
            assert component in plan

    def test_markdown_heading(self, valid_concept):
        plan = build_plan(valid_concept)
        assert plan.startswith("## TestSensor")
