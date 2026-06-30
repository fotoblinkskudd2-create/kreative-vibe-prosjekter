#!/usr/bin/env bash
# start.sh – Enkel launcher for OPPGAVE-LOOP-24

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR/.."

echo "🔥 OPPGAVE-LOOP-24 – 24-timers marathon coding session"
echo "======================================================="

# Sjekk Python
if ! command -v python3 &>/dev/null; then
    echo "❌ Python3 ikke funnet. Installer Python 3.10+"
    exit 1
fi

# Sjekk venv / installer avhengigheter
if [ ! -d "$ROOT/.venv" ]; then
    echo "📦 Setter opp virtuelt miljø..."
    python3 -m venv "$ROOT/.venv"
    source "$ROOT/.venv/bin/activate"
    pip install -q -r "$ROOT/requirements.txt"
else
    source "$ROOT/.venv/bin/activate"
fi

# Sjekk API-nøkkel
if [ -z "$ANTHROPIC_API_KEY" ] && [ ! -f "$ROOT/.env" ]; then
    echo ""
    echo "⚠️  API-nøkkel mangler!"
    echo "Sett ANTHROPIC_API_KEY som miljøvariabel eller opprett $ROOT/.env:"
    echo "  echo 'ANTHROPIC_API_KEY=sk-ant-...' > $ROOT/.env"
    echo ""
    read -p "Eller skriv inn API-nøkkel nå (Enter for å hoppe over): " api_key
    if [ -n "$api_key" ]; then
        echo "ANTHROPIC_API_KEY=$api_key" > "$ROOT/.env"
        echo "✅ Lagret til .env"
    fi
fi

# Start
cd "$ROOT"
if [ -n "$1" ]; then
    python3 main.py start --resume "$1"
else
    python3 main.py start
fi
