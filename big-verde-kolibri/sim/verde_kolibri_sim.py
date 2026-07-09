#!/usr/bin/env python3
"""Verde Kolibri – Monte Carlo energi- og oppdragssimulering.

Simulerer inspeksjonsoppdrag i Vestland/Arktis-vær og sammenligner en
biomimicry-drone (kolibri-rotor, haiskinn-riblets, pangolin anti-icing,
solcellefilm) mot en standard inspeksjonsdrone.

Kjør:  python3 verde_kolibri_sim.py
Kun standardbiblioteket – ingen pip install.
"""

from __future__ import annotations

import math
import random
import statistics
from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Dronekonfigurasjoner
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class DroneConfig:
    name: str
    battery_wh: float            # batterikapasitet
    hover_power_w: float         # effektbehov i hover, vindstille
    cruise_power_w: float        # effektbehov i marsjfart
    drag_reduction: float        # 0.0 = ingen, 0.07 = 7 % mindre luftmotstand (riblets)
    wind_tolerance_ms: float     # maks vind før oppdrag avbrytes
    solar_w_peak: float          # solcellefilm, toppeffekt
    anti_icing_passive: bool     # pangolin-paneler: ising koster ikke energi
    icing_heater_w: float        # varmekabel-effekt hvis aktiv anti-icing trengs


STANDARD = DroneConfig(
    name="Standard inspeksjonsdrone",
    battery_wh=270.0,
    hover_power_w=380.0,
    cruise_power_w=320.0,
    drag_reduction=0.0,
    wind_tolerance_ms=9.0,
    solar_w_peak=0.0,
    anti_icing_passive=False,
    icing_heater_w=60.0,
)

VERDE_KOLIBRI = DroneConfig(
    name="Verde Kolibri",
    battery_wh=270.0,            # samme batteri – gevinsten skal komme fra design
    hover_power_w=340.0,         # kolibri-inspirert rotorprofil: bedre hover-effektivitet
    cruise_power_w=320.0,
    drag_reduction=0.07,         # haiskinn-riblets (konservativt: 6-8 % i litteraturen)
    wind_tolerance_ms=12.0,      # kolibri-agilitet: aktiv vingekompensasjon
    solar_w_peak=45.0,           # tynnfilm på kropp og armer
    anti_icing_passive=True,     # pangolin-paneler flekser isen av
    icing_heater_w=0.0,
)


# ---------------------------------------------------------------------------
# Vestland/Arktis-vær (Monte Carlo-trekk per oppdrag)
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class Weather:
    wind_ms: float
    temp_c: float
    rain: bool
    icing: bool
    solar_fraction: float  # 0-1, andel av solcellenes toppeffekt som er tilgjengelig


def draw_weather(rng: random.Random) -> Weather:
    # Weibull-aktig vindfordeling, typisk kyst-Vestland
    wind = min(rng.weibullvariate(6.0, 1.8), 25.0)
    temp = rng.gauss(2.0, 5.0)  # årsgjennomsnitt rundt +2, stor spredning
    rain = rng.random() < 0.55  # Bergen er Bergen
    # Ising: kaldt + fuktig
    icing = temp < 1.0 and (rain or rng.random() < 0.3)
    # Sol: mye skydekke; regn presser sola ned mot null
    base_solar = rng.betavariate(1.5, 3.5)
    solar = base_solar * (0.15 if rain else 1.0)
    return Weather(wind, temp, rain, icing, solar)


# ---------------------------------------------------------------------------
# Oppdragsmodell
# ---------------------------------------------------------------------------

MISSION_MINUTES_REQUIRED = 22.0   # typisk tipp-/linjeinspeksjon
HOVER_SHARE = 0.6                 # andel av oppdraget i hover (fotopunkter)
RESERVE_FRACTION = 0.20           # landingsreserve som aldri røres


@dataclass
class MissionResult:
    completed: bool
    flight_minutes: float
    energy_used_wh: float
    abort_reason: str  # "" hvis fullført


