import "server-only";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type { SportSlug, UpsetEntry } from "@/lib/schema/upset";
import { computeUpsetScore } from "@/lib/scoring/upset-score";

const PACKED_ROOT = path.join(process.cwd(), "data", "packed");
const DATA_ROOT = path.join(process.cwd(), "data", "upsets");

let cache: UpsetEntry[] | null = null;
let cacheAt = 0;
// Effectively infinite in prod build. Only matters in dev when files change.
const CACHE_TTL_MS = process.env.NODE_ENV === "production" ? 24 * 60 * 60 * 1000 : 60_000;
// Per-sport caches so getUpsetsBySport doesn't refilter 200K entries on every page.
const bySportCache = new Map<SportSlug, UpsetEntry[]>();

/**
 * Load every ingested upset entry across all sports and years, apply the
 * scoring formula (source-of-truth in lib/scoring), return sorted by
 * upsetScore desc.
 *
 * Prefers data/packed/[sport]/[year].jsonl.gz (19x smaller, single
 * decompress per file). Falls back to data/upsets/[sport]/[year]/*.json
 * if packed archives aren't present (fresh clone before build_pack.py
 * has run, or during dev when new files were just ingested).
 */
export function getAllUpsets(): UpsetEntry[] {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;

  const entries: UpsetEntry[] = [];

  // Prefer packed archives
  if (fs.existsSync(PACKED_ROOT)) {
    for (const sportDir of fs.readdirSync(PACKED_ROOT)) {
      const sportPath = path.join(PACKED_ROOT, sportDir);
      if (!fs.statSync(sportPath).isDirectory()) continue;
      for (const file of fs.readdirSync(sportPath)) {
        if (!file.endsWith(".jsonl.gz")) continue;
        try {
          const buf = fs.readFileSync(path.join(sportPath, file));
          const jsonl = zlib.gunzipSync(buf).toString("utf8");
          for (const line of jsonl.split("\n")) {
            if (!line) continue;
            const entry = JSON.parse(line) as UpsetEntry;
            entry.upsetScore = computeUpsetScore(entry.factors);
            entries.push(entry);
          }
        } catch {
          // skip unreadable
        }
      }
    }
  } else if (fs.existsSync(DATA_ROOT)) {
    // Fallback: read individual files (dev / pre-pack)
    for (const sportDir of fs.readdirSync(DATA_ROOT)) {
      const sportPath = path.join(DATA_ROOT, sportDir);
      if (!fs.statSync(sportPath).isDirectory()) continue;
      for (const yearDir of fs.readdirSync(sportPath)) {
        const yearPath = path.join(sportPath, yearDir);
        if (!fs.statSync(yearPath).isDirectory()) continue;
        for (const file of fs.readdirSync(yearPath)) {
          if (!file.endsWith(".json")) continue;
          try {
            const raw = fs.readFileSync(path.join(yearPath, file), "utf8");
            const entry = JSON.parse(raw) as UpsetEntry;
            entry.upsetScore = computeUpsetScore(entry.factors);
            entries.push(entry);
          } catch {
            // skip unreadable
          }
        }
      }
    }
  } else {
    cache = [];
    cacheAt = now;
    return cache;
  }
  // Dedupe: some games get ingested by multiple sources (ESPN + WC JSON
  // both catch FIFA WC 2026 matches). Keep whichever has the higher
  // upset score for each unique (sport, date, winner-slug, loser-slug)
  // tuple — richer factor data wins.
  const seen = new Map<string, UpsetEntry>();
  for (const e of entries) {
    const key = `${e.sport}:${e.date}:${e.winner.slug}:${e.loser.slug}`;
    const existing = seen.get(key);
    if (!existing || e.upsetScore > existing.upsetScore) {
      seen.set(key, e);
    }
  }
  const deduped = Array.from(seen.values());
  deduped.sort((a, b) => b.upsetScore - a.upsetScore);
  cache = deduped;
  cacheAt = now;
  return cache;
}

export function getUpsetsBySport(sport: SportSlug): UpsetEntry[] {
  const cached = bySportCache.get(sport);
  if (cached) return cached;
  const filtered = getAllUpsets().filter((e) => e.sport === sport);
  bySportCache.set(sport, filtered);
  return filtered;
}

export function getUpsetsByYear(year: string): UpsetEntry[] {
  return getAllUpsets().filter((e) => e.date.startsWith(year));
}

export function getUpsetsForWeek(anyDate: Date, days = 7): UpsetEntry[] {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const start = new Date(anyDate);
  start.setDate(start.getDate() - days);
  const startIso = iso(start);
  const endIso = iso(anyDate);
  return getAllUpsets().filter((e) => e.date >= startIso && e.date <= endIso);
}

export function getTopUpsetsForWeek(anyDate: Date, top = 10, days = 7): UpsetEntry[] {
  return getUpsetsForWeek(anyDate, days).slice(0, top);
}

let routeIndex: Map<string, UpsetEntry> | null = null;

export function getUpsetByRoute(
  year: string,
  sport: SportSlug,
  date: string,
  slug: string,
): UpsetEntry | null {
  if (!routeIndex) {
    routeIndex = new Map();
    for (const e of getAllUpsets()) {
      routeIndex.set(`${e.sport}:${e.date}:${e.slug}`, e);
    }
  }
  const hit = routeIndex.get(`${sport}:${date}:${slug}`);
  if (!hit) return null;
  if (!hit.date.startsWith(year)) return null;
  return hit;
}

export function getAllUpsetParams(): {
  year: string;
  sport: SportSlug;
  date: string;
  slug: string;
  upsetScore: number;
}[] {
  return getAllUpsets().map((e) => ({
    year: e.date.slice(0, 4),
    sport: e.sport,
    date: e.date,
    slug: e.slug,
    upsetScore: e.upsetScore,
  }));
}

export function formatUpsetHeadline(e: UpsetEntry): string {
  return `${e.winner.name} d. ${e.loser.name}, ${e.finalScore}`;
}
