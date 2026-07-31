"""Genererer figur for TØRKA T1 rev. B: energibudsjett + varmegjenvinner.

    python3 lag_figur.py            -> figurer/torka-t1-revB-energi.svg

Ingen avhengigheter. Tallene hentes fra termisk_revisjon.py, slik at figuren
ikke kan komme i utakt med beregningen.
"""

import pathlib

from termisk_revisjon import GJENVINNING, PTC_W, VIFTE_W, budsjett

# --- Palett, samme familie som konseptrisset rev. A ---
BG = "#ffffff"
INK = "#1a1a1a"
GRÅ = "#6b6b6b"
BEIGE = "#d9d2c5"
BEIGE_LYS = "#ebe6dc"
RUST = "#b5462a"
BLÅ = "#2b7ea8"
BLÅ_LYS = "#bcd9e6"
GRØNN = "#4a7c59"

W, H = 1600, 1070

POSTER = [
    ("Latent varme — fordamping av 0,8 l vann", "latent", RUST),
    ("Sensibel varme — oppvarming av erstatningsluft", "sensibel", BLÅ),
    ("Kappetap gjennom duk", "kappe", "#8a7f6d"),
    ("Vifte", "vifte", GRØNN),
]


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def nb(x: float, desimaler: int = 2) -> str:
    """Tall med norsk desimalkomma."""
    return f"{x:.{desimaler}f}".replace(".", ",")


def txt(x, y, s, size=13, fill=INK, anchor="start", weight="normal",
        family="Helvetica, Arial, sans-serif", spacing=None):
    sp = f' letter-spacing="{spacing}"' if spacing else ""
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" '
            f'fill="{fill}" text-anchor="{anchor}" font-weight="{weight}"{sp}>'
            f'{esc(s)}</text>')


def rect(x, y, w, h, fill="none", stroke="none", sw=1, rx=0, opacity=1.0):
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" rx="{rx}" '
            f'opacity="{opacity}"/>')


def line(x1, y1, x2, y2, stroke=INK, sw=1, dash=None, cap="butt", marker=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}"{d}{marker}/>')


def path(d, fill="none", stroke=INK, sw=1, dash=None, marker=""):
    ds = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<path d="{d}" fill="{fill}" stroke="{stroke}" '
            f'stroke-width="{sw}" stroke-linejoin="round"{ds}{marker}/>')


def energipanel(a, b, x0, y0, w, h):
    """Stablet søylediagram: rev. A og rev. B mot effekttaket."""
    o = []
    tak = PTC_W + VIFTE_W
    maks = 900.0                      # W, aksens toppunkt
    base = y0 + h                     # nullinje
    skala = h / maks

    # Akse og rutenett
    for v in range(0, int(maks) + 1, 100):
        y = base - v * skala
        o.append(line(x0, y, x0 + w, y, "#e6e6e6", 1))
        o.append(txt(x0 - 10, y + 4, f"{v}", 11, GRÅ, "end"))
    o.append(txt(x0 - 10, y0 - 14, "W", 11, GRÅ, "end"))
    o.append(line(x0, base, x0 + w, base, INK, 1.4))

    kolonner = [("rev. A  —  slik den er spesifisert", a, x0 + w * 0.44),
                ("rev. B  —  med varmegjenvinner", b, x0 + w * 0.72)]
    bw = w * 0.20

    for tittel, d, cx in kolonner:
        y = base
        for navn, nøkkel, farge in POSTER:
            # kWh -> snitteffekt over syklusen
            watt = d[nøkkel] * 1000 / 1.5
            hh = watt * skala
            o.append(rect(cx, y - hh, bw, hh, farge, "#ffffff", 1.2))
            if hh > 17:
                o.append(txt(cx + bw / 2, y - hh / 2 + 5, f"{watt:.0f} W",
                             12, "#ffffff", "middle", "bold"))
            y -= hh

        # All tekst under nullinjen, slik at ingenting kan kollidere med
        # effekttaket eller tegnforklaringen.
        snitt = d["snitt_w"]
        margin = tak - snitt
        farge = RUST if margin < 0 else GRØNN
        merke = "over effekttaket" if margin < 0 else "margin til effekttaket"
        o.append(txt(cx + bw / 2, base + 24, tittel, 13, INK, "middle", "bold"))
        o.append(txt(cx + bw / 2, base + 50, f"{nb(d['sum'])} kWh", 21, INK,
                     "middle", "bold"))
        o.append(txt(cx + bw / 2, base + 68, f"{snitt:.0f} W snitteffekt",
                     11.5, GRÅ, "middle"))
        o.append(txt(cx + bw / 2, base + 88, f"{margin:+.0f} W {merke}",
                     12, farge, "middle", "bold"))

    # Effekttaket
    yt = base - tak * skala
    o.append(line(x0, yt, x0 + w, yt, RUST, 2, "8 4"))
    o.append(txt(x0 + w, yt - 8, f"Effekttak {tak:.0f} W  (PTC 700 W + vifte 24 W)",
                 12, RUST, "end", "bold"))

    # Rev. A-påstanden — leder inn mot venstre kant av første søyle, slik at
    # merkelappen havner i det tomme feltet og ikke oppå rev. B.
    ya = base - (0.9 * 1000 / 1.5) * skala
    x_søyle_a = x0 + w * 0.44
    o.append(line(x0 + w * 0.245, ya, x_søyle_a, ya, GRÅ, 1.4, "3 3"))
    o.append(txt(x_søyle_a - 10, ya - 7, "Påstand rev. A: 0,90 kWh / 600 W snitt",
                 11, GRÅ, "end"))

    # Tegnforklaring — i det tomme feltet til venstre for søylene
    ly = y0 + 34
    lx = x0 + 16
    o.append(txt(lx, ly - 22, "Poster i budsjettet", 12, INK, weight="bold"))
    for navn, nøkkel, farge in POSTER:
        o.append(rect(lx, ly - 9, 12, 12, farge))
        o.append(txt(lx + 19, ly + 1, navn, 11.5, INK))
        ly += 20
    o.append(txt(lx, ly + 14,
                 "Søylene viser snitteffekt over de 90 minuttene.", 11, GRÅ))
    o.append(txt(lx, ly + 30,
                 "Kappetapet er posten rev. A ikke har med.", 11, GRÅ))
    return "\n".join(o)


