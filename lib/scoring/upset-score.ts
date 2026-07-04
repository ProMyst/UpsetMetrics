import type { UpsetFactors } from "@/lib/schema/upset";

/**
 * Upset Score v1 — the transparent formula.
 *
 * A single 0-100 score across every sport. Higher = bigger upset. Every
 * factor is normalized 0-1 before weighting so contributions are directly
 * comparable across MLB, WNBA, Soccer, NBA, NFL.
 *
 * The methodology page publishes this file source verbatim. Transparency
 * IS the moat — anyone can audit the math.
 *
 * Version this constant on every formula change. Existing upsets keep
 * their original score + methodology version; new games get scored under
 * the current version.
 */
export const METHODOLOGY_VERSION = "1.0";

/**
 * Weights sum to 1.0. Rationale for each weight in the methodology page.
 *   pregameOdds  — What the market thought would happen (loudest signal)
 *   rankGap      — Underlying quality gap (ELO / power rating)
 *   streak       — Momentum context — bigger upset when the loser was hot
 *   stakes       — Playoffs and championships weigh more than midseason
 *   margin       — A close upset counts less than a wire-to-wire beatdown
 */
export const WEIGHTS = {
  pregameOdds: 0.4,
  rankGap: 0.25,
  streak: 0.15,
  stakes: 0.1,
  margin: 0.1,
} as const;

/**
 * Compute the Upset Score from normalized factors.
 * Every factor MUST be in [0, 1]. Returned score is in [0, 100].
 */
export function computeUpsetScore(f: UpsetFactors): number {
  const raw =
    WEIGHTS.pregameOdds * f.pregameOddsFactor +
    WEIGHTS.rankGap * f.rankGapFactor +
    WEIGHTS.streak * f.streakFactor +
    WEIGHTS.stakes * f.stakesFactor +
    WEIGHTS.margin * f.marginFactor;
  return Math.round(raw * 100);
}

/**
 * Convert American moneyline odds on the LOSING side into a factor 0-1.
 * Example: loser was +450 → implied win prob 18.2% → factor = 1 - 0.182 = 0.818
 * The bigger the underdog upset, the closer to 1.
 */
export function pregameOddsFactorFromMoneyline(
  loserMoneyline: number,
): number {
  const implied = impliedProbFromMoneyline(loserMoneyline);
  // Cap at 0.98 so unfathomable upsets (+10000 dogs) don't max out the
  // whole scale; keeps room for the truly historic outliers.
  return Math.min(1 - implied, 0.98);
}

/**
 * Convert American moneyline to implied win probability.
 * -180 → 0.6429, +150 → 0.4, +450 → 0.1818
 */
export function impliedProbFromMoneyline(ml: number): number {
  return ml > 0 ? 100 / (ml + 100) : Math.abs(ml) / (Math.abs(ml) + 100);
}

/**
 * When moneyline isn't available (older games, some soccer leagues), fall
 * back to ELO / power ranking gap.
 * eloDiff = winner_elo - loser_elo (negative = underdog won)
 * Returns 0-1 where more negative = bigger upset.
 */
export function pregameOddsFactorFromElo(eloDiff: number): number {
  // Empirically: ELO gap of -300 ~= 15% underdog win chance
  // Scale so eloDiff of -400 → 0.9 factor
  const normalized = Math.max(0, Math.min(1, (-eloDiff + 50) / 450));
  return normalized;
}

/**
 * Rank gap factor: how much better the losing team's power rating was
 * relative to the league average spread. Higher when a top team lost to
 * a bottom team.
 * rankGapPct = (loser_rank - winner_rank) / (total_teams - 1)  [0-1]
 * where rank 1 = best, rank N = worst.
 */
export function rankGapFactorFromRanks(
  winnerRank: number,
  loserRank: number,
  totalTeams: number,
): number {
  if (winnerRank <= loserRank) return 0; // higher-ranked won, no rank-gap upset
  return (winnerRank - loserRank) / (totalTeams - 1);
}

/**
 * Streak factor: how hot the losing side was AND how cold the winning side
 * was going into the game. Both fuel the upset.
 * loserStreak = number of consecutive wins (positive) or losses (negative)
 * winnerStreak = same, from winner's perspective
 *
 * Example: loser on a 10-game win streak, winner on a 4-game losing
 * streak → very high streak factor.
 */
export function streakFactor(
  loserStreak: number,
  winnerStreak: number,
): number {
  // Reward loser being hot AND winner being cold
  const loserHotness = Math.max(0, Math.min(1, loserStreak / 10));
  const winnerColdness = Math.max(0, Math.min(1, -winnerStreak / 10));
  return 0.5 * loserHotness + 0.5 * winnerColdness;
}

/**
 * Stakes factor: multiplier for postseason context.
 * "Regular Season" = 0.4, "Playoffs" = 0.75, "Championship" = 1.0
 * "Knockout" (soccer) and "Rivalry Game" get their own weights.
 */
export function stakesFactor(stakes: string): number {
  const s = stakes.toLowerCase();
  if (s.includes("championship") || s.includes("world series") ||
      s.includes("super bowl") || s.includes("finals") ||
      s.includes("world cup final")) return 1.0;
  if (s.includes("playoff") || s.includes("knockout") ||
      s.includes("semifinal") || s.includes("quarterfinal")) return 0.85;
  if (s.includes("round of 16") || s.includes("wild card")) return 0.75;
  if (s.includes("group stage") || s.includes("division")) return 0.6;
  if (s.includes("rivalry")) return 0.6;
  return 0.4; // Regular season
}

/**
 * Margin factor: 1 = blowout, 0 = one-possession/one-run game.
 * A close upset is a smaller upset than a wire-to-wire beatdown of the
 * favorite.
 */
export function marginFactor(
  pointDiff: number,
  sport: string,
): number {
  const s = sport.toLowerCase();
  // Sport-specific "blowout thresholds" — normalize to 0-1
  const thresholds: Record<string, number> = {
    mlb: 6,      // 6+ run game is a blowout
    wnba: 15,    // 15+ point game
    nba: 20,     // 20+ point game
    nfl: 21,     // 3-touchdown game
    soccer: 3,   // 3+ goal margin
  };
  const threshold = thresholds[s] ?? 15;
  return Math.max(0, Math.min(1, Math.abs(pointDiff) / threshold));
}
