#!/usr/bin/env python3
"""
Soccer ingest via ESPN scoreboard.

Covers major competitions individually because ESPN scopes scoreboards
by league. The default pulls FIFA World Cup 2026 (currently active, US /
Canada / Mexico host) plus the top-flight European leagues.

Add or remove leagues via the LEAGUES map. Each league has:
    espn_path — the /soccer/{league} path segment
    stakes    — default competition tier for the margin heuristic
    threshold — goals-margin considered a blowout

Usage:
    python3 scripts/ingest/soccer.py --today
    python3 scripts/ingest/soccer.py --season 2026
    python3 scripts/ingest/soccer.py --league fifa.world --season 2026
    python3 scripts/ingest/soccer.py --league eng.1 --from 2025-08-01 --to 2026-05-31
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import date, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from _espn import crawl_range  # noqa: E402

PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "soccer"

LEAGUES: dict[str, dict] = {
    "fifa.world": {
        "espn_path": "soccer/fifa.world",
        "stakes": "Group Stage",
        "threshold": 3.0,
    },
    "uefa.champions": {
        "espn_path": "soccer/uefa.champions",
        "stakes": "Knockout",
        "threshold": 3.0,
    },
    "eng.1": {
        "espn_path": "soccer/eng.1",
        "stakes": "Regular Season",
        "threshold": 3.0,
    },
    "esp.1": {
        "espn_path": "soccer/esp.1",
        "stakes": "Regular Season",
        "threshold": 3.0,
    },
    "ita.1": {
        "espn_path": "soccer/ita.1",
        "stakes": "Regular Season",
        "threshold": 3.0,
    },
    "ger.1": {
        "espn_path": "soccer/ger.1",
        "stakes": "Regular Season",
        "threshold": 3.0,
    },
    "usa.1": {  # MLS
        "espn_path": "soccer/usa.1",
        "stakes": "Regular Season",
        "threshold": 3.0,
    },
}


def write_entry(entry):
    year = entry["date"][:4]
    d = DATA_ROOT / year
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{entry['provenance']['sourceGameId']}.json").write_text(json.dumps(entry, indent=2))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="date_from")
    ap.add_argument("--to", dest="date_to")
    ap.add_argument("--season", type=int)
    ap.add_argument("--yesterday", action="store_true")
    ap.add_argument("--today", action="store_true")
    ap.add_argument("--league", help="Single league key; else all in LEAGUES")
    args = ap.parse_args()

    today = date.today()
    if args.today:
        start = end = today
    elif args.yesterday:
        start = end = today - timedelta(days=1)
    elif args.season:
        # Soccer seasons run roughly Aug -> May in European leagues; FIFA
        # WC is June-July. Use calendar year for now; refine per-league later.
        start = date(args.season, 1, 1)
        end = min(date(args.season, 12, 31), today)
    elif args.date_from and args.date_to:
        start = date.fromisoformat(args.date_from)
        end = date.fromisoformat(args.date_to)
    else:
        print("Provide --from/--to, --season, --yesterday, or --today", file=sys.stderr)
        return 2

    leagues = [args.league] if args.league else list(LEAGUES.keys())
    total = 0
    for key in leagues:
        if key not in LEAGUES:
            print(f"  [!] Unknown league {key}", file=sys.stderr)
            continue
        cfg = LEAGUES[key]
        print(f"Fetching {key} from {start} through {end}...")
        entries = crawl_range(
            cfg["espn_path"], "soccer", start, end,
            stakes_default=cfg["stakes"],
            margin_threshold=cfg["threshold"],
        )
        print(f"  {len(entries)} finals in {key}")
        for e in entries:
            e["provenance"]["source"] = f"espn-soccer-{key}"
            write_entry(e)
        total += len(entries)
    print(f"  Total: {total} entries under {DATA_ROOT.relative_to(PROJECT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
