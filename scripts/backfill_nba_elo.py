#!/usr/bin/env python3
"""
Backfill NBA pre-2007 upset factors using FiveThirtyEight NBA Elo.

Source: nicidob/nba_elo (cloned to ~/Desktop/Cloned/)
Original: FiveThirtyEight's NBA Elo dataset, 126,314 team-game rows,
Nov 1946 through Jun 2015.

Purpose: NBA games from 2007-2025 already carry real closing moneylines
(methodology 1.1). Games 1946-2006 fall back to record-based factors
which are noisy. Elo ratings provide a much better signal.

Formula: elo_diff = winner_elo_before - loser_elo_before
  Negative elo_diff = underdog won (bigger upset)
  Elo diff of -300 ~= 15% underdog win probability

Rescores in place — existing methodology 1.0 entries get bumped to 1.2
with Elo-derived pregame factors.

Usage:
    python3 scripts/backfill_nba_elo.py
    python3 scripts/backfill_nba_elo.py --max-year 2006  # pre-2007 only
"""
from __future__ import annotations

import argparse
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
DATA_ROOT = PROJECT / "data" / "upsets" / "nba"
SOURCE_CSV = Path.home() / "Desktop/Cloned/nba_elo/nbaallelo.csv"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


TEAM_SLUG_OVERRIDES = {
    "Los Angeles Lakers": "lakers",
    "Golden State Warriors": "warriors",
    "New Jersey Nets": "nets-nj",
    "Brooklyn Nets": "nets",
    "Seattle SuperSonics": "sonics",
    "Oklahoma City Thunder": "thunder",
    "Washington Bullets": "bullets",
    "Washington Wizards": "wizards",
    "Charlotte Bobcats": "bobcats",
    "Charlotte Hornets": "hornets",
    "New Orleans Hornets": "hornets-nola-classic",
    "New Orleans Pelicans": "pelicans",
    "Vancouver Grizzlies": "grizzlies-vancouver",
    "Memphis Grizzlies": "grizzlies",
    "Buffalo Braves": "braves",
    "San Diego Clippers": "clippers-sd",
    "Los Angeles Clippers": "clippers",
    "Kansas City Kings": "kings-kc",
    "Sacramento Kings": "kings",
    "Baltimore Bullets": "bullets-baltimore",
    "Cincinnati Royals": "royals",
    "Rochester Royals": "royals-rochester",
    "Fort Wayne Pistons": "pistons-fw",
    "Detroit Pistons": "pistons",
    "Minneapolis Lakers": "lakers-minneapolis",
    "Philadelphia Warriors": "warriors-philly",
    "San Francisco Warriors": "warriors-sf",
    "St. Louis Hawks": "hawks-stl",
    "Milwaukee Hawks": "hawks-milwaukee",
    "Tri-Cities Blackhawks": "blackhawks",
    "Atlanta Hawks": "hawks",
    "Syracuse Nationals": "nationals",
    "Philadelphia 76ers": "76ers",
}


def team_slug(name: str) -> str:
    return TEAM_SLUG_OVERRIDES.get(name, slugify(name))


def elo_to_pregame_odds(winner_elo: float, loser_elo: float) -> float:
    """
    Convert winner/loser Elo ratings into a 0-1 pregame odds factor.
    Higher factor = bigger upset.

    Elo formula: win_prob = 1 / (1 + 10^((opponent - self) / 400))

    If winner had LOWER Elo than loser, that's the upset direction.
    Factor = 1 - winner_expected_win_prob.
    """
    elo_diff = winner_elo - loser_elo
    winner_expected = 1 / (1 + 10 ** (-elo_diff / 400))
    factor = max(0.0, min(0.98, 1 - winner_expected))
    return factor


