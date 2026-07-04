#!/usr/bin/env python3
"""
NBA 1946-1969 ingest from FiveThirtyEight Elo CSV.

The local box scores parquet at ~/Desktop/Code/SportsAnalytics/ only
goes back to 1970. The nba_elo CSV covers Nov 1946 through Jun 2015
with real Elo pregame ratings on every game.

This script ingests the 1946-1969 range as fresh UpsetEntries so those
23 seasons of NBA history join the archive. Elo-based factors match
the 538 methodology already used for our pre-2007 backfill.
"""
from __future__ import annotations
import json, re, sys
from datetime import datetime
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    print("pandas required", file=sys.stderr)
    sys.exit(1)

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "nba"
SOURCE_CSV = Path.home() / "Desktop/Cloned/nba_elo/nbaallelo.csv"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


def elo_to_upset_factor(winner_elo: float, loser_elo: float) -> float:
    """Standard Elo formula. Returns 0-1 upset factor (higher = bigger upset)."""
    elo_diff = winner_elo - loser_elo
    winner_expected = 1 / (1 + 10 ** (-elo_diff / 400))
    return max(0.0, min(0.98, 1 - winner_expected))


def main() -> int:
    if not SOURCE_CSV.exists():
        print(f"Missing: {SOURCE_CSV}", file=sys.stderr)
        return 1

    df = pd.read_csv(SOURCE_CSV)
    df["date_iso"] = pd.to_datetime(df["date_game"]).dt.strftime("%Y-%m-%d")

    # Only home rows (dataset has 2 per game). Winner/loser derived from
    # game_result.
    home = df[df["game_location"] == "H"].copy()
    home["year"] = home["date_iso"].str.slice(0, 4).astype(int)
    prehistoric = home[home["year"] < 1970].copy()
    print(f"Pre-1970 home rows: {len(prehistoric):,}")

    # Team name lookup — dataset uses 3-char team_id + fran_id (nickname).
    # Build a team_id → full name mapping by joining with fran_id nicknames.
    # Names: "Boston Celtics" style. We reconstruct via city+nickname where
    # possible. Since we don't have a canonical city map for defunct teams
    # (BLB, PIT, etc.), we use the nickname as the display name and let the
    # slugifier normalize.
    written = 0
    for r in prehistoric.itertuples(index=False):
        home_name = r.fran_id
        away_name = r.opp_fran
        home_score = r.pts
        away_score = r.opp_pts

        if home_score == away_score:
            continue

        home_won = home_score > away_score
        winner_name = home_name if home_won else away_name
        loser_name = away_name if home_won else home_name
        winner_score = home_score if home_won else away_score
        loser_score = away_score if home_won else home_score
        winner_elo = r.elo_i if home_won else r.opp_elo_i
        loser_elo = r.opp_elo_i if home_won else r.elo_i

        pregame = elo_to_upset_factor(winner_elo, loser_elo)
        rank_gap = max(0.0, min(1.0, (loser_elo - winner_elo) / 400))

        stakes = "Playoffs" if r.is_playoffs == 1 else "Regular Season"
        stakes_factor = 0.85 if stakes == "Playoffs" else 0.4
        point_diff = abs(winner_score - loser_score)
        margin = min(1.0, point_diff / 20.0)

        date_str = r.date_iso
        away_slug = slugify(away_name)
        home_slug = slugify(home_name)
        game_id = f"538nba-{r.game_id}"

        entry = {
            "id": f"nba-{date_str}-{away_slug}-at-{home_slug}",
            "sport": "nba",
            "date": date_str,
            "season": str(r.year_id),
            "event": None,
            "stakes": stakes,
            "winner": {
                "slug": slugify(winner_name),
                "name": winner_name,
            },
            "loser": {
                "slug": slugify(loser_name),
                "name": loser_name,
            },
            "finalScore": f"{winner_score}-{loser_score}",
            "factors": {
                "pregameOddsFactor": round(pregame, 3),
                "rankGapFactor": round(rank_gap, 3),
                "streakFactor": 0.3,
                "stakesFactor": round(stakes_factor, 3),
                "marginFactor": round(margin, 3),
            },
            "provenance": {
                "source": "nba_elo_538_prehistoric",
                "sourceGameId": game_id,
                "sourceUrl": "https://github.com/nicidob/nba_elo",
                "retrievedAt": datetime.utcnow().isoformat() + "Z",
            },
            "methodologyVersion": "1.2",
            "slug": f"{away_slug}-at-{home_slug}",
            "published": False,
            "ingestedAt": datetime.utcnow().isoformat() + "Z",
        }

        year_dir = DATA_ROOT / date_str[:4]
        year_dir.mkdir(parents=True, exist_ok=True)
        (year_dir / f"{game_id}.json").write_text(json.dumps(entry, indent=2))
        written += 1

    print(f"Wrote {written:,} NBA 1946-1969 entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
