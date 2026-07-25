#!/usr/bin/env python3
"""Genererer konsepttegning (SVG) for TORKA T1.

Alle mal i tegningen oppgis i millimeter. Tegningen er et konseptriss,
ikke en produksjonstegning: den viser hovedmal, luftvei og
nokkelmekanismer slik de er beskrevet i designpitchen.
"""
import math
from pathlib import Path

W, H = 1660, 1120
S = 0.36          # px per mm i hovedrissene
Y_FLOOR = 800.0   # y-koordinat for gulvlinje i oppriss og snitt

INK = "#1c1c1c"
DIM = "#7a2f1e"
AIR_WARM = "#c8541f"
AIR_WET = "#2f6f8f"
FILL_SHELL = "#eceae5"
FILL_MOD = "#d9d4cb"
FILL_TRAY = "#c9c3b8"

parts: list[str] = []


def add(s: str) -> None:
    parts.append(s)


def y(mm: float) -> float:
    """Hoyde i mm over gulv -> y-koordinat."""
    return Y_FLOOR - mm * S


def rect(x, yy, w, h, fill="none", stroke=INK, sw=1.4, dash=None, rx=0):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    add(f'<rect x="{x:.1f}" y="{yy:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')


def line(x1, y1, x2, y2, stroke=INK, sw=1.4, dash=None, cap="butt"):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
        f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}"{d}/>')


def path(d, stroke=INK, sw=1.4, fill="none", dash=None, marker=None):
    ds = f' stroke-dasharray="{dash}"' if dash else ""
    mk = f' marker-end="url(#{marker})"' if marker else ""
    add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{ds}{mk}/>')


def text(x, yy, s, size=13, anchor="start", fill=INK, weight="400", style="normal",
         family="DejaVu Sans, Arial, sans-serif"):
    add(f'<text x="{x:.1f}" y="{yy:.1f}" font-family="{family}" font-size="{size}" '
        f'font-weight="{weight}" font-style="{style}" fill="{fill}" '
        f'text-anchor="{anchor}">{s}</text>')


def dim_h(x1, x2, yy, label, tick=6, side="above", size=12):
    """Horisontal malsetting med piler i begge ender."""
    line(x1, yy, x2, yy, stroke=DIM, sw=1.0)
    for x in (x1, x2):
        line(x, yy - tick, x, yy + tick, stroke=DIM, sw=1.0)
    ty = yy - 7 if side == "above" else yy + 15
    text((x1 + x2) / 2, ty, label, size=size, anchor="middle", fill=DIM)


def dim_v(yy1, yy2, x, label, tick=6, side="left", size=12):
    """Vertikal malsetting; etiketten roteres."""
    line(x, yy1, x, yy2, stroke=DIM, sw=1.0)
    for yv in (yy1, yy2):
        line(x - tick, yv, x + tick, yv, stroke=DIM, sw=1.0)
    tx = x - 8 if side == "left" else x + 14
    my = (yy1 + yy2) / 2
    add(f'<text x="{tx:.1f}" y="{my:.1f}" font-family="DejaVu Sans, Arial, sans-serif" '
        f'font-size="{size}" fill="{DIM}" text-anchor="middle" '
        f'transform="rotate(-90 {tx:.1f} {my:.1f})">{label}</text>')


def balloon(x, yy, n, tx, ty, size=13):
    """Posisjonsnummer med henvisningslinje."""
    line(x, yy, tx, ty, stroke=INK, sw=0.9)
    add(f'<circle cx="{tx:.1f}" cy="{ty:.1f}" r="11" fill="#ffffff" stroke="{INK}" stroke-width="1.2"/>')
    text(tx, ty + 4.5, str(n), size=size, anchor="middle", weight="600")


def panel_title(x, yy, s, sub=""):
    text(x, yy, s, size=15, weight="700")
    if sub:
        text(x, yy + 17, sub, size=11.5, fill="#555")


