"""Radiell mandala: hver frame i lyden blir en ring, chroma styrer farge.

Inspirert av cymatikk — hele stykkets tidsforløp leses innenfra og ut.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from ..dsp import AudioFeatures
from ..palette import color


def render_mandala(feat: AudioFeatures, out_path: str | Path,
                   symmetry: int = 8, points_per_ring: int = 720,
                   size: int = 2000) -> Path:
    fig, ax = plt.subplots(figsize=(size / 200, size / 200), facecolor="black")
    ax.set_facecolor("black")
    ax.set_aspect("equal")
    ax.axis("off")

    n = feat.n_frames
    # Nedskaler til maks 240 ringer for lesbarhet
    ring_idx = np.linspace(0, n - 1, min(n, 240)).astype(int)
    theta = np.linspace(0, 2 * np.pi, points_per_ring, endpoint=False)

    onset_set = set(feat.onsets.tolist())

    for ring_no, fi in enumerate(ring_idx):
        r_base = 0.15 + 0.85 * ring_no / len(ring_idx)
        energy = feat.rms[fi]
        centroid_norm = np.clip(feat.centroid[fi] / (feat.sr / 4), 0, 1)
        pitch = int(np.argmax(feat.chroma[:, fi]))

        # Radiusmodulasjon: centroid gir detaljfrekvens, energi gir amplitude
        lobes = symmetry * (1 + int(centroid_norm * 3))
        wobble = 0.04 * energy * np.sin(lobes * theta + ring_no * 0.15)
        r = r_base + wobble

        rgb = color(pitch, feat.key_is_minor, energy, depth=ring_no / len(ring_idx))
        lw = 0.4 + 2.2 * energy
        alpha = 0.25 + 0.6 * energy

        ax.plot(r * np.cos(theta), r * np.sin(theta),
                color=rgb, linewidth=lw, alpha=float(alpha), solid_capstyle="round")

        # Onsets markeres som lyspunkter på ringen
        if fi in onset_set or any(abs(fi - o) <= 1 for o in feat.onsets):
            spikes = theta[::points_per_ring // symmetry]
            ax.scatter(r_base * np.cos(spikes), r_base * np.sin(spikes),
                       s=18 * (0.5 + energy), color="white", alpha=0.85, zorder=5,
                       linewidths=0)

    lim = 1.08
    ax.set_xlim(-lim, lim)
    ax.set_ylim(-lim, lim)
    ax.text(0, -1.04, f"{feat.key}  ·  {feat.tempo_bpm:.0f} BPM  ·  {feat.duration:.0f}s",
            color="0.6", fontsize=9, ha="center", fontfamily="monospace")

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, dpi=200, facecolor="black", bbox_inches="tight", pad_inches=0.1)
    plt.close(fig)
    return out_path
