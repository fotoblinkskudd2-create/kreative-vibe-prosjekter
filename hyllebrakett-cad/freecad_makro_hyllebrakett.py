# -*- coding: utf-8 -*-
"""FreeCAD-makro: genererer hyllebrakett HB-250 (se README.md for underlag).

Kjøres fra FreeCAD: Macro -> Macros -> Execute, eller lim inn i Python-konsollen.
Koordinatsystem: origo i nedre bakre hjørne av veggplaten.
X = ut fra vegg, Y = sideveis, Z = opp. Alle mål i mm.
"""

import FreeCAD as App
import Part

# --- Parametre (endres ved variantbygging; oppdater beregningene tilsvarende) ---
T = 5.0          # platetykkelse
B_PLATE = 50.0   # veggplate bredde
H_PLATE = 200.0  # veggplate høyde
B_ARM = 40.0     # bærearm bredde
L_ARM = 250.0    # bærearm lengde (utstikk fra veggplatens front)
L_RIB = 180.0    # ribbe, horisontal katet
H_RIB = 150.0    # ribbe, vertikal katet

D_WALL_HOLE = 6.6    # veggfestehull (6 mm skrue)
D_SHELF_HOLE = 4.5   # hyllefestehull (4,2 mm treskrue)
WALL_HOLES = [(12.0, 30.0), (38.0, 30.0), (12.0, 170.0), (38.0, 170.0)]  # (Y, Z)
SHELF_HOLES_X = [60.0, 200.0]  # målt fra veggflaten (X=0), Y = 15
SHELF_HOLE_Y = 15.0

doc = App.newDocument("Hyllebrakett_HB250")

# --- POS 1: Veggplate (flat mot vegg, tykkelse i X) ---
plate = Part.makeBox(T, B_PLATE, H_PLATE)
for y, z in WALL_HOLES:
    drill = Part.makeCylinder(D_WALL_HOLE / 2, T + 2,
                              App.Vector(-1, y, z), App.Vector(1, 0, 0))
    plate = plate.cut(drill)
obj = doc.addObject("Part::Feature", "POS1_Veggplate")
obj.Shape = plate

# --- POS 2: Bærearm (topp flush med veggplatens overkant) ---
arm = Part.makeBox(L_ARM, B_ARM, T,
                   App.Vector(T, (B_PLATE - B_ARM) / 2, H_PLATE - T))
for x in SHELF_HOLES_X:
    drill = Part.makeCylinder(D_SHELF_HOLE / 2, T + 2,
                              App.Vector(x, SHELF_HOLE_Y, H_PLATE - T - 1),
                              App.Vector(0, 0, 1))
    arm = arm.cut(drill)
    # Forsenkning Ø9 x 90° fra undersiden
    sink = Part.makeCone(4.5, 0.0, 4.5,
                         App.Vector(x, SHELF_HOLE_Y, H_PLATE - T),
                         App.Vector(0, 0, 1))
    arm = arm.cut(sink)
obj = doc.addObject("Part::Feature", "POS2_Baerearm")
obj.Shape = arm

# --- POS 3: Trekantribbe (staar paa hoykant, sentrert i bredden) ---
y0 = (B_PLATE - T) / 2
p1 = App.Vector(T, y0, H_PLATE - T)            # innerhjorne
p2 = App.Vector(T + L_RIB, y0, H_PLATE - T)    # ut langs armens underside
p3 = App.Vector(T, y0, H_PLATE - T - H_RIB)    # ned langs veggplaten
face = Part.Face(Part.makePolygon([p1, p2, p3, p1]))
rib = face.extrude(App.Vector(0, T, 0))
obj = doc.addObject("Part::Feature", "POS3_Ribbe")
obj.Shape = rib

doc.recompute()

try:
    import FreeCADGui
    FreeCADGui.ActiveDocument.ActiveView.viewIsometric()
    FreeCADGui.SendMsgToActiveView("ViewFit")
except ImportError:
    pass  # kjørt uten GUI (freecadcmd)

print("Hyllebrakett HB-250 generert: 3 deler, total vekt ca. 1,31 kg (S235JR)")
