#!/usr/bin/env python3
"""
Pack 200K individual JSON files into compressed JSONL per (sport, year).

Reads data/upsets/[sport]/[year]/*.json and writes
    data/packed/[sport]/[year].jsonl.gz

Result: 200K files -> ~50 files, ~500 MB -> ~30 MB (gzipped compact JSONL).

The site reader (lib/data/upsets.ts) prefers packed files when they
exist and falls back to individual JSONs. This lets ingest scripts
append individual files locally without needing to unpack, and
deployment reads only the packed archives.

Run this after any ingest that adds new games:
    python3 scripts/ingest/mlb.py --today
    python3 scripts/build_pack.py
    git add data/packed/ && git commit -am "..."

Or wire it into the daily cron so every push is packed automatically.
"""
from __future__ import annotations
import gzip, json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
UNPACKED = PROJECT / "data" / "upsets"
PACKED = PROJECT / "data" / "packed"


def main() -> int:
    if not UNPACKED.exists():
        print(f"missing {UNPACKED}", file=sys.stderr)
        return 1

    total_entries = 0
    total_files_written = 0
    for sport_dir in sorted(UNPACKED.iterdir()):
        if not sport_dir.is_dir():
            continue
        sport = sport_dir.name
        for year_dir in sorted(sport_dir.iterdir()):
            if not year_dir.is_dir():
                continue
            year = year_dir.name

            entries = []
            for f in sorted(year_dir.glob("*.json")):
                try:
                    entries.append(json.loads(f.read_text()))
                except Exception:
                    continue
            if not entries:
                continue

            out_dir = PACKED / sport
            out_dir.mkdir(parents=True, exist_ok=True)
            out_file = out_dir / f"{year}.jsonl.gz"
            with gzip.open(out_file, "wt", compresslevel=9) as gz:
                for e in entries:
                    gz.write(json.dumps(e, separators=(",", ":")))
                    gz.write("\n")
            total_entries += len(entries)
            total_files_written += 1

    # Report
    unpacked_files = sum(1 for _ in UNPACKED.rglob("*.json"))
    unpacked_bytes = sum(f.stat().st_size for f in UNPACKED.rglob("*.json"))
    packed_files = sum(1 for _ in PACKED.rglob("*.jsonl.gz"))
    packed_bytes = sum(f.stat().st_size for f in PACKED.rglob("*.jsonl.gz"))

    print(f"Packed {total_entries:,} entries -> {total_files_written} files")
    print(f"  Unpacked: {unpacked_files:,} files, {unpacked_bytes / 1e6:.1f} MB")
    print(f"  Packed:   {packed_files:,} files, {packed_bytes / 1e6:.1f} MB")
    print(f"  Compression: {unpacked_bytes / max(1, packed_bytes):.1f}x")
    return 0


if __name__ == "__main__":
    sys.exit(main())
