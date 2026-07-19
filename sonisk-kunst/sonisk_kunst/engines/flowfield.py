"""Strømningsfelt: partikler driver gjennom et vektorfelt formet av spektret.

Centroid styrer feltets turbulens, chroma velger farge langs hver bane,
RMS styrer strekenes tyngde. Hele lydfilen tegnes som ett samlet bilde.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

from ..dsp import AudioFeatures
from ..palette import color


def _field_angle(x: np.ndarray, y: np.ndarray, turbulence: float, phase: float) -> np.ndarray:
    """Pseudo-tilfeldig men glatt vinkel-felt bygget av sinusbølger."""
    return (
        np.sin(x * (1.5 + 2.5 * turbulence) + phase)
        + np.cos(y * (2.0 + 3.0 * turbulence) - phase * 0.7)
        + 0.5 * np.sin((x + y) * 1.3 * (1 + turbulence))
    ) * np.pi


def render_flowfield(feat: AudioFeatures, out_path: str | Path,
                     n_streams: int = 900, steps: int = 140,
                     size: int = 2000, seed: int = 7) -> Path:
    rng = np.random.default_rng(seed)
    fig, ax = plt.subplots(figsize=(size / 200, size / 200), facecolor="black")
    ax.set_facecolor("black")
    ax.axis("off")
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)

    # Hver strøm starter på et tidspunkt i lyden og arver egenskapene derfra
    start_frames = np.linspace(0, feat.n_frames - 1, n_streams).astype(int)
    x = rng.uniform(0, 10, n_streams)
    y = rng.uniform(0, 10, n_streams)

    mean_centroid = feat.centroid.mean() or 1.0

    for i in range(n_streams):
        fi = start_frames[i]
        energy = feat.rms[fi]
        turbulence = float(np.clip(feat.centroid[fi] / (2 * mean_centroid), 0, 1))
        pitch = int(np.argmax(feat.chroma[:, fi]))
        phase = 2 * np.pi * fi / feat.n_frames

        px, py = [x[i]], [y[i]]
        cx, cy = x[i], y[i]
        step_len = 0.035 + 0.05 * energy
        for _ in range(steps):
            angle = _field_angle(np.array(cx), np.array(cy), turbulence, phase)
            cx += step_len * np.cos(angle)
            cy += step_len * np.sin(angle)
            if not (0 <= cx <= 10 and 0 <= cy <= 10):
                break
            px.append(float(cx))
            py.append(float(cy))

        if len(px) < 3:
            continue
        rgb = color(pitch, feat.key_is_minor, energy, depth=0.3 + 0.7 * (fi / feat.n_frames))
        ax.plot(px, py, color=rgb, linewidth=0.3 + 1.6 * energy,
                alpha=float(0.12 + 0.3 * energy), solid_capstyle="round")

    ax.text(5, 0.25, f"{feat.key}  ·  {feat.tempo_bpm:.0f} BPM",
            color="0.55", fontsize=9, ha="center", fontfamily="monospace")

    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out_path, dpi=200, facecolor="black", bbox_inches="tight", pad_inches=0.1)
    plt.close(fig)
    return out_path
