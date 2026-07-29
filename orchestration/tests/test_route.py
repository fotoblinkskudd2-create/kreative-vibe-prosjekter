"""Routing tests. Pin behaviour to signals and policy, not to prose wording."""

from __future__ import annotations

import io
import json
import sys
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import route  # noqa: E402


class RouteTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.policy = route.load_policy()

    def decide(self, task: str, **kwargs):
        return route.route(task, self.policy, **kwargs)


class TestPolicyIntegrity(RouteTestCase):
    def test_every_signal_is_well_formed(self):
        for signal in self.policy["signal"]:
            self.assertIn("name", signal)
            self.assertTrue(signal["keywords"], f"{signal['name']} has no keywords")
            for engine in route.ENGINES:
                self.assertIsInstance(signal.get(engine, 0), int)
            self.assertIsInstance(signal.get("cost", 0), int)

    def test_keywords_are_lowercase(self):
        # match_signals lowercases the task only; an uppercase keyword can never hit.
        for signal in self.policy["signal"]:
            for keyword in signal["keywords"]:
                self.assertEqual(keyword, keyword.lower(), keyword)

    def test_cost_class_models_exist(self):
        for klass in self.policy["cost_class"].values():
            self.assertIn(klass["model"], self.policy["models"])

    def test_escalation_ladder_is_cheapest_first(self):
        ladder = self.policy["escalation"]["ladder"]
        prices = [self.policy["models"][m]["input_per_mtok"] for m in ladder]
        self.assertEqual(prices, sorted(prices), "ladder must ascend in price")

    def test_missing_section_is_rejected(self):
        broken = Path(__file__).with_name("_broken_policy.toml")
        broken.write_text('[meta]\nschema = 1\n', encoding="utf-8")
        try:
            with self.assertRaises(route.PolicyError):
                route.load_policy(broken)
        finally:
            broken.unlink()


class TestEngineSelection(RouteTestCase):
    def test_architecture_work_goes_to_claude(self):
        d = self.decide("redesign the arkitektur for the vibe-kort renderer")
        self.assertEqual(d["engine"], "claude")

    def test_keep_going_until_green_goes_to_codex(self):
        d = self.decide("run the test-driven loop until green and open a pull request")
        self.assertEqual(d["engine"], "codex")

    def test_realtime_surface_goes_to_foci(self):
        d = self.decide("always-on telegram agent with low-memory footprint")
        self.assertEqual(d["engine"], "foci")

    def test_runtime_flag_alone_selects_foci(self):
        d = self.decide("answer questions about the catalogue", runtime=True)
        self.assertEqual(d["engine"], "foci")

    def test_no_signal_defaults_to_plan_first(self):
        d = self.decide("zzzz")
        self.assertEqual(d["engine"], "claude")
        self.assertEqual(d["signals"], [])

    def test_codex_route_still_names_a_claude_reviewer(self):
        d = self.decide("iterate on ci until green", risk="high")
        self.assertEqual(d["engine"], "codex")
        self.assertEqual(d["plan_review_model"], "claude-opus-5")


class TestCostDiscipline(RouteTestCase):
    def test_cheap_bulk_work_stays_on_haiku(self):
        d = self.decide("klassifiser og oppsummer 400 prosjektideer")
        self.assertEqual(d["cost_class"], "low")
        self.assertEqual(d["model"], "claude-haiku-4-5")
        self.assertEqual(d["effort"], "low")

    def test_high_risk_multifile_refactor_reaches_opus(self):
        d = self.decide(
            "refactor the renderer across flere filer", files=25, risk="high",
            horizon="long",
        )
        self.assertEqual(d["cost_class"], "high")
        self.assertEqual(d["effort"], "xhigh")

    def test_cost_weight_is_monotonic_in_risk(self):
        low = self.decide("review the module", risk="low")["cost_weight"]
        med = self.decide("review the module", risk="medium")["cost_weight"]
        high = self.decide("review the module", risk="high")["cost_weight"]
        self.assertLess(low, med)
        self.assertLess(med, high)

    def test_file_count_thresholds_escalate_cost(self):
        few = self.decide("tweak a thing", files=1)["cost_weight"]
        many = self.decide("tweak a thing", files=5)["cost_weight"]
        sprawl = self.decide("tweak a thing", files=20)["cost_weight"]
        self.assertLess(few, many)
        self.assertLess(many, sprawl)

    def test_fable_is_never_auto_selected(self):
        tasks = [
            "redesign the entire arkitektur, migrering, refactor, audit, security",
            "autonomous long-running ci loop until green with large pr",
        ]
        for task in tasks:
            for risk in ("low", "medium", "high"):
                d = self.decide(task, files=50, risk=risk, horizon="long")
                self.assertNotEqual(d["model"], "claude-fable-5", task)

    def test_fable_requires_explicit_request(self):
        d = self.decide("hardest possible reasoning task", model="claude-fable-5")
        self.assertEqual(d["model"], "claude-fable-5")
        self.assertTrue(self.policy["models"]["claude-fable-5"]["requires_explicit_request"])

    def test_unknown_forced_model_is_rejected(self):
        with self.assertRaises(route.PolicyError):
            self.decide("anything", model="gpt-9-ultra")

    def test_escalation_path_excludes_current_model(self):
        d = self.decide("klassifiser noe smått")
        self.assertNotIn(d["model"], d["escalate_to"])
        self.assertEqual(d["escalate_to"], ["claude-sonnet-5", "claude-opus-5"])

    def test_offladder_engine_never_escalates_downward(self):
        # A high-risk Codex loop must not be offered Haiku as an escalation.
        d = self.decide(
            "iterate on ci until green and open a large pr",
            risk="high", horizon="long", files=8,
        )
        self.assertEqual(d["model"], "codex-cli")
        self.assertEqual(d["escalate_to"], ["claude-opus-5"])

    def test_offladder_low_cost_escalates_from_its_own_tier(self):
        d = self.decide("run a quick git commit", model="codex-cli")
        self.assertEqual(d["escalate_to"][0], "claude-haiku-4-5")

    def test_top_of_ladder_has_nowhere_to_escalate(self):
        d = self.decide("audit the arkitektur", files=30, risk="high", horizon="long")
        self.assertEqual(d["model"], "claude-opus-5")
        self.assertEqual(d["escalate_to"], [])


class TestDeterminism(RouteTestCase):
    def test_same_input_same_decision(self):
        args = dict(files=7, horizon="medium", risk="medium", interactive=True)
        first = self.decide("refactor and review the renderer", **args)
        second = self.decide("refactor and review the renderer", **args)
        self.assertEqual(first, second)

    def test_case_insensitive_matching(self):
        lower = self.decide("refactor the arkitektur")
        upper = self.decide("REFACTOR THE ARKITEKTUR")
        self.assertEqual(lower["engine_scores"], upper["engine_scores"])

    def test_render_mentions_engine_and_model(self):
        d = self.decide("refactor the arkitektur")
        text = route.render(d)
        self.assertIn(d["engine"], text)
        self.assertIn(d["model"], text)


class TestCli(RouteTestCase):
    def run_cli(self, argv: list[str]) -> tuple[int, str]:
        out, err = io.StringIO(), io.StringIO()
        with redirect_stdout(out), redirect_stderr(err):
            code = route.main(argv)
        return code, out.getvalue()

    def test_json_output_is_valid_and_exits_clean(self):
        code, out = self.run_cli(["klassifiser ideer", "--json"])
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(out)["model"], "claude-haiku-4-5")

    def test_bad_policy_path_exits_two(self):
        code, _ = self.run_cli(["task", "--policy", "/nope/policy.toml"])
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
