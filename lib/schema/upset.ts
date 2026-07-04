/**
 * Canonical Upset entry schema — the atomic unit of UpsetMetrics.
 *
 * Every scored game across every sport becomes one of these. All programmatic
 * upset pages, the Monday edition, the archive, the team hubs — every surface
 * on the site is a projection over this schema.
 *
 * Provenance field is non-negotiable: every upset must cite its source so
 * the methodology page can point at real API endpoints, not vibes.
 */

export type SportSlug = "soccer" | "wnba" | "mlb" | "nba" | "nfl";

export interface UpsetEntry {
  /** Stable ID: {sport}-{yyyy-mm-dd}-{away-slug}-at-{home-slug} */
  id: string;

  /** Sport slug matching /app/{sport}/page.tsx */
  sport: SportSlug;

  /** ISO date YYYY-MM-DD in the event's local timezone */
  date: string;

  /** ISO datetime of the actual first pitch / kickoff / tipoff / start */
  startTime?: string;

  /** Season identifier — "2026" for MLB, "2025-26" for NBA, etc. */
  season: string;

  /** Optional event name (playoff round, tournament stage, cup name) */
  event?: string;

  /** "Regular Season" | "Playoffs" | "Championship" | "Group Stage" | "Knockout" */
  stakes: string;

  /** Team that won (may be underdog OR favorite; the score decides) */
  winner: TeamRef;

  /** Team that lost */
  loser: TeamRef;

  /** Final score — "3-2" or "27-24" style */
  finalScore: string;

  /** Optional detail: score by period (quarters/halves/innings) */
  scoreByPeriod?: string[];

  /** The star of the show: 0-100. Higher = bigger upset. */
  upsetScore: number;

  /** Breakdown of the score for the methodology page transparency */
  factors: UpsetFactors;

  /** Where the data came from — required for every entry */
  provenance: Provenance;

  /** Methodology version — bump whenever the formula changes */
  methodologyVersion: string;

  /** Editorial context added by the Monday edition or manually */
  context?: string;

  /** URL-safe slug for the upset entry page */
  slug: string;

  /** Whether this upset is publish-ready (false during ingest) */
  published: boolean;

  /** Timestamp of ingestion for auditability */
  ingestedAt: string;
}

export interface TeamRef {
  /** Canonical team slug matching /team/{sport}/{slug} */
  slug: string;

  /** Display name */
  name: string;

  /** Pre-game power ranking (ELO or moneyline-implied win prob 0-1) */
  pregameWinProb?: number;

  /** Pre-game moneyline if available (e.g., "+450" or "-180") */
  pregameMoneyline?: string;

  /** Win/loss record leading into the game */
  recordEntering?: string;
}

export interface UpsetFactors {
  /** How much the pre-game odds favored the losing side (0-1) */
  pregameOddsFactor: number;

  /** Gap in ELO / power ranking between the two teams (0-1) */
  rankGapFactor: number;

  /** Winner's / loser's recent form (0-1) */
  streakFactor: number;

  /** Stakes multiplier: regular season < playoffs < championship (0-1) */
  stakesFactor: number;

  /** How the game ended: blowout vs squeaker (0-1) */
  marginFactor: number;
}

export interface Provenance {
  /** e.g., "mlb-statsapi", "balldontlie", "football-data.org" */
  source: string;

  /** Source's stable ID for the game so we can re-fetch */
  sourceGameId: string;

  /** URL to the source data endpoint or human-readable page */
  sourceUrl?: string;

  /** Timestamp when the source data was retrieved */
  retrievedAt: string;
}
