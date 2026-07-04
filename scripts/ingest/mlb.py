#!/usr/bin/env python3
"""
MLB game ingestion via MLB StatsAPI.

Pulls every completed game in a date range and writes canonical UpsetEntry
records to data/upsets/mlb/{year}/{game-id}.json.

The upset score is computed by JS (lib/scoring/upset-score.ts) at build
time, not here — Python only writes the raw factors. Keeps the formula
one-source-of-truth in TypeScript on the site.

Source:
    https://statsapi.mlb.com/api/v1/schedule
    Undocumented public API. Free. No auth required. Rate limits are lax.

Usage:
    python3 scripts/ingest/mlb.py --from 2026-04-01 --to 2026-07-03
    python3 scripts/ingest/mlb.py --season 2024        # full season
    python3 scripts/ingest/mlb.py --yesterday          # yesterday only
    python3 scripts/ingest/mlb.py --today              # today only

Rerun-safe: existing files get overwritten with fresh data on subsequent
pulls (useful if a game got a resolution correction).
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.request
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "mlb"

STATSAPI = "https://statsapi.mlb.com/api/v1"
SOURCE = "mlb-statsapi"

MLB_TEAM_SLUGS = {
    "Arizona Diamondbacks": "diamondbacks",
    "Atlanta Braves": "braves",
    "Baltimore Orioles": "orioles",
    "Boston Red Sox": "red-sox",
    "Chicago White Sox": "white-sox",
    "Chicago Cubs": "cubs",
    "Cincinnati Reds": "reds",
    "Cleveland Guardians": "guardians",
    "Colorado Rockies": "rockies",
    "Detroit Tigers": "tigers",
    "Houston Astros": "astros",
    "Kansas City Royals": "royals",
    "Los Angeles Angels": "angels",
    "Los Angeles Dodgers": "dodgers",
    "Miami Marlins": "marlins",
    "Milwaukee Brewers": "brewers",
    "Minnesota Twins": "twins",
    "New York Yankees": "yankees",
    "New York Mets": "mets",
    "Athletics": "athletics",
    "Oakland Athletics": "athletics",
    "Philadelphia Phillies": "phillies",
    "Pittsburgh Pirates": "pirates",
    "San Diego Padres": "padres",
    "San Francisco Giants": "giants",
    "Seattle Mariners": "mariners",
    "St. Louis Cardinals": "cardinals",
    "Tampa Bay Rays": "rays",
    "Texas Rangers": "rangers",
    "Toronto Blue Jays": "blue-jays",
    "Washington Nationals": "nationals",
}


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", text.lower()).strip("-")
    return re.sub(r"-+", "-", s)


def team_slug(team_name: str) -> str:
    if team_name in MLB_TEAM_SLUGS:
        return MLB_TEAM_SLUGS[team_name]
    return slugify(team_name)


def fetch(url: str) -> dict[str, Any]:
    req = urllib.request.Request(url, headers={"User-Agent": "UpsetMetrics/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def games_between(start: date, end: date) -> list[dict[str, Any]]:
    """Fetch every game in the date range, one API call per date."""
    all_games: list[dict[str, Any]] = []
    cur = start
    while cur <= end:
        url = f"{STATSAPI}/schedule?sportId=1&date={cur.isoformat()}"
        try:
            data = fetch(url)
        except Exception as e:
            print(f"  [!] Failed {cur}: {e}", file=sys.stderr)
            cur += timedelta(days=1)
            continue
        for date_block in data.get("dates", []):
            for game in date_block.get("games", []):
                # Only completed games get scored
                status = (game.get("status") or {}).get("abstractGameState")
                if status != "Final":
                    continue
                all_games.append(game)
        # Be gentle
        time.sleep(0.15)
        cur += timedelta(days=1)
    return all_games


def game_to_entry(game: dict[str, Any]) -> dict[str, Any] | None:
    """Convert a raw StatsAPI schedule entry to an UpsetEntry-shaped dict.

    Factors that require pre-game odds or ELO are set to reasonable
    placeholders here; the JS scoring layer is authoritative for the
    final upsetScore, computed at build time.
    """
    game_pk = game.get("gamePk")
    if game_pk is None:
        return None

    teams = game.get("teams") or {}
    home = teams.get("home") or {}
    away = teams.get("away") or {}
    home_team = (home.get("team") or {}).get("name", "")
    away_team = (away.get("team") or {}).get("name", "")
    home_score = home.get("score", 0) or 0
    away_score = away.get("score", 0) or 0
    home_won = bool(home.get("isWinner"))

    winner_name = home_team if home_won else away_team
    loser_name = away_team if home_won else home_team
    winner_score = home_score if home_won else away_score
    loser_score = away_score if home_won else home_score

    game_date = game.get("officialDate") or game.get("gameDate", "")[:10]
    start_time = game.get("gameDate")
    season = str(game.get("season", ""))

    # Records entering
    home_record = home.get("leagueRecord") or {}
    away_record = away.get("leagueRecord") or {}
    winner_record = home_record if home_won else away_record
    loser_record = away_record if home_won else home_record

    # Stakes: playoffs vs regular season
    game_type = game.get("gameType", "R")
    stakes = {
        "R": "Regular Season",
        "F": "Wild Card",
        "D": "Division Series",
        "L": "Championship Series",
        "W": "World Series",
    }.get(game_type, "Regular Season")

    # Series context (for playoffs)
    series_desc = game.get("seriesDescription") or ""
    event = series_desc if game_type != "R" else None

    # Placeholder factors — these get refined when a moneyline / ELO
    # backfill script runs. For now: use a coarse "record-based" proxy.
    winner_wins = int(winner_record.get("wins", 0))
    winner_losses = int(winner_record.get("losses", 0))
    loser_wins = int(loser_record.get("wins", 0))
    loser_losses = int(loser_record.get("losses", 0))
    winner_wp = winner_wins / max(1, winner_wins + winner_losses)
    loser_wp = loser_wins / max(1, loser_wins + loser_losses)

    # Rank gap: how much better was the loser? Only counts as upset if the
    # loser had a better record entering the game.
    rank_gap = max(0.0, min(1.0, (loser_wp - winner_wp) * 2))

    # Pregame odds proxy: use record differential heuristically. Real
    # backfill replaces this with actual moneyline data.
    pregame_odds = max(0.0, min(1.0, (loser_wp - winner_wp) * 2.5 + 0.3))
    if loser_wp <= winner_wp:
        pregame_odds = 0.15  # not an upset by record

    # Streak factor placeholder — will be filled by streak backfill
    streak = 0.3

    # Stakes factor
    stakes_multipliers = {
        "Regular Season": 0.4,
        "Wild Card": 0.75,
        "Division Series": 0.85,
        "Championship Series": 0.9,
        "World Series": 1.0,
    }
    stakes_factor = stakes_multipliers.get(stakes, 0.4)

    # Margin factor: MLB blowout threshold = 6 runs
    point_diff = abs(winner_score - loser_score)
    margin = min(1.0, point_diff / 6.0)

    entry = {
        "id": f"mlb-{game_date}-{team_slug(away_team)}-at-{team_slug(home_team)}",
        "sport": "mlb",
        "date": game_date,
        "startTime": start_time,
        "season": season,
        "event": event,
        "stakes": stakes,
        "winner": {
            "slug": team_slug(winner_name),
            "name": winner_name,
            "recordEntering": f"{winner_wins}-{winner_losses}",
        },
        "loser": {
            "slug": team_slug(loser_name),
            "name": loser_name,
            "recordEntering": f"{loser_wins}-{loser_losses}",
        },
        "finalScore": f"{winner_score}-{loser_score}",
        "factors": {
            "pregameOddsFactor": round(pregame_odds, 3),
            "rankGapFactor": round(rank_gap, 3),
            "streakFactor": round(streak, 3),
            "stakesFactor": round(stakes_factor, 3),
            "marginFactor": round(margin, 3),
        },
        "provenance": {
            "source": SOURCE,
            "sourceGameId": str(game_pk),
            "sourceUrl": f"{STATSAPI}/game/{game_pk}/feed/live",
            "retrievedAt": datetime.utcnow().isoformat() + "Z",
        },
        "methodologyVersion": "1.0",
        "slug": f"{team_slug(away_team)}-at-{team_slug(home_team)}",
        "published": False,  # gets set true when a human reviews
        "ingestedAt": datetime.utcnow().isoformat() + "Z",
    }
    return entry


def write_entry(entry: dict[str, Any]) -> Path:
    year = entry["date"][:4]
    out_dir = DATA_ROOT / year
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{entry['provenance']['sourceGameId']}.json"
    with out.open("w") as f:
        json.dump(entry, f, indent=2)
    return out


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--from", dest="date_from", help="YYYY-MM-DD")
    ap.add_argument("--to", dest="date_to", help="YYYY-MM-DD")
    ap.add_argument("--season", type=int, help="Full season year, e.g., 2024")
    ap.add_argument("--yesterday", action="store_true")
    ap.add_argument("--today", action="store_true")
    args = ap.parse_args()

    today = date.today()
    if args.today:
        start = end = today
    elif args.yesterday:
        start = end = today - timedelta(days=1)
    elif args.season:
        # MLB regular season roughly Mar 20 - Oct 5, then playoffs to early Nov
        start = date(args.season, 3, 20)
        end = date(args.season, 11, 5) if args.season < today.year else today
    elif args.date_from and args.date_to:
        start = date.fromisoformat(args.date_from)
        end = date.fromisoformat(args.date_to)
    else:
        print("Provide --from/--to, --season YYYY, --yesterday, or --today",
              file=sys.stderr)
        return 2

    print(f"Fetching MLB games from {start} through {end}...")
    games = games_between(start, end)
    print(f"  {len(games)} final games found")

    written = 0
    for game in games:
        entry = game_to_entry(game)
        if entry is None:
            continue
        write_entry(entry)
        written += 1
    print(f"  Wrote {written} entries under {DATA_ROOT.relative_to(PROJECT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