# ---------------------------------------------------------------- oppsett
add(f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" '
    f'viewBox="0 0 {W} {H}">')
add('<defs>'
    '<marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
    'markerHeight="7" orient="auto-start-reverse">'
    '<path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/></marker>'
    '<marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" '
    'markerHeight="6" orient="auto-start-reverse">'
    f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{AIR_WARM}"/></marker>'
    '<marker id="arb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" '
    'markerHeight="6" orient="auto-start-reverse">'
    f'<path d="M 0 0 L 10 5 L 0 10 z" fill="{AIR_WET}"/></marker>'
    '</defs>')
rect(0, 0, W, H, fill="#ffffff", stroke="none")
rect(18, 18, W - 36, H - 36, fill="none", stroke=INK, sw=1.6)

# ============================================================ 1. OPPRISS
X0 = 150.0
BW = 640 * S                      # 230.4 px
X1 = X0 + BW
panel_title(X0, 92, "1  OPPRISS - UTFOLDET", "Sett forfra, malestokk 1:12 (A3)")

line(X0 - 55, Y_FLOOR, X1 + 55, Y_FLOOR, sw=1.8)          # gulv
for i in range(14):                                        # gulvskravur
    gx = X0 - 50 + i * 24
    line(gx, Y_FLOOR, gx - 10, Y_FLOOR + 11, sw=0.7)

rect(X0, y(1780), BW, (1780 - 60) * S, fill=FILL_SHELL)    # kabinett
rect(X0, y(1780), BW, 60 * S, fill="#dedad2")              # topphette
line(X0 + 14, y(1720), X1 - 14, y(1720), sw=2.2)           # hengerskinne
for hx in (0.22, 0.38, 0.54, 0.70):                        # glidekroker
    cx = X0 + BW * hx
    path(f"M {cx:.1f} {y(1720):.1f} q 0 14 8 18", sw=1.1)

line(X0 + BW / 2, y(1720), X0 + BW / 2, y(280), dash="7 5", sw=1.1)   # glidelas
for zy in (1560, 1240, 920, 620):
    line(X0 + BW / 2 - 5, y(zy), X0 + BW / 2 + 5, y(zy), sw=0.8)

for ux in (X0 + 4, X1 - 4):                                # rammerar
    line(ux, y(1780), ux, y(60), sw=2.0)

rect(X0, y(280), BW, 60 * S, fill="#cfc9be")               # plenum
rect(X0 + 6, y(220), BW - 12, 160 * S, fill=FILL_TRAY)     # bunnkar-sone
rect(X0 + BW / 2 - 160 * S, y(220), 320 * S, 160 * S, fill=FILL_MOD, dash="6 4")
text(X0 + BW / 2, y(140) + 5, "KLIMAMODUL", size=10.5, anchor="middle", fill="#444")

for fx in (X0 + 16, X1 - 16):                              # fotmoduler m/hjul
    rect(fx - 9, y(60), 18, 60 * S - 8, fill="#bfb9ae")
    add(f'<circle cx="{fx:.1f}" cy="{Y_FLOOR - 7:.1f}" r="7" fill="#ffffff" '
        f'stroke="{INK}" stroke-width="1.3"/>')

dim_v(y(1780), y(0), X0 - 46, "1780")
dim_v(y(1720), y(280), X0 - 20, "1440 fri torkehoyde", size=11)
dim_h(X0, X1, y(1780) - 34, "640")
dim_v(y(220), y(60), X1 + 22, "160", side="right", size=11)
dim_v(y(60), y(0), X1 + 22, "60", side="right", size=11)

BX = X1 + 84
balloon(X0 + BW * 0.62, y(1720), 1, BX, y(1740))
balloon(X0 + BW * 0.78, y(1430), 2, BX, y(1430))
balloon(X1 - 4, y(1100), 3, BX, y(1100))
balloon(X1 - 10, y(300), 4, BX, y(620))
balloon(X0 + BW / 2 + 40, y(150), 5, BX, y(330))
balloon(X1 - 16, y(30), 6, BX, y(60))

