"""Rich terminal renderer for OPPGAVE-LOOP-24."""

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.rule import Rule
from rich.markdown import Markdown
from rich import box

console = Console()


def print_header():
    console.print()
    console.print(Panel(
        "[bold cyan]OPPGAVE-LOOP-24[/bold cyan] 🔥\n"
        "[dim]24-timers marathon coding session[/dim]",
        box=box.DOUBLE_EDGE,
        border_style="cyan",
        expand=False,
    ))
    console.print()


def print_status(state):
    streak_display = f"🔥{state.streak}" if state.streak > 0 else "0"
    score_avg = f"{state.avg_score:.1f}" if state.total_cycles > 0 else "-"

    table = Table(box=box.SIMPLE, show_header=False, padding=(0, 2))
    table.add_column("key", style="dim")
    table.add_column("value", style="bold")

    table.add_row("⏱ Time", f"{state.current_hour}/24  [{state.phase}]")
    table.add_row("🔥 Streak", streak_display)
    table.add_row("🎯 Nivå", f"{state.level}/10")
    table.add_row("📊 Poeng", f"{state.total_points} ({score_avg} snitt)")
    table.add_row("🔄 Sykluser", str(state.total_cycles))
    table.add_row("📌 Fokus", ", ".join(state.focus[:3]))

    console.print(Panel(table, title="[bold]STATUS[/bold]", border_style="blue"))


def print_reply(text: str):
    console.print()
    console.print(Rule("[cyan]OPPGAVE-LOOP-24[/cyan]", style="cyan"))
    console.print(Markdown(text))
    console.print()


def print_summary(state):
    s = state.summary()
    console.print()
    console.print(Panel(
        f"[bold green]24H SESSION SUMMARY[/bold green]\n\n"
        f"Session ID: {s['session_id']}\n"
        f"Startet: {s['started_at'][:16]}\n"
        f"Timer fullført: {s['hours_completed']}\n"
        f"Totale sykluser: {s['total_cycles']}\n"
        f"Totale poeng: {s['total_points']}\n"
        f"Snittpoeng: {s['avg_score']}/10\n"
        f"Best streak: {s['best_streak']}\n"
        f"Sluttivå: {s['final_level']}/10\n\n"
        f"[bold]Bra jobba! 🔥[/bold]",
        box=box.DOUBLE_EDGE,
        border_style="green",
    ))


def print_sessions_table(sessions: list):
    if not sessions:
        console.print("[dim]Ingen tidligere sesjoner funnet.[/dim]")
        return

    table = Table(title="Tidligere sesjoner", box=box.ROUNDED)
    table.add_column("ID", style="cyan")
    table.add_column("Startet")
    table.add_column("Sykluser", justify="right")
    table.add_column("Poeng", justify="right")
    table.add_column("Status")

    for s in sessions:
        status = "[green]Aktiv[/green]" if s["active"] else "[dim]Fullført[/dim]"
        table.add_row(
            s["id"],
            s["started"],
            str(s["cycles"]),
            str(s["points"]),
            status,
        )
    console.print(table)


def prompt_input(label: str = "") -> str:
    display = f"\n[bold green]▶[/bold green] {label}: " if label else "\n[bold green]▶[/bold green] "
    return console.input(display)


def print_commands():
    table = Table(box=box.SIMPLE, show_header=True, padding=(0, 2))
    table.add_column("Kommando", style="cyan bold")
    table.add_column("Handling")

    cmds = [
        ("NEXT / KONTINUER", "Neste oppgave"),
        ("FULL CODE", "Gi fullstendig løsning"),
        ("HARDER", "Øk vanskelighetsgrad"),
        ("EASIER", "Senk vanskelighetsgrad"),
        ("HINT", "Gi hint"),
        ("REVIEW [kode]", "La Claude vurdere koden din"),
        ("STATUS", "Vis statistikk"),
        ("24H SUMMARY", "Oppsummering av sessionen"),
        ("NY INPUT", "Oppdater brukerprofil"),
        ("STOPP / AVSLUTT", "Avslutt loopen"),
    ]
    for cmd, desc in cmds:
        table.add_row(cmd, desc)

    console.print(Panel(table, title="[bold]KOMMANDOER[/bold]", border_style="dim"))
