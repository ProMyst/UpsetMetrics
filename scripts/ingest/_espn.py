#!/usr/bin/env python3
"""
Shared ESPN scoreboard client.

ESPN exposes a public JSON scoreboard endpoint that covers WNBA, MLB,
NBA, NFL, and every major soccer league. Reliable, well-structured, no
auth. This module normalizes it into the UpsetEntry shape used by every
sport-specific ingester.

Usage from an ingester:
    from _espn import fetch_scoreboard, event_to_entry
    events = fetch_scoreboard("basketball/wnba", "20260703")
    entry = event_to_entry(events[0], sport="wnba", ...)
"""

from __future__ import annotations

import json
import re
import sys
import time
import urllib.request
from datetime import date, datetime, timedelta
from typing import Any, Iterator

BASE = "https://site.api.espn.com/apis/site/v2/sports"
UA = "UpsetMetrics/1.0"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9-]+", "-", text.lower()).strip("-")
    return re.sub(r"-+", "-", s)


def fetch_scoreboard(path: str, yyyymmdd: str) -> list[dict[str, Any]]:
    """
    path examples:
      "basketball/wnba"
      "basketball/nba"
      "baseball/mlb"
      "football/nfl"
      "soccer/fifa.world"           # FIFA World Cup
      "soccer/eng.1"                # Premier League
      "soccer/uefa.champions"       # UCL

    yyyymmdd: "20260703"
    """
    url = f"{BASE}/{path}/scoreboard?dates={yyyymmdd}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        print(f"  [!] {yyyymmdd} {path}: {e}", file=sys.stderr)
        return []
    return data.get("events") or []


def dates_in_range(start: date, end: date) -> Iterator[str]:
    cur = start
    while cur <= end:
        yield cur.strftime("%Y%m%d")
        cur += timedelta(days=1)


def parse_record(summary: str) -> tuple[int, int]:
    """Parse "10-9" or "12-4-1" (soccer with draws) into (W, L)."""
    try:
        parts = summary.split("-")
        if len(parts) >= 2:
            return int(parts[0]), int(parts[1])
    except Exception:
        pass
    return 0, 0


