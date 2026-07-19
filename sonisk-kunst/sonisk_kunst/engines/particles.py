"""Partikkelsystem: onsets skyter partikler ut fra en tidsakse.

Tiden løper venstre → høyre. Hvert onset eksploderer i partikler hvis
hastighet følger energien og farge følger chroma. RMS tegnes som midtbånd.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from ..dsp import AudioFeatures, HOP
from ..palette import color


def render_particles(feat: AudioFeatures, out_path: str | Path,
                     particles_per_onset: int = 90, size: int = 2400,
                     seed: int = 3) -> Path:
    rng = np.random.default_rng(seed)
    fig, ax = plt.subplots(figsize=(size / 200, size / 400), facecolor="black")
    ax.set_facecolor("black")
    ax.axis("off")
    ax.set_xlim(0, feat.duration)
    ax.set_ylim(-1.1, 1.1)

    # Midtbånd: RMS-konvolutt speilet rundt null
    t = feat.frame_times
    band = 0.35 * feat.rms
    base_pitch = int(np.argmax(feat.chroma.mean(axis=1)))
    band_rgb = color(base_pitch, feat.key_is_minor, 0.6, depth=0.35)
    ax.fill_between(t, -band, band, color=band_rgb, alpha=0.35, linewidth=0)
    ax.plot(t, band, color=band_rgb, alpha=0.8, linewidth=0.8)
    ax.plot(t, -band, color=band_rgb, alpha=0.8, linewidth=0.8)

    # Partikkeleksplosjon per onset
    for fi in feat.onsets:
        t0 = fi * HOP / feat.sr
        energy = feat.rms[fi]
        pitch = int(np.argmax(feat.chroma[:, fi]))
        n = int(particles_per_onset * (0.4 + energy))

        angles = rng.uniform(0, 2 * np.pi, n)
        speed = rng.rayleigh(0.25 + 0.55 * energy, n)
        life = rng.uniform(0.3, 1.0, n)

        px = t0 + 0.12 * speed * np.cos(angles) * life * feat.duration / 20
        py = speed * np.sin(angles) * life

        rgb = color(pitch, feat.key_is_minor, energy, depth=0.8)
        sizes = 14 * life * (0.4 + energy)
        ax.scatter(px, py, s=sizes, color=rgb, alpha=0.5, linewidths=0)
        ax.scatter([t0], [0], s=40 * (0.5 + energy), color="white", alpha=0.9,
                   linewidths=0, zorder=5)

    ax.text(feat.duration / 2, -1.05,
            f"{feat.key}  ·  {feat.tempo_bpm:.0f} BPM  ·  {len(feat.onsets)} onsets",
            color="0.55", fontsize=9, ha="center", fontfamily="monospace")

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, dpi=200, facecolor="black", bbox_inches="tight", pad_inches=0.1)
    plt.close(fig)
    return out_path
