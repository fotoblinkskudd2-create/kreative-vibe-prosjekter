#!/usr/bin/env python3
"""REGNVIKING-30H-MAX — orchestrator-runner.

Holder state for en 30-timers loop: sykluser, agent-rotasjon, verdi-score,
carry-over og sluttrapport. Ingen eksterne avhengigheter (kun stdlib).

Bruk:
    python3 openclaw/runner/openclaw.py init
    python3 openclaw/runner/openclaw.py status
    python3 openclaw/runner/openclaw.py prompt          # copy-paste prompt for neste syklus
    python3 openclaw/runner/openclaw.py start
    python3 openclaw/runner/openclaw.py end --verdi 8 --neste "riblet-CFD" \
        --deliverable "Riblet-kalkulator v0" --deliverable "Suno pack" --carry "STL-eksport"
    python3 openclaw/runner/openclaw.py score openclaw/runner/ideer.eksempel.json
    python3 openclaw/runner/openclaw.py report
    python3 openclaw/runner/openclaw.py export-yaml
    python3 openclaw/runner/openclaw.py stop
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import scoring  # noqa: E402

ROT = Path(__file__).resolve().parents[2]
CONFIG_STI = ROT / "openclaw" / "config" / "regnviking-30h.json"
STATE_STI = ROT / "openclaw" / "logs" / "state.json"
LOGG_STI = ROT / "openclaw" / "logs" / "LOGG.md"
MEMORY_STI = ROT / "openclaw" / "memory" / "core-inputs.md"


# --------------------------------------------------------------------------- io

def last_config() -> dict:
    return json.loads(CONFIG_STI.read_text(encoding="utf-8"))


def last_state() -> dict:
    if not STATE_STI.exists():
        sys.exit("Ingen state. Kjør: openclaw.py init")
    return json.loads(STATE_STI.read_text(encoding="utf-8"))


def skriv_state(state: dict) -> None:
    STATE_STI.parent.mkdir(parents=True, exist_ok=True)
    STATE_STI.write_text(json.dumps(state, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def naa() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse(ts: str) -> datetime:
    return datetime.fromisoformat(ts)


# ---------------------------------------------------------------- agent-rotasjon

def velg_agenter(config: dict, state: dict, energi: int | None = None) -> list[str]:
    """Agent-miks for neste syklus etter reglene i config.

    - codex-msx er alltid med
    - maks N aktive
    - ingen sub-agent mer enn 3 sykluser på rad
    - ide-jakt minimum hver 3. syklus
    - panicsafe tvinges inn ved lav energi eller to svake sykluser
    """
    regler = config["agent_miks_regler"]
    maks = int(regler["maks_aktive_per_syklus"])
    alle = [s["id"] for s in config["superhuman_skills"]]
    obligatorisk = list(regler["obligatorisk"])

    historikk = [s.get("agenter", []) for s in state["sykluser"]]
    siste3 = historikk[-3:]

    def paa_rad(agent: str) -> int:
        n = 0
        for miks in reversed(historikk):
            if agent in miks:
                n += 1
            else:
                break
        return n

    def sist_kjort(agent: str) -> int:
        """Antall sykluser siden agenten sist var aktiv (stort tall = aldri)."""
        for avstand, miks in enumerate(reversed(historikk), start=1):
            if agent in miks:
                return avstand
        return 999

    valgt = [a for a in obligatorisk]

    if energi is None:
        energi = int(state.get("energi", 7))
    svake = [s for s in state["sykluser"][-2:] if s.get("verdi_score", 10) < 5]
    if (energi <= 4 or len(svake) == 2) and "panicsafe" in alle and "panicsafe" not in valgt:
        valgt.append("panicsafe")

    if "ide-jakt" in alle and "ide-jakt" not in valgt and sist_kjort("ide-jakt") >= 3:
        valgt.append("ide-jakt")

    # Fyll resten: minst nylig brukte først, hopp over de som har gått 3 på rad.
    kandidater = sorted(
        (a for a in alle if a not in valgt and paa_rad(a) < 3),
        key=lambda a: (-sist_kjort(a), a),
    )
    for a in kandidater:
        if len(valgt) >= maks:
            break
        valgt.append(a)

    del siste3  # kun for lesbarhet i feilsøking
    return valgt[:maks]


# ---------------------------------------------------------------- kommandoer

def cmd_init(args: argparse.Namespace) -> None:
    config = last_config()
    if STATE_STI.exists() and not args.force:
        sys.exit(f"State finnes allerede: {STATE_STI}. Bruk --force for å nullstille.")
    state = {
        "loop_id": config["loop"]["id"],
        "startet": naa(),
        "stoppet": None,
        "runtime_hours": config["loop"]["runtime_hours"],
        "target_cycles": config["loop"]["target_cycles"],
        "energi": args.energi,
        "aktiv_syklus": None,
        "sykluser": [],
        "carry_over": [],
        "patent_kandidater": [],
        "deliverables": [],
    }
    skriv_state(state)
    LOGG_STI.parent.mkdir(parents=True, exist_ok=True)
    if not LOGG_STI.exists():
        LOGG_STI.write_text(
            f"# {config['loop']['id']} — kjørelogg\n\nStartet: {state['startet']}\n\n", encoding="utf-8"
        )
    print(f"Initialisert {config['loop']['id']} — {state['target_cycles']} sykluser / {state['runtime_hours']}t.")
    print(f"State: {STATE_STI.relative_to(ROT)}")


def _tidsbudsjett(config: dict, state: dict) -> tuple[float, float]:
    gaatt = (datetime.now(timezone.utc) - parse(state["startet"])).total_seconds() / 3600
    igjen = max(0.0, float(state["runtime_hours"]) - gaatt)
    return round(gaatt, 2), round(igjen, 2)


def cmd_status(args: argparse.Namespace) -> None:
    config, state = last_config(), last_state()
    gaatt, igjen = _tidsbudsjett(config, state)
    ferdige = len(state["sykluser"])
    scores = [s["verdi_score"] for s in state["sykluser"] if s.get("verdi_score") is not None]
    snitt = round(sum(scores) / len(scores), 2) if scores else 0.0

    print(f"{state['loop_id']}")
    print(f"  Sykluser ferdig : {ferdige}/{state['target_cycles']}")
    print(f"  Tid             : {gaatt}t gått / {igjen}t igjen")
    print(f"  Snitt verdi     : {snitt}/10")
    print(f"  Energi          : {state['energi']}/10")
    print(f"  Deliverables    : {len(state['deliverables'])}")
    print(f"  Patentkandidater: {len(state['patent_kandidater'])}")
    if state["carry_over"]:
        print("  Carry-over      :")
        for c in state["carry_over"]:
            print(f"    - {c}")
    if state["aktiv_syklus"]:
        a = state["aktiv_syklus"]
        print(f"  AKTIV syklus {a['nr']} startet {a['startet']} | agenter: {', '.join(a['agenter'])}")
    if state["stoppet"]:
        print(f"  STOPPET: {state['stoppet']}")


def bygg_syklusprompt(config: dict, state: dict, agenter: list[str]) -> str:
    nr = len(state["sykluser"]) + 1
    gaatt, igjen = _tidsbudsjett(config, state)
    skills = {s["id"]: s for s in config["superhuman_skills"]}
    carry = state["carry_over"] or ["(ingen — fri jakt)"]
    forrige = state["sykluser"][-1] if state["sykluser"] else None

    linjer = [
        f"# {config['loop']['id']} — SYKLUS {nr}/{state['target_cycles']}",
        "",
        f"Tid: {gaatt}t gått, {igjen}t igjen. Energi: {state['energi']}/10.",
        f"Kvalitetsport: {config['loop']['quality_gate']}",
        f"Tone: {config['loop']['tone']}",
        "",
        "## Aktive sub-agenter denne syklusen",
    ]
    for a in agenter:
        s = skills[a]
        linjer.append(f"- **{s['navn']}** (`{a}`) — {', '.join(s['domene'])}")

    linjer += ["", "## Carry-over fra forrige syklus"]
    linjer += [f"- {c}" for c in carry]

    if forrige:
        linjer += [
            "",
            "## Forrige syklus",
            f"- Verdi: {forrige.get('verdi_score')}/10",
            f"- Neste fokus satt til: {forrige.get('neste_fokus')}",
            f"- Svakhet notert: {forrige.get('svakhet') or '—'}",
        ]

    linjer += ["", "## Faser (hold tiden)"]
    for f in config["faser"]:
        linjer.append(f"### {f['id']}. {f['navn']} ({f['minutter']} min)")
        for punkt in f.get("sjekkliste", []):
            linjer.append(f"- [ ] {punkt}")
        if "krav" in f:
            krav = ", ".join(f"{k}={v}" for k, v in f["krav"].items())
            linjer.append(f"- KRAV: {krav}")
        if "format" in f:
            linjer.append(f"- FORMAT: {f['format']}")

    linjer += [
        "",
        "## Scoring (bruk denne på alt du foreslår)",
        " | ".join(f"{a['id']} (v{a['vekt']})" for a in config["scoring"]["akser"]),
        f"Bygg nå >= {config['scoring']['terskler']['bygg_naa']} | "
        f"Parker >= {config['scoring']['terskler']['parker_men_noter']} | ellers drep.",
        "",
        "## Avslutt med",
        f"`Syklus {nr}/{state['target_cycles']} | Verdi levert: … | Neste fokus: …`",
    ]

    if MEMORY_STI.exists():
        linjer += ["", "---", "", MEMORY_STI.read_text(encoding="utf-8").strip()]

    return "\n".join(linjer)


def cmd_prompt(args: argparse.Namespace) -> None:
    config, state = last_config(), last_state()
    agenter = state["aktiv_syklus"]["agenter"] if state["aktiv_syklus"] else velg_agenter(config, state)
    print(bygg_syklusprompt(config, state, agenter))


def cmd_start(args: argparse.Namespace) -> None:
    config, state = last_config(), last_state()
    if state["stoppet"]:
        sys.exit("Loopen er stoppet. Kjør init --force for ny kjøring.")
    if state["aktiv_syklus"]:
        sys.exit(f"Syklus {state['aktiv_syklus']['nr']} er allerede aktiv. Kjør 'end' først.")
    if args.energi is not None:
        state["energi"] = args.energi

    agenter = args.agent or velg_agenter(config, state)
    nr = len(state["sykluser"]) + 1
    state["aktiv_syklus"] = {"nr": nr, "startet": naa(), "agenter": agenter}
    skriv_state(state)

    print(f"Syklus {nr}/{state['target_cycles']} startet. Agenter: {', '.join(agenter)}")
    print(f"Budsjett: {config['loop']['cycle_minutes']['default']} min\n")
    print(bygg_syklusprompt(config, state, agenter))


def cmd_end(args: argparse.Namespace) -> None:
    config, state = last_config(), last_state()
    aktiv = state["aktiv_syklus"]
    if not aktiv:
        sys.exit("Ingen aktiv syklus. Kjør 'start' først.")

    varighet = round((datetime.now(timezone.utc) - parse(aktiv["startet"])).total_seconds() / 60, 1)
    syklus = {
        "nr": aktiv["nr"],
        "agenter": aktiv["agenter"],
        "startet": aktiv["startet"],
        "avsluttet": naa(),
        "varighet_min": varighet,
        "verdi_score": args.verdi,
        "deliverables": args.deliverable or [],
        "neste_fokus": args.neste or "",
        "svakhet": args.svakhet or "",
        "patent": args.patent or [],
    }
    state["sykluser"].append(syklus)
    state["aktiv_syklus"] = None
    state["carry_over"] = args.carry or []
    state["deliverables"].extend(f"[S{aktiv['nr']}] {d}" for d in syklus["deliverables"])
    state["patent_kandidater"].extend(f"[S{aktiv['nr']}] {p}" for p in syklus["patent"])
    if args.energi is not None:
        state["energi"] = args.energi
    skriv_state(state)

    with LOGG_STI.open("a", encoding="utf-8") as f:
        f.write(
            f"## Syklus {syklus['nr']}/{state['target_cycles']} — {syklus['avsluttet']}\n"
            f"- Agenter: {', '.join(syklus['agenter'])}\n"
            f"- Varighet: {varighet} min\n"
            f"- Verdi levert: {args.verdi}/10\n"
            f"- Deliverables: {'; '.join(syklus['deliverables']) or '—'}\n"
            f"- Patent-notat: {'; '.join(syklus['patent']) or '—'}\n"
            f"- Svakhet: {syklus['svakhet'] or '—'}\n"
            f"- Neste fokus: {syklus['neste_fokus'] or '—'}\n\n"
        )

    print(f"Syklus {syklus['nr']} lukket ({varighet} min, verdi {args.verdi}/10).")

    svake = [s for s in state["sykluser"][-3:] if s.get("verdi_score", 10) < 5]
    if len(svake) == 3:
        print("ADVARSEL: 3 svake sykluser på rad — stopp-krav utløst. Gjør full ny MAX INPUT PULL.")
    _, igjen = _tidsbudsjett(config, state)
    if igjen <= 0:
        print("30 timer brukt opp. Kjør: openclaw.py report")


def cmd_score(args: argparse.Namespace) -> None:
    config = last_config()
    data = json.loads(Path(args.fil).read_text(encoding="utf-8"))
    scores = [
        scoring.score_ide(d["navn"], d["verdier"], config, d.get("begrunnelse", ""))
        for d in data["ideer"]
    ]
    print(scoring.som_markdown_tabell(scores, config))
    print()
    for s in scoring.ranger(scores):
        if s.begrunnelse:
            print(f"- **{s.navn}** ({s.total:.2f}, {s.dom}): {s.begrunnelse}")


def cmd_report(args: argparse.Namespace) -> None:
    config, state = last_config(), last_state()
    gaatt, igjen = _tidsbudsjett(config, state)
    scores = [s["verdi_score"] for s in state["sykluser"] if s.get("verdi_score") is not None]
    snitt = round(sum(scores) / len(scores), 2) if scores else 0.0
    topp = sorted(state["sykluser"], key=lambda s: s.get("verdi_score", 0), reverse=True)

    ut = [
        f"# {state['loop_id']} — sluttrapport",
        "",
        f"Startet {state['startet']} | {gaatt}t kjørt | {len(state['sykluser'])} sykluser | snitt verdi {snitt}/10",
        "",
        "## Topp 10 deliverables",
    ]
    ut += [f"{i}. {d}" for i, d in enumerate(state["deliverables"][:10], 1)] or ["_ingen registrert_"]
    ut += ["", "## Patent-kandidater"]
    ut += [f"- {p}" for p in state["patent_kandidater"]] or ["_ingen registrert_"]
    ut += ["", "## Sterkeste sykluser"]
    ut += [
        f"- Syklus {s['nr']} ({s.get('verdi_score')}/10, {', '.join(s['agenter'])}): "
        f"{'; '.join(s['deliverables']) or '—'}"
        for s in topp[:5]
    ]
    ut += ["", "## Åpen carry-over"]
    ut += [f"- {c}" for c in state["carry_over"]] or ["_tom_"]
    ut += [
        "",
        "## Fyll ut manuelt",
        "- Nye skills/agenter foreslått:",
        "- ROI-estimat:",
        "- Anbefalt neste 7-dagers plan:",
        "",
        f"_Gjenstående budsjett: {igjen}t_",
    ]
    tekst = "\n".join(ut) + "\n"
    sti = ROT / "openclaw" / "logs" / "sluttrapport.md"
    sti.write_text(tekst, encoding="utf-8")
    print(tekst)
    print(f"[skrevet til {sti.relative_to(ROT)}]")
    del config


def cmd_stop(args: argparse.Namespace) -> None:
    state = last_state()
    state["stoppet"] = naa()
    state["aktiv_syklus"] = None
    skriv_state(state)
    print("Loop stoppet. Kjør 'report' for sluttrapport.")


def cmd_export_yaml(args: argparse.Namespace) -> None:
    from export_yaml import til_yaml

    config = last_config()
    sti = ROT / "openclaw" / "config" / "regnviking-30h.yaml"
    sti.write_text(
        "# GENERERT av openclaw.py export-yaml — rediger regnviking-30h.json, ikke denne.\n"
        + til_yaml(config),
        encoding="utf-8",
    )
    print(f"Skrevet {sti.relative_to(ROT)}")


# ---------------------------------------------------------------- cli

def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(prog="openclaw", description="REGNVIKING-30H-MAX orchestrator")
    sub = p.add_subparsers(dest="kommando", required=True)

    s = sub.add_parser("init", help="nullstill og start ny 30t-kjøring")
    s.add_argument("--force", action="store_true")
    s.add_argument("--energi", type=int, default=7)
    s.set_defaults(func=cmd_init)

    sub.add_parser("status", help="hvor står loopen").set_defaults(func=cmd_status)
    sub.add_parser("prompt", help="skriv ut syklusprompt uten å starte").set_defaults(func=cmd_prompt)

    s = sub.add_parser("start", help="start neste syklus")
    s.add_argument("--agent", action="append", help="overstyr agent-miks (kan gjentas)")
    s.add_argument("--energi", type=int)
    s.set_defaults(func=cmd_start)

    s = sub.add_parser("end", help="lukk aktiv syklus")
    s.add_argument("--verdi", type=int, required=True, help="verdi levert 0-10")
    s.add_argument("--deliverable", action="append")
    s.add_argument("--patent", action="append")
    s.add_argument("--carry", action="append", help="carry-over til neste syklus")
    s.add_argument("--neste", help="neste fokus")
    s.add_argument("--svakhet", help="hva var svakt")
    s.add_argument("--energi", type=int)
    s.set_defaults(func=cmd_end)

    s = sub.add_parser("score", help="score ideer fra json")
    s.add_argument("fil")
    s.set_defaults(func=cmd_score)

    sub.add_parser("report", help="generer sluttrapport").set_defaults(func=cmd_report)
    sub.add_parser("stop", help="stopp loopen").set_defaults(func=cmd_stop)
    sub.add_parser("export-yaml", help="eksporter config til YAML").set_defaults(func=cmd_export_yaml)

    args = p.parse_args(argv)
    args.func(args)


if __name__ == "__main__":
    main()
