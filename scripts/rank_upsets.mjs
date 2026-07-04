#!/usr/bin/env node
/**
 * Rank ingested upset entries by computed Upset Score.
 *
 * Reads every JSON file under data/upsets/[sport]/[year]/, applies the
 * scoring formula from lib/scoring/upset-score.ts (mirrored here for the
 * batch pass), sorts by score, and prints the top N.
 *
 * Usage:
 *   node scripts/rank_upsets.mjs                        # top 20 across all
 *   node scripts/rank_upsets.mjs --sport mlb --top 30   # top 30 MLB
 *   node scripts/rank_upsets.mjs --season 2026          # top of 2026
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(PROJECT, "data", "upsets");

const WEIGHTS = {
  pregameOdds: 0.4,
  rankGap: 0.25,
  streak: 0.15,
  stakes: 0.1,
  margin: 0.1,
};

function computeScore(f) {
  const raw =
    WEIGHTS.pregameOdds * f.pregameOddsFactor +
    WEIGHTS.rankGap * f.rankGapFactor +
    WEIGHTS.streak * f.streakFactor +
    WEIGHTS.stakes * f.stakesFactor +
    WEIGHTS.margin * f.marginFactor;
  return Math.round(raw * 100);
}

function args() {
  const a = process.argv.slice(2);
  const out = { sport: null, season: null, top: 20 };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--sport") out.sport = a[++i];
    else if (a[i] === "--season") out.season = a[++i];
    else if (a[i] === "--top") out.top = parseInt(a[++i], 10);
  }
  return out;
}

function loadEntries(sportFilter, seasonFilter) {
  const entries = [];
  const sports = sportFilter
    ? [sportFilter]
    : fs.readdirSync(DATA_ROOT).filter((d) =>
        fs.statSync(path.join(DATA_ROOT, d)).isDirectory(),
      );
  for (const sport of sports) {
    const sportDir = path.join(DATA_ROOT, sport);
    if (!fs.existsSync(sportDir)) continue;
    for (const year of fs.readdirSync(sportDir)) {
      if (seasonFilter && year !== seasonFilter) continue;
      const yearDir = path.join(sportDir, year);
      if (!fs.statSync(yearDir).isDirectory()) continue;
      for (const file of fs.readdirSync(yearDir)) {
        if (!file.endsWith(".json")) continue;
        try {
          const e = JSON.parse(
            fs.readFileSync(path.join(yearDir, file), "utf8"),
          );
          e.upsetScore = computeScore(e.factors);
          entries.push(e);
        } catch {
          // skip unreadable
        }
      }
    }
  }
  return entries;
}

const opts = args();
const entries = loadEntries(opts.sport, opts.season);
entries.sort((a, b) => b.upsetScore - a.upsetScore);
const top = entries.slice(0, opts.top);

console.log(`\n=== ${entries.length} games scored${opts.sport ? " (" + opts.sport + ")" : ""}${opts.season ? " (" + opts.season + ")" : ""} ===\n`);

console.log(
  "Rank | Score | Date       | Sport | Matchup                                             | Final    | Stakes"
);
console.log("-".repeat(130));
for (let i = 0; i < top.length; i++) {
  const e = top[i];
  const matchup = `${e.loser.name} at ${e.winner.name}`.padEnd(52);
  const score = String(e.upsetScore).padStart(5);
  const final = String(e.finalScore).padEnd(8);
  const stakes = e.stakes.padEnd(20);
  console.log(
    `${String(i + 1).padStart(4)} | ${score} | ${e.date} | ${e.sport.padEnd(5)} | ${matchup} | ${final} | ${stakes}`,
  );
}
console.log("");