# ============================================================ 2. SNITT
SX0 = 610.0
SX1 = SX0 + BW
panel_title(SX0, 92, "2  SNITT B-B - LUFTVEI", "Sett fra siden; front til venstre, retursjakt bak")

line(SX0 - 45, Y_FLOOR, SX1 + 120, Y_FLOOR, sw=1.8)
for i in range(15):
    gx = SX0 - 40 + i * 24
    line(gx, Y_FLOOR, gx - 10, Y_FLOOR + 11, sw=0.7)

rect(SX0, y(1780), BW, (1780 - 60) * S, fill="#f6f5f2")
RET = 60 * S                                               # retursjakt 60 mm dyp
rect(SX1 - RET, y(1750), RET, (1750 - 280) * S, fill="#e3ecf1")   # retursjakt
text(SX1 - RET / 2, y(1320), "RETUR", size=9.5, anchor="middle", fill=AIR_WET)

line(SX0 + 10, y(1720), SX1 - RET - 10, y(1720), sw=2.2)   # hengerskinne
# plagg (forenklet silhuett): henger + jakke + ullag + stovler pa dyse
jx = SX0 + 36
path(f"M {jx + 46} {y(1720):.1f} l -22 -17 l 44 0 z", fill="#ffffff")   # henger
rect(jx, y(1698), 92, 430 * S, fill="#ded9d0")
text(jx + 46, y(1520), "skalljakke", size=9.5, anchor="middle", fill="#555")
rect(jx + 14, y(1240), 64, 380 * S, fill="#e6e2da")
text(jx + 46, y(1090), "ullag", size=9.5, anchor="middle", fill="#555")
bx = SX0 + 134                                             # stovel tredd pa dyse
rect(bx, y(780), 30, 380 * S, fill="#e6e2da")
path(f"M {bx} {y(400):.1f} l 52 0 l 0 22 l -52 0 z", fill="#e6e2da")
line(bx + 15, y(340), bx + 15, y(400), stroke=AIR_WARM, sw=3.0)         # dyse
line(bx + 26, y(700), SX1 + 8, y(690), stroke=INK, sw=0.9)
text(SX1 + 12, y(684), "stovel tredd pa dyseport", size=10)

rect(SX0, y(280), BW, 60 * S, fill="#cfc9be")              # plenum
text(SX0 + 40, y(300) + 4, "PLENUM", size=10, fill="#333")
rect(SX0 + 8, y(220), BW - 16, 160 * S, fill=FILL_MOD)     # klimamodul i snitt

# innmat i klimamodulen
mx, my_ = SX0 + 8, y(220)
mh = 160 * S
rect(mx + 10, my_ + 10, 26, mh - 20, fill="#ffffff")       # filter
text(mx + 23, my_ + mh / 2, "F", size=10, anchor="middle")
add(f'<circle cx="{mx + 66:.1f}" cy="{my_ + mh / 2:.1f}" r="17" fill="#ffffff" '
    f'stroke="{INK}" stroke-width="1.3"/>')
text(mx + 66, my_ + mh / 2 + 4, "V", size=11, anchor="middle")
rect(mx + 92, my_ + 10, 30, mh - 20, fill="#f7ded2")       # PTC
text(mx + 107, my_ + mh / 2 + 4, "PTC", size=9.5, anchor="middle", fill=AIR_WARM)
line(mx + 140, my_ + 12, mx + 168, my_ + mh - 14, sw=1.6)  # spjeld
text(mx + 154, my_ + mh - 4, "spjeld", size=9, anchor="middle", fill="#555")

