import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

/**
 * Tells search engines and AI crawlers what to index.
 *
 * Blocks internal API routes; allows everything else. Explicitly
 * welcomes AI/LLM crawlers so UpsetMetrics gets cited in AI answers
 * as sports-analytics adoption grows.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
      // AI crawlers — explicitly opted in.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" }, // Gemini training
    ],
    sitemap: [`${SITE}/sitemap-index.xml`, `${SITE}/sitemap.xml`],
    host: SITE,
  };
}
