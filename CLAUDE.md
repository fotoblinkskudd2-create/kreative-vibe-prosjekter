# CLAUDE.md

@AGENTS.md

Claude Code-spesifikt, utover kontrakten over:

- Ved sesjonsstart: les `prosjekter/INDEKS.md` og `minne/inbox.md` før du foreslår noe. Køen bestemmer, ikke gjetning.
- `/destiller` (`.claude/skills/destiller/`) kjører inbox-løypa i AGENTS.md §3.
- Ved parallelle oppgaver på uavhengige prosjekter: kjør verktøykall i samme blokk. Ikke serialiser noe som ikke har avhengighet.
- Skill `alexander-context` er global og dekker persona. Denne fila dekker repoet. Ved konflikt vinner repoet.
