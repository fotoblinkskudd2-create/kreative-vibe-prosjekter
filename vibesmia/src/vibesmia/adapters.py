"""LLM-adaptere for VIBESMIA.

Agentene snakker med en `Hjerne` — enten den deterministiske
HeuristiskHjerne (kjører offline, ingen avhengigheter) eller
ClaudeHjerne (produksjon, krever `pip install anthropic` og
ANTHROPIC_API_KEY / `ant auth login`).
"""

from __future__ import annotations

import hashlib
import random
from typing import Protocol


class Hjerne(Protocol):
    def generer(self, rolle: str, oppgave: str) -> str: ...
    def skaar(self, rolle: str, tekst: str, kriterium: str) -> float: ...


class HeuristiskHjerne:
    """Deterministisk offline-hjerne. Samme input gir samme output,
    slik at demoen og testene er reproduserbare."""

    def __init__(self, froe: int = 42) -> None:
        self.froe = froe

    def _rng(self, *deler: str) -> random.Random:
        noekkel = hashlib.sha256("|".join(deler).encode()).hexdigest()
        return random.Random(f"{self.froe}:{noekkel}")

    def generer(self, rolle: str, oppgave: str) -> str:
        return f"[{rolle}] {oppgave}"

    def skaar(self, rolle: str, tekst: str, kriterium: str) -> float:
        return round(self._rng(rolle, tekst, kriterium).uniform(0.05, 0.95), 3)


class ClaudeHjerne:
    """Produksjonshjerne mot Claude API (Opus 4.8, adaptiv tenkning)."""

    def __init__(self, modell: str = "claude-opus-4-8") -> None:
        import anthropic  # valgfri avhengighet

        self._klient = anthropic.Anthropic()
        self._modell = modell

    def generer(self, rolle: str, oppgave: str) -> str:
        respons = self._klient.messages.create(
            model=self._modell,
            max_tokens=16000,
            thinking={"type": "adaptive"},
            output_config={"effort": "high"},
            system=f"Du er {rolle} i den kreative smia VIBESMIA. Svar på norsk, konkret og uten fyll.",
            messages=[{"role": "user", "content": oppgave}],
        )
        return next(b.text for b in respons.content if b.type == "text")

    def skaar(self, rolle: str, tekst: str, kriterium: str) -> float:
        respons = self._klient.messages.create(
            model=self._modell,
            max_tokens=1024,
            system=(
                f"Du er {rolle}. Vurder teksten mot kriteriet og svar KUN med "
                "et desimaltall mellom 0.0 og 1.0."
            ),
            messages=[{"role": "user", "content": f"Kriterium: {kriterium}\n\nTekst: {tekst}"}],
        )
        svar = next(b.text for b in respons.content if b.type == "text").strip()
        try:
            return max(0.0, min(1.0, float(svar)))
        except ValueError:
            return 0.5
