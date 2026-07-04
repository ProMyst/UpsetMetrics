import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { SportSlug, UpsetEntry } from "@/lib/schema/upset";
import { computeUpsetScore } from "@/lib/scoring/upset-score";

const DATA_ROOT = path.join(process.cwd(), "data", "upsets");

let cache: UpsetEntry[] | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 60_000; // 60s in dev; irrelevant in prod (SSG)

/**
 * Load every ingested upset entry across all sports and years, apply the
 * scoring formula (source-of-truth in lib/scoring), return sorted by
 * upsetScore desc.
 *
 * Called at build time by SSG routes and at request time by the (few)
 * dynamic endpoints. Cached briefly in-memory so a single request that
 * hits multiple routes doesn't re-read 2,000+ files.
 */
export function getAllUpsets(): UpsetEntry[] {
  const now = Date.now();
  if (cache && now - cacheAt < CACHE_TTL_MS) return cache;

  const entries: UpsetEntry[] = [];
  if (!fs.existsSync(DATA_ROOT)) {
    cache = [];
    cacheAt = now;
    return cache;
  }
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
  return getAllUpsets().filter((e) => e.sport === sport);
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

export function getUpsetByRoute(
  year: string,
  sport: SportSlug,
  date: string,
  slug: string,
): UpsetEntry | null {
  return (
    getAllUpsets().find(
      (e) =>
        e.date === date &&
        e.sport === sport &&
        e.slug === slug &&
        e.date.startsWith(year),
    ) ?? null
  );
}

export function getAllUpsetParams(): {
  year: string;
  sport: SportSlug;
  date: string;
  slug: string;
}[] {
  return getAllUpsets().map((e) => ({
    year: e.date.slice(0, 4),
    sport: e.sport,
    date: e.date,
    slug: e.slug,
  }));
}

export function formatUpsetHeadline(e: UpsetEntry): string {
  return `${e.winner.name} d. ${e.loser.name}, ${e.finalScore}`;
}
