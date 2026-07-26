#!/usr/bin/env python3
"""Riblet-kalkulator — referanseimplementasjon.

Regner optimal haihud-rillegeometri (riblets) for et droneskrog eller en vinge
ut fra flyfart, posisjon på overflaten og luftforhold.

Fysikken:
  ISA-atmosfære      p  = 101325·(1 - 2.25577e-5·h)^5.2559
  Sutherland         μ  = 1.458e-6·T^1.5/(T + 110.4)
  Tetthet            ρ  = p/(R·T),  R = 287.05 J/(kg·K)
  Kinematisk visk.   ν  = μ/ρ
  Reynolds           Re_x = U·x/ν
  Lokal friksjon     C_f = 0.0592·Re_x^(-1/5)      (Prandtl, turbulent flat plate,
                                                    gyldig 5e5 < Re_x < 1e7)
  Veggskjær          τ_w = 0.5·ρ·U²·C_f
  Friksjonshastighet u_τ = sqrt(τ_w/ρ)
  Viskøs lengde      δ_ν = ν/u_τ
  Rilleavstand       s   = s⁺·δ_ν
  Rillehøyde         h   = 0.5·s          (Bechert et al.: h/s ≈ 0.5 for trekantriller)

Motstandsreduksjonen er en EMPIRISK TILNÆRMING kalibrert mot den publiserte formen på
kurven (topp ~8 % ved s⁺ ≈ 15–17, null effekt ved s⁺ ≈ 32, motstandsØKNING over det).
Bruk den til å velge geometri — ikke til å love en kunde et tall. Mål selv.

Kjør tester: python3 riblet.py --test
"""

from __future__ import annotations

import argparse
import math
from dataclasses import dataclass

R_LUFT = 287.05  # J/(kg·K)
S_PLUSS_OPTIMAL = 16.0  # topp på DR-kurven
DR_MAKS = 8.0  # % maksimal motstandsreduksjon, trekantriller
S_PLUSS_NULL = 32.0  # der effekten krysser null


@dataclass
class Luft:
    tetthet: float  # kg/m³
    dyn_visk: float  # Pa·s
    kin_visk: float  # m²/s
    temp_k: float
    trykk: float  # Pa


@dataclass
class Resultat:
    luft: Luft
    reynolds: float
    cf: float
    tau_w: float  # Pa
    u_tau: float  # m/s
    visk_lengde: float  # m
    s: float  # m — rilleavstand
    h: float  # m — rillehøyde
    s_pluss: float
    dr_prosent: float
    regime: str


def luftegenskaper(temp_c: float = 15.0, hoyde_m: float = 0.0) -> Luft:
    """ISA-atmosfære + Sutherland. Gyldig i troposfæren (< 11 km)."""
    t = temp_c + 273.15
    if t <= 0:
        raise ValueError("Temperatur under absolutt nullpunkt.")
    trykk = 101325.0 * (1.0 - 2.25577e-5 * hoyde_m) ** 5.2559
    mu = 1.458e-6 * t**1.5 / (t + 110.4)
    rho = trykk / (R_LUFT * t)
    return Luft(tetthet=rho, dyn_visk=mu, kin_visk=mu / rho, temp_k=t, trykk=trykk)


def motstandsreduksjon(s_pluss: float) -> float:
    """Empirisk DR-kurve i prosent. Positiv = mindre motstand.

    Parabel med topp DR_MAKS ved S_PLUSS_OPTIMAL og nullgjennomgang ved 0 og
    S_PLUSS_NULL. Over S_PLUSS_NULL blir rillene ruhet og øker motstanden;
    kurven flates ut på -4 % fordi parabelen ellers gir urealistisk store tall.
    """
    if s_pluss <= 0:
        return 0.0
    normalisert = (s_pluss - S_PLUSS_OPTIMAL) / S_PLUSS_OPTIMAL
    dr = DR_MAKS * (1.0 - normalisert**2)
    return max(dr, -4.0)


def regime(reynolds: float) -> str:
    if reynolds < 5e5:
        return "LAMINÆR — riller gir ingen gevinst her, og kan koste. Flytt startpunktet bakover."
    if reynolds > 1e7:
        return "OVER GYLDIGHETSOMRÅDET — Prandtl-korrelasjonen underestimerer C_f. Behandle som nedre grense."
    return "TURBULENT — riblets virker i dette området."


def beregn(
    fart_ms: float,
    posisjon_m: float,
    temp_c: float = 15.0,
    hoyde_m: float = 0.0,
    s_pluss: float = S_PLUSS_OPTIMAL,
) -> Resultat:
    if fart_ms <= 0 or posisjon_m <= 0:
        raise ValueError("Fart og posisjon må være større enn null.")

    luft = luftegenskaper(temp_c, hoyde_m)
    re = fart_ms * posisjon_m / luft.kin_visk
    cf = 0.0592 * re**-0.2
    tau_w = 0.5 * luft.tetthet * fart_ms**2 * cf
    u_tau = math.sqrt(tau_w / luft.tetthet)
    visk_lengde = luft.kin_visk / u_tau
    s = s_pluss * visk_lengde

    return Resultat(
        luft=luft,
        reynolds=re,
        cf=cf,
        tau_w=tau_w,
        u_tau=u_tau,
        visk_lengde=visk_lengde,
        s=s,
        h=0.5 * s,
        s_pluss=s_pluss,
        dr_prosent=motstandsreduksjon(s_pluss),
        regime=regime(re),
    )


