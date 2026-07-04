import type { MetadataRoute } from "next";
import { getAllTeams } from "@/lib/data/teams";
import { getAllSeasons } from "@/lib/data/seasons";
import { getAllEditions } from "@/lib/data/editions";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

/**
 * Root sitemap.xml — indexes the split per-sport upset sitemaps + covers
 * the low-volume routes directly. Google's per-file cap is 50K URLs; we
 * split by sport so no single file exceeds that even at 200K entries.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);

  const top: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,            lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE}/newsletter`,  lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/archive`,     lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/all-time`,    lastModified: now, changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/nba`,         lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/wnba`,        lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/mlb`,         lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/soccer`,      lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/nfl`,         lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
  ];

  const editions = getAllEditions().filter((e) => e.published);
  const editionPages: MetadataRoute.Sitemap = editions.map((e) => ({
    url: `${SITE}/edition/${e.slug}`,
    lastModified: new Date(e.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const seasonPages: MetadataRoute.Sitemap = getAllSeasons().map((s) => ({
    url: `${SITE}/season/${s.sport}/${s.season}`,
    lastModified: yesterday,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const teamPages: MetadataRoute.Sitemap = getAllTeams().map((t) => ({
    url: `${SITE}/team/${t.sport}/${t.slug}`,
    lastModified: yesterday,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...top, ...editionPages, ...seasonPages, ...teamPages];
}
