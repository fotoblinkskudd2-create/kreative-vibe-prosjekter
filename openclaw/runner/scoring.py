"""Scoringsmodell for REGNVIKING-30H-MAX.

Vektet 0-10-score per idé/deliverable. Aksene og vektene leses fra
config/regnviking-30h.json slik at modellen kan justeres uten kodeendring.
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Akse:
    id: str
    vekt: float
    beskrivelse: str = ""


@dataclass
class Score:
    navn: str
    verdier: dict[str, float] = field(default_factory=dict)
    total: float = 0.0
    dom: str = ""
    begrunnelse: str = ""


def akser_fra_config(config: dict) -> list[Akse]:
    return [Akse(a["id"], float(a["vekt"]), a.get("beskrivelse", "")) for a in config["scoring"]["akser"]]


def score_ide(navn: str, verdier: dict[str, float], config: dict, begrunnelse: str = "") -> Score:
    """Vektet snitt. Manglende akse = 0. Ukjent akse = feil (fanger skrivefeil)."""
    akser = akser_fra_config(config)
    kjente = {a.id for a in akser}
    ukjente = set(verdier) - kjente
    if ukjente:
        raise ValueError(f"Ukjente akser for '{navn}': {sorted(ukjente)}. Gyldige: {sorted(kjente)}")

    total = 0.0
    for akse in akser:
        v = float(verdier.get(akse.id, 0.0))
        if not 0.0 <= v <= 10.0:
            raise ValueError(f"Akse '{akse.id}' for '{navn}' er {v}; må være 0-10.")
        total += v * akse.vekt

    total = round(total, 2)
    terskler = config["scoring"]["terskler"]
    if total >= terskler["bygg_naa"]:
        dom = "BYGG NÅ"
    elif total >= terskler["parker_men_noter"]:
        dom = "PARKER + NOTER"
    else:
        dom = "DREP"

    return Score(navn=navn, verdier=dict(verdier), total=total, dom=dom, begrunnelse=begrunnelse)


def ranger(scores: list[Score]) -> list[Score]:
    return sorted(scores, key=lambda s: s.total, reverse=True)


def som_markdown_tabell(scores: list[Score], config: dict) -> str:
    akser = akser_fra_config(config)
    hode = "| Idé | " + " | ".join(a.id for a in akser) + " | Total | Dom |"
    strek = "|" + "---|" * (len(akser) + 3)
    rader = []
    for s in ranger(scores):
        celler = [f"{float(s.verdier.get(a.id, 0)):g}" for a in akser]
        rader.append(f"| {s.navn} | " + " | ".join(celler) + f" | **{s.total:.2f}** | {s.dom} |")
    return "\n".join([hode, strek, *rader])
