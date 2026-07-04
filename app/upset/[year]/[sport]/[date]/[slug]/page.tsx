import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import {
  getAllUpsetParams,
  getUpsetByRoute,
  formatUpsetHeadline,
  getUpsetsBySport,
} from "@/lib/data/upsets";
import type { SportSlug } from "@/lib/schema/upset";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

/**
 * SSG only for meaningful upsets (score >= 55). The 200K low-score
 * games render on-demand via ISR — Next.js caches them after first
 * hit. Cuts build time from 25+ min to ~3 min while keeping the pages
 * that matter for SEO pre-rendered.
 */
export function generateStaticParams() {
  return getAllUpsetParams().filter((p) => p.upsetScore >= 55);
}

export const dynamicParams = true;
export const revalidate = 3600;

interface RouteParams {
  year: string;
  sport: SportSlug;
  date: string;
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const p = await params;
  const e = getUpsetByRoute(p.year, p.sport, p.date, p.slug);
  if (!e) return { title: "Not Found" };
  const headline = `${e.winner.name} d. ${e.loser.name}`;
  return {
    title: `${headline} — Upset Score ${e.upsetScore} | UpsetMetrics`,
    description: `${headline}, ${e.finalScore}. Upset Score of ${e.upsetScore} on ${e.date}. ${e.stakes} — Upsetmetrics.`,
    alternates: {
      canonical: `${SITE}/upset/${p.year}/${p.sport}/${p.date}/${p.slug}`,
    },
    openGraph: {
      title: `${headline} — Upset Score ${e.upsetScore}`,
      description: `${e.stakes} · ${e.date} · ${e.finalScore}`,
      type: "article",
      publishedTime: e.date,
    },
  };
}

const SPORT_LABELS: Record<SportSlug, string> = {
  soccer: "Soccer",
  wnba: "WNBA",
  mlb: "MLB",
  nba: "NBA",
  nfl: "NFL",
};

function factorLabel(key: string): string {
  const labels: Record<string, string> = {
    pregameOddsFactor: "Pregame Odds",
    rankGapFactor: "Rank Gap",
    streakFactor: "Streak Context",
    stakesFactor: "Stakes",
    marginFactor: "Margin",
  };
  return labels[key] ?? key;
}

export default async function UpsetPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const p = await params;
  const e = getUpsetByRoute(p.year, p.sport, p.date, p.slug);
  if (!e) notFound();

  const related = getUpsetsBySport(p.sport)
    .filter((x) => x.id !== e.id)
    .slice(0, 8);

  const factorRows = Object.entries(e.factors).map(([k, v]) => ({
    label: factorLabel(k),
    value: v,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${e.winner.name} vs ${e.loser.name}`,
    startDate: e.startTime ?? e.date,
    homeTeam: { "@type": "SportsTeam", name: e.winner.name },
    awayTeam: { "@type": "SportsTeam", name: e.loser.name },
    description: `${formatUpsetHeadline(e)} — Upset Score ${e.upsetScore}.`,
    sport: SPORT_LABELS[e.sport],
    url: `${SITE}/upset/${p.year}/${p.sport}/${p.date}/${p.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        className="mx-auto"
        style={{
          maxWidth: "72ch",
          padding: "var(--section-pad-y) var(--gutter)",
        }}
      >
        <div className="mb-8 text-xs uppercase tracking-widest text-graphite">
          <Link href="/" className="hover:text-ink">
            UpsetMetrics
          </Link>
          {"  ·  "}
          <Link href={`/${p.sport}`} className="hover:text-ink">
            {SPORT_LABELS[p.sport]}
          </Link>
          {"  ·  "}
          <span>{p.year}</span>
        </div>

        <Eyebrow className="mb-6">
          {e.stakes} · Upset Score {e.upsetScore}
        </Eyebrow>

        <h1 className="text-display-l font-display text-ink mb-4 leading-none">
          {e.winner.name} d.
          <br />
          {e.loser.name}
        </h1>

        <p
          className="text-body text-graphite italic mt-4"
          style={{ fontFamily: "var(--font-eb-garamond)" }}
        >
          {e.date} · {e.finalScore} · {e.event ?? SPORT_LABELS[p.sport]}
        </p>

        <Divider className="my-12" />

        <section className="mb-16">
          <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
            The Math
          </h2>

          <div
            className="text-6xl font-display text-ink mb-4"
            style={{ fontFeatureSettings: '"tnum" 1' }}
          >
            {e.upsetScore}
          </div>
          <p className="text-body text-graphite mb-8">
            Upset Score, methodology version {e.methodologyVersion}.
          </p>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-graphite/30">
                <th className="text-left py-2 uppercase tracking-widest text-xs text-graphite">
                  Factor
                </th>
                <th className="text-right py-2 uppercase tracking-widest text-xs text-graphite">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {factorRows.map((f) => (
                <tr key={f.label} className="border-b border-graphite/10">
                  <td className="py-3 text-ink">{f.label}</td>
                  <td className="py-3 text-right text-ink font-mono">
                    {f.value.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-sm text-graphite mt-6">
            The Upset Score is a weighted sum of these five factors, each
            normalized to a 0-1 scale. See the{" "}
            <Link
              href="/methodology"
              className="underline decoration-graphite/40 hover:decoration-ink"
            >
              methodology page
            </Link>{" "}
            for the full formula and source code.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-4">
            Records Entering
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-xs uppercase tracking-widest text-graphite mb-2">
                Winner
              </div>
              <div className="text-lg font-display text-ink">
                {e.winner.name}
              </div>
              {e.winner.recordEntering && (
                <div className="text-sm text-graphite mt-1">
                  {e.winner.recordEntering}
                </div>
              )}
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-graphite mb-2">
                Loser
              </div>
              <div className="text-lg font-display text-ink">
                {e.loser.name}
              </div>
              {e.loser.recordEntering && (
                <div className="text-sm text-graphite mt-1">
                  {e.loser.recordEntering}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-3">
            Provenance
          </h2>
          <p className="text-sm text-graphite">
            Source: <code className="text-ink">{e.provenance.source}</code> ·
            Game ID:{" "}
            <code className="text-ink">{e.provenance.sourceGameId}</code>
            {e.provenance.sourceUrl && (
              <>
                {" · "}
                <a
                  href={e.provenance.sourceUrl}
                  className="underline decoration-graphite/40 hover:decoration-ink"
                  target="_blank"
                  rel="noopener"
                >
                  Original data
                </a>
              </>
            )}
          </p>
        </section>

        {related.length > 0 && (
          <>
            <Divider className="my-12" />
            <section>
              <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
                More {SPORT_LABELS[p.sport]} Upsets
              </h2>
              <ul className="space-y-4">
                {related.map((r) => (
                  <li key={r.id} className="border-b border-graphite/10 pb-3">
                    <Link
                      href={`/upset/${r.date.slice(0, 4)}/${r.sport}/${r.date}/${r.slug}`}
                      className="group flex justify-between items-baseline"
                    >
                      <div>
                        <div className="text-ink group-hover:underline">
                          {r.winner.name} d. {r.loser.name}
                        </div>
                        <div className="text-xs text-graphite mt-1">
                          {r.date} · {r.finalScore}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-ink shrink-0 ml-4">
                        {r.upsetScore}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </article>
    </>
  );
}