def gjenvinnerpanel(x0, y0, w, h):
    """Prinsippskisse: klimamodul rev. B med motstrøms platevarmeveksler."""
    o = []
    o.append(rect(x0, y0, w, h, BEIGE_LYS, "#c9c1b2", 1.2, 4))

    mx, my = x0 + 40, y0 + 100
    mw, mh = w - 80, h - 172
    o.append(rect(mx, my, mw, mh, "#ffffff", INK, 1.6, 3))
    o.append(txt(mx + 10, my - 10, "KLIMAMODUL rev. B — snitt", 12.5, INK,
                 weight="bold", spacing="0.5"))

    # Varmeveksleren
    vx = mx + mw * 0.30
    vw, vh = mw * 0.26, mh * 0.55
    vy = my + (mh - vh) / 2 - 6
    o.append(rect(vx, vy, vw, vh, BLÅ_LYS, BLÅ, 1.6, 2))
    for i in range(1, 9):
        xx = vx + vw * i / 9
        o.append(line(xx, vy + 4, xx, vy + vh - 4, BLÅ, 0.7))
    o.append(txt(vx + vw / 2, vy - 10,
                 f"NY: motstrøms platevarmeveksler i aluminium, η ≈ {GJENVINNING:.0%}",
                 11.5, BLÅ, "middle", "bold"))
    kondensnotat = ("Ingen kondens i pakken: duggpunktet i avtrekket er 17,3 °C, "
                    "og inntaksluften er varmere enn det.")

    # Komponenter nedstrøms
    def boks(cx, cw, etikett, fill=BEIGE):
        yy = my + mh * 0.16
        hh = mh * 0.34
        o.append(rect(cx, yy, cw, hh, fill, INK, 1.2, 2))
        o.append(txt(cx + cw / 2, yy + hh / 2 + 4, etikett, 11, INK, "middle"))
        return yy, hh

    fx = mx + mw * 0.62
    boks(fx, mw * 0.10, "vifte")
    boks(fx + mw * 0.13, mw * 0.12, "PTC", "#f2c9bd")

    # Luftveier: kald inntaksluft -> forvarmet -> PTC -> pod
    y_inn = my + mh * 0.33
    o.append(path(f"M {mx + 8} {y_inn} L {vx} {y_inn}", stroke=BLÅ, sw=3,
                  marker=' marker-end="url(#pil_bla)"'))
    o.append(txt(mx + 12, y_inn - 9, "romluft 20 °C", 10.5, BLÅ))
    o.append(path(f"M {vx + vw} {y_inn} L {fx} {y_inn}", stroke="#8f5a3c", sw=3,
                  marker=' marker-end="url(#pil_rust)"'))
    o.append(txt(vx + vw + 8, y_inn - 9, "forvarmet 25 °C", 10.5, "#8f5a3c"))
    o.append(path(f"M {fx + mw * 0.25} {y_inn} L {mx + mw - 8} {y_inn}",
                  stroke=RUST, sw=3, marker=' marker-end="url(#pil_rust)"'))
    o.append(txt(mx + mw - 12, y_inn - 9, "tilluft 38 °C  →  pod", 10.5, RUST, "end"))

    # Returluft tilbake gjennom veksleren og ut
    y_ret = my + mh * 0.76
    o.append(path(f"M {mx + mw - 8} {y_ret} L {vx + vw} {y_ret}", stroke=BLÅ, sw=3,
                  marker=' marker-end="url(#pil_bla)"'))
    o.append(txt(mx + mw - 12, y_ret + 18, "retur fra pod 30 °C, 12,3 g/kg",
                 10.5, BLÅ, "end"))
    o.append(path(f"M {vx} {y_ret} L {mx + 8} {y_ret}", stroke=BLÅ, sw=3,
                  marker=' marker-end="url(#pil_bla)"'))
    o.append(txt(mx + 12, y_ret + 18, "avtrekk 25 °C  →  vindusplate", 10.5, BLÅ))

    o.append(txt(mx, my + mh + 20, kondensnotat, 10.5, GRÅ))

    o.append(txt(x0 + 22, y0 + 34,
                 "Endringen som lukker effektgapet", 15, INK, weight="bold"))
    o.append(txt(x0 + 22, y0 + 54,
                 "Avtrekket forlot podden på 30 °C og gikk rett ut av vinduet. "
                 "Rev. B lar det varme inntaksluften først.", 11.5, GRÅ))

    b = budsjett(GJENVINNING)
    a = budsjett(0.0)
    o.append(txt(x0 + 22, y0 + h - 22,
                 f"Sensibel post faller fra {nb(a['sensibel'])} til "
                 f"{nb(b['sensibel'])} kWh — {nb(a['sum'] - b['sum'])} kWh spart per "
                 f"syklus, og syklusen kommer under effekttaket.", 11.5, INK))
    return "\n".join(o)


