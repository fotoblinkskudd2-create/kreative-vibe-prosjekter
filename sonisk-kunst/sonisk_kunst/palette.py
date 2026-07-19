"""Harmonisk fargelogikk: toneart og pitch-klasse styrer paletten.

Dur → varm palett, moll → kald. Pitch-klasse roterer hue rundt kvintsirkelen
slik at harmonisk nære toner får beslektede farger.
"""

from __future__ import annotations

import colorsys

import numpy as np

# Kvintsirkel-rekkefølge for pitch-klassene C..B
_CIRCLE_OF_FIFTHS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
_PC_TO_CIRCLE = {pc: i for i, pc in enumerate(_CIRCLE_OF_FIFTHS)}


def pitch_hue(pitch_class: int, is_minor: bool) -> float:
    """Hue i [0,1) for en pitch-klasse. Moll forskyves mot blått/fiolett."""
    base = _PC_TO_CIRCLE[pitch_class % 12] / 12.0
    if is_minor:
        return (0.55 + 0.35 * base) % 1.0   # 0.55-0.90: blå → fiolett
    return (0.98 + 0.20 * base) % 1.0        # rundt rød → oransje → gul


def color(pitch_class: int, is_minor: bool, energy: float, depth: float = 0.5) -> tuple:
    """RGB-tuppel fra pitch, energi (metning) og lagdybde (lysstyrke)."""
    h = pitch_hue(pitch_class, is_minor)
    s = float(np.clip(0.55 + 0.45 * energy, 0, 1))
    v = float(np.clip(0.35 + 0.55 * depth, 0, 1))
    return colorsys.hsv_to_rgb(h, s, v)


def palette_for(is_minor: bool, n: int = 6) -> list[tuple]:
    """Sammenhengende palett for hele verket, forankret i toneartens modus."""
    hues = [(pitch_hue(pc, is_minor)) for pc in _CIRCLE_OF_FIFTHS[:n]]
    return [colorsys.hsv_to_rgb(h, 0.75, 0.85) for h in hues]