def event_to_entry(
    event: dict[str, Any],
    *,
    sport: str,
    stakes_default: str = "Regular Season",
    margin_threshold: float = 15.0,
    stakes_from_note: bool = True,
) -> dict[str, Any] | None:
    """Convert an ESPN scoreboard event to a canonical UpsetEntry dict."""
    comp = (event.get("competitions") or [{}])[0]
    status = ((comp.get("status") or {}).get("type") or {}).get("name")
    # ESPN uses STATUS_FINAL for MLB/NBA/WNBA/NFL and STATUS_FULL_TIME for
    # soccer. Both indicate a resolved final score.
    if status not in ("STATUS_FINAL", "STATUS_FULL_TIME"):
        return None

    competitors = comp.get("competitors") or []
    if len(competitors) != 2:
        return None

    home = next((c for c in competitors if c.get("homeAway") == "home"), None)
    away = next((c for c in competitors if c.get("homeAway") == "away"), None)
    if not home or not away:
        return None

    def team_bits(c: dict[str, Any]) -> tuple[str, int, str]:
        t = c.get("team", {})
        name = t.get("displayName") or t.get("name") or ""
        score = int(c.get("score") or 0)
        rec = (c.get("records") or [{}])[0].get("summary", "")
        return name, score, rec

    home_name, home_score, home_rec = team_bits(home)
    away_name, away_score, away_rec = team_bits(away)

    # Soccer draws are valid results (both scores can be 0). Skip only if
    # the status flag ALSO says the game hasn't started (defensive check).
    if home_score == 0 and away_score == 0 and status == "STATUS_FINAL":
        return None  # unresolved MLB/NBA/etc

    if home_score == away_score:
        # A draw isn't an "upset" in the winner/loser sense; skip for now.
        # Future: soccer-specific draw-upset handling (drew when heavy favorite).
        return None

    home_won = home_score > away_score
    winner_name = home_name if home_won else away_name
    loser_name = away_name if home_won else home_name
    winner_score = home_score if home_won else away_score
    loser_score = away_score if home_won else home_score
    winner_rec = home_rec if home_won else away_rec
    loser_rec = away_rec if home_won else home_rec

    ww, wl = parse_record(winner_rec)
    lw, ll = parse_record(loser_rec)
    winner_games = ww + wl
    loser_games = lw + ll
    winner_wp = ww / max(1, winner_games)
    loser_wp = lw / max(1, loser_games)

    # Small-sample floor: with fewer than 5 games entering, records are
    # too noisy to trust as a proxy for pregame odds. Use conservative
    # neutral defaults so a WC group-stage 1-1-0 vs 1-0-1 doesn't produce
    # a fake 86 upset when the actual FIFA-ranked favorite won.
    MIN_SAMPLE = 5
    if min(winner_games, loser_games) < MIN_SAMPLE:
        pregame_odds = 0.35
        rank_gap = 0.2
    else:
        rank_gap = max(0.0, min(1.0, (loser_wp - winner_wp) * 2))
        if loser_wp <= winner_wp:
            pregame_odds = 0.15
        else:
            pregame_odds = max(0.15, min(1.0, (loser_wp - winner_wp) * 2.5 + 0.3))

    # Stakes — pull from the event's season type or notes
    stakes = stakes_default
    season_type = ((event.get("season") or {}).get("type") or 0) or (
        (event.get("season") or {}).get("slug", "")
    )
    if stakes_from_note:
        notes = comp.get("notes") or []
        for n in notes:
            headline = (n.get("headline") or "").lower()
            if any(k in headline for k in ["final", "championship"]):
                stakes = "Championship"
                break
            if any(k in headline for k in ["semifinal", "conf finals"]):
                stakes = "Semifinal"
                break
            if any(k in headline for k in ["quarter", "quarter-final", "elite eight"]):
                stakes = "Quarterfinal"
                break
            if any(k in headline for k in ["playoff", "postseason", "wild card", "knockout"]):
                stakes = "Playoffs"
                break
            if "group" in headline:
                stakes = "Group Stage"
                break
    stakes_factor_map = {
        "Championship": 1.0,
        "Semifinal": 0.9,
        "Quarterfinal": 0.85,
        "Playoffs": 0.85,
        "Wild Card": 0.75,
        "Group Stage": 0.6,
        "Regular Season": 0.4,
    }
    stakes_factor = stakes_factor_map.get(stakes, 0.4)

    point_diff = abs(winner_score - loser_score)
    margin = min(1.0, point_diff / margin_threshold)

    game_date = (event.get("date") or "")[:10]

    entry = {
        "id": f"{sport}-{game_date}-{slugify(away_name)}-at-{slugify(home_name)}",
        "sport": sport,
        "date": game_date,
        "startTime": event.get("date"),
        "season": str(((event.get("season") or {}).get("year")) or game_date[:4]),
        "event": (comp.get("notes") or [{}])[0].get("headline") if comp.get("notes") else None,
        "stakes": stakes,
        "winner": {
            "slug": slugify(winner_name),
            "name": winner_name,
            "recordEntering": winner_rec,
        },
        "loser": {
            "slug": slugify(loser_name),
            "name": loser_name,
            "recordEntering": loser_rec,
        },
        "finalScore": f"{winner_score}-{loser_score}",
        "factors": {
            "pregameOddsFactor": round(pregame_odds, 3),
            "rankGapFactor": round(rank_gap, 3),
            "streakFactor": 0.3,
            "stakesFactor": round(stakes_factor, 3),
            "marginFactor": round(margin, 3),
        },
        "provenance": {
            "source": f"espn-{sport}",
            "sourceGameId": str(event.get("id") or comp.get("id") or ""),
            "sourceUrl": f"https://www.espn.com/{sport}/game/_/gameId/{event.get('id')}",
            "retrievedAt": datetime.utcnow().isoformat() + "Z",
        },
        "methodologyVersion": "1.0",
        "slug": f"{slugify(away_name)}-at-{slugify(home_name)}",
        "published": False,
        "ingestedAt": datetime.utcnow().isoformat() + "Z",
    }
    return entry


def crawl_range(
    path: str, sport: str, start: date, end: date, *, delay: float = 0.15,
    **entry_kwargs,
) -> list[dict[str, Any]]:
    all_entries: list[dict[str, Any]] = []
    for yyyymmdd in dates_in_range(start, end):
        events = fetch_scoreboard(path, yyyymmdd)
        for e in events:
            entry = event_to_entry(e, sport=sport, **entry_kwargs)
            if entry:
                all_entries.append(entry)
        time.sleep(delay)
    return all_entries
