import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getAllUpsets } from "@/lib/data/upsets";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

/**
 * Vercel Cron — Sunday 22:00 UTC (Sunday evening US time).
 *
 * Composes a draft Monday Edition from the current week's ingested
 * upsets. Writes to data/editions/[slug].json with empty coldOpen +
 * longRead fields (Miller writes those manually).
 *
 * NOTE: Vercel's runtime is read-only for the repo. This endpoint
 * therefore writes to a /tmp path and pings a heartbeat. The MiniPC
 * cron picks up the composition and commits it to the repo on next
 * daily cycle.
 *
 * For an all-Vercel path, wire this endpoint to instead call the
 * GitHub Contents API to commit the draft directly. Deferred for now
 * because MiniPC handles it fine.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const dow = now.getUTCDay();
  const coverageEnd = new Date(now);
  coverageEnd.setUTCDate(coverageEnd.getUTCDate() - dow);
  const coverageStart = new Date(coverageEnd);
  coverageStart.setUTCDate(coverageStart.getUTCDate() - 6);

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const startIso = iso(coverageStart);
  const endIso = iso(coverageEnd);

  const week = getAllUpsets()
    .filter((e) => e.date >= startIso && e.date <= endIso)
    .slice(0, 20);

  const isoWeek = getIsoWeek(coverageEnd);
  const slug = `${coverageEnd.getUTCFullYear()}-W${String(isoWeek).padStart(2, "0")}`;

  const draft = {
    slug,
    coverageEnd: endIso,
    coverageStart: startIso,
    publishDate: iso(new Date(coverageEnd.getTime() + 86_400_000)),
    coldOpen: "",
    longRead: "",
    gamesConsidered: getAllUpsets().filter(
      (e) => e.date >= startIso && e.date <= endIso,
    ).length,
    topUpsets: week.slice(0, 10),
    alsoRans: week.slice(10, 13),
    streakWatch: "",
    weekAhead: "",
    methodologyVersion: week[0]?.methodologyVersion ?? "1.2",
    published: false,
    composedAt: new Date().toISOString(),
  };

  // Ping the heartbeat so the missing-heartbeat monitor knows we ran
  await fetch(`${SITE}/api/heartbeat/weekly-edition`, { method: "POST" }).catch(() => null);

  // Return the draft — the MiniPC cron writes it to disk on the next
  // daily cycle by hitting this endpoint from the ingest script.
  return NextResponse.json({ ok: true, draft });
}

function getIsoWeek(d: Date): number {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}
