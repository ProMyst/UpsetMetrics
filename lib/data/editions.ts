import "server-only";
import fs from "node:fs";
import path from "node:path";
import { getAllUpsets, getUpsetsForWeek } from "@/lib/data/upsets";
import type { UpsetEntry } from "@/lib/schema/upset";

const EDITION_ROOT = path.join(process.cwd(), "data", "editions");

export interface Edition {
  /** ISO week identifier: "2026-W27" */
  slug: string;
  /** Sunday date the edition covers TO (usually a Sunday) */
  coverageEnd: string;
  /** Prior Monday, start of the coverage window */
  coverageStart: string;
  /** Publish date (typically the Monday after coverageEnd) */
  publishDate: string;
  /** Cold open paragraph — usually manually authored */
  coldOpen: string;
  /** The featured "long read" 200-400 word deep dive */
  longRead: string;
  /** Number of games considered when composing the edition */
  gamesConsidered: number;
  /** Top upsets that made the ranked list (typically 10) */
  topUpsets: UpsetEntry[];
  /** Also-rans that just missed */
  alsoRans: UpsetEntry[];
  /** Optional streak-watch notes */
  streakWatch?: string;
  /** Preview of the coming week */
  weekAhead?: string;
  /** Methodology version at composition time */
  methodologyVersion: string;
  /** Whether this edition has been published (as opposed to draft) */
  published: boolean;
}

/**
 * Weekly editions are stored as JSON at data/editions/[slug].json so they
 * can be authored by a human on top of the auto-composed template. The
 * compose script writes a fresh draft; the human edits the cold open and
 * long read; the site renders the final.
 */
export function getAllEditions(): Edition[] {
  if (!fs.existsSync(EDITION_ROOT)) return [];
  const out: Edition[] = [];
  for (const f of fs.readdirSync(EDITION_ROOT)) {
    if (!f.endsWith(".json")) continue;
    try {
      const raw = fs.readFileSync(path.join(EDITION_ROOT, f), "utf8");
      const parsed = JSON.parse(raw) as Edition;
      out.push(parsed);
    } catch {
      // skip unreadable
    }
  }
  // Newest edition first
  out.sort((a, b) => b.publishDate.localeCompare(a.publishDate));
  return out;
}

export function getEditionBySlug(slug: string): Edition | null {
  return getAllEditions().find((e) => e.slug === slug) ?? null;
}

/**
 * Format an ISO date to "Monday, July 6, 2026" style used in edition
 * headers.
 */
export function formatEditionDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Compose a fresh edition draft from the current data. Called by
 * scripts/compose_edition.mjs on Sunday evenings. Human then edits the
 * cold open + long read fields and flips `published: true`.
 */
export function composeEditionDraft(
  coverageEnd: Date,
  topN: number = 10,
  alsoN: number = 3,
): Edition {
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const coverageEndIso = iso(coverageEnd);
  const start = new Date(coverageEnd);
  start.setDate(start.getDate() - 6);
  const coverageStartIso = iso(start);

  const publish = new Date(coverageEnd);
  publish.setDate(publish.getDate() + 1);
  const publishIso = iso(publish);

  const weekUpsets = getUpsetsForWeek(coverageEnd, 7);
  const top = weekUpsets.slice(0, topN);
  const also = weekUpsets.slice(topN, topN + alsoN);

  const isoWeek = getIsoWeek(coverageEnd);
  const slug = `${coverageEnd.getUTCFullYear()}-W${String(isoWeek).padStart(2, "0")}`;

  return {
    slug,
    coverageEnd: coverageEndIso,
    coverageStart: coverageStartIso,
    publishDate: publishIso,
    coldOpen: "",
    longRead: "",
    gamesConsidered: getAllUpsets().filter(
      (e) => e.date >= coverageStartIso && e.date <= coverageEndIso,
    ).length,
    topUpsets: top,
    alsoRans: also,
    methodologyVersion: top[0]?.methodologyVersion ?? "1.1",
    published: false,
  };
}

function getIsoWeek(d: Date): number {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
}
