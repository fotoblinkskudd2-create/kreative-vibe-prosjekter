"""Genererer designarket for Luna: proporsjon, stabilitet, CMF og lyslagpakke.

    python3 lag_figur.py     -> figurer/luna-designark.svg

Stabilitetstallene hentes fra stabilitet.py, slik at arket og beregningen
ikke kan gå fra hverandre.
"""

import math
import pathlib

from stabilitet import (BASERADIUS_MM, DYTTEHØYDE_MM, tyngdepunkt,
                        veltearbeid, veltekraft, veltevinkel)

# --- Palett ---
BG = "#faf8f5"
INK = "#241f1b"
GRÅ = "#7a736c"
LINJE = "#c9c0b5"
MÅL = "#a5442a"                 # målsettingslinjer
GLØD = "#ffbe7d"

# CMF, sRGB-tilnærminger til NCS-kodene i specen
BEIGE = "#d9c7b4"               # NCS S 2010-Y30R, grunnfarge trekk
ORANSJE = "#b0663a"             # NCS S 3040-Y60R, stripe
STRIPEGRÅ = "#9a9a9a"           # NCS S 4000-N, stripe
BASEGRÅ = "#b6aea1"             # sandgrå, halvmatt glasur

W, H = 1600, 1000
SK = 0.78                       # px per mm

BALLAST = 3.5

# Silhuett: (høyde mm over gulv, halvbredde mm). Fra designspec §1 og §2.
SILHUETT = [(120, 142), (200, 148), (260, 150), (310, 166), (345, 170),
            (375, 142), (392, 96), (420, 108), (470, 110), (530, 100),
            (562, 70), (578, 22)]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def nb(x, d=1):
    return f"{x:.{d}f}".replace(".", ",")


def txt(x, y, s, size=12, fill=INK, anchor="start", weight="normal",
        spacing=None, style=""):
    sp = f' letter-spacing="{spacing}"' if spacing else ""
    st = f' font-style="{style}"' if style else ""
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-family="Helvetica, Arial, sans-serif" '
            f'font-size="{size}" fill="{fill}" text-anchor="{anchor}" '
            f'font-weight="{weight}"{sp}{st}>{esc(s)}</text>')


def rect(x, y, w, h, fill="none", stroke="none", sw=1, rx=0):
    return (f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
            f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}" rx="{rx}"/>')


def line(x1, y1, x2, y2, stroke=INK, sw=1, dash=None, marker=""):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke="{stroke}" stroke-width="{sw}"{d}{marker}/>')


def path(d, fill="none", stroke=INK, sw=1, dash=None, opacity=1.0):
    ds = f' stroke-dasharray="{dash}"' if dash else ""
    return (f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" '
            f'stroke-linejoin="round" stroke-linecap="round" '
            f'opacity="{opacity}"{ds}/>')


