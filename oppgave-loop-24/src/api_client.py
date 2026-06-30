"""Claude API client for OPPGAVE-LOOP-24."""

import os
from pathlib import Path
from anthropic import Anthropic

_client: Anthropic | None = None


def get_client() -> Anthropic:
    global _client
    if _client is None:
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            env_file = Path(__file__).parent.parent / ".env"
            if env_file.exists():
                from dotenv import load_dotenv
                load_dotenv(env_file)
                api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise RuntimeError(
                "ANTHROPIC_API_KEY ikke funnet.\n"
                "Sett den i .env-filen eller som miljøvariabel:\n"
                "  export ANTHROPIC_API_KEY=sk-ant-..."
            )
        _client = Anthropic(api_key=api_key)
    return _client


SYSTEM_PROMPT_PATH = Path(__file__).parent.parent / "prompts" / "system_prompt_no.md"


def load_system_prompt() -> str:
    return SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")


def chat(
    conversation_history: list[dict],
    user_message: str,
    system_prompt: str,
    model: str = "claude-sonnet-4-6",
    max_tokens: int = 2000,
) -> tuple[str, list[dict]]:
    """Send a message and return (assistant_reply, updated_history)."""
    client = get_client()

    history = list(conversation_history)
    history.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=history,
    )

    reply = response.content[0].text
    history.append({"role": "assistant", "content": reply})

    return reply, history


def start_session_message(state) -> str:
    """Build the initial message that bootstraps the 24h loop."""
    focus_str = ", ".join(state.focus)
    return (
        f"Start loopen for {state.user_name}.\n\n"
        f"**Mine inputs:**\n"
        f"- Nivå: {state.level}/10\n"
        f"- Fokus: {focus_str}\n"
        f"- Mål: {state.goal}\n"
        f"- Tema: {state.theme}\n"
        f"- Språk: {state.language}\n\n"
        f"Bekreft inputs, gi status Time 1/24, og start med første oppgave."
    )


def score_from_reply(reply: str) -> int:
    """Try to extract score from Claude's reply (best-effort)."""
    import re
    patterns = [
        r"Poeng[:\s]+(\d+)/10",
        r"(\d+)/10\s*poeng",
        r"score[:\s]+(\d+)",
        r"\*\*(\d+)\*\*/10",
    ]
    for p in patterns:
        m = re.search(p, reply, re.IGNORECASE)
        if m:
            v = int(m.group(1))
            return min(10, max(0, v))
    return 0
