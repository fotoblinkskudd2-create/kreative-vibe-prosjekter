"""Core 24h loop engine for OPPGAVE-LOOP-24."""

from .session_state import SessionState
from .api_client import chat, load_system_prompt, start_session_message, score_from_reply
from .renderer import (
    console,
    print_header,
    print_status,
    print_reply,
    print_summary,
    print_commands,
    prompt_input,
)

STOP_WORDS = {"STOPP", "AVSLUTT", "EXIT", "QUIT", "Q"}
SUMMARY_WORDS = {"24H SUMMARY", "SUMMARY", "OPPSUMMERING"}
STATUS_WORDS = {"STATUS", "STATS"}
HELP_WORDS = {"HELP", "HJELP", "KOMMANDOER"}


class LoopEngine:
    def __init__(self, state: SessionState):
        self.state = state
        self.system_prompt = load_system_prompt()

    def _send(self, user_msg: str) -> str:
        reply, updated_history = chat(
            conversation_history=self.state.conversation_history,
            user_message=user_msg,
            system_prompt=self.system_prompt,
        )
        self.state.conversation_history = updated_history
        return reply

    def _extract_task_title(self, reply: str) -> str:
        for line in reply.splitlines():
            if "NY OPPGAVE" in line or "🆕" in line:
                clean = line.replace("🆕", "").replace("NY OPPGAVE:", "").replace("**", "").strip()
                if clean and len(clean) < 100:
                    return clean[:80]
        return f"Syklus {self.state.total_cycles + 1}"

    def run(self):
        print_header()

        console.print("[dim]Starter ny sesjon...[/dim]\n")

        init_msg = start_session_message(self.state)
        reply = self._send(init_msg)

        task_title = self._extract_task_title(reply)
        self.state.add_cycle(
            task_title=task_title,
            task_type="start",
            score=0,
            notes="Sesjon startet",
        )
        self.state.save()

        print_reply(reply)
        print_commands()

        while self.state.active and self.state.current_hour <= 24:
            try:
                user_input = prompt_input()
            except (EOFError, KeyboardInterrupt):
                console.print("\n[yellow]Avbrutt. Lagrer sesjon...[/yellow]")
                self.state.active = False
                self.state.save()
                print_summary(self.state)
                break

            stripped = user_input.strip()
            upper = stripped.upper()

            if not stripped:
                continue

            if upper in STOP_WORDS or any(upper.startswith(w) for w in STOP_WORDS):
                self.state.active = False
                self.state.save()
                reply = self._send("AVSLUTT – generer 24H SUMMARY med full statistikk og neste dag plan.")
                print_reply(reply)
                print_summary(self.state)
                break

            if upper in SUMMARY_WORDS or "24H SUMMARY" in upper:
                reply = self._send("Generer full 24H SUMMARY nå – statistikk, beste oppgaver, anbefalinger.")
                print_reply(reply)
                print_summary(self.state)
                continue

            if upper in STATUS_WORDS:
                print_status(self.state)
                continue

            if upper in HELP_WORDS:
                print_commands()
                continue

            if upper == "HARDER":
                self.state.level = min(10, self.state.level + 1)
                self.state.save()
                stripped = f"HARDER – øk til nivå {self.state.level}/10 og gi en hardere oppgave."

            elif upper == "EASIER":
                self.state.level = max(1, self.state.level - 1)
                self.state.save()
                stripped = f"EASIER – senk til nivå {self.state.level}/10 og gi en lettere oppgave."

            reply = self._send(stripped)
            score = score_from_reply(reply)
            task_title = self._extract_task_title(reply)

            if score > 0 or any(w in upper for w in ("NEXT", "KONTINUER", "NESTE")):
                if score > 0:
                    self.state.add_cycle(
                        task_title=task_title,
                        task_type="closed" if "CLOSED" in reply else "open",
                        score=score,
                    )
                    if self.state.total_cycles % 3 == 0:
                        self.state.advance_hour()
                else:
                    self.state.add_cycle(task_title=task_title, task_type="open", score=0)

            print_reply(reply)

            if self.state.total_cycles > 0 and self.state.total_cycles % 5 == 0:
                print_status(self.state)

        if self.state.current_hour > 24:
            console.print("\n[bold green]24 timer fullført! Utrolig innsats! 🏆[/bold green]")
            print_summary(self.state)
