#!/usr/bin/env python3
"""
ping_loop.py – Ekte 24h automatisk loop som pinger Claude API hvert 60. minutt.

Bruk:
    python scripts/ping_loop.py --session SESSION_ID
    python scripts/ping_loop.py --session SESSION_ID --interval 30

Sender automatisk "NEXT" til Claude hvert N minutt, lagrer svar og viser
dem i terminalen. Perfekt for bakgrunnssessioner.

Avslutt med Ctrl+C.
"""

import sys
import time
import argparse
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.session_state import SessionState
from src.api_client import chat, load_system_prompt, start_session_message, score_from_reply
from src.renderer import console, print_reply, print_status


def ping_once(state: SessionState, system_prompt: str, message: str = "KONTINUER – gi neste oppgave") -> str:
    reply, updated = chat(
        conversation_history=state.conversation_history,
        user_message=message,
        system_prompt=system_prompt,
    )
    state.conversation_history = updated

    score = score_from_reply(reply)
    task_title = f"Auto-ping syklus {state.total_cycles + 1}"
    state.add_cycle(task_title=task_title, task_type="auto", score=score)

    if state.total_cycles % 3 == 0:
        state.advance_hour()

    return reply


def main():
    parser = argparse.ArgumentParser(description="Automatisk 24h ping-loop")
    parser.add_argument("--session", "-s", required=True, help="Session ID å fortsette")
    parser.add_argument("--interval", "-i", type=int, default=60, help="Minutter mellom pings (default: 60)")
    parser.add_argument("--max-hours", type=int, default=24, help="Maks timer (default: 24)")
    args = parser.parse_args()

    state = SessionState.load(args.session)
    if state is None:
        console.print(f"[red]Sesjon ikke funnet: {args.session}[/red]")
        sys.exit(1)

    system_prompt = load_system_prompt()
    interval_seconds = args.interval * 60

    console.print(f"[green]Starter auto-ping loop for sesjon {args.session}[/green]")
    console.print(f"[dim]Interval: {args.interval} min | Maks: {args.max_hours} timer[/dim]\n")

    ping_count = 0
    try:
        while state.active and state.current_hour <= args.max_hours:
            now = datetime.now().strftime("%H:%M:%S")
            console.print(f"[dim]{now}[/dim] [cyan]Ping {ping_count + 1}...[/cyan]")

            try:
                reply = ping_once(state, system_prompt)
                print_reply(reply)
                print_status(state)
                ping_count += 1
            except Exception as e:
                console.print(f"[red]API-feil: {e}[/red]")
                console.print("[yellow]Venter 30 sekunder og prøver igjen...[/yellow]")
                time.sleep(30)
                continue

            if state.current_hour > args.max_hours:
                console.print("[bold green]24 timer fullført! 🏆[/bold green]")
                break

            console.print(f"[dim]Neste ping om {args.interval} minutter. Ctrl+C for å stoppe.[/dim]\n")
            time.sleep(interval_seconds)

    except KeyboardInterrupt:
        console.print("\n[yellow]Auto-loop stoppet. Sesjon lagret.[/yellow]")
        state.active = False
        state.save()


if __name__ == "__main__":
    main()
