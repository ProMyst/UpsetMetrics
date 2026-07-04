#!/usr/bin/env python3
"""
Backfill WNBA upset factors using FiveThirtyEight WNBA Elo.

Source: fivethirtyeight/WNBA-stats (cloned to ~/Desktop/Cloned/)
Original: 538's WNBA Elo dataset — 10,488 team-game rows spanning
1997-2019. Includes elo1_pre, elo2_pre, and prob1 (win probability).

Rescores every existing WNBA entry from that window with Elo-based
pregame factors instead of record proxies. Also handles 2020-2024
games IF matched — but the dataset only goes through 2019.

Usage:
    python3 scripts/backfill_wnba_elo.py
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("pandas required", file=sys.stderr)
    sys.exit(1)

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "wnba"
SOURCE_CSV = Path.home() / "Desktop/Cloned/WNBA-stats/wnba-team-elo-ratings.csv"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


def load_elo_map() -> dict[tuple[str, str, str], float]:
    """
    Returns dict: (date_iso, winner_name, loser_name) -> win_probability_pre
    where win_probability is the WINNER's Elo-implied pregame win chance.
    """
    df = pd.read_csv(SOURCE_CSV)
    df["date_iso"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

    # Dataset has 2 rows per game (one per team perspective). Keep both
    # then key by (date, team1 name, team2 name) after normalizing so
    # we can look up regardless of which team was winner/loser.
    out: dict[tuple[str, str, str], float] = {}
    for r in df.itertuples(index=False):
        if r.score1 > r.score2:
            winner, loser = r.name1, r.name2
            winner_prob = r.prob1
        elif r.score2 > r.score1:
            winner, loser = r.name2, r.name1
            winner_prob = 1 - r.prob1
        else:
            continue
        out[(r.date_iso, winner, loser)] = winner_prob
    return out


def main() -> int:
    if not SOURCE_CSV.exists():
        print(f"Missing: {SOURCE_CSV}", file=sys.stderr)
        return 1
    print("Loading WNBA Elo dataset...")
    elo_map = load_elo_map()
    print(f"  {len(elo_map):,} games indexed (1997-2019)")

    updated = 0
    skipped_no_match = 0
    skipped_out_of_range = 0
    total = 0

    for year_dir in sorted(DATA_ROOT.iterdir()):
        if not year_dir.is_dir():
            continue
        year = int(year_dir.name)
        if year < 1997 or year > 2019:
            skipped_out_of_range += len(list(year_dir.glob("*.json")))
            continue
        for f in year_dir.glob("*.json"):
            total += 1
            try:
                entry = json.loads(f.read_text())
            except Exception:
                continue
            date = entry["date"]
            winner_name = entry["winner"]["name"]
            loser_name = entry["loser"]["name"]

            prob = elo_map.get((date, winner_name, loser_name))
            if prob is None:
                skipped_no_match += 1
                continue

            # Upset factor = 1 - winner's expected win probability
            pregame = max(0.0, min(0.98, 1 - prob))
            rank_gap = pregame  # closely tied when using Elo

            entry["factors"]["pregameOddsFactor"] = round(pregame, 3)
            entry["factors"]["rankGapFactor"] = round(rank_gap, 3)
            entry["methodologyVersion"] = "1.2"
            entry["provenance"]["source"] = "wnba_elo_538+espn"
            entry["ingestedAt"] = datetime.utcnow().isoformat() + "Z"

            f.write_text(json.dumps(entry, indent=2))
            updated += 1

    print(f"\nUpdated {updated:,} of {total:,} in-range entries")
    print(f"  Skipped no-match: {skipped_no_match:,}")
    print(f"  Skipped out of range (1997-2019): {skipped_out_of_range:,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
