"""Demolyd-syntese slik at systemet kan demonstreres uten eksterne lydfiler.

Genererer en kort drone-komposisjon: lagdelte overtoner, langsom LFO,
perkussive pulser for onset/tempo-deteksjon.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from scipy.io import wavfile


def drone_piece(path: str | Path, duration: float = 24.0, sr: int = 22050,
                root_hz: float = 110.0, bpm: float = 72.0, seed: int = 42) -> Path:
    rng = np.random.default_rng(seed)
    t = np.arange(int(duration * sr)) / sr
    y = np.zeros_like(t)

    # Dronelag: grunntone + kvint + liten ters (A-moll-farge) med sakte LFO-er
    ratios = [1.0, 1.5, 1.2, 2.0, 3.0]
    for i, ratio in enumerate(ratios):
        lfo = 0.5 + 0.5 * np.sin(2 * np.pi * (0.05 + 0.03 * i) * t + rng.uniform(0, 2 * np.pi))
        detune = 1 + 0.001 * np.sin(2 * np.pi * 0.11 * t + i)
        y += (0.5 / (i + 1)) * lfo * np.sin(2 * np.pi * root_hz * ratio * detune * t)

    # Perkussive pulser på beatet: kort eksponentielt dempet støy + klikk
    beat_period = 60.0 / bpm
    for beat_start in np.arange(0.5, duration - 0.5, beat_period):
        idx = int(beat_start * sr)
        length = int(0.08 * sr)
        env = np.exp(-np.arange(length) / (0.015 * sr))
        burst = env * (0.6 * rng.standard_normal(length) * 0.3
                       + 0.7 * np.sin(2 * np.pi * 880 * np.arange(length) / sr))
        y[idx:idx + length] += 0.8 * burst

    # Langsom dynamisk bue over hele stykket
    y *= 0.4 + 0.6 * np.sin(np.pi * t / duration) ** 2

    y /= np.abs(y).max()
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    wavfile.write(path, sr, (y * 32767).astype(np.int16))
    return path


if __name__ == "__main__":
    out = drone_piece("demo/drone_a_moll.wav")
    print(f"Skrev {out}")
