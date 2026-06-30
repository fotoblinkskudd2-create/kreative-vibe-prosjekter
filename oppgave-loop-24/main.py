#!/usr/bin/env python3
"""OPPGAVE-LOOP-24 – 24-timers marathon coding session."""

import sys
from pathlib import Path

# Ensure src is importable
sys.path.insert(0, str(Path(__file__).parent))

import click
import yaml
from src.session_state import SessionState, list_sessions
from src.loop_engine import LoopEngine
from src.renderer import console, print_sessions_table, print_header


CONFIG_PATH = Path(__file__).parent / "config" / "mine_inputs.yaml"


def load_config() -> dict:
    if not CONFIG_PATH.exists():
        console.print(f"[red]Konfigurasjonsfil ikke funnet: {CONFIG_PATH}[/red]")
        console.print("Opprett filen basert på malen i config/mine_inputs.yaml")
        sys.exit(1)
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return yaml.safe_load(f)


@click.group(invoke_without_command=True)
@click.pass_context
def cli(ctx):
    """OPPGAVE-LOOP-24 – 24-timers AI-drevet coding marathon."""
    if ctx.invoked_subcommand is None:
        ctx.invoke(start)


@cli.command()
@click.option("--resume", "-r", metavar="SESSION_ID", help="Fortsett en eksisterende sesjon")
def start(resume):
    """Start eller fortsett en 24-timers sesjon."""
    if resume:
        state = SessionState.load(resume)
        if state is None:
            console.print(f"[red]Sesjon ikke funnet: {resume}[/red]")
            sys.exit(1)
        console.print(f"[green]Fortsetter sesjon {resume}...[/green]")
    else:
        config = load_config()
        state = SessionState.new(config)
        state.save()
        console.print(f"[green]Ny sesjon startet: {state.session_id}[/green]")

    engine = LoopEngine(state)
    engine.run()


@cli.command()
def sessions():
    """List alle tidligere sesjoner."""
    all_sessions = list_sessions()
    print_header()
    print_sessions_table(all_sessions)


@cli.command()
@click.argument("session_id")
def summary(session_id):
    """Vis oppsummering av en spesifikk sesjon."""
    from src.renderer import print_summary
    state = SessionState.load(session_id)
    if state is None:
        console.print(f"[red]Sesjon ikke funnet: {session_id}[/red]")
        sys.exit(1)
    print_summary(state)


@cli.command()
def config():
    """Åpne konfigurasjonsfilen for redigering."""
    import subprocess, os
    editor = os.environ.get("EDITOR", "nano")
    subprocess.run([editor, str(CONFIG_PATH)])


if __name__ == "__main__":
    cli()
