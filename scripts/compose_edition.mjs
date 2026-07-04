#!/usr/bin/env node
/**
 * Compose a Monday Edition draft from the current ingested data.
 *
 * Runs Sunday nights at 6 PM via Vercel Cron OR MiniPC systemd timer.
 * Writes data/editions/[slug].json as a draft. Miller then opens the
 * file, writes the cold open + long read fields, flips published: true,
 * commits, and Vercel redeploys — the edition appears at
 * /edition/[slug].
 *
 * Usage:
 *   node scripts/compose_edition.mjs                # last full week
 *   node scripts/compose_edition.mjs --end 2026-07-06  # explicit end date
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const DATA_ROOT = path.join(PROJECT, "data", "upsets");
const EDITION_ROOT = path.join(PROJECT, "data", "editions");

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

function loadAllUpsets() {
  const out = [];
  if (!fs.existsSync(DATA_ROOT)) return out;
  for (const sport of fs.readdirSync(DATA_ROOT)) {
    const sportPath = path.join(DATA_ROOT, sport);
    if (!fs.statSync(sportPath).isDirectory()) continue;
    for (const year of fs.readdirSync(sportPath)) {
      const yearPath = path.join(sportPath, year);
      if (!fs.statSync(yearPath).isDirectory()) continue;
      for (const file of fs.readdirSync(yearPath)) {
        if (!file.endsWith(".json")) continue;
        try {
          const e = JSON.parse(
            fs.readFileSync(path.join(yearPath, file), "utf8"),
          );
          e.upsetScore = computeScore(e.factors);
          out.push(e);
        } catch {
          // skip
        }
      }
    }
  }
  return out;
}

function isoWeek(date) {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86_400_000 + 1) / 7);
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

function args() {
  const a = process.argv.slice(2);
  const out = { end: null };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--end") out.end = a[++i];
  }
  return out;
}

const opts = args();

// Default: the most recent Sunday
let coverageEnd = new Date();
if (opts.end) {
  coverageEnd = new Date(opts.end + "T12:00:00Z");
} else {
  // Roll back to the most recent Sunday
  const dow = coverageEnd.getUTCDay();
  coverageEnd.setUTCDate(coverageEnd.getUTCDate() - dow);
}

const coverageStart = new Date(coverageEnd);
coverageStart.setUTCDate(coverageStart.getUTCDate() - 6);

const publish = new Date(coverageEnd);
publish.setUTCDate(publish.getUTCDate() + 1);

const startIso = iso(coverageStart);
const endIso = iso(coverageEnd);

const all = loadAllUpsets();
const weekUpsets = all
  .filter((e) => e.date >= startIso && e.date <= endIso)
  .sort((a, b) => b.upsetScore - a.upsetScore);

const top = weekUpsets.slice(0, 10);
const also = weekUpsets.slice(10, 13);
const gamesConsidered = weekUpsets.length;

const slug = `${coverageEnd.getUTCFullYear()}-W${String(
  isoWeek(coverageEnd),
).padStart(2, "0")}`;

const draft = {
  slug,
  coverageEnd: endIso,
  coverageStart: startIso,
  publishDate: iso(publish),
  coldOpen: "",
  longRead: "",
  gamesConsidered,
  topUpsets: top,
  alsoRans: also,
  streakWatch: "",
  weekAhead: "",
  methodologyVersion: top[0]?.methodologyVersion ?? "1.1",
  published: false,
};

fs.mkdirSync(EDITION_ROOT, { recursive: true });
const outFile = path.join(EDITION_ROOT, `${slug}.json`);
fs.writeFileSync(outFile, JSON.stringify(draft, null, 2));

console.log(
  `Drafted ${slug} — ${gamesConsidered} games considered, top ${top.length} named.`,
);
console.log(`  Coverage: ${startIso} → ${endIso}`);
console.log(`  Publish date: ${iso(publish)}`);
console.log(`  File: ${path.relative(PROJECT, outFile)}`);
console.log(`\nEdit the coldOpen + longRead fields, then flip published:true.`);
