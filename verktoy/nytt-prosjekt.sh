#!/usr/bin/env bash
# Oppretter nytt prosjekt fra mal og regenererer indeksen.
# Bruk: verktoy/nytt-prosjekt.sh <slug> ["Navn på prosjektet"]
set -euo pipefail

rot="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ $# -lt 1 ]; then
  echo "Bruk: verktoy/nytt-prosjekt.sh <slug> [\"Navn\"]" >&2
  exit 1
fi

slug="$1"
navn="${2:-$slug}"
maal="$rot/prosjekter/$slug"

if [ -e "$maal" ]; then
  echo "Finnes allerede: prosjekter/$slug" >&2
  exit 1
fi

mkdir -p "$maal"
sed "s/^navn: Malprosjekt$/navn: $navn/; s/^# Malprosjekt$/# $navn/" \
  "$rot/prosjekter/MAL/prosjekt.md" > "$maal/prosjekt.md"

python3 "$rot/verktoy/bygg-indeks.py"
echo "Opprettet prosjekter/$slug/prosjekt.md"
