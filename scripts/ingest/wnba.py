#!/usr/bin/env python3
"""WNBA ingest via ESPN scoreboard. Season: mid-May through late October."""
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
DATA_ROOT = PROJECT / "data" / "upsets" / "wnba"


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
    args = ap.parse_args()

    today = date.today()
    if args.today:
        start = end = today
    elif args.yesterday:
        start = end = today - timedelta(days=1)
    elif args.season:
        start = date(args.season, 5, 15)
        end = date(args.season, 10, 25) if args.season < today.year else today
    elif args.date_from and args.date_to:
        start = date.fromisoformat(args.date_from)
        end = date.fromisoformat(args.date_to)
    else:
        print("Provide --from/--to, --season, --yesterday, or --today", file=sys.stderr)
        return 2

    print(f"Fetching WNBA games from {start} through {end}...")
    entries = crawl_range("basketball/wnba", "wnba", start, end, margin_threshold=15.0)
    print(f"  {len(entries)} final games found")
    for e in entries:
        write_entry(e)
    print(f"  Wrote {len(entries)} entries under {DATA_ROOT.relative_to(PROJECT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