def load_elo_map() -> dict[tuple[str, str, str], tuple[float, float]]:
    """
    Return dict: (date_iso, home_slug, away_slug) → (home_elo_before, away_elo_before)
    """
    df = pd.read_csv(SOURCE_CSV)
    df["date_iso"] = pd.to_datetime(df["date_game"]).dt.strftime("%Y-%m-%d")

    # The dataset has 2 rows per game (one from each team's perspective).
    # We only need one — pick game_location == 'H' rows.
    home = df[df["game_location"] == "H"].copy()

    # Build map by date + team_id + opp_id
    # But UpsetMetrics uses team NAMES, and this dataset uses 3-char codes.
    # We use fran_id (the franchise short code that carries "LAL", "BOS", etc)
    # combined with year to map to team names.
    # For simplicity: map by (date, fran_id, opp_fran) which are 3-char.
    m = {}
    for row in home.itertuples(index=False):
        key = (row.date_iso, row.fran_id, row.opp_fran)
        m[key] = (row.elo_i, row.opp_elo_i)
    return m


# The nba_elo dataset uses franchise NICKNAMES as fran_id ("Lakers",
# "Hawks", "Trail Blazers"). Extract the nickname from our full team
# name by matching known multi-word nicknames first, then the last word.
MULTI_WORD_NICKNAMES = {"Trail Blazers", "76ers", "SuperSonics"}


def team_nickname(name: str) -> str:
    """Convert 'Los Angeles Lakers' -> 'Lakers'."""
    for nick in MULTI_WORD_NICKNAMES:
        if name.endswith(nick):
            return nick
    parts = name.split()
    return parts[-1] if parts else name


def team_slug(name: str) -> str:
    return TEAM_SLUG_OVERRIDES.get(name, slugify(name))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--max-year", type=int, default=2006,
                    help="Only rescore entries up through this year (real ML data covers 2007+)")
    args = ap.parse_args()

    if not SOURCE_CSV.exists():
        print(f"Missing: {SOURCE_CSV}", file=sys.stderr)
        return 1

    print("Loading NBA Elo dataset...")
    elo_map = load_elo_map()
    print(f"  {len(elo_map):,} games indexed")

    updated = 0
    skipped_no_match = 0
    skipped_recent = 0
    total = 0

    for year_dir in sorted(DATA_ROOT.iterdir()):
        if not year_dir.is_dir():
            continue
        year = int(year_dir.name)
        if year > args.max_year:
            skipped_recent += len(list(year_dir.glob("*.json")))
            continue
        for f in year_dir.glob("*.json"):
            total += 1
            try:
                entry = json.loads(f.read_text())
            except Exception:
                continue

            # Skip if already has real moneyline (methodology 1.1 from odds_all)
            if entry.get("provenance", {}).get("source") == "local-nba-boxscore+odds":
                continue

            date = entry["date"]
            winner_name = entry["winner"]["name"]
            loser_name = entry["loser"]["name"]

            winner_fran = team_nickname(winner_name)
            loser_fran = team_nickname(loser_name)
            if not winner_fran or not loser_fran:
                skipped_no_match += 1
                continue

            # Try both orderings (home/away not encoded in our entry)
            elos = elo_map.get((date, winner_fran, loser_fran))
            if elos is None:
                elos = elo_map.get((date, loser_fran, winner_fran))
                if elos is None:
                    skipped_no_match += 1
                    continue
                # elos are (home_elo, away_elo) where home=loser here
                loser_elo, winner_elo = elos
            else:
                # home=winner
                winner_elo, loser_elo = elos

            pregame = elo_to_pregame_odds(winner_elo, loser_elo)
            # Rank gap: use Elo diff magnitude normalized
            rank_gap = max(0.0, min(1.0, (loser_elo - winner_elo) / 400))

            entry["factors"]["pregameOddsFactor"] = round(pregame, 3)
            entry["factors"]["rankGapFactor"] = round(rank_gap, 3)
            entry["methodologyVersion"] = "1.2"
            entry["provenance"]["source"] = "nba_elo_538+local-boxscore"
            entry["ingestedAt"] = datetime.utcnow().isoformat() + "Z"

            f.write_text(json.dumps(entry, indent=2))
            updated += 1

    print(f"\nUpdated {updated:,} of {total:,} entries")
    print(f"  Skipped no-match: {skipped_no_match:,}")
    print(f"  Skipped recent (>{args.max_year}): {skipped_recent:,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
