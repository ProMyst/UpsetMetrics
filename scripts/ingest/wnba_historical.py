#!/usr/bin/env python3
"""
WNBA historical ingest from FiveThirtyEight WNBA Elo dataset.

Source: fivethirtyeight/WNBA-stats (cloned to ~/Desktop/Cloned/)
Coverage: 5,244 games 1997-2019 with pre-game Elo + win probabilities.

The 538 dataset has TWO rows per game (one per team's perspective).
We collapse to one row per game and write UpsetEntry JSONs. Since Elo
probabilities are embedded in the dataset, every entry gets
methodology 1.2 factors directly — no post-hoc backfill needed.
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
PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "wnba"
SOURCE_CSV = Path.home() / "Desktop/Cloned/WNBA-stats/wnba-team-elo-ratings.csv"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


def main() -> int:
    if not SOURCE_CSV.exists():
        print(f"Missing: {SOURCE_CSV}", file=sys.stderr)
        return 1

    df = pd.read_csv(SOURCE_CSV)
    df["date_iso"] = pd.to_datetime(df["date"]).dt.strftime("%Y-%m-%d")

    # Collapse to one row per game — keep the row where is_home1 == 1 (team1 is home)
    home = df[df["is_home1"] == 1].copy()
    neutral = df[(df["neutral"] == 1) & (df["is_home1"] == 0)].copy()
    # For neutral games, one arbitrary row per game_key
    neutral["game_key"] = neutral["date_iso"] + "-" + neutral["team1"] + "-" + neutral["team2"]
    neutral = neutral.drop_duplicates(subset=["date_iso", "team1", "team2"])
    games = pd.concat([home, neutral]).sort_values("date_iso").reset_index(drop=True)

    print(f"{len(games):,} unique WNBA games 1997-2019 to ingest")

    written = 0
    for r in games.itertuples(index=False):
        home_name = r.name1
        away_name = r.name2
        home_score = int(r.score1)
        away_score = int(r.score2)

        if home_score == away_score:
            continue

        home_won = home_score > away_score
        winner_name = home_name if home_won else away_name
        loser_name = away_name if home_won else home_name
        winner_score = home_score if home_won else away_score
        loser_score = away_score if home_won else home_score

        winner_prob = r.prob1 if home_won else (1 - r.prob1)
        pregame = max(0.0, min(0.98, 1 - winner_prob))
        rank_gap = pregame  # closely tied when Elo drives both

        stakes = "Playoffs" if r.playoff == 1 else "Regular Season"
        stakes_factor = 0.85 if stakes == "Playoffs" else 0.4

        point_diff = abs(winner_score - loser_score)
        margin = min(1.0, point_diff / 15.0)

        date_str = r.date_iso
        away_slug = slugify(away_name)
        home_slug = slugify(home_name)
        game_id = f"538-{date_str}-{away_slug}-at-{home_slug}"

        entry = {
            "id": f"wnba-{game_id}",
            "sport": "wnba",
            "date": date_str,
            "season": str(r.season),
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
                "source": "wnba_elo_538",
                "sourceGameId": game_id,
                "sourceUrl": "https://github.com/fivethirtyeight/WNBA-stats",
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

    print(f"Wrote {written:,} entries")
    return 0


if __name__ == "__main__":
    sys.exit(main())
