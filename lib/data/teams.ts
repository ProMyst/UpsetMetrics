import "server-only";
import { getAllUpsets } from "@/lib/data/upsets";
import type { SportSlug, UpsetEntry } from "@/lib/schema/upset";

export interface TeamRoute {
  sport: SportSlug;
  slug: string;
  displayName: string;
  /** All upsets this team appeared in (as winner OR loser) */
  entries: UpsetEntry[];
  /** Upsets where this team WON as underdog */
  asWinner: UpsetEntry[];
  /** Upsets where this team LOST as favorite */
  asLoser: UpsetEntry[];
}

/**
 * Build the full list of (sport, team-slug) pairs across every scored
 * upset. Used by generateStaticParams on /team/[sport]/[slug].
 */
export function getAllTeams(): TeamRoute[] {
  const all = getAllUpsets();
  const bucket = new Map<string, { sport: SportSlug; slug: string; displayName: string; entries: UpsetEntry[] }>();

  for (const e of all) {
    for (const side of [e.winner, e.loser]) {
      const key = `${e.sport}:${side.slug}`;
      let b = bucket.get(key);
      if (!b) {
        b = {
          sport: e.sport,
          slug: side.slug,
          displayName: side.name,
          entries: [],
        };
        bucket.set(key, b);
      }
      // Prefer the longest display name seen (some sources have short
      // aliases and full names on different games)
      if (side.name.length > b.displayName.length) {
        b.displayName = side.name;
      }
      b.entries.push(e);
    }
  }

  const teams: TeamRoute[] = [];
  for (const b of bucket.values()) {
    const asWinner = b.entries.filter((e) => e.winner.slug === b.slug);
    const asLoser = b.entries.filter((e) => e.loser.slug === b.slug);
    teams.push({
      sport: b.sport,
      slug: b.slug,
      displayName: b.displayName,
      entries: b.entries,
      asWinner: asWinner.sort((a, b) => b.upsetScore - a.upsetScore),
      asLoser: asLoser.sort((a, b) => b.upsetScore - a.upsetScore),
    });
  }
  return teams;
}

export function getTeam(sport: SportSlug, slug: string): TeamRoute | null {
  return getAllTeams().find((t) => t.sport === sport && t.slug === slug) ?? null;
}

export function getAllTeamParams(): { sport: SportSlug; slug: string }[] {
  return getAllTeams().map((t) => ({ sport: t.sport, slug: t.slug }));
}
