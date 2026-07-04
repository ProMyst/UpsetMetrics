import type { MetadataRoute } from "next";
import { getAllUpsets } from "@/lib/data/upsets";
import { getAllEditions } from "@/lib/data/editions";
import { getAllTeams } from "@/lib/data/teams";
import { getAllSeasons } from "@/lib/data/seasons";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

/**
 * Dynamic sitemap over every page UpsetMetrics serves. Regenerates on
 * every deploy so newly ingested upsets appear within one build.
 *
 * Submit once at search.google.com/search-console:
 *   Sitemaps → paste sitemap.xml → Submit
 * Google re-fetches automatically thereafter.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 86_400_000);

  const top: MetadataRoute.Sitemap = [
    { url: `${SITE}/`,             lastModified: now,       changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE}/newsletter`,   lastModified: now,       changeFrequency: "weekly",  priority: 0.9 },
    { url: `${SITE}/methodology`,  lastModified: now,       changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/archive`,      lastModified: now,       changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/nba`,          lastModified: now,       changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/wnba`,         lastModified: now,       changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/mlb`,          lastModified: now,       changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/soccer`,       lastModified: now,       changeFrequency: "daily",   priority: 0.8 },
    { url: `${SITE}/nfl`,          lastModified: now,       changeFrequency: "weekly",  priority: 0.6 },
  ];

  const upsets = getAllUpsets();
  const upsetPages: MetadataRoute.Sitemap = upsets.map((e) => ({
    url: `${SITE}/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`,
    lastModified: new Date(e.date),
    changeFrequency: "yearly" as const,
    priority: e.upsetScore >= 75 ? 0.7 : 0.5,
  }));

  const editions = getAllEditions().filter((e) => e.published);
  const editionPages: MetadataRoute.Sitemap = editions.map((e) => ({
    url: `${SITE}/edition/${e.slug}`,
    lastModified: new Date(e.publishDate),
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  const teamPages: MetadataRoute.Sitemap = getAllTeams().map((t) => ({
    url: `${SITE}/team/${t.sport}/${t.slug}`,
    lastModified: yesterday,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const seasonPages: MetadataRoute.Sitemap = getAllSeasons().map((s) => ({
    url: `${SITE}/season/${s.sport}/${s.season}`,
    lastModified: yesterday,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...top,
    ...editionPages,
    ...seasonPages,
    ...teamPages,
    ...upsetPages,
  ];
}
