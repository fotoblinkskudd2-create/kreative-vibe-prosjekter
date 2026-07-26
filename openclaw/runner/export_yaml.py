"""Minimal YAML-emitter (stdlib only) for OpenClaw-config.

Bruker PyYAML hvis det finnes, ellers en innebygd emitter som dekker
den datatypen configen faktisk består av: dict / list / str / tall / bool / None.
"""

from __future__ import annotations

_MAA_SITERES = set(":{}[],&*#?|-<>=!%@`\"'")


def _skalar(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return str(v)
    s = str(v)
    if not s:
        return '""'
    trenger = (
        s[0] in _MAA_SITERES
        or ": " in s
        or " #" in s
        or s.strip() != s
        or s.lower() in {"true", "false", "null", "yes", "no", "on", "off"}
    )
    if trenger:
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    return s


def _emit(data, innrykk: int, linjer: list[str]) -> None:
    pad = "  " * innrykk
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)) and v:
                linjer.append(f"{pad}{k}:")
                _emit(v, innrykk + 1, linjer)
            elif isinstance(v, (dict, list)):
                linjer.append(f"{pad}{k}: {'{}' if isinstance(v, dict) else '[]'}")
            else:
                linjer.append(f"{pad}{k}: {_skalar(v)}")
    elif isinstance(data, list):
        for v in data:
            if isinstance(v, dict) and v:
                nye: list[str] = []
                _emit(v, innrykk + 1, nye)
                forste = nye[0].lstrip()
                linjer.append(f"{pad}- {forste}")
                linjer.extend(nye[1:])
            elif isinstance(v, list) and v:
                linjer.append(f"{pad}-")
                _emit(v, innrykk + 1, linjer)
            else:
                linjer.append(f"{pad}- {_skalar(v)}")


def til_yaml(data) -> str:
    try:
        import yaml  # type: ignore

        return yaml.safe_dump(data, allow_unicode=True, sort_keys=False, default_flow_style=False)
    except ImportError:
        linjer: list[str] = []
        _emit(data, 0, linjer)
        return "\n".join(linjer) + "\n"
