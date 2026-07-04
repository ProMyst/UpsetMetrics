#!/usr/bin/env bash
#
# Daily UpsetMetrics ingest.
#
# Runs at 06:00 local via systemd user timer on the MiniPC. Pulls
# yesterday's completed games from every sport we cover and writes
# canonical entries to data/upsets/[sport]/[year]/.
#
# Yesterday's date is safer than today's because most late-night games
# resolve after midnight. Running at 6am ensures every game from the
# prior calendar day has final status.

set -euo pipefail

cd "$(dirname "$0")/.."

STAMP="$(date -u +%FT%TZ)"
echo "[$STAMP] Daily UpsetMetrics ingest starting"

python3 scripts/ingest/mlb.py --yesterday
python3 scripts/ingest/wnba.py --yesterday
python3 scripts/ingest/soccer.py --yesterday

echo "[$STAMP] Daily ingest complete"