# avtrekksstuss + slange til vindusplate
rect(SX1 - 8, y(160), 24, 90 * S, fill="#ffffff")
path(f"M {SX1 + 16} {y(130):.1f} q 66 0 78 62", stroke=AIR_WET, sw=8, dash="9 7")
text(SX1 + 32, y(210), "avtrekk O100 mm", size=10.5, fill=AIR_WET)
text(SX1 + 32, y(160), "til vindusplate", size=10.5, fill=AIR_WET)

# luftpiler
for ax, h0, h1 in ((SX0 + 20, 340, 1600), (SX0 + 176, 340, 1600)):
    path(f"M {ax} {y(h0):.1f} L {ax} {y(h1):.1f}", stroke=AIR_WARM, sw=2.2, marker="arw")
path(f"M {SX1 - RET / 2:.1f} {y(1680):.1f} L {SX1 - RET / 2:.1f} {y(340):.1f}",
     stroke=AIR_WET, sw=2.2, marker="arb")
path(f"M {SX0 + 150:.1f} {y(1706):.1f} L {SX1 - RET - 8:.1f} {y(1716):.1f}",
     stroke=AIR_WET, sw=1.8, marker="arb")
text(SX1 + 12, y(1706), "mettet luft ut av", size=10, fill=AIR_WET)
text(SX1 + 12, y(1656), "plagget, ca. 38 C", size=10, fill=AIR_WET)
text(SX0 + 26, y(400) - 6, "tilluft", size=10.5, fill=AIR_WARM)

for fx in (SX0 + 16, SX1 - 16):
    rect(fx - 9, y(60), 18, 60 * S - 8, fill="#bfb9ae")
    add(f'<circle cx="{fx:.1f}" cy="{Y_FLOOR - 7:.1f}" r="7" fill="#ffffff" '
        f'stroke="{INK}" stroke-width="1.3"/>')

dim_h(SX0, SX1, y(1780) - 34, "640 dybde")
line(SX1 - RET / 2, y(640), SX1 + 66, y(510), stroke=INK, sw=0.9)
text(SX1 + 70, y(504), "retursjakt 60 dyp", size=10)

# ============================================================ 3. PLAN
PX, PY = 1010.0, 175.0
PS = 0.30
PW = 640 * PS
panel_title(PX, 92, "3  PLAN C-C", "Snitt rett over plenum, 1:14")
rect(PX, PY, PW, PW, fill=FILL_SHELL)
RETP = 60 * PS
rect(PX + PW - RETP, PY, RETP, PW, fill="#e3ecf1")                      # retursjakt bak
PLEN = 190 * PS
rect(PX, PY + PW - PLEN, PW - RETP, PLEN, fill="#cfc9be")               # plenum
line(PX + 8, PY + PW / 2 - 26, PX + PW - RETP - 8, PY + PW / 2 - 26, sw=2.0)
for i in range(6):                                                      # dyseporter
    cx = PX + 20 + i * 22
    add(f'<circle cx="{cx:.1f}" cy="{PY + PW - PLEN + 20:.1f}" r="6.5" fill="#ffffff" '
        f'stroke="{INK}" stroke-width="1.2"/>')
line(PX + 20, PY + PW - PLEN + 20, PX - 26, PY + PW + 40, stroke=INK, sw=0.9)
line(PX + PW - RETP / 2, PY + 14, PX + PW + 34, PY - 6, stroke=INK, sw=0.9)
text(PX + PW + 38, PY - 10, "retursjakt", size=10, fill=AIR_WET)
line(PX + 60, PY + PW / 2 - 26, PX + PW + 34, PY + PW / 2 - 44, stroke=INK, sw=0.9)
text(PX + PW + 38, PY + PW / 2 - 48, "hengerskinne O16", size=10)
text(PX - 30, PY + PW + 54, "6 x dyseport O22 i plenumforkant,", size=10)
text(PX - 30, PY + PW + 71, "selvlukkende ventil", size=10)
dim_h(PX, PX + PW, PY - 20, "640")
dim_v(PY, PY + PW, PX - 20, "640", size=11)