def produksjonsdom(s_m: float) -> str:
    """Hva kan faktisk lage denne geometrien?"""
    s_um = s_m * 1e6
    if s_um >= 800:
        return "FDM (0.4 mm dyse) klarer det med fin laghøyde. Enkleste vei."
    if s_um >= 300:
        return "FDM med 0.2 mm dyse er på grensen. SLA/DLP er trygt. CNC-fresing med v-bit fungerer."
    if s_um >= 80:
        return "SLA/DLP eller mikrofresing. FDM er utelukket. Alternativ: kjøpt riblet-film."
    return "Under 80 µm: krever mikroreplikasjon/preging eller kommersiell riblet-film. Ikke garasjeproduksjon."


def rapport(r: Resultat, fart_ms: float, posisjon_m: float) -> str:
    return "\n".join(
        [
            f"Fart {fart_ms:g} m/s ved {posisjon_m*1000:g} mm fra forkant",
            f"  Luft      : ρ={r.luft.tetthet:.4f} kg/m³, ν={r.luft.kin_visk:.3e} m²/s",
            f"  Re_x      : {r.reynolds:.3e}",
            f"  {r.regime}",
            f"  C_f       : {r.cf:.5f}",
            f"  τ_w       : {r.tau_w:.4f} Pa",
            f"  u_τ       : {r.u_tau:.4f} m/s",
            f"  δ_ν       : {r.visk_lengde*1e6:.2f} µm",
            "",
            f"  RILLEAVSTAND s : {r.s*1e6:.1f} µm  ({r.s*1000:.3f} mm)",
            f"  RILLEHØYDE   h : {r.h*1e6:.1f} µm  ({r.h*1000:.3f} mm)",
            f"  s⁺             : {r.s_pluss:g}",
            f"  Estimert DR    : {r.dr_prosent:+.1f} %  (empirisk — mål selv)",
            "",
            f"  Produksjon: {produksjonsdom(r.s)}",
        ]
    )


# ----------------------------------------------------------------------- tester

def _test() -> int:
    import unittest

    class T(unittest.TestCase):
        def test_isa_havniva(self):
            luft = luftegenskaper(15.0, 0.0)
            self.assertAlmostEqual(luft.tetthet, 1.225, delta=0.005)
            self.assertAlmostEqual(luft.kin_visk, 1.47e-5, delta=0.03e-5)
            self.assertAlmostEqual(luft.trykk, 101325, delta=1)

        def test_tetthet_faller_med_hoyde(self):
            self.assertLess(luftegenskaper(15, 2000).tetthet, luftegenskaper(15, 0).tetthet)

        def test_dr_topp_ved_optimal(self):
            self.assertAlmostEqual(motstandsreduksjon(S_PLUSS_OPTIMAL), DR_MAKS, places=6)
            self.assertLess(motstandsreduksjon(10), DR_MAKS)
            self.assertLess(motstandsreduksjon(25), DR_MAKS)

        def test_dr_null_ved_nullpunkt(self):
            self.assertAlmostEqual(motstandsreduksjon(S_PLUSS_NULL), 0.0, places=6)

        def test_dr_negativ_over_nullpunkt(self):
            self.assertLess(motstandsreduksjon(45), 0.0)
            self.assertGreaterEqual(motstandsreduksjon(200), -4.0)

        def test_kjent_arbeidspunkt(self):
            # 20 m/s, 0.5 m bak forkant, 15 °C, havnivå — håndregnet over.
            r = beregn(20.0, 0.5)
            self.assertAlmostEqual(r.reynolds, 6.8e5, delta=0.3e5)
            self.assertAlmostEqual(r.cf, 0.00403, delta=0.0002)
            self.assertAlmostEqual(r.tau_w, 0.99, delta=0.05)
            self.assertAlmostEqual(r.u_tau, 0.90, delta=0.03)
            self.assertAlmostEqual(r.s * 1e6, 262, delta=15)  # µm
            self.assertAlmostEqual(r.h / r.s, 0.5, places=6)

        def test_hoyere_fart_gir_finere_riller(self):
            self.assertLess(beregn(40, 0.5).s, beregn(20, 0.5).s)

        def test_lenger_bak_gir_grovere_riller(self):
            self.assertGreater(beregn(20, 1.0).s, beregn(20, 0.3).s)

        def test_laminaert_regime_flagges(self):
            self.assertIn("LAMINÆR", beregn(5, 0.2).regime)

        def test_ugyldig_input(self):
            for fart, pos in ((0, 0.5), (-1, 0.5), (20, 0)):
                with self.assertRaises(ValueError):
                    beregn(fart, pos)

    resultat = unittest.TextTestRunner(verbosity=2).run(
        unittest.TestLoader().loadTestsFromTestCase(T)
    )
    return 0 if resultat.wasSuccessful() else 1


def main() -> None:
    p = argparse.ArgumentParser(description="Riblet-kalkulator (haihud-geometri)")
    p.add_argument("--fart", type=float, default=20.0, help="m/s")
    p.add_argument("--posisjon", type=float, default=0.5, help="m fra forkant")
    p.add_argument("--temp", type=float, default=15.0, help="°C")
    p.add_argument("--hoyde", type=float, default=0.0, help="m over havet")
    p.add_argument("--splus", type=float, default=S_PLUSS_OPTIMAL)
    p.add_argument("--test", action="store_true", help="kjør selvtest")
    a = p.parse_args()

    if a.test:
        raise SystemExit(_test())

    print(rapport(beregn(a.fart, a.posisjon, a.temp, a.hoyde, a.splus), a.fart, a.posisjon))


if __name__ == "__main__":
    main()
