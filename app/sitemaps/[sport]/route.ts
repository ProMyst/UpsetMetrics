import { NextResponse } from "next/server";
import { getUpsetsBySport } from "@/lib/data/upsets";
import type { SportSlug } from "@/lib/schema/upset";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

const VALID_SPORTS: SportSlug[] = ["nba", "wnba", "mlb", "soccer", "nfl"];

const xmlEscape = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function generateStaticParams() {
  return VALID_SPORTS.map((sport) => ({ sport }));
}

export const dynamic = "force-static";

/**
 * Per-sport sitemap: one file per sport at /sitemaps/[sport].xml.
 * Under Google's 50K URL cap even for MLB (largest with 108K games —
 * we split into halves if needed by capping at 45K here).
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sport: string }> },
) {
  const { sport: sportParam } = await params;
  // Strip .xml if the URL includes it
  const sport = sportParam.replace(/\.xml$/, "") as SportSlug;

  if (!VALID_SPORTS.includes(sport)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const upsets = getUpsetsBySport(sport).slice(0, 45000);

  const urls = upsets.map((e) => {
    const url = `${SITE}/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`;
    return `  <url>
    <loc>${xmlEscape(url)}</loc>
    <lastmod>${e.date}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>${e.upsetScore >= 75 ? "0.7" : "0.5"}</priority>
  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
