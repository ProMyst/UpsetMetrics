import { NextResponse } from "next/server";
import { getAllEditions } from "@/lib/data/editions";
import { getAllUpsets } from "@/lib/data/upsets";

export const revalidate = 3600;
export const dynamic = "force-static";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const editions = getAllEditions().filter((e) => e.published);
  const topRecent = getAllUpsets()
    .filter((e) => {
      const days = (Date.now() - new Date(e.date).getTime()) / 86_400_000;
      return days <= 30;
    })
    .slice(0, 20);

  const editionItems = editions.map((e) => {
    const url = `${SITE}/edition/${e.slug}`;
    return `    <item>
      <title>${xmlEscape(`Monday Edition · ${e.slug}`)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${new Date(e.publishDate).toUTCString()}</pubDate>
      <description>${xmlEscape(e.coldOpen.slice(0, 300) || `${e.gamesConsidered} games considered, ${e.topUpsets.length} named upsets.`)}</description>
    </item>`;
  });

  const upsetItems = topRecent.map((e) => {
    const url = `${SITE}/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`;
    return `    <item>
      <title>${xmlEscape(`${e.winner.name} d. ${e.loser.name} — Upset Score ${e.upsetScore}`)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <pubDate>${new Date(e.date).toUTCString()}</pubDate>
      <description>${xmlEscape(`${e.stakes} · ${e.finalScore} · ${e.sport.toUpperCase()}. Upset Score of ${e.upsetScore}.`)}</description>
      <category>${e.sport}</category>
    </item>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>UpsetMetrics — A Record of the Unexpected</title>
    <link>${SITE}</link>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
    <description>The top upsets of the week across NBA, WNBA, MLB, and Soccer. One transparent 0-100 scale. Free Monday newsletter.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${[...editionItems, ...upsetItems].join("\n")}
  </channel>
</rss>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