def fly_mission(drone: DroneConfig, wx: Weather, rng: random.Random) -> MissionResult:
    if wx.wind_ms > drone.wind_tolerance_ms:
        return MissionResult(False, 0.0, 0.0, "vind over grense")

    # Vind øker effektbehovet kvadratisk-ish; riblets demper luftmotstandsleddet
    wind_load = 1.0 + 0.012 * wx.wind_ms ** 1.7 * (1.0 - drone.drag_reduction)
    # Kaldt batteri leverer dårligere
    cold_penalty = 1.0 + max(0.0, (5.0 - wx.temp_c)) * 0.006

    hover_w = drone.hover_power_w * wind_load * cold_penalty
    cruise_w = drone.cruise_power_w * wind_load * cold_penalty

    heater_w = 0.0
    if wx.icing and not drone.anti_icing_passive:
        heater_w = drone.icing_heater_w

    solar_w = drone.solar_w_peak * wx.solar_fraction

    avg_power_w = (HOVER_SHARE * hover_w
                   + (1.0 - HOVER_SHARE) * cruise_w
                   + heater_w
                   - solar_w)
    avg_power_w = max(avg_power_w, 50.0)  # kan ikke fly gratis

    usable_wh = drone.battery_wh * (1.0 - RESERVE_FRACTION)
    endurance_min = usable_wh / avg_power_w * 60.0

    # Litt operasjonell støy: GPS-drift, omflyginger, vindkast
    required = MISSION_MINUTES_REQUIRED * rng.uniform(0.95, 1.20)

    if endurance_min >= required:
        energy = avg_power_w * required / 60.0
        return MissionResult(True, required, energy, "")
    return MissionResult(False, endurance_min, usable_wh, "batteri tomt før fullført")


# ---------------------------------------------------------------------------
# Monte Carlo
# ---------------------------------------------------------------------------


def simulate(drone: DroneConfig, n: int, seed: int) -> dict:
    rng = random.Random(seed)
    results = [fly_mission(drone, draw_weather(rng), rng) for _ in range(n)]

    completed = [r for r in results if r.completed]
    wind_aborts = sum(1 for r in results if r.abort_reason == "vind over grense")
    battery_aborts = sum(1 for r in results if r.abort_reason == "batteri tomt før fullført")
    flown = [r for r in results if r.flight_minutes > 0]

    return {
        "navn": drone.name,
        "oppdrag": n,
        "suksessrate": len(completed) / n,
        "avbrutt_vind": wind_aborts / n,
        "avbrutt_batteri": battery_aborts / n,
        "snitt_flytid_min": statistics.mean(r.flight_minutes for r in flown) if flown else 0.0,
        "snitt_energi_wh": statistics.mean(r.energy_used_wh for r in completed) if completed else 0.0,
    }


def print_report(stats_a: dict, stats_b: dict) -> None:
    print("=" * 68)
    print("VERDE KOLIBRI – MONTE CARLO-RAPPORT (Vestland/Arktis-vær)")
    print("=" * 68)
    rows = [
        ("Oppdrag simulert", "{oppdrag}", ""),
        ("Suksessrate", "{suksessrate:.1%}", ""),
        ("Avbrutt pga. vind", "{avbrutt_vind:.1%}", ""),
        ("Avbrutt pga. batteri", "{avbrutt_batteri:.1%}", ""),
        ("Snitt flytid (min)", "{snitt_flytid_min:.1f}", ""),
        ("Snitt energi/oppdrag (Wh)", "{snitt_energi_wh:.1f}", ""),
    ]
    name_w = 30
    print(f"{'':{name_w}} {stats_a['navn']:>26} {stats_b['navn']:>16}")
    for label, fmt, _ in rows:
        va = fmt.format(**stats_a)
        vb = fmt.format(**stats_b)
        print(f"{label:{name_w}} {va:>26} {vb:>16}")

    lift = stats_b["suksessrate"] - stats_a["suksessrate"]
    energy_saving = 0.0
    if stats_a["snitt_energi_wh"] > 0:
        energy_saving = 1.0 - stats_b["snitt_energi_wh"] / stats_a["snitt_energi_wh"]
    print("-" * 68)
    print(f"Verde-gevinst: +{lift:.1%} oppdragssuksess, "
          f"{energy_saving:.1%} mindre energi per fullført oppdrag.")
    print("Konservative parametre – juster i toppen av fila mot reelle spesifikasjoner.")


if __name__ == "__main__":
    N = 10_000
    SEED = 2026
    print_report(simulate(STANDARD, N, SEED), simulate(VERDE_KOLIBRI, N, SEED))
