import { NextResponse } from "next/server";
import { getAllEditions } from "@/lib/data/editions";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

/**
 * Vercel Cron — Monday 12:00 UTC (Monday 8 AM Eastern).
 *
 * Dispatches this week's published Monday Edition as a Kit broadcast
 * targeted at subscribers with the "monday-edition" tag.
 *
 * If no edition is published for the current week (Miller didn't
 * flip published:true), we skip and log — no send is safer than a
 * blank send.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const editions = getAllEditions().filter((e) => e.published);
  if (editions.length === 0) {
    console.warn("[dispatch-edition] no published edition found — skipping");
    return NextResponse.json({ ok: true, skipped: "no published edition" });
  }

  // The newest published edition
  const ed = editions[0];

  const kitKey = process.env.KIT_API_KEY;
  const tagId = process.env.KIT_TAG_MONDAY_EDITION;

  if (!kitKey || !tagId) {
    console.warn(`[dispatch-edition] Kit not configured — skipping ${ed.slug}`);
    return NextResponse.json({ ok: true, stubbed: true, edition: ed.slug });
  }

  const subject = `Monday Edition · ${ed.slug} · ${ed.topUpsets.length} named upsets`;
  const preview = ed.coldOpen.slice(0, 140);
  const bodyHtml = renderEditionHtml(ed);

  try {
    const res = await fetch("https://api.kit.com/v4/broadcasts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": kitKey,
      },
      body: JSON.stringify({
        subject,
        preview_text: preview,
        content: bodyHtml,
        subscriber_filter: [{ type: "tag", ids: [Number(tagId)] }],
        published_at: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[dispatch-edition] Kit rejected:", res.status, err);
      return NextResponse.json({ ok: false, error: "kit rejected" }, { status: 502 });
    }

    await fetch(`${SITE}/api/heartbeat/weekly-edition`, { method: "POST" }).catch(() => null);
    return NextResponse.json({ ok: true, edition: ed.slug });
  } catch (e) {
    console.error("[dispatch-edition] error:", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}

interface EditionLike {
  slug: string;
  coldOpen: string;
  longRead: string;
  topUpsets: Array<{
    winner: { name: string };
    loser: { name: string };
    date: string;
    finalScore: string;
    upsetScore: number;
    sport: string;
    slug: string;
    stakes: string;
  }>;
  publishDate: string;
}

function renderEditionHtml(e: EditionLike): string {
  const top = e.topUpsets
    .map(
      (u, i) => `<p><strong>${String(i + 1).padStart(2, "0")}. ${escapeHtml(u.winner.name)} d. ${escapeHtml(u.loser.name)}</strong> — Upset Score ${u.upsetScore}. <a href="${SITE}/upset/${u.date.slice(0, 4)}/${u.sport}/${u.date}/${u.slug}">${escapeHtml(u.stakes)}, ${escapeHtml(u.date)}, ${escapeHtml(u.finalScore)}</a></p>`,
    )
    .join("\n");

  return `<h1>Monday Edition · ${escapeHtml(e.slug)}</h1>
${e.coldOpen
  .split("\n\n")
  .map((p) => `<p>${escapeHtml(p)}</p>`)
  .join("\n")}
<h2>The Top ${e.topUpsets.length}</h2>
${top}
${e.longRead ? `<h2>The Long Read</h2>\n${e.longRead.split("\n\n").map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}` : ""}
<hr />
<p><small><a href="${SITE}/edition/${e.slug}">Read on the web</a> · <a href="${SITE}/methodology">Methodology</a></small></p>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
