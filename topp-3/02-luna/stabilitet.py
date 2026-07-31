"""Luna — massebudsjett, tyngdepunkt, veltevinkel og termisk sjekk.

Designspecen (luna/00-designspec.md, §5) oppgir tyngdepunkt 175 mm og
veltevinkel 38° uten å vise regnestykket. Denne modulen setter opp
massepostene eksplisitt, slik at ballasten kan dimensjoneres på tall
i stedet for på magefølelse.

    python3 stabilitet.py
"""

import math

BASERADIUS_MM = 140.0     # Ø280 base -> vippepunktet ligger 140 mm fra aksen
KRAV_VELTEVINKEL = 30.0   # grader, fra specen
TOTALHØYDE_MM = 580.0

# (navn, masse kg, tyngdepunktshøyde mm) — alt utenom ballasten
FASTE_POSTER = [
    ("Keramikkbase, dreid steintøy 8–10 mm", 1.20, 62),
    ("Skjelett, skum, vatt og trekk", 0.90, 330),
    ("COB-bånd, diffusor, aluminiumsplate", 0.25, 300),
    ("Styrekort, kabling, gjennomføring", 0.15, 80),
]

BALLAST_H_MM = 45.0       # tyngdepunkt for sand-/betongballast i basebunnen

# Termisk
LED_W = 8.0               # nominell effekt COB-bånd
LED_VIRKNINGSGRAD = 0.40  # andel til lys; resten blir varme i kroppen
KROPP_AREAL_M2 = 0.60     # ytterflate kropp + hode
KROPP_R = 0.55            # m²K/W — 20 mm PU-skum + ull/bomull-trekk
ROMTEMP = 22.0


def tyngdepunkt(ballast_kg: float) -> tuple[float, float]:
    """Returnerer (totalmasse kg, tyngdepunktshøyde mm)."""
    poster = [("Ballast", ballast_kg, BALLAST_H_MM)] + FASTE_POSTER
    m = sum(p[1] for p in poster)
    h = sum(p[1] * p[2] for p in poster) / m
    return m, h


def veltevinkel(cg_mm: float) -> float:
    """Statisk veltevinkel i grader for et stivt legeme på en sirkulær fot."""
    return math.degrees(math.atan(BASERADIUS_MM / cg_mm))


G = 9.81
DYTTEHØYDE_MM = 400.0     # der en hånd eller en kattelabb faktisk treffer


def veltearbeid(ballast_kg: float) -> float:
    """Arbeidet som skal til for å velte Luna, i joule.

    Tyngdepunktet må løftes fra ro til balansepunktet rett over fotranden.
    Dette er det som skiller «står støtt» fra «oppfyller vinkelkravet» —
    vinkelen alene sier ingenting om hvor hardt du må dytte.
    """
    m, cg = tyngdepunkt(ballast_kg)
    løft = (math.hypot(BASERADIUS_MM, cg) - cg) / 1000
    return m * G * løft


def veltekraft(ballast_kg: float, høyde_mm: float = DYTTEHØYDE_MM) -> float:
    """Horisontal kraft i newton som akkurat begynner å velte Luna."""
    m, _ = tyngdepunkt(ballast_kg)
    return m * G * (BASERADIUS_MM / høyde_mm)


def temperaturstigning() -> float:
    """Stasjonær temperaturstigning inne i trekket, K over romtemp."""
    spillvarme = LED_W * (1 - LED_VIRKNINGSGRAD)
    return spillvarme * KROPP_R / KROPP_AREAL_M2


def main() -> None:
    print("Luna — stabilitet og termikk\n" + "=" * 60)
    ballast = 3.5
    m, cg = tyngdepunkt(ballast)

    print(f"{'Post':<40}{'kg':>7}{'h mm':>8}")
    print("-" * 60)
    print(f"{'Ballast (kvartssand i basebunn)':<40}{ballast:>7.2f}{BALLAST_H_MM:>8.0f}")
    for navn, kg, h in FASTE_POSTER:
        print(f"{navn:<40}{kg:>7.2f}{h:>8.0f}")
    print("-" * 60)
    print(f"{'Totalt':<40}{m:>7.2f}{cg:>8.0f}\n")

    print(f"Tyngdepunkt      : {cg:.0f} mm  ({cg/TOTALHØYDE_MM:.0%} av totalhøyden)")
    print(f"  specen antar   : 175 mm — konservativt, regnestykket er ikke vist")
    print(f"Veltevinkel      : {veltevinkel(cg):.1f}°   (specen oppgir 38°, "
          f"kravet er ≥ {KRAV_VELTEVINKEL:.0f}°)\n")

    print("Ballast-sensitivitet:")
    print(f"  {'ballast':>9}{'total':>10}{'CG':>8}{'velte':>8}{'arbeid':>10}"
          f"{'kraft @400mm':>14}")
    for b in (0.0, 1.0, 2.0, 3.0, 3.5, 4.0):
        mm, cc = tyngdepunkt(b)
        print(f"  {b:>6.1f} kg{mm:>7.2f} kg{cc:>7.0f} mm{veltevinkel(cc):>7.1f}°"
              f"{veltearbeid(b):>8.2f} J{veltekraft(b):>12.1f} N")

    print(f"\n  Uten ballast i det hele tatt er veltevinkelen "
          f"{veltevinkel(tyngdepunkt(0.0)[1]):.1f}° — altså over kravet på "
          f"{KRAV_VELTEVINKEL:.0f}°.")
    print("  Vinkelkravet er derfor ikke det som dimensjonerer ballasten, "
          "og specen begrunner\n  den på feil størrelse. Det som faktisk skiller "
          "er hvor hardt du må dytte:")
    print(f"    uten ballast : {veltekraft(0.0):.1f} N — et lett dult fra en katt "
          "eller et barn velter den")
    print(f"    med 3,5 kg   : {veltekraft(3.5):.1f} N — "
          f"{veltekraft(3.5)/veltekraft(0.0):.1f}× mer, og "
          f"{veltearbeid(3.5)/veltearbeid(0.0):.1f}× mer arbeid")
    print("  Behold ballasten, men skriv kravet om til veltearbeid "
          "(mål: ≥ 4 J) i stedet for vinkel.\n")

    dt = temperaturstigning()
    print(f"Spillvarme fra lyset : {LED_W*(1-LED_VIRKNINGSGRAD):.1f} W")
    print(f"Temperaturstigning   : {dt:.1f} K  ->  ca. {ROMTEMP + dt:.0f} °C "
          "inne i trekket ved 22 °C i rommet")
    print("  Innenfor det både LED-båndet og et ullblandingstrekk tåler. "
          "Luftspalten på 25 mm\n  er likevel det kritiske punktet — "
          "den er der for å hindre synlige punkter og\n  brennmerker, ikke for "
          "å holde snittemperaturen nede.")


if __name__ == "__main__":
    main()