# ============================================================ 4. DETALJ C
DX, DY = 1330.0, 430.0
panel_title(DX, 92 + 0, "", "")
text(DX, 120, "4  DETALJ C - HJORNEKNUTE", size=15, weight="700")
text(DX, 137, "Skala 1:2", size=11.5, fill="#555")
# tre ror inn i en knute
kx, ky = DX + 96, 235.0
rect(kx - 26, ky - 26, 52, 52, fill=FILL_MOD, rx=7)
rect(kx - 8, ky - 96, 16, 70, fill="#ffffff")           # vertikalt ror
rect(kx + 26, ky - 8, 78, 16, fill="#ffffff")           # horisontalt ror hoyre
rect(kx - 104, ky - 8, 78, 16, fill="#ffffff")          # horisontalt ror venstre
add(f'<circle cx="{kx + 58:.1f}" cy="{ky:.1f}" r="5" fill="#ffffff" stroke="{INK}" stroke-width="1.2"/>')
line(kx + 58, ky - 6, kx + 74, ky - 52, stroke=INK, sw=0.9)
text(kx + 76, ky - 56, "fjaerknapp O8", size=10)
line(kx, ky - 84, kx + 74, ky - 88, stroke=INK, sw=0.9)
text(kx + 76, ky - 92, "rammerar O22 x 1,2", size=10)
line(kx - 60, ky - 8, kx - 60, ky + 8, dash="3 3", sw=1.0)
dim_h(kx - 104, kx - 60, ky + 40, "45 innstikk", size=10)
text(DX, 340, "Boring O22,2 +0,15/0  (kompensert for MJF-krymp)", size=10.5)
text(DX, 358, "M5 settskrue 90 gr. fra fjaerknapp", size=10.5)
text(DX, 376, "PA12-GB, veggtykkelse 3,2 mm", size=10.5)

# ============================================================ 5. DETALJ A
AX, AY = 1010.0, 560.0
text(AX, AY - 22, "5  DETALJ A - KLIMAMODUL, SNITT", size=15, weight="700")
text(AX, AY - 5, "Skala 1:4", size=11.5, fill="#555")
AW, AH = 470.0, 165.0
rect(AX, AY + 10, AW, AH, fill=FILL_MOD, rx=5)
rect(AX + 12, AY + 22, 34, AH - 24, fill="#ffffff")
text(AX + 29, AY + AH / 2 + 16, "filter", size=9.5, anchor="middle")
add(f'<circle cx="{AX + 108:.1f}" cy="{AY + 10 + AH / 2:.1f}" r="34" fill="#ffffff" '
    f'stroke="{INK}" stroke-width="1.4"/>')
for a in range(8):
    an = a * math.pi / 4
    line(AX + 108, AY + 10 + AH / 2,
         AX + 108 + 30 * math.cos(an), AY + 10 + AH / 2 + 30 * math.sin(an), sw=0.9)
text(AX + 108, AY + AH + 4, "EC-vifte", size=9.5, anchor="middle")
rect(AX + 156, AY + 22, 46, AH - 24, fill="#f7ded2")
text(AX + 179, AY + AH / 2 + 16, "PTC", size=10, anchor="middle", fill=AIR_WARM)
line(AX + 232, AY + 24, AX + 276, AY + AH - 2, sw=2.0)
text(AX + 254, AY + AH + 4, "spjeld", size=9.5, anchor="middle")
rect(AX + 300, AY + 34, 60, 40, fill="#e3ecf1")
text(AX + 330, AY + 58, "SHT40", size=9.5, anchor="middle", fill=AIR_WET)
rect(AX + 300, AY + 96, 60, 40, fill="#f7ded2")
text(AX + 330, AY + 120, "NTC", size=9.5, anchor="middle", fill=AIR_WARM)
rect(AX + 386, AY + 26, 72, AH - 32, fill="#ffffff")
text(AX + 422, AY + 84, "PCBA", size=10, anchor="middle")
path(f"M {AX - 60} {AY + 46} L {AX - 6} {AY + 46}", stroke=AIR_WARM, sw=2.2, marker="arw")
text(AX - 62, AY + 30, "romluft inn", size=10, anchor="end", fill=AIR_WARM)
path(f"M {AX + AW - 4} {AY + AH - 16} L {AX + AW + 46} {AY + AH - 16}",
     stroke=AIR_WET, sw=2.4, marker="arb")
