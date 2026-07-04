import { NextResponse } from "next/server";

/**
 * Self-hosted cron heartbeat monitoring.
 *
 * Each cron job (MiniPC daily ingest, Vercel Cron weekly edition, etc.)
 * pings /api/heartbeat/[name] on success. A missed heartbeat within
 * the expected window is checked by a separate cron job that opens a
 * GitHub Issue.
 *
 * Currently accepts these names — reject anything else to keep junk
 * out of the log:
 *   - daily-ingest        (MiniPC systemd, 06:00 daily)
 *   - weekly-edition      (Vercel Cron, Sunday 18:00 UTC)
 *   - weekly-rescore      (Vercel Cron, Sunday 18:30 UTC)
 *   - custom              (catch-all for one-off scripts)
 */

const VALID_NAMES = new Set([
  "daily-ingest",
  "weekly-edition",
  "weekly-rescore",
  "custom",
]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  if (!VALID_NAMES.has(name)) {
    return NextResponse.json({ ok: false, error: "unknown heartbeat" }, { status: 400 });
  }
  console.log(`[heartbeat] ${name} at ${new Date().toISOString()}`);
  return NextResponse.json({ ok: true, name, at: new Date().toISOString() });
}

export const POST = GET;
