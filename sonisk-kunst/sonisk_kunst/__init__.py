"""Sonisk Kunst — lyd til algoritmisk kunst. Ren numpy/scipy, ingen librosa."""

__version__ = "1.0.0"

from .dsp import AudioFeatures, analyze
from .palette import palette_for

__all__ = ["AudioFeatures", "analyze", "palette_for"]