text(AX + AW + 50, AY + AH - 20, "avtrekk", size=10, fill=AIR_WET)
dim_h(AX, AX + AW, AY + AH + 40, "320")

# ============================================================ NOTELISTE
NX, NY = 150.0, 866.0
text(NX, NY, "POSISJONER", size=13, weight="700")
notes = [
    "1  Hengerskinne O16 mm, 8 glidekroker, maks 12 kg fordelt",
    "2  Ytterduk 210D ripstop m/TPU-laminat, FR-behandlet",
    "3  Rammerar alu 6063-T5, O22 x 1,2 mm, klaranodisert",
    "4  Fordelingsplenum PA12 (MJF) med 6 dyseporter",
    "5  Klimamodul, kamlaser 2 x 90 gr. + jordet blindkontakt",
    "6  Fotmodul med lasbart hjul, 6 mm nivajustering",
]
for i, n in enumerate(notes):
    text(NX, NY + 22 + i * 19, n, size=11.5)

NX2 = 610.0
text(NX2, NY, "KONSTRUKSJONSDATA", size=13, weight="700")
data = [
    "Utfoldet 640 x 640 x 1780 mm - sammenlagt 780 x 220 x 180 mm",
    "Vekt 8,4 kg (ramme og duk 5,9 kg / klimamodul 2,5 kg)",
    "Luftmengde 145 m3/h fritt, 95 m3/h ved 60 Pa systemtrykk",
    "Effekt 724 W maks (PTC 700 W), 3,15 A ved 230 V, klasse I, IPX2",
    "Temperatur ved plagg 32-38 C, NTC-kutt 55 C, termosikring 78/98 C",
    "Kapasitet 4 kg vatt toy (ca. 0,8 l fritt vann) - syklus ca. 90 min",
]
for i, n in enumerate(data):
    text(NX2, NY + 22 + i * 19, n, size=11.5)

# ============================================================ TITTELFELT
TX, TY, TW, TH = 1180.0, 866.0, 442.0, 200.0
rect(TX, TY - 18, TW, TH - 18, fill="none", sw=1.6)
line(TX, TY + 34, TX + TW, TY + 34, sw=1.2)
line(TX, TY + 96, TX + TW, TY + 96, sw=1.2)
line(TX + 250, TY + 34, TX + 250, TY + TH - 18, sw=1.2)
text(TX + 14, TY + 12, "TORKA T1", size=22, weight="700")
text(TX + 14, TY + 58, "Konseptriss, hovedmal og luftvei", size=12)
text(TX + 14, TY + 78, "Sammenleggbart torkerom", size=12)
text(TX + 14, TY + 118, "Alle mal i mm", size=11.5)
text(TX + 14, TY + 137, "Generelle toleranser ISO 2768-m", size=11.5)
text(TX + 14, TY + 156, "Malestokk der annet ikke er angitt: 1:12", size=11.5)
text(TX + 262, TY + 58, "Rev. A", size=12, weight="600")
text(TX + 262, TY + 78, "Ark 1 av 1", size=12)
text(TX + 262, TY + 118, "Tredje vinkels projeksjon", size=11)
text(TX + 262, TY + 137, "Status: konsept /", size=11)
text(TX + 262, TY + 156, "ikke for produksjon", size=11)

add("</svg>")

out = Path(__file__).resolve().parent.parent / "figurer" / "torka-t1-tegning.svg"
out.write_text("\n".join(parts), encoding="utf-8")
print(f"skrev {out} ({out.stat().st_size} bytes)")