def bygg() -> str:
    a, b = budsjett(0.0), budsjett(GJENVINNING)
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}">']
    o.append("""<defs>
  <marker id="pil_rust" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#b5462a"/></marker>
  <marker id="pil_bla" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M 0 0 L 10 5 L 0 10 z" fill="#2b7ea8"/></marker>
</defs>""")
    o.append(rect(0, 0, W, H, BG))
    o.append(rect(14, 14, W - 28, H - 28, "none", "#cfcfcf", 1.2))

    # Tittelblokk
    o.append(txt(46, 62, "TØRKA T1 — termisk revisjon", 27, INK, weight="bold"))
    o.append(txt(46, 88,
                 "Energibudsjett for én tørkesyklus: 4 kg plagg, 0,8 l fritt vann, "
                 "90 minutter, romluft 20 °C / 40 % RF", 13, GRÅ))
    o.append(line(46, 104, W - 46, 104, INK, 1.4))

    o.append(txt(46, 136, "1  Hvor rev. A ikke går opp", 15, INK, weight="bold"))
    o.append(energipanel(a, b, 96, 176, W - 190, 330))

    o.append(txt(46, 638, "2  Foreslått rettelse", 15, INK, weight="bold"))
    o.append(gjenvinnerpanel(46, 658, W - 92, 340))

    # Bunntekst
    o.append(line(46, H - 52, W - 46, H - 52, "#cfcfcf", 1))
    o.append(txt(46, H - 32,
                 "Beregnet med termisk_revisjon.py · Buck-ligningen for metningstrykk · "
                 "kappetap antatt 5 m² ved U = 2,5 W/m²K", 11, GRÅ))
    o.append(txt(W - 46, H - 32, "Rev. B, forslag · ikke frigitt for produksjon",
                 11, GRÅ, "end"))
    o.append("</svg>")
    return "\n".join(o)


if __name__ == "__main__":
    ut = pathlib.Path(__file__).parent / "figurer" / "torka-t1-revB-energi.svg"
    ut.parent.mkdir(parents=True, exist_ok=True)
    ut.write_text(bygg(), encoding="utf-8")
    print(f"skrev {ut}")