def glatt(punkter, lukk=False):
    """Catmull-Rom gjennom punktene, konvertert til kubiske bézier-segmenter."""
    p = list(punkter)
    if len(p) < 2:
        return ""
    d = [f"M {p[0][0]:.1f} {p[0][1]:.1f}"]
    for i in range(len(p) - 1):
        p0 = p[i - 1] if i > 0 else p[0]
        p1, p2 = p[i], p[i + 1]
        p3 = p[i + 2] if i + 2 < len(p) else p[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d.append(f"C {c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} "
                 f"{p2[0]:.1f} {p2[1]:.1f}")
    if lukk:
        d.append("Z")
    return " ".join(d)


def kropp_bane(cx, gulv, vipp_grader=0.0, halsh=392.0):
    """Lukket silhuett av kroppen. Hodet kan vippes om halslinjen."""
    v = math.radians(vipp_grader)

    def pkt(h_mm, hb_mm, side):
        x, y = side * hb_mm, h_mm
        if vipp_grader and h_mm > halsh:
            dy = h_mm - halsh
            x, y = x * math.cos(v) + dy * math.sin(v), halsh + dy * math.cos(v)
        return cx + x * SK, gulv - y * SK

    høyre = [pkt(h, hb, 1) for h, hb in SILHUETT]
    venstre = [pkt(h, hb, -1) for h, hb in reversed(SILHUETT)]
    topp = [((høyre[-1][0] + venstre[0][0]) / 2,
             min(høyre[-1][1], venstre[0][1]) - 10 * SK)]
    return glatt(høyre + topp + venstre, lukk=True)


def base_bane(cx, gulv):
    """Keramikkbasen: Ø280 × H120, svakt konisk, avrundet overgang."""
    r, h = 140 * SK, 120 * SK
    rt = 143 * SK
    return (f"M {cx-r:.1f} {gulv:.1f} "
            f"L {cx-r:.1f} {gulv-h+8:.1f} "
            f"Q {cx-r:.1f} {gulv-h:.1f} {cx-rt+3:.1f} {gulv-h:.1f} "
            f"L {cx+rt-3:.1f} {gulv-h:.1f} "
            f"Q {cx+r:.1f} {gulv-h:.1f} {cx+r:.1f} {gulv-h+8:.1f} "
            f"L {cx+r:.1f} {gulv:.1f} Z")


def målpil(x1, y1, x2, y2, etikett, side="v", farge=MÅL):
    """Målsettingslinje med piler i begge ender."""
    o = [line(x1, y1, x2, y2, farge, 1,
              marker=' marker-start="url(#m1)" marker-end="url(#m1)"')]
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if side == "v":      # vertikalt mål, tekst rotert
        o.append(f'<g transform="translate({mx-6:.1f},{my:.1f}) rotate(-90)">'
                 f'{txt(0, 0, etikett, 11, farge, "middle")}</g>')
    else:
        o.append(txt(mx, my - 6, etikett, 11, farge, "middle"))
    return "\n".join(o)


def panel(x, y, w, h, tittel, nummer):
    o = [rect(x, y, w, h, "#ffffff", LINJE, 1.2, 3),
         txt(x + 16, y + 26, f"{nummer}   {tittel}", 13, INK, weight="bold",
             spacing="0.4")]
    return o


def oppriss(x, y, w, h):
    o = panel(x, y, w, h, "Oppriss — proporsjon", "1")
    cx, gulv = x + w * 0.46, y + h - 54

    o.append(path(base_bane(cx, gulv), BASEGRÅ, INK, 1.4))
    o.append(path(kropp_bane(cx, gulv), BEIGE, INK, 1.4))

    # Striper: uregelmessig fordelt, aldri to like avstander etter hverandre
    avstander = [0, 52, 96, 158, 199, 262, 331, 379, 452]
    bredder = [9, 6, 13, 7, 11, 6, 14, 8, 10]
    farger = [ORANSJE, STRIPEGRÅ, ORANSJE, STRIPEGRÅ, ORANSJE,
              ORANSJE, STRIPEGRÅ, ORANSJE, STRIPEGRÅ]
    # Stripene stopper ved halslinjen — hodet står rent, ellers leser ansiktet
    # som mønster i stedet for som ansikt.
    o.append(f'<clipPath id="kropp"><path d="{kropp_bane(cx, gulv)}"/></clipPath>')
    o.append('<g clip-path="url(#kropp)">')
    for dx, bw, f in zip(avstander, bredder, farger):
        xs = cx - 180 * SK + dx * SK
        o.append(f'<rect x="{xs:.1f}" y="{gulv-388*SK:.1f}" width="{bw*SK:.1f}" '
                 f'height="{388*SK:.1f}" fill="{f}" opacity="0.7"/>')
    o.append("</g>")

    # Øyne
    for s in (-1, 1):
        o.append(f'<circle cx="{cx + s*34*SK:.1f}" cy="{gulv - 468*SK:.1f}" '
                 f'r="{7*SK:.1f}" fill="#fff4e2" stroke="{INK}" stroke-width="0.8"/>')
    # Munn: søm/preging, 45 mm bred
    o.append(path(f"M {cx-22*SK:.1f} {gulv-436*SK:.1f} Q {cx:.1f} "
                  f"{gulv-432*SK:.1f} {cx+22*SK:.1f} {gulv-436*SK:.1f}",
                  stroke="#a89680", sw=1.2))

    # Skjerf: festet i én søm på venstre skulder, faller fritt over høyre
    # skulder og ned til kote 260.
    o.append('<g clip-path="url(#kropp)">')
    o.append(path(f"M {cx-96*SK:.1f} {gulv-346*SK:.1f} "
                  f"C {cx-40*SK:.1f} {gulv-374*SK:.1f} {cx+40*SK:.1f} "
                  f"{gulv-374*SK:.1f} {cx+96*SK:.1f} {gulv-344*SK:.1f} "
                  f"L {cx+96*SK:.1f} {gulv-316*SK:.1f} "
                  f"C {cx+40*SK:.1f} {gulv-344*SK:.1f} {cx-40*SK:.1f} "
                  f"{gulv-344*SK:.1f} {cx-96*SK:.1f} {gulv-318*SK:.1f} Z",
                  ORANSJE, INK, 1.1))
    o.append(path(f"M {cx+52*SK:.1f} {gulv-330*SK:.1f} "
                  f"C {cx+78*SK:.1f} {gulv-312*SK:.1f} {cx+84*SK:.1f} "
                  f"{gulv-286*SK:.1f} {cx+74*SK:.1f} {gulv-260*SK:.1f} "
                  f"L {cx+40*SK:.1f} {gulv-264*SK:.1f} "
                  f"C {cx+50*SK:.1f} {gulv-288*SK:.1f} {cx+46*SK:.1f} "
                  f"{gulv-312*SK:.1f} {cx+26*SK:.1f} {gulv-328*SK:.1f} Z",
                  ORANSJE, INK, 1.1))
    o.append("</g>")

    # Gulvlinje
    o.append(line(cx - 200 * SK, gulv, cx + 200 * SK, gulv, INK, 1.4))
    for i in range(13):
        gx = cx - 195 * SK + i * 32 * SK
        o.append(line(gx, gulv, gx - 7, gulv + 8, GRÅ, 0.8))

    # Målsetting, vertikalt til høyre
    mx = cx + 232 * SK
    o.append(målpil(mx, gulv, mx, gulv - 580 * SK, "580"))
    o.append(målpil(mx + 26, gulv, mx + 26, gulv - 120 * SK, "120"))
    for kote, tekst in [(390, "390  halslinje"), (300, "300  skjerf"),
                        (120, "120  skjøt")]:
        yy = gulv - kote * SK
        o.append(line(cx - 200 * SK, yy, mx - 8, yy, LINJE, 0.9, "4 3"))
        o.append(txt(cx - 204 * SK, yy + 4, tekst, 10, GRÅ, "end"))

    # Horisontale mål
    o.append(målpil(cx - 170 * SK, gulv - 604 * SK, cx + 170 * SK,
                    gulv - 604 * SK, "340  bredeste punkt", "h"))
    o.append(målpil(cx - 140 * SK, gulv + 30, cx + 140 * SK, gulv + 30,
                    "Ø280  base", "h"))
    o.append(txt(x + 16, y + h - 14,
                 "Bredeste punkt er bredere enn foten — Luna hviler, den står ikke.",
                 10.5, GRÅ))
    return o


def profil(x, y, w, h):
    o = panel(x, y, w, h, "Profil, 8° fremoverlent hode — og hva som velter den", "2")
    cx, gulv = x + w * 0.50, y + 566
    m, cg = tyngdepunkt(BALLAST)

    o.append(path(base_bane(cx, gulv), BASEGRÅ, INK, 1.4))
    # Sett fra siden er kroppen 310 mm dyp mot 340 mm bred. Basen er rund og
    # skaleres ikke.
    d = 310 / 340
    o.append(f'<g transform="translate({cx:.1f},0) scale({d:.4f},1) '
             f'translate({-cx:.1f},0)">')
    # Spøkelse: hode uten vipp, til sammenligning
    o.append(path(kropp_bane(cx, gulv, 0.0), "none", GRÅ, 1.0, dash="4 3"))
    o.append(path(kropp_bane(cx, gulv, 8.0), BEIGE, INK, 1.4))
    o.append("</g>")

    # Vippevinkelen markert over hodet, utenfor silhuetten
    hy = gulv - 392 * SK
    L = 230 * SK
    o.append(line(cx, hy, cx, hy - L, GRÅ, 0.9, "3 3"))
    o.append(line(cx, hy, cx + L * math.sin(math.radians(8)),
                  hy - L * math.cos(math.radians(8)), MÅL, 1.3))
    o.append(f'<path d="M {cx:.1f} {hy-L:.1f} A {L:.1f} {L:.1f} 0 0 1 '
             f'{cx + L*math.sin(math.radians(8)):.1f} '
             f'{hy - L*math.cos(math.radians(8)):.1f}" fill="none" '
             f'stroke="{MÅL}" stroke-width="1"/>')
    o.append(txt(cx + 22, hy - L - 8, "8° fremover", 11.5, MÅL, weight="bold"))
    o.append(txt(cx - 8, hy - L - 8, "loddrett", 10, GRÅ, "end"))

    # Tyngdepunkt
    cgy = gulv - cg * SK
    o.append(f'<circle cx="{cx:.1f}" cy="{cgy:.1f}" r="7" fill="none" '
             f'stroke="{MÅL}" stroke-width="1.4"/>')
    o.append(f'<path d="M {cx-7:.1f} {cgy:.1f} A 7 7 0 0 1 {cx+7:.1f} {cgy:.1f} Z" '
             f'fill="{MÅL}"/>')
    o.append(f'<path d="M {cx+7:.1f} {cgy:.1f} A 7 7 0 0 1 {cx-7:.1f} {cgy:.1f} Z" '
             f'fill="none"/>')
    o.append(line(cx - 12, cgy, cx - 74, cgy, MÅL, 0.9))
    o.append(txt(cx - 80, cgy + 4, f"tyngdepunkt {cg:.0f} mm", 10.5, MÅL, "end"))

    # Veltelinje fra fotrand gjennom tyngdepunkt
    fx = cx + BASERADIUS_MM * SK
    o.append(line(fx, gulv, cx, cgy, MÅL, 1, "5 3"))
    o.append(f'<path d="M {fx:.1f} {gulv-34:.1f} A 34 34 0 0 1 '
             f'{fx - 34*math.sin(math.radians(veltevinkel(cg))):.1f} '
             f'{gulv - 34*math.cos(math.radians(veltevinkel(cg))):.1f}" '
             f'fill="none" stroke="{MÅL}" stroke-width="1"/>')
    o.append(txt(fx + 8, gulv - 44, f"{nb(veltevinkel(cg))}°", 11, MÅL, weight="bold"))

    o.append(line(cx - 200 * SK, gulv, cx + 200 * SK, gulv, INK, 1.4))

    # Tallpanel, i to kolonner under tegningen
    px, py, pw = x + 20, y + 616, w - 40
    o.append(rect(px, py, pw, 160, "#f6f2ec", LINJE, 1, 3))
    kolonner = [
        [("Totalvekt", f"{nb(m, 2)} kg"),
         ("Tyngdepunkt", f"{cg:.0f} mm over gulv"),
         ("Veltevinkel", f"{nb(veltevinkel(cg))}°   (krav ≥ 30°)")],
        [("Veltearbeid", f"{nb(veltearbeid(BALLAST), 2)} J"),
         ("Veltekraft @ 400 mm", f"{nb(veltekraft(BALLAST))} N"),
         ("Uten ballast i det hele tatt",
          f"{nb(veltevinkel(tyngdepunkt(0)[1]))}°  /  {nb(veltekraft(0))} N")],
    ]
    for i, kol in enumerate(kolonner):
        kx = px + 16 + i * pw / 2
        kb = pw / 2 - 32
        yy = py + 28
        for k, v in kol:
            farge = MÅL if k.startswith("Uten") else INK
            o.append(txt(kx, yy, k, 10.5, GRÅ))
            o.append(txt(kx + kb, yy, v, 11.5, farge, "end", "bold"))
            yy += 24
    o.append(line(px + 16, py + 108, px + pw - 16, py + 108, LINJE, 1))
    o.append(txt(px + 16, py + 128,
                 "Vinkelkravet på 30° holder også helt uten ballast — "
                 "det er altså ikke vinkelen som dimensjonerer den.",
                 10.5, INK, weight="bold"))
    o.append(txt(px + 16, py + 145,
                 "Det som skiller er hvor hardt du må dytte. Sett kravet i "
                 "veltearbeid (mål: ≥ 4 J), ikke i grader.", 10.5, GRÅ))
    return o


def cmf(x, y, w, h):
    o = panel(x, y, w, h, "CMF — farge, materiale, finish", "3")
    prøver = [
        (BEIGE, "Grunnfarge trekk", "NCS S 2010-Y30R", "Ull/bomull 60/40, vevd, 280–340 g/m²"),
        (ORANSJE, "Stripe, dempet oransje", "NCS S 3040-Y60R", "Bredde 6–14 mm, avstand 40–90 mm"),
        (STRIPEGRÅ, "Stripe, grå", "NCS S 4000-N", "Aldri to like avstander etter hverandre"),
        (BASEGRÅ, "Base, sandgrå", "Halvmatt 10–20 GU @ 60°", "Dreid steintøy, gods 8–10 mm"),
        (GLØD, "Lys ut av stoffet", "2700 K, CRI ≥ 95", "120–180 lm — glød, ikke leselys"),
    ]
    sy = y + 50
    for farge, navn, kode, note in prøver:
        o.append(rect(x + 18, sy, 62, 42, farge, INK, 1, 3))
        o.append(txt(x + 92, sy + 15, navn, 11.5, INK, weight="bold"))
        o.append(txt(x + 92, sy + 29, kode, 10.5, MÅL))
        o.append(txt(x + 92, sy + 42, note, 10, GRÅ))
        sy += 56
    o.append(txt(x + 18, y + h - 32,
                 "Trekket skal være flammehemmende og bestå EN 1021-1 og -2.",
                 10.5, INK, weight="bold"))
    o.append(txt(x + 18, y + h - 16,
                 "Ikke valgfritt når tekstil ligger over en lyskilde.", 10, GRÅ))
    return o


def lyspakke(x, y, w, h):
    o = panel(x, y, w, h, "Lagpakke — fra LED til stoff", "4")
    lag = [("COB-bånd 24 V, 2700 K", 10, "#ffe9c9", "8 W over 1,2 m"),
           ("Luftspalte", 25, "#ffffff", "hindrer synlige punkter"),
           ("Opal PC-diffusor", 2, "#e8eef2", "transmisjon 45–60 %"),
           ("Luftspalte", 8, "#ffffff", ""),
           ("PU-skum 30 kg/m³", 20, "#f2ece2", "form og utjevning"),
           ("Ull/bomull, FR-behandlet", 3, BEIGE, "EN 1021-1/-2")]
    total = sum(t for _, t, _, _ in lag)
    x0, bredde = x + 26, w * 0.30
    y_topp = y + 56
    tilgjengelig = h - 118
    # Proporsjonal tykkelse, men med et gulv slik at de tynne lagene fortsatt
    # får plass til sin egen etikett.
    min_h = 30
    fri = tilgjengelig - min_h * len(lag) - 3 * (len(lag) - 1)
    yy = y_topp
    for navn, tykkelse, farge, note in lag:
        hh = min_h + fri * tykkelse / total
        o.append(rect(x0, yy, bredde, hh, farge, INK, 1))
        o.append(txt(x0 + bredde + 14, yy + hh / 2 - 2,
                     f"{navn}   ·   {tykkelse} mm", 10.5, INK))
        if note:
            o.append(txt(x0 + bredde + 14, yy + hh / 2 + 13, note, 9.5, GRÅ))
        yy += hh + 3

    # Glødegradient til høyre
    gx = x + w - 92
    o.append(f'<defs><linearGradient id="glod" x1="0" y1="1" x2="0" y2="0">'
             f'<stop offset="0" stop-color="{GLØD}" stop-opacity="0.05"/>'
             f'<stop offset="1" stop-color="{GLØD}" stop-opacity="0.9"/>'
             f'</linearGradient></defs>')
    o.append(rect(gx, y_topp, 54, yy - y_topp - 3, "url(#glod)", LINJE, 1, 3))
    o.append(f'<g transform="translate({gx+27:.1f},{(y_topp+yy)/2:.1f}) rotate(-90)">'
             f'{txt(0, 4, "glød, ikke punkter", 10, "#8a6a44", "middle")}</g>')

    o.append(txt(x + 26, y + h - 20,
                 "Rekkefølgen er ikke valgfri: uten de 25 mm ser du hver enkelt "
                 "diode gjennom stoffet.", 10.5, GRÅ))
    return o


def bygg():
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
         f'width="{W}" height="{H}">']
    o.append(f'''<defs>
  <marker id="m1" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6"
          markerHeight="6" orient="auto"><path d="M 2 2 L 8 5 L 2 8 z"
          fill="{MÅL}"/></marker>
</defs>''')
    o.append(rect(0, 0, W, H, BG))

    o.append(txt(46, 60, "LUNA", 30, INK, weight="bold", spacing="3"))
    o.append(txt(150, 60, "— designark, utkast 2", 17, GRÅ))
    o.append(txt(46, 86,
                 "Mykt lysobjekt, 580 mm. Keramikkbase, ullkledd kropp, varm glød "
                 "innenfra. Skal lese som møbel, ikke som maskin.", 12.5, GRÅ))
    o.append(line(46, 102, W - 46, 102, INK, 1.4))

    o += oppriss(46, 124, 470, 796)
    o += profil(532, 124, 560, 796)
    o += cmf(1108, 124, 446, 372)
    o += lyspakke(1108, 512, 446, 408)

    o.append(line(46, H - 56, W - 46, H - 56, LINJE, 1))
    o.append(txt(46, H - 34,
                 "Stabilitetstall beregnet med stabilitet.py · CMF-prøvene er "
                 "sRGB-tilnærminger til NCS-kodene og erstatter ikke fysiske "
                 "fargeprøver", 10.5, GRÅ))
    o.append(txt(W - 46, H - 34, "Utkast 2 · ikke bygget", 10.5, GRÅ, "end"))
    o.append("</svg>")
    return "\n".join(o)


if __name__ == "__main__":
    ut = pathlib.Path(__file__).parent / "figurer" / "luna-designark.svg"
    ut.parent.mkdir(parents=True, exist_ok=True)
    ut.write_text(bygg(), encoding="utf-8")
    print(f"skrev {ut}")
