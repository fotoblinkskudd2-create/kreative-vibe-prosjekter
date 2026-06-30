"""Session state – persists 24h loop progress to disk."""

import json
import time
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import Optional


SESSIONS_DIR = Path(__file__).parent.parent / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)


@dataclass
class CycleRecord:
    cycle: int
    hour: int
    task_title: str
    task_type: str
    difficulty: int
    score: int
    timestamp: str
    notes: str = ""


@dataclass
class SessionState:
    session_id: str
    started_at: str
    user_name: str
    focus: list
    language: str
    goal: str
    theme: str
    level: int                      # current difficulty 1–10
    auto_ramp: bool
    total_cycles: int = 0
    current_hour: int = 1
    total_points: int = 0
    streak: int = 0
    best_streak: int = 0
    last_cycle_score: int = 0
    last_task_title: str = ""
    conversation_history: list = field(default_factory=list)
    cycle_records: list = field(default_factory=list)
    active: bool = True

    @property
    def path(self) -> Path:
        return SESSIONS_DIR / f"{self.session_id}.json"

    def save(self):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(asdict(self), f, ensure_ascii=False, indent=2)

    @classmethod
    def load(cls, session_id: str) -> Optional["SessionState"]:
        path = SESSIONS_DIR / f"{session_id}.json"
        if not path.exists():
            return None
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        state = cls(**{k: v for k, v in data.items() if k in cls.__dataclass_fields__})
        return state

    @classmethod
    def new(cls, config: dict) -> "SessionState":
        session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        return cls(
            session_id=session_id,
            started_at=datetime.now().isoformat(),
            user_name=config.get("bruker", {}).get("navn", "Alexander"),
            focus=config.get("fokus", ["Python"]),
            language=config.get("bruker", {}).get("spraak", "norsk-engelsk mix"),
            goal=config.get("sesjonsmaal", ""),
            theme=config.get("tema", "web development"),
            level=config.get("startnivaа", 4),
            auto_ramp=config.get("auto_ramp", True),
        )

    def add_cycle(self, task_title: str, task_type: str, score: int, notes: str = ""):
        self.total_cycles += 1
        self.total_points += score
        self.last_cycle_score = score
        self.last_task_title = task_title

        if score >= 7:
            self.streak += 1
            self.best_streak = max(self.streak, self.best_streak)
        else:
            self.streak = 0

        if self.auto_ramp and self.streak > 0 and self.streak % 3 == 0:
            self.level = min(10, self.level + 1)

        record = CycleRecord(
            cycle=self.total_cycles,
            hour=self.current_hour,
            task_title=task_title,
            task_type=task_type,
            difficulty=self.level,
            score=score,
            timestamp=datetime.now().isoformat(),
            notes=notes,
        )
        self.cycle_records.append(asdict(record))
        self.save()

    def advance_hour(self):
        self.current_hour = min(24, self.current_hour + 1)
        self.save()

    @property
    def phase(self) -> str:
        h = self.current_hour
        if h <= 8:
            return "Høy energi ⚡"
        elif h <= 16:
            return "Deep work 🔥"
        elif h <= 20:
            return "Refleksjon 🧠"
        else:
            return "Wrap-up 🏁"

    @property
    def avg_score(self) -> float:
        if not self.cycle_records:
            return 0.0
        return self.total_points / len(self.cycle_records)

    def summary(self) -> dict:
        return {
            "session_id": self.session_id,
            "started_at": self.started_at,
            "total_cycles": self.total_cycles,
            "total_points": self.total_points,
            "avg_score": round(self.avg_score, 1),
            "best_streak": self.best_streak,
            "final_level": self.level,
            "hours_completed": self.current_hour - 1,
        }


def list_sessions() -> list[dict]:
    sessions = []
    for path in sorted(SESSIONS_DIR.glob("*.json"), reverse=True):
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            sessions.append({
                "id": data["session_id"],
                "started": data["started_at"][:16],
                "cycles": data["total_cycles"],
                "points": data["total_points"],
                "active": data["active"],
            })
        except Exception:
            pass
    return sessions
