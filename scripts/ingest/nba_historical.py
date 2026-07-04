#!/usr/bin/env python3
"""
NBA historical ingest from Miller's local data assets.

Reads the pre-collected NBA box scores (1970-2025) and odds data
(2007-2025), joins them, and writes canonical UpsetEntry JSONs. This is
Miller's real archive — the file paths are hardcoded to his Mac and the
outputs land in the UpsetMetrics repo.

Sources:
    ~/Desktop/Code/SportsAnalytics/nba_all_boxscores_merged.parquet
    ~/Desktop/Code/SportsAnalytics/nba_spread_model/data/odds_all.parquet

Where odds are available, uses real moneyline (methodology v1.1).
Otherwise falls back to record-based proxy (v1.0). Every entry carries
its methodology version so the site can display which formula scored it.

Usage:
    python3 scripts/ingest/nba_historical.py                 # all seasons
    python3 scripts/ingest/nba_historical.py --season 2024-25
    python3 scripts/ingest/nba_historical.py --min-year 2007  # only games with odds
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
    print("pandas required: pip install pandas pyarrow", file=sys.stderr)
    sys.exit(1)

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "nba"

HOME = Path.home()
BOX_PATH = HOME / "Desktop/Code/SportsAnalytics/nba_all_boxscores_merged.parquet"
ODDS_PATH = HOME / "Desktop/Code/SportsAnalytics/nba_spread_model/data/odds_all.parquet"

TEAM_SLUG_OVERRIDES = {
    "Los Angeles Clippers": "clippers",
    "Los Angeles Lakers": "lakers",
    "Golden State Warriors": "warriors",
    "San Antonio Spurs": "spurs",
    "New Orleans Hornets": "hornets-nola-classic",
    "New Orleans Pelicans": "pelicans",
    "New Jersey Nets": "nets-nj",
    "Brooklyn Nets": "nets",
    "Seattle SuperSonics": "sonics",
    "Oklahoma City Thunder": "thunder",
    "Vancouver Grizzlies": "grizzlies-vancouver",
    "Memphis Grizzlies": "grizzlies",
    "Washington Bullets": "bullets",
    "Washington Wizards": "wizards",
    "Charlotte Bobcats": "bobcats",
    "Charlotte Hornets": "hornets",
    "New Orleans/Oklahoma City Hornets": "hornets-katrina",
}


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


def team_slug(name: str) -> str:
    if name in TEAM_SLUG_OVERRIDES:
        return TEAM_SLUG_OVERRIDES[name]
    return slugify(name)


def implied_prob_from_ml(ml: float) -> float:
    """American moneyline to implied win probability."""
    if pd.isna(ml):
        return 0.5
    return 100 / (ml + 100) if ml > 0 else abs(ml) / (abs(ml) + 100)


def load_games() -> pd.DataFrame:
    """
    Aggregate raw player-game boxscore rows into one row per game with:
    date, home_team_full, away_team_full, home_score, away_score, winner_side, matchup, game_id, season_year
    """
    print(f"Loading boxscores from {BOX_PATH.name}...")
    bx = pd.read_parquet(
        BOX_PATH,
        columns=["game_id", "date", "season_year", "team", "team_name",
                 "matchup", "win_loss", "pts"],
    )
    bx = bx.dropna(subset=["game_id", "date", "matchup"])
    bx["date"] = pd.to_datetime(bx["date"], errors="coerce")
    bx = bx.dropna(subset=["date"])

    # Sum team points per game
    team_totals = bx.groupby(["game_id", "team_name", "matchup"], as_index=False).agg(
        pts=("pts", "sum"),
        win=("win_loss", lambda s: "W" if "W" in s.values else "L"),
    )
    # Get date + season per game
    per_game = bx.groupby("game_id").agg(
        date=("date", "first"),
        season_year=("season_year", "first"),
    ).reset_index()

    # Merge home/away from matchup: e.g. "SAS vs. POR" means SAS is home; "SAS @ POR" means SAS is away.
    # We'll split by matchup and combine into wide format per game.
    games = per_game.copy()
    # For each game find both team totals
    tt_by_game = team_totals.groupby("game_id")
    home_teams, home_scores, away_teams, away_scores, winners = [], [], [], [], []
    for gid, grp in tt_by_game:
        rows = grp.to_dict("records")
        if len(rows) != 2:
            home_teams.append(None); home_scores.append(None)
            away_teams.append(None); away_scores.append(None)
            winners.append(None)
            continue
        r0, r1 = rows
        # Determine home from matchup: "TEAM vs. OPP" → TEAM is home; "TEAM @ OPP" → TEAM is away
        m0 = r0["matchup"]
        m1 = r1["matchup"]
        if "vs" in (m0 or ""):
            home, away = r0, r1
        elif "vs" in (m1 or ""):
            home, away = r1, r0
        else:
            home, away = r0, r1
        home_teams.append(home["team_name"])
        home_scores.append(home["pts"])
        away_teams.append(away["team_name"])
        away_scores.append(away["pts"])
        winners.append("home" if home["win"] == "W" else "away")

    games["home_team"] = home_teams
    games["home_score"] = home_scores
    games["away_team"] = away_teams
    games["away_score"] = away_scores
    games["winner"] = winners
    games = games.dropna(subset=["home_team", "away_team", "home_score", "away_score", "winner"])
    print(f"  {len(games):,} games aggregated")
    return games


def load_odds() -> pd.DataFrame:
    print(f"Loading odds from {ODDS_PATH.name}...")
    odds = pd.read_parquet(ODDS_PATH)
    odds["Date"] = pd.to_datetime(odds["Date"])
    print(f"  {len(odds):,} games with odds ({odds['Date'].min().date()} → {odds['Date'].max().date()})")
    return odds


def merge_games_odds(games: pd.DataFrame, odds: pd.DataFrame) -> pd.DataFrame:
    merged = games.merge(
        odds[["Date", "Home", "Away", "ML_Home", "ML_Away", "Spread"]],
        how="left",
        left_on=["date", "home_team", "away_team"],
        right_on=["Date", "Home", "Away"],
    )
    with_odds = merged["ML_Home"].notna().sum()
    print(f"  {with_odds:,} of {len(merged):,} games matched to odds ({with_odds / max(1,len(merged)) * 100:.1f}%)")
    return merged


def make_entry(row: dict[str, Any]) -> dict[str, Any] | None:
    date_obj = row.get("date")
    if pd.isna(date_obj):
        return None
    date_str = date_obj.strftime("%Y-%m-%d") if hasattr(date_obj, "strftime") else str(date_obj)[:10]

    home_team = row["home_team"]
    away_team = row["away_team"]
    home_score = int(row["home_score"])
    away_score = int(row["away_score"])
    home_won = row["winner"] == "home"

    winner_name = home_team if home_won else away_team
    loser_name = away_team if home_won else home_team
    winner_score = home_score if home_won else away_score
    loser_score = away_score if home_won else home_score

    ml_home = row.get("ML_Home")
    ml_away = row.get("ML_Away")

    if pd.notna(ml_home) and pd.notna(ml_away):
        # v1.1: real moneyline
        winner_ml = ml_home if home_won else ml_away
        loser_ml = ml_away if home_won else ml_home
        loser_implied = implied_prob_from_ml(loser_ml)
        # Bigger underdog wins = bigger upset. Underdog is the side with
        # positive ML (higher implied), or the higher-ML side if both signs match.
        # We want the PROBABILITY that the winner should have LOST.
        winner_implied = implied_prob_from_ml(winner_ml)
        # Pregame odds factor is 1 - winner_implied — how unlikely the outcome was.
        pregame_odds_factor = round(max(0.0, min(0.98, 1 - winner_implied)), 3)
        methodology_version = "1.1"
        provenance_source = "local-nba-boxscore+odds"
        rank_gap = pregame_odds_factor  # use the same signal for both when odds present
    else:
        # v1.0 fallback: no odds
        pregame_odds_factor = 0.4
        methodology_version = "1.0"
        provenance_source = "local-nba-boxscore"
        rank_gap = 0.4

    # Stakes — inferred from season month (playoffs typically Apr-Jun)
    stakes = "Regular Season"
    stakes_factor = 0.4
    month = date_obj.month if hasattr(date_obj, "month") else int(date_str[5:7])
    if month in (4, 5, 6):
        # Rough playoff heuristic — refine per-team when we backfill schedules
        stakes = "Playoffs"
        stakes_factor = 0.85
    if month == 6:
        # NBA Finals are always June
        stakes = "Finals"
        stakes_factor = 1.0

    # Streak factor — placeholder without deeper backfill
    streak = 0.3

    # Margin — NBA blowout threshold = 20
    point_diff = abs(winner_score - loser_score)
    margin = round(min(1.0, point_diff / 20.0), 3)

    entry = {
        "id": f"nba-{date_str}-{team_slug(away_team)}-at-{team_slug(home_team)}",
        "sport": "nba",
        "date": date_str,
        "season": row.get("season_year", ""),
        "event": None,
        "stakes": stakes,
        "winner": {
            "slug": team_slug(winner_name),
            "name": winner_name,
        },
        "loser": {
            "slug": team_slug(loser_name),
            "name": loser_name,
        },
        "finalScore": f"{winner_score}-{loser_score}",
        "factors": {
            "pregameOddsFactor": pregame_odds_factor,
            "rankGapFactor": round(rank_gap, 3),
            "streakFactor": streak,
            "stakesFactor": stakes_factor,
            "marginFactor": margin,
        },
        "provenance": {
            "source": provenance_source,
            "sourceGameId": str(row["game_id"]),
            "sourceUrl": None,
            "retrievedAt": datetime.utcnow().isoformat() + "Z",
        },
        "methodologyVersion": methodology_version,
        "slug": f"{team_slug(away_team)}-at-{team_slug(home_team)}",
        "published": False,
        "ingestedAt": datetime.utcnow().isoformat() + "Z",
    }
    return entry


def write_entry(entry: dict[str, Any]) -> None:
    year = entry["date"][:4]
    d = DATA_ROOT / year
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{entry['provenance']['sourceGameId']}.json").write_text(json.dumps(entry, indent=2))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--season", help="e.g., 2024-25")
    ap.add_argument("--min-year", type=int, help="Only include games from this year onward")
    args = ap.parse_args()

    games = load_games()
    odds = load_odds()
    merged = merge_games_odds(games, odds)

    if args.season:
        merged = merged[merged["season_year"] == args.season]
        print(f"  Filtered to {args.season}: {len(merged):,} games")

    if args.min_year:
        merged = merged[merged["date"].dt.year >= args.min_year]
        print(f"  Filtered to >= {args.min_year}: {len(merged):,} games")

    written = 0
    for _, row in merged.iterrows():
        entry = make_entry(row.to_dict())
        if entry:
            write_entry(entry)
            written += 1

    print(f"\nWrote {written:,} entries under {DATA_ROOT.relative_to(PROJECT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
