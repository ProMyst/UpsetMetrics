#!/usr/bin/env python3
"""
Rescore all ingested entries with the small-sample floor.

Reads every data/upsets/[sport]/[year]/*.json, applies the new logic
that neutralizes record-based factors when either team has fewer than
MIN_SAMPLE games entering the contest, writes the fixed factors back.

The NBA historical archive uses REAL closing moneylines (methodology
1.1) for 20K+ games — those are untouched. Only entries with
record-based proxies get the floor applied.

MIN_SAMPLE per sport:
  soccer   — 5   games (FIFA WC group stage is 3 games max)
  wnba     — 5   games
  mlb      — 15  games (162-game season)
  nfl      — 3   games (17-game season)
  nba      — 8   games (82-game season; only if without real ML data)
"""
from __future__ import annotations
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
DATA_ROOT = PROJECT / "data" / "upsets"

MIN_SAMPLE = {
    "soccer": 5,
    "wnba": 5,
    "mlb": 15,
    "nfl": 3,
    "nba": 8,
}

def parse_record(rec: str) -> tuple[int, int]:
    try:
        parts = rec.split("-")
        if len(parts) >= 2:
            return int(parts[0]), int(parts[1])
    except Exception:
        pass
    return 0, 0


def rescore(entry: dict) -> bool:
    """Return True if the entry was updated."""
    # Skip entries with real ML data (methodology 1.1 on NBA archive)
    if entry.get("provenance", {}).get("source") == "local-nba-boxscore+odds":
        return False

    winner_rec = (entry.get("winner") or {}).get("recordEntering", "")
    loser_rec = (entry.get("loser") or {}).get("recordEntering", "")
    if not winner_rec or not loser_rec:
        return False

    ww, wl = parse_record(winner_rec)
    lw, ll = parse_record(loser_rec)
    winner_games = ww + wl
    loser_games = lw + ll

    sport = entry.get("sport", "")
    min_sample = MIN_SAMPLE.get(sport, 5)

    factors = entry.get("factors", {})
    if min(winner_games, loser_games) < min_sample:
        # Neutralize the record-based factors
        new_pregame = 0.35
        new_rank = 0.2
    else:
        winner_wp = ww / max(1, winner_games)
        loser_wp = lw / max(1, loser_games)
        new_rank = max(0.0, min(1.0, (loser_wp - winner_wp) * 2))
        if loser_wp <= winner_wp:
            new_pregame = 0.15
        else:
            new_pregame = max(0.15, min(1.0, (loser_wp - winner_wp) * 2.5 + 0.3))

    old_pregame = factors.get("pregameOddsFactor")
    old_rank = factors.get("rankGapFactor")

    if abs(new_pregame - old_pregame) < 0.001 and abs(new_rank - old_rank) < 0.001:
        return False

    factors["pregameOddsFactor"] = round(new_pregame, 3)
    factors["rankGapFactor"] = round(new_rank, 3)
    entry["factors"] = factors
    return True


def main() -> int:
    if not DATA_ROOT.exists():
        print(f"no data at {DATA_ROOT}", file=sys.stderr)
        return 1

    total = 0
    updated = 0
    per_sport = {}
    for sport_dir in DATA_ROOT.iterdir():
        if not sport_dir.is_dir():
            continue
        for year_dir in sport_dir.iterdir():
            if not year_dir.is_dir():
                continue
            for f in year_dir.glob("*.json"):
                try:
                    entry = json.loads(f.read_text())
                except Exception:
                    continue
                total += 1
                if rescore(entry):
                    f.write_text(json.dumps(entry, indent=2))
                    updated += 1
                    per_sport[sport_dir.name] = per_sport.get(sport_dir.name, 0) + 1

    print(f"Rescored {updated:,} of {total:,} entries")
    for sport, n in sorted(per_sport.items(), key=lambda x: -x[1]):
        print(f"  {sport}: {n:,}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
