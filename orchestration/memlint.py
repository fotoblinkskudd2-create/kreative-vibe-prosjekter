#!/usr/bin/env python3
"""Memory hygiene enforcement for the orchestration kernel.

Memory is only useful if it stays small, factual, and secret-free. This checks
the rules from policy.toml [memory] so drift fails a run instead of rotting
silently:

  * line budget per file
  * one fact per bullet, bounded length
  * ISO-8601 dates only
  * no credentials, ever

    ./memlint.py                 # lint the configured memory dir
    ./memlint.py path/to/file.md # lint specific files

Exit codes: 0 clean, 1 violations found, 2 bad usage.
"""

from __future__ import annotations

import argparse
import re
import sys
import tomllib
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable

DEFAULT_POLICY = Path(__file__).with_name("policy.toml")
REPO_ROOT = Path(__file__).resolve().parents[1]

# A date-shaped token that is *not* ISO-8601. Catches 29-07-2026, 07/29/2026.
NON_ISO_DATE = re.compile(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b")
ISO_DATE = re.compile(r"\b\d{4}-\d{2}-\d{2}\b")
HEADING = re.compile(r"^\s{0,3}#{1,6}\s")
BULLET = re.compile(r"^\s*[-*]\s+\S")


@dataclass(frozen=True)
class Finding:
    path: Path
    line: int
    rule: str
    message: str

    def render(self, root: Path) -> str:
        try:
            shown = self.path.relative_to(root)
        except ValueError:
            shown = self.path
        where = f"{shown}:{self.line}" if self.line else str(shown)
        return f"{where}: [{self.rule}] {self.message}"


def load_memory_policy(path: Path = DEFAULT_POLICY) -> dict[str, Any]:
    with path.open("rb") as fh:
        policy = tomllib.load(fh)
    if "memory" not in policy:
        raise RuntimeError(f"{path.name}: missing [memory] section")
    return policy["memory"]


def _strip_code_fences(lines: list[str]) -> list[bool]:
    """Return a per-line mask: True when the line sits inside a fenced block."""
    inside = False
    mask = []
    for line in lines:
        if line.lstrip().startswith("```"):
            mask.append(True)
            inside = not inside
            continue
        mask.append(inside)
    return mask


def check_file(path: Path, memory: dict[str, Any]) -> list[Finding]:
    findings: list[Finding] = []
    try:
        text = path.read_text(encoding="utf-8")
    except OSError as exc:
        return [Finding(path, 0, "unreadable", str(exc))]

    lines = text.splitlines()
    max_lines = int(memory.get("max_lines", 300))
    if len(lines) > max_lines:
        findings.append(
            Finding(
                path,
                len(lines),
                "budget",
                f"{len(lines)} lines exceeds the {max_lines}-line budget; compact or split it",
            )
        )

    patterns = [re.compile(p, re.IGNORECASE) for p in memory.get("secret_patterns", [])]
    in_fence = _strip_code_fences(lines)
    prose_files = set(memory.get("prose_files", []))
    require_bullets = bool(memory.get("require_bullet_entries", True))
    max_entry = int(memory.get("max_entry_chars", 200))
    is_prose = path.name in prose_files

    for number, line in enumerate(lines, start=1):
        # Secrets are unconditional — fenced blocks are not an escape hatch.
        for pattern in patterns:
            if pattern.search(line):
                findings.append(
                    Finding(
                        path,
                        number,
                        "secret",
                        f"matches forbidden pattern /{pattern.pattern}/ — memory never stores credentials",
                    )
                )
                break

        if in_fence[number - 1]:
            continue

        stripped = line.strip()
        if not stripped:
            continue

        if NON_ISO_DATE.search(stripped) and not ISO_DATE.search(stripped):
            findings.append(
                Finding(path, number, "date", "use ISO-8601 dates (YYYY-MM-DD)")
            )

        if is_prose or HEADING.match(line) or stripped.startswith(">"):
            continue

        if require_bullets and not BULLET.match(line):
            findings.append(
                Finding(
                    path,
                    number,
                    "format",
                    "entries must be one fact per '- ' bullet (headings and quotes excepted)",
                )
            )
            continue

        if BULLET.match(line) and len(stripped) > max_entry:
            findings.append(
                Finding(
                    path,
                    number,
                    "length",
                    f"entry is {len(stripped)} chars, over the {max_entry}-char limit; split it",
                )
            )

    return findings


def collect_targets(memory: dict[str, Any], paths: Iterable[Path]) -> list[Path]:
    explicit = [p for p in paths]
    if explicit:
        return explicit
    directory = REPO_ROOT / str(memory.get("dir", "memory"))
    if not directory.is_dir():
        return []
    return sorted(directory.glob("*.md"))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Lint kernel memory files.")
    parser.add_argument("paths", nargs="*", type=Path, help="Files to lint.")
    parser.add_argument("--policy", type=Path, default=DEFAULT_POLICY)
    args = parser.parse_args(argv)

    try:
        memory = load_memory_policy(args.policy)
    except (OSError, RuntimeError, tomllib.TOMLDecodeError) as exc:
        print(f"memlint: {exc}", file=sys.stderr)
        return 2

    targets = collect_targets(memory, args.paths)
    if not targets:
        print("memlint: no memory files found", file=sys.stderr)
        return 2

    findings: list[Finding] = []
    for path in targets:
        findings.extend(check_file(path, memory))

    for finding in findings:
        print(finding.render(REPO_ROOT))

    if findings:
        print(f"\n{len(findings)} violation(s) across {len(targets)} file(s)")
        return 1

    print(f"memlint: {len(targets)} file(s) clean")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
