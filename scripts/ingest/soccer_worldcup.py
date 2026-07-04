#!/usr/bin/env python3
"""
Historical World Cup ingest with round/stadium/goal context.

Source: openfootball/world-cup.json (cloned to ~/Desktop/Cloned/)
Coverage: Every FIFA World Cup 1930-2022, complete match results
with round names ("Match for third place", "Final", "Quarter-final"),
group letters, stadium names, goal timeline.

Stakes classification specifically for WC rounds:
    Final                    → Championship (1.0)
    Match for third place    → Playoffs (0.85)
    Semi-final               → Semifinal (0.9)
    Quarter-final            → Quarterfinal (0.85)
    Round of 16              → Playoffs (0.75)
    Group stage / matchday   → Group Stage (0.6)

Where an intl-ingested entry already exists for the same match (same
date, same teams), this ingest OVERWRITES with the richer WC context.
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent.parent
DATA_ROOT = PROJECT / "data" / "upsets" / "soccer"
SOURCE_ROOT = Path.home() / "Desktop/Cloned/world-cup.json"


ROUND_STAKES = {
    "Final": ("Championship", 1.0),
    "Match for third place": ("Playoffs", 0.85),
    "3rd place": ("Playoffs", 0.85),
    "Third place": ("Playoffs", 0.85),
    "Semi-finals": ("Semifinal", 0.9),
    "Semi-final": ("Semifinal", 0.9),
    "Semifinal": ("Semifinal", 0.9),
    "Quarter-finals": ("Quarterfinal", 0.85),
    "Quarter-final": ("Quarterfinal", 0.85),
    "Quarterfinal": ("Quarterfinal", 0.85),
    "Round of 16": ("Playoffs", 0.75),
    "Playoff": ("Playoffs", 0.75),
    "Play-offs": ("Playoffs", 0.75),
    "Play-off": ("Playoffs", 0.75),
    "Preliminary round": ("Group Stage", 0.6),
    "First round": ("Group Stage", 0.6),
    "Second round": ("Group Stage", 0.7),
}

# Rolling records loaded from martj42/international_results if available,
# for calibrating pregame factors. If not, fall back to neutral defaults.
try:
    import pandas as pd
    INTL = Path.home() / "Desktop/Cloned/international_results/results.csv"
    if INTL.exists():
        _intl_df = pd.read_csv(INTL, parse_dates=["date"])
    else:
        _intl_df = None
except Exception:
    _intl_df = None


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", (text or "").lower()).strip("-")
    return re.sub(r"-+", "-", s)


def stakes_for(round_name: str, group_name: str) -> tuple[str, float]:
    for k, v in ROUND_STAKES.items():
        if k.lower() in (round_name or "").lower():
            return v
    if "matchday" in (round_name or "").lower() or "matchday" in (group_name or "").lower():
        return ("Group Stage", 0.6)
    if "group" in (round_name or "").lower() or "group" in (group_name or "").lower():
        return ("Group Stage", 0.6)
    return ("Group Stage", 0.6)


def rolling_wp(team: str, before_date: str, years: int = 5) -> tuple[float, int]:
    """Compute win % over the trailing window before this date."""
    if _intl_df is None:
        return 0.5, 0
    cutoff = pd.Timestamp(before_date)
    window_start = cutoff - pd.Timedelta(days=years * 365)
    recent = _intl_df[
        (_intl_df["date"] >= window_start) &
        (_intl_df["date"] < cutoff) &
        ((_intl_df["home_team"] == team) | (_intl_df["away_team"] == team))
    ]
    if len(recent) == 0:
        return 0.5, 0
    wins = 0
    for r in recent.itertuples(index=False):
        home_won = r.home_score > r.away_score
        if r.home_team == team and home_won:
            wins += 1
        elif r.away_team == team and not home_won and r.home_score != r.away_score:
            wins += 1
    return wins / len(recent), len(recent)


def process_match(match: dict, year: int) -> dict | None:
    if not match.get("date") or not match.get("team1") or not match.get("team2"):
        return None
    score = match.get("score") or {}
    ft = score.get("ft") or []
    if len(ft) != 2:
        return None
    s1, s2 = ft[0], ft[1]
    if s1 == s2:
        return None  # skip draws

    home_won = s1 > s2
    winner_name = match["team1"] if home_won else match["team2"]
    loser_name = match["team2"] if home_won else match["team1"]
    winner_score = s1 if home_won else s2
    loser_score = s2 if home_won else s1

    date_str = match["date"]
    round_name = match.get("round") or ""
    group_name = match.get("group") or ""
    stadium = match.get("ground") or ""

    stakes, stakes_factor = stakes_for(round_name, group_name)

    # Pregame odds from rolling records
    winner_wp, winner_games = rolling_wp(winner_name, date_str)
    loser_wp, loser_games = rolling_wp(loser_name, date_str)

    MIN_SAMPLE = 20
    if min(winner_games, loser_games) < MIN_SAMPLE:
        pregame = 0.4  # slightly above the international floor since WC teams are elite
        rank_gap = 0.25
    else:
        rank_gap = max(0.0, min(1.0, (loser_wp - winner_wp) * 2))
        if loser_wp <= winner_wp:
            pregame = 0.15
        else:
            pregame = max(0.15, min(1.0, (loser_wp - winner_wp) * 2.5 + 0.3))

    point_diff = abs(winner_score - loser_score)
    margin = min(1.0, point_diff / 3.0)

    away_slug = slugify(match["team2"])
    home_slug = slugify(match["team1"])
    game_id = f"wc{year}-{date_str}-{away_slug}-at-{home_slug}"

    event_label = f"World Cup {year}"
    if round_name:
        event_label += f" · {round_name}"

    entry = {
        "id": f"soccer-{game_id}",
        "sport": "soccer",
        "date": date_str,
        "season": str(year),
        "event": event_label,
        "stakes": stakes,
        "context": f"{round_name} at {stadium}." if stadium else round_name,
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
            "source": "openfootball-world-cup",
            "sourceGameId": game_id,
            "sourceUrl": f"https://github.com/openfootball/world-cup.json",
            "retrievedAt": datetime.utcnow().isoformat() + "Z",
        },
        "methodologyVersion": "1.2",
        "slug": f"{away_slug}-at-{home_slug}",
        "published": False,
        "ingestedAt": datetime.utcnow().isoformat() + "Z",
    }
    return entry


def main() -> int:
    if not SOURCE_ROOT.exists():
        print(f"Missing: {SOURCE_ROOT}", file=sys.stderr)
        return 1

    written = 0
    for year_dir in sorted(SOURCE_ROOT.iterdir()):
        if not year_dir.is_dir():
            continue
        try:
            year = int(year_dir.name)
        except ValueError:
            continue
        wc_file = year_dir / "worldcup.json"
        if not wc_file.exists():
            continue
        try:
            data = json.loads(wc_file.read_text())
        except Exception as e:
            print(f"  [!] {year}: {e}", file=sys.stderr)
            continue

        matches = data.get("matches") or []
        for m in matches:
            entry = process_match(m, year)
            if not entry:
                continue
            out_year = entry["date"][:4]
            d = DATA_ROOT / out_year
            d.mkdir(parents=True, exist_ok=True)
            (d / f"{entry['provenance']['sourceGameId']}.json").write_text(
                json.dumps(entry, indent=2)
            )
            written += 1
        print(f"  {year}: {len(matches)} matches, {written} total written")

    print(f"\nTotal WC entries written: {written:,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
