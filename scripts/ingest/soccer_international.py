#!/usr/bin/env python3
"""
International soccer results ingest — 150+ years of data.

Source: martj42/international_results (cloned to ~/Desktop/Cloned/)
Coverage: 49,499 international matches from Scotland vs England 1872
through today, across FIFA World Cup, Copa America, Euro Championships,
African Cup of Nations, and every other confederation tournament +
friendlies.

Records are computed from actual head-to-head history over a rolling
5-year window, so upset factors are meaningful (unlike ESPN's
current-season standings for a national team that plays 8 games a year).

Usage:
    python3 scripts/ingest/soccer_international.py             # everything
    python3 scripts/ingest/soccer_international.py --min-year 2020
    python3 scripts/ingest/soccer_international.py --tournament "FIFA World Cup"
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import pandas as pd
except ImportError:
    print("pandas required: pip install pandas", file=sys.stderr)
    sys.exit(1)

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "soccer"

SOURCE_CSV = Path.home() / "Desktop/Cloned/international_results/results.csv"

# Tournament → stakes mapping (higher stakes = higher score)
TOURNAMENT_STAKES = {
    "FIFA World Cup": "Championship",
    "UEFA Euro": "Championship",
    "Copa América": "Championship",
    "AFC Asian Cup": "Championship",
    "African Cup of Nations": "Championship",
    "CONCACAF Gold Cup": "Championship",
    "OFC Nations Cup": "Championship",
    "FIFA Confederations Cup": "Championship",
    "UEFA Nations League": "Playoffs",
    "FIFA World Cup qualification": "Playoffs",
    "UEFA Euro qualification": "Playoffs",
    "Copa América Centenario": "Championship",
    "Olympic Games": "Championship",
    "Friendly": "Regular Season",
}

STAKES_FACTORS = {
    "Championship": 1.0,
    "Semifinal": 0.9,
    "Quarterfinal": 0.85,
    "Playoffs": 0.75,
    "Regular Season": 0.4,
}


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


def load_and_prep() -> pd.DataFrame:
    df = pd.read_csv(SOURCE_CSV, parse_dates=["date"])
    df = df.dropna(subset=["home_team", "away_team", "home_score", "away_score"])
    df["home_score"] = df["home_score"].astype(int)
    df["away_score"] = df["away_score"].astype(int)
    return df


def compute_rolling_records(df: pd.DataFrame, window_years: int = 5) -> pd.DataFrame:
    """
    Compute each team's win/loss/draw record over the trailing window_years
    at the moment of each match. Adds columns:
      home_wp_before, home_games_before, away_wp_before, away_games_before
    """
    df = df.sort_values("date").reset_index(drop=True)
    df["window_start"] = df["date"] - pd.Timedelta(days=window_years * 365)

    # Track cumulative records per team as we walk chronologically
    # Rather than a full rolling join (expensive), we build a running dict
    home_wp = []
    away_wp = []
    home_games = []
    away_games = []

    # Per-team history: list of (date, result) where result is 'W'/'L'/'D'
    history: dict[str, list[tuple[pd.Timestamp, str]]] = {}

    for row in df.itertuples(index=False):
        window_start = row.window_start

        def team_record(team: str) -> tuple[float, int]:
            hist = history.get(team, [])
            # Only games within window
            recent = [r for d, r in hist if d >= window_start]
            if not recent:
                return 0.5, 0
            wins = sum(1 for r in recent if r == "W")
            return wins / len(recent), len(recent)

        h_wp, h_g = team_record(row.home_team)
        a_wp, a_g = team_record(row.away_team)
        home_wp.append(h_wp)
        away_wp.append(a_wp)
        home_games.append(h_g)
        away_games.append(a_g)

        # Update history AFTER computing this game's factors
        if row.home_score > row.away_score:
            history.setdefault(row.home_team, []).append((row.date, "W"))
            history.setdefault(row.away_team, []).append((row.date, "L"))
        elif row.home_score < row.away_score:
            history.setdefault(row.home_team, []).append((row.date, "L"))
            history.setdefault(row.away_team, []).append((row.date, "W"))
        else:
            history.setdefault(row.home_team, []).append((row.date, "D"))
            history.setdefault(row.away_team, []).append((row.date, "D"))

    df["home_wp_before"] = home_wp
    df["home_games_before"] = home_games
    df["away_wp_before"] = away_wp
    df["away_games_before"] = away_games
    return df


def row_to_entry(row: dict[str, Any]) -> dict[str, Any] | None:
    if row["home_score"] == row["away_score"]:
        return None  # draws deferred

    home_won = row["home_score"] > row["away_score"]
    winner = row["home_team"] if home_won else row["away_team"]
    loser = row["away_team"] if home_won else row["home_team"]
    winner_score = row["home_score"] if home_won else row["away_score"]
    loser_score = row["away_score"] if home_won else row["home_score"]
    winner_wp = row["home_wp_before"] if home_won else row["away_wp_before"]
    loser_wp = row["away_wp_before"] if home_won else row["home_wp_before"]
    winner_games = row["home_games_before"] if home_won else row["away_games_before"]
    loser_games = row["away_games_before"] if home_won else row["home_games_before"]

    tournament = row["tournament"]

    # Small-sample floor. Real national teams play ~8-12 games/year. A
    # 20-game window over 5 years excludes micronations like Padania,
    # Provence, Sami people, etc. whose records are noise. Real FIFA
    # members like Iceland or Fiji still qualify with occasional friendlies.
    MIN_SAMPLE = 20
    if min(winner_games, loser_games) < MIN_SAMPLE:
        pregame = 0.35
        rank_gap = 0.2
    else:
        rank_gap = max(0.0, min(1.0, (loser_wp - winner_wp) * 2))
        if loser_wp <= winner_wp:
            pregame = 0.15
        else:
            pregame = max(0.15, min(1.0, (loser_wp - winner_wp) * 2.5 + 0.3))

    stakes = TOURNAMENT_STAKES.get(tournament, "Regular Season")
    stakes_factor = STAKES_FACTORS.get(stakes, 0.4)

    point_diff = abs(winner_score - loser_score)
    margin = min(1.0, point_diff / 3.0)

    date_str = row["date"].strftime("%Y-%m-%d")
    away_slug = slugify(row["away_team"])
    home_slug = slugify(row["home_team"])
    game_key = f"intl-{date_str}-{away_slug}-at-{home_slug}"

    entry = {
        "id": f"soccer-{game_key}",
        "sport": "soccer",
        "date": date_str,
        "season": date_str[:4],
        "event": tournament,
        "stakes": stakes,
        "winner": {
            "slug": slugify(winner),
            "name": winner,
            "recordEntering": f"{int(winner_wp * winner_games)}-{int((1-winner_wp) * winner_games)}"
                              if winner_games > 0 else "0-0",
        },
        "loser": {
            "slug": slugify(loser),
            "name": loser,
            "recordEntering": f"{int(loser_wp * loser_games)}-{int((1-loser_wp) * loser_games)}"
                              if loser_games > 0 else "0-0",
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
            "source": "martj42-international-results",
            "sourceGameId": game_key,
            "sourceUrl": "https://github.com/martj42/international_results",
            "retrievedAt": datetime.utcnow().isoformat() + "Z",
        },
        "methodologyVersion": "1.1",
        "slug": f"{away_slug}-at-{home_slug}",
        "published": False,
        "ingestedAt": datetime.utcnow().isoformat() + "Z",
    }
    return entry


def write_entry(entry: dict[str, Any]) -> None:
    year = entry["date"][:4]
    d = DATA_ROOT / year
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{entry['provenance']['sourceGameId']}.json").write_text(
        json.dumps(entry, indent=2)
    )


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--min-year", type=int, help="Filter to this year forward")
    ap.add_argument("--tournament", help="Filter to a specific tournament")
    args = ap.parse_args()

    if not SOURCE_CSV.exists():
        print(f"Missing: {SOURCE_CSV}", file=sys.stderr)
        return 1

    print("Loading and computing rolling records...")
    df = load_and_prep()
    df = compute_rolling_records(df, window_years=5)

    if args.min_year:
        df = df[df["date"].dt.year >= args.min_year]
        print(f"  Filtered to >= {args.min_year}: {len(df):,} matches")
    if args.tournament:
        df = df[df["tournament"] == args.tournament]
        print(f"  Filtered to {args.tournament}: {len(df):,} matches")

    written = 0
    skipped_draws = 0
    for row in df.to_dict("records"):
        if row["home_score"] == row["away_score"]:
            skipped_draws += 1
            continue
        entry = row_to_entry(row)
        if entry:
            write_entry(entry)
            written += 1

    print(f"\nWrote {written:,} entries ({skipped_draws:,} draws skipped)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
