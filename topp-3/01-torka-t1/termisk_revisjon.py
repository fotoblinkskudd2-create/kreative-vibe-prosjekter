"""Termisk revisjon av TØRKA T1, rev. A -> rev. B.

Regner om energibudsjettet for én tørkesyklus og viser hvor rev. A-tallet
(0,9 kWh / 724 W) ikke går opp. Kjør:

    python3 termisk-revisjon.py

Ingen avhengigheter utover standardbiblioteket.
"""

import math

# --- Forutsetninger, alle fra designpitchen rev. A ---
VANN_KG = 0.80        # fritt vann i typisk last (4 kg plagg)
SYKLUS_S = 90 * 60    # oppgitt syklustid
T_POD = 35.0          # °C i podden under varmefasen
RF_POD = 0.35         # settpunkt relativ fuktighet i podden
T_ROM = 20.0          # °C romluft
RF_ROM = 0.40         # relativ fuktighet romluft
T_AVTREKK = 30.0      # °C returluft etter plagg (fordampningskjølt)
VIFTE_W = 24.0        # EC-radialvifte
VIFTE_M3H = 95.0      # ved 60 Pa systemtrykk
PTC_W = 700.0         # selvbegrensende varmeelement

# Kappe: 0,63 m³ pod, ca. 5 m² duk med aluminisert innerforing.
KAPPE_A = 5.0         # m²
KAPPE_U = 2.5         # W/m²K — duk + stillestående luft + foring
H_FG = 2418.0         # kJ/kg, fordampningsvarme ved 35 °C

GJENVINNING = 0.50    # temperaturvirkningsgrad, motstrøms platevarmeveksler (rev. B)


def p_metning(t_c: float) -> float:
    """Metningstrykk for vanndamp i kPa (Buck-ligningen)."""
    return 0.61121 * math.exp((18.678 - t_c / 234.5) * (t_c / (257.14 + t_c)))


def fuktinnhold(t_c: float, rf: float, p_tot: float = 101.325) -> float:
    """Absolutt fuktinnhold i kg vann per kg tørr luft."""
    p_v = rf * p_metning(t_c)
    return 0.622 * p_v / (p_tot - p_v)


def duggpunkt(w: float, p_tot: float = 101.325) -> float:
    """Duggpunkt i °C for et gitt fuktinnhold."""
    lo, hi = -20.0, 60.0
    for _ in range(80):
        m = (lo + hi) / 2
        if fuktinnhold(m, 1.0, p_tot) < w:
            lo = m
        else:
            hi = m
    return lo


def budsjett(gjenvinning: float = 0.0) -> dict:
    """Energibudsjett for én syklus. gjenvinning = virkningsgrad på avtrekksvarmen."""
    w_pod = fuktinnhold(T_POD, RF_POD)
    w_rom = fuktinnhold(T_ROM, RF_ROM)
    d_w = w_pod - w_rom

    # Massestrøm tørr luft som må ut for å bære vannet innen syklustiden.
    m_luft_s = VANN_KG / SYKLUS_S / d_w
    m_luft_tot = m_luft_s * SYKLUS_S

    latent = VANN_KG * H_FG / 3600                              # kJ -> kWh
    d_t = (T_AVTREKK - T_ROM) * (1 - gjenvinning)
    sensibel = m_luft_tot * 1.006 * d_t / 3600                  # kJ -> kWh
    kappe = KAPPE_A * KAPPE_U * (T_POD - T_ROM) * SYKLUS_S / 3.6e6   # J -> kWh
    vifte = VIFTE_W * SYKLUS_S / 3.6e6                          # J -> kWh

    sum_kwh = latent + sensibel + kappe + vifte
    return {
        "d_w": d_w,
        "m_luft_s": m_luft_s,
        "avtrekk_m3h": m_luft_s / 1.16 * 3600,
        "spjeld_pct": (m_luft_s / 1.16 * 3600) / VIFTE_M3H * 100,
        "latent": latent,
        "sensibel": sensibel,
        "kappe": kappe,
        "vifte": vifte,
        "sum": sum_kwh,
        "snitt_w": sum_kwh * 1000 / (SYKLUS_S / 3600),
    }


def main() -> None:
    tak = PTC_W + VIFTE_W
    a = budsjett(0.0)
    b = budsjett(GJENVINNING)

    print("TØRKA T1 — termisk revisjon\n" + "=" * 62)
    print(f"Fuktinnhold pod  {T_POD:.0f} °C / {RF_POD:.0%} RF : "
          f"{fuktinnhold(T_POD, RF_POD)*1000:5.2f} g/kg")
    print(f"Fuktinnhold rom  {T_ROM:.0f} °C / {RF_ROM:.0%} RF : "
          f"{fuktinnhold(T_ROM, RF_ROM)*1000:5.2f} g/kg")
    print(f"Differanse                        : {a['d_w']*1000:5.2f} g/kg")
    print(f"Duggpunkt i avtrekket             : "
          f"{duggpunkt(fuktinnhold(T_POD, RF_POD)):5.1f} °C\n")

    print(f"Nødvendig avtrekk : {a['avtrekk_m3h']:.0f} m³/h "
          f"= {a['spjeld_pct']:.0f} % av viftekapasiteten")
    print("  -> massebalansen i rev. A holder: spjeldet har margin.\n")

    print(f"{'Post':<34}{'rev. A':>11}{'rev. B':>11}")
    print("-" * 62)
    for nøkkel, navn in [("latent", "Latent varme (fordamping)"),
                         ("sensibel", "Sensibel, erstatningsluft"),
                         ("kappe", "Kappetap gjennom duk"),
                         ("vifte", "Vifte")]:
        print(f"{navn:<34}{a[nøkkel]:>9.3f} kWh{b[nøkkel]:>9.3f} kWh")
    print("-" * 62)
    print(f"{'SUM':<34}{a['sum']:>9.3f} kWh{b['sum']:>9.3f} kWh")
    print(f"{'Snitteffekt over 90 min':<34}{a['snitt_w']:>11.0f} W{b['snitt_w']:>11.0f} W")
    print(f"{'Tilgjengelig effekt (PTC + vifte)':<34}{tak:>11.0f} W{tak:>11.0f} W")
    print(f"{'Margin':<34}{tak - a['snitt_w']:>11.0f} W{tak - b['snitt_w']:>11.0f} W\n")

    print(f"Rev. A oppgir 0,900 kWh. Beregnet: {a['sum']:.3f} kWh "
          f"({(a['sum']/0.9 - 1)*100:+.0f} %).")
    print(f"Avviket tilsvarer omtrent kappetapet ({a['kappe']:.3f} kWh), "
          "som ikke er med i rev. A.")
    print(f"Rev. B med {GJENVINNING:.0%} gjenvinning: {b['sum']:.3f} kWh, "
          f"{tak - b['snitt_w']:.0f} W margin mot taket.")


if __name__ == "__main__":
    main()
