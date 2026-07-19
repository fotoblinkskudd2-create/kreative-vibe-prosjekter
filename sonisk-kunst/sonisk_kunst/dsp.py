"""Signalanalyse: STFT, spektral centroid, RMS, onsets, chroma, tempo.

Alt implementert direkte på numpy/scipy slik at systemet kjører uten librosa.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import get_window

N_FFT = 2048
HOP = 512

PITCH_CLASSES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Krumhansl-Schmuckler toneartsprofiler
_MAJOR_PROFILE = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_MINOR_PROFILE = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])


@dataclass
class AudioFeatures:
    sr: int
    duration: float
    rms: np.ndarray                # (frames,) energi per frame, normalisert 0..1
    centroid: np.ndarray           # (frames,) spektral centroid i Hz
    chroma: np.ndarray             # (12, frames) pitch-klasse-energi
    onset_strength: np.ndarray     # (frames,) spektral fluks
    onsets: np.ndarray             # frame-indekser for detekterte onsets
    tempo_bpm: float
    key: str                       # f.eks. "A minor"
    key_is_minor: bool
    frame_times: np.ndarray = field(default=None)

    @property
    def n_frames(self) -> int:
        return len(self.rms)

    def at_time(self, t: float) -> int:
        """Nærmeste frame-indeks for tidspunkt t (sekunder)."""
        return int(np.clip(t * self.sr / HOP, 0, self.n_frames - 1))


def load_wav(path: str | Path) -> tuple[np.ndarray, int]:
    """Les WAV som mono float i [-1, 1]."""
    sr, y = wavfile.read(path)
    y = y.astype(np.float64)
    if y.ndim > 1:
        y = y.mean(axis=1)
    peak = np.abs(y).max()
    if peak > 0:
        y /= peak
    return y, sr


def stft_mag(y: np.ndarray, n_fft: int = N_FFT, hop: int = HOP) -> np.ndarray:
    """Magnitude-spektrogram (bins, frames)."""
    window = get_window("hann", n_fft)
    n_frames = max(1, 1 + (len(y) - n_fft) // hop)
    frames = np.lib.stride_tricks.as_strided(
        y,
        shape=(n_frames, n_fft),
        strides=(y.strides[0] * hop, y.strides[0]),
    )
    return np.abs(np.fft.rfft(frames * window, axis=1)).T


def _spectral_centroid(S: np.ndarray, sr: int) -> np.ndarray:
    freqs = np.fft.rfftfreq(N_FFT, 1 / sr)[:, None]
    energy = S.sum(axis=0)
    energy[energy == 0] = 1e-12
    return (freqs * S).sum(axis=0) / energy


def _chroma(S: np.ndarray, sr: int) -> np.ndarray:
    """Fold FFT-bins ned til 12 pitch-klasser."""
    freqs = np.fft.rfftfreq(N_FFT, 1 / sr)
    chroma = np.zeros((12, S.shape[1]))
    valid = freqs > 20
    midi = 69 + 12 * np.log2(freqs[valid] / 440.0)
    pc = np.round(midi).astype(int) % 12
    S_valid = S[valid]
    for k in range(12):
        rows = pc == k
        if rows.any():
            chroma[k] = S_valid[rows].sum(axis=0)
    norm = chroma.max(axis=0)
    norm[norm == 0] = 1e-12
    return chroma / norm


def _onset_strength(S: np.ndarray) -> np.ndarray:
    """Spektral fluks: summert positiv endring mellom frames."""
    log_S = np.log1p(S)
    flux = np.diff(log_S, axis=1, prepend=log_S[:, :1])
    return np.maximum(flux, 0).sum(axis=0)


def _detect_onsets(strength: np.ndarray, sr: int) -> np.ndarray:
    """Toppunkter i onset-styrke over adaptiv terskel."""
    if strength.max() <= 0:
        return np.array([], dtype=int)
    s = strength / strength.max()
    win = max(1, int(0.1 * sr / HOP))
    kernel = np.ones(2 * win + 1) / (2 * win + 1)
    local_mean = np.convolve(s, kernel, mode="same")
    threshold = local_mean + 0.07
    peaks = []
    min_gap = max(1, int(0.05 * sr / HOP))
    last = -min_gap
    for i in range(1, len(s) - 1):
        if s[i] > threshold[i] and s[i] >= s[i - 1] and s[i] >= s[i + 1] and i - last >= min_gap:
            peaks.append(i)
            last = i
    return np.array(peaks, dtype=int)


def _estimate_tempo(strength: np.ndarray, sr: int) -> float:
    """Tempo via autokorrelasjon av onset-styrken, begrenset til 40-200 BPM."""
    s = strength - strength.mean()
    if not s.any():
        return 0.0
    ac = np.correlate(s, s, mode="full")[len(s) - 1:]
    frame_rate = sr / HOP
    lag_min = int(frame_rate * 60 / 200)
    lag_max = min(len(ac) - 1, int(frame_rate * 60 / 40))
    if lag_max <= lag_min:
        return 0.0
    best_lag = lag_min + int(np.argmax(ac[lag_min:lag_max]))
    return 60.0 * frame_rate / best_lag


def _estimate_key(chroma: np.ndarray) -> tuple[str, bool]:
    """Krumhansl-Schmuckler toneartsestimat fra gjennomsnittlig chroma."""
    mean_chroma = chroma.mean(axis=1)
    best_score, best_key, best_minor = -np.inf, "C", False
    for shift in range(12):
        rolled = np.roll(mean_chroma, -shift)
        for profile, is_minor in ((_MAJOR_PROFILE, False), (_MINOR_PROFILE, True)):
            score = np.corrcoef(rolled, profile)[0, 1]
            if score > best_score:
                best_score, best_key, best_minor = score, PITCH_CLASSES[shift], is_minor
    return f"{best_key} {'minor' if best_minor else 'major'}", best_minor


def analyze(path: str | Path) -> AudioFeatures:
    """Full analysepipeline for en WAV-fil."""
    y, sr = load_wav(path)
    S = stft_mag(y, N_FFT, HOP)

    window = get_window("hann", N_FFT)
    n_frames = S.shape[1]
    frames = np.lib.stride_tricks.as_strided(
        y, shape=(n_frames, N_FFT), strides=(y.strides[0] * HOP, y.strides[0])
    )
    rms = np.sqrt((frames**2).mean(axis=1))
    if rms.max() > 0:
        rms = rms / rms.max()

    strength = _onset_strength(S)
    chroma = _chroma(S, sr)
    key, is_minor = _estimate_key(chroma)

    return AudioFeatures(
        sr=sr,
        duration=len(y) / sr,
        rms=rms,
        centroid=_spectral_centroid(S, sr),
        chroma=chroma,
        onset_strength=strength,
        onsets=_detect_onsets(strength, sr),
        tempo_bpm=_estimate_tempo(strength, sr),
        key=key,
        key_is_minor=is_minor,
        frame_times=np.arange(n_frames) * HOP / sr,
    )
