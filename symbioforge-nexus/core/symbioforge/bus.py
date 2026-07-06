"""Meldingsbuss med full sporbarhet.

Hver melding mellom agenter logges med sekvensnummer, avsender, mottaker
og nyttelast. Trace-loggen er selve reproduserbarhets-garantien: samme
spørsmål gir samme meldingssekvens, og hele kjeden kan revideres i
ettertid (tilsvarer blockchain-forankringen i full arkitektur, se
docs/ARKITEKTUR.md).
"""

from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from typing import Any, Callable


@dataclass(frozen=True)
class Message:
    seq: int
    sender: str
    topic: str
    payload: dict[str, Any]

    def digest(self) -> str:
        """Innholdsadressert hash — forankringspunkt for revisjonssporet."""
        raw = json.dumps(
            {"seq": self.seq, "sender": self.sender, "topic": self.topic,
             "payload": self.payload},
            sort_keys=True, ensure_ascii=False, default=str,
        )
        return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:16]


@dataclass
class MessageBus:
    _subscribers: dict[str, list[Callable[[Message], None]]] = field(default_factory=dict)
    trace: list[Message] = field(default_factory=list)
    _seq: int = 0

    def subscribe(self, topic: str, handler: Callable[[Message], None]) -> None:
        self._subscribers.setdefault(topic, []).append(handler)

    def publish(self, sender: str, topic: str, payload: dict[str, Any]) -> Message:
        self._seq += 1
        msg = Message(seq=self._seq, sender=sender, topic=topic, payload=payload)
        self.trace.append(msg)
        for handler in self._subscribers.get(topic, []):
            handler(msg)
        return msg

    def audit_chain(self) -> str:
        """Kjedet hash over hele meldingsloggen — én verdi som beviser
        at ingen steg i resonneringskjeden er endret i etterkant."""
        chain = ""
        for msg in self.trace:
            chain = hashlib.sha256((chain + msg.digest()).encode()).hexdigest()[:16]
        return chain
