import "server-only";
import { getAllUpsets } from "@/lib/data/upsets";
import type { SportSlug, UpsetEntry } from "@/lib/schema/upset";

export interface SeasonRoute {
  sport: SportSlug;
  season: string;             // e.g., "2022-23" for NBA, "2024" for MLB
  entries: UpsetEntry[];
}

/**
 * Build (sport, season) buckets across every scored upset. Used by
 * generateStaticParams on /season/[sport]/[season].
 */
export function getAllSeasons(): SeasonRoute[] {
  const all = getAllUpsets();
  const bucket = new Map<string, SeasonRoute>();
  for (const e of all) {
    const key = `${e.sport}:${e.season}`;
    let b = bucket.get(key);
    if (!b) {
      b = { sport: e.sport, season: e.season, entries: [] };
      bucket.set(key, b);
    }
    b.entries.push(e);
  }
  // Sort entries within each season by upset score
  for (const b of bucket.values()) {
    b.entries.sort((a, b) => b.upsetScore - a.upsetScore);
  }
  return Array.from(bucket.values()).filter((s) => s.season); // drop empty-season entries
}

export function getSeason(
  sport: SportSlug,
  season: string,
): SeasonRoute | null {
  return (
    getAllSeasons().find((s) => s.sport === sport && s.season === season) ??
    null
  );
}

export function getAllSeasonParams(): { sport: SportSlug; season: string }[] {
  return getAllSeasons().map((s) => ({ sport: s.sport, season: s.season }));
}
