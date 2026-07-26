"""Sanity-tester for orchestratoren. Kjør: python3 openclaw/runner/test_runner.py"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import export_yaml  # noqa: E402
import openclaw  # noqa: E402
import scoring  # noqa: E402

CONFIG = json.loads(openclaw.CONFIG_STI.read_text(encoding="utf-8"))


def tom_state(sykluser=None, energi=7) -> dict:
    return {
        "loop_id": "TEST",
        "startet": openclaw.naa(),
        "stoppet": None,
        "runtime_hours": 30,
        "target_cycles": 17,
        "energi": energi,
        "aktiv_syklus": None,
        "sykluser": sykluser or [],
        "carry_over": [],
        "patent_kandidater": [],
        "deliverables": [],
    }


class TestScoring(unittest.TestCase):
    def test_vekter_summerer_til_en(self):
        self.assertAlmostEqual(sum(a["vekt"] for a in CONFIG["scoring"]["akser"]), 1.0, places=6)

    def test_maks_score_er_ti(self):
        full = {a["id"]: 10 for a in CONFIG["scoring"]["akser"]}
        self.assertEqual(scoring.score_ide("full", full, CONFIG).total, 10.0)

    def test_dom_terskler(self):
        akser = [a["id"] for a in CONFIG["scoring"]["akser"]]
        self.assertEqual(scoring.score_ide("topp", {a: 9 for a in akser}, CONFIG).dom, "BYGG NÅ")
        self.assertEqual(scoring.score_ide("midt", {a: 6 for a in akser}, CONFIG).dom, "PARKER + NOTER")
        self.assertEqual(scoring.score_ide("bunn", {a: 1 for a in akser}, CONFIG).dom, "DREP")

    def test_ukjent_akse_feiler(self):
        with self.assertRaises(ValueError):
            scoring.score_ide("x", {"tulleakse": 5}, CONFIG)

    def test_verdi_utenfor_skala_feiler(self):
        with self.assertRaises(ValueError):
            scoring.score_ide("x", {"robusthet": 11}, CONFIG)

    def test_eksempelfil_scorer(self):
        data = json.loads((Path(__file__).parent / "ideer.eksempel.json").read_text(encoding="utf-8"))
        scores = [scoring.score_ide(d["navn"], d["verdier"], CONFIG) for d in data["ideer"]]
        self.assertEqual(len(scores), 5)
        self.assertEqual(scoring.ranger(scores)[0].navn.split(" ")[0], "Riblet-Kalkulator")


class TestAgentRotasjon(unittest.TestCase):
    def test_obligatorisk_alltid_med(self):
        self.assertIn("codex-msx", openclaw.velg_agenter(CONFIG, tom_state()))

    def test_respekterer_maks(self):
        maks = CONFIG["agent_miks_regler"]["maks_aktive_per_syklus"]
        self.assertLessEqual(len(openclaw.velg_agenter(CONFIG, tom_state())), maks)

    def test_ingen_agent_fire_paa_rad(self):
        sykluser = [{"nr": i, "agenter": ["codex-msx", "drone-sovereign"], "verdi_score": 8} for i in range(1, 4)]
        valgt = openclaw.velg_agenter(CONFIG, tom_state(sykluser))
        self.assertNotIn("drone-sovereign", valgt)

    def test_panicsafe_ved_lav_energi(self):
        self.assertIn("panicsafe", openclaw.velg_agenter(CONFIG, tom_state(energi=3)))

    def test_panicsafe_ved_to_svake_sykluser(self):
        sykluser = [{"nr": i, "agenter": ["codex-msx"], "verdi_score": 3} for i in (1, 2)]
        self.assertIn("panicsafe", openclaw.velg_agenter(CONFIG, tom_state(sykluser)))

    def test_ide_jakt_minst_hver_tredje(self):
        sykluser = [{"nr": i, "agenter": ["codex-msx", "gonzo-forge"], "verdi_score": 8} for i in (1, 2, 3)]
        self.assertIn("ide-jakt", openclaw.velg_agenter(CONFIG, tom_state(sykluser)))


class TestPrompt(unittest.TestCase):
    def test_prompt_inneholder_kjerneelementer(self):
        state = tom_state()
        p = openclaw.bygg_syklusprompt(CONFIG, state, ["codex-msx", "drone-sovereign"])
        self.assertIn("SYKLUS 1/17", p)
        self.assertIn("MAX INPUT PULL", p)
        self.assertIn("Null slurv", p)
        self.assertIn("Arctic Biomimicry Drone Sovereign", p)
        for fase in CONFIG["faser"]:
            self.assertIn(fase["navn"], p)


class TestYaml(unittest.TestCase):
    def test_rundtur(self):
        tekst = export_yaml.til_yaml(CONFIG)
        self.assertIn("REGNVIKING-30H-MAX", tekst)
        try:
            import yaml

            self.assertEqual(yaml.safe_load(tekst), CONFIG)
        except ImportError:
            self.skipTest("PyYAML ikke installert")


if __name__ == "__main__":
    unittest.main(verbosity=2)
