"""Tester for SymbioForge Nexus-kjernen. Kjør med:  python -m pytest  eller
python -m unittest discover -s tests  fra core/-mappen."""

import unittest

from symbioforge import NexusOrchestrator, TWIN_REGISTRY


class TestTwins(unittest.TestCase):
    def test_all_five_twins_registered(self):
        self.assertEqual(
            set(TWIN_REGISTRY),
            {"hunger", "elder", "adhd", "boycrisis", "girlmental"},
        )

    def test_intervention_improves_outcome(self):
        """Alle tvillinger: full intervensjonspakke gir lavere 2035-tall enn baseline."""
        for twin in TWIN_REGISTRY.values():
            r = twin.simulate(chosen=list(twin.interventions), coverage=1.0)
            self.assertLess(r.intervened[-1], r.baseline[-1], twin.key)
            self.assertLess(r.outcome_delta_pct, 0, twin.key)

    def test_zero_coverage_is_noop(self):
        r = TWIN_REGISTRY["hunger"].simulate(chosen=["skolemat"], coverage=0.0)
        self.assertEqual(r.baseline, r.intervened)
        self.assertEqual(r.total_cost_bnok, 0.0)

    def test_unknown_intervention_raises(self):
        with self.assertRaises(KeyError):
            TWIN_REGISTRY["elder"].simulate(chosen=["finnes-ikke"])

    def test_effects_multiply_not_add(self):
        """To tiltak à ~effekt e gir (1-e1)(1-e2), ikke 1-(e1+e2)."""
        twin = TWIN_REGISTRY["hunger"]
        both = twin.simulate(chosen=["skolemat", "kontantstotte"], coverage=1.0)
        expected_factor = (1 - 0.06) * (1 - 0.09)
        year1_ratio = both.intervened[1] / both.baseline[1]
        self.assertAlmostEqual(year1_ratio, expected_factor, places=3)


class TestOrchestrator(unittest.TestCase):
    def test_deterministic(self):
        """Samme spørsmål → identisk brief og audit-hash."""
        q = "Analyser samspill sult + ADHD hos gutter i Norge vs. Sudan"
        r1 = NexusOrchestrator().discover(q)
        r2 = NexusOrchestrator().discover(q)
        self.assertEqual(r1.brief_markdown, r2.brief_markdown)
        self.assertEqual(r1.audit_hash, r2.audit_hash)

    def test_keyword_routing_finds_cross_twins(self):
        r = NexusOrchestrator().discover("sult og adhd hos gutter")
        self.assertIn("hunger", r.twins)
        self.assertIn("adhd", r.twins)
        self.assertIn("boycrisis", r.twins)
        # Kryssforbindelsen sult → ADHD skal dukke opp som hypotese.
        self.assertTrue(any("kryss" in h for h in r.hypotheses))

    def test_bias_guard_flags_low_coverage(self):
        r = NexusOrchestrator().discover("sult i Sudan")
        self.assertTrue(any("Sudan" in f for f in r.bias_flags))

    def test_brief_contains_costs_and_reservations(self):
        r = NexusOrchestrator().discover("ensomhet hos eldre kvinner")
        self.assertIn("mrd. NOK", r.brief_markdown)
        self.assertIn("Equity-forbehold", r.brief_markdown)

    def test_trace_covers_all_agents(self):
        r = NexusOrchestrator().discover("jenter og sosiale medier")
        senders = {m.sender for m in r.trace}
        self.assertEqual(senders, {
            "DataHunter", "HypothesisGen", "CausalInfer", "TwinSimulator",
            "BiasGuard", "CitizenValidator", "PolicyPilot",
        })


if __name__ == "__main__":
    unittest.main()
