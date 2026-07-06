#!/usr/bin/env python3
"""Kjør en full Discovery-to-Action-løkke fra kommandolinjen.

    python demo.py "Analyser samspill sult + ADHD hos gutter i Norge vs. Sudan"

Uten argument kjøres et standardspørsmål. Skriver policy-brief til stdout
og viser meldingsloggen (sporbarheten) til slutt.
"""

import sys

from symbioforge import NexusOrchestrator


def main() -> None:
    question = (
        " ".join(sys.argv[1:])
        or "Analyser samspill sult + ADHD hos gutter i Norge vs. Sudan"
    )
    nexus = NexusOrchestrator()
    result = nexus.discover(question)

    print(result.brief_markdown)
    print()
    print("=" * 72)
    print(f"Sporbarhet: {len(result.trace)} meldinger | audit-hash {result.audit_hash}")
    for msg in result.trace:
        print(f"  #{msg.seq:02d} {msg.sender:>16} → {msg.topic:<20} [{msg.digest()}]")


if __name__ == "__main__":
    main()
