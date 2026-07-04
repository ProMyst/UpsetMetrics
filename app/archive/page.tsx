import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { getAllUpsets } from "@/lib/data/upsets";
import type { SportSlug } from "@/lib/schema/upset";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "Archive — Every Upset We've Scored | UpsetMetrics",
  description:
    "The full archive of every upset scored by UpsetMetrics. NBA back to 1970, MLB and WNBA current season, soccer across seven top competitions.",
  alternates: { canonical: `${SITE}/archive` },
};

const SPORT_LABEL: Record<SportSlug, string> = {
  soccer: "Soccer",
  wnba: "WNBA",
  mlb: "MLB",
  nba: "NBA",
  nfl: "NFL",
};

export default function ArchivePage() {
  const all = getAllUpsets();
  const bySport: Record<string, number> = {};
  for (const e of all) {
    bySport[e.sport] = (bySport[e.sport] || 0) + 1;
  }
  const sports = Object.entries(bySport).sort(([, a], [, b]) => b - a);
  const topAllTime = all.slice(0, 100);

  const years = Array.from(new Set(all.map((e) => e.date.slice(0, 4)))).sort();
  const earliestYear = years[0] ?? "—";
  const latestYear = years[years.length - 1] ?? "—";

  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: "72ch",
        padding: "var(--section-pad-y) var(--gutter)",
      }}
    >
      <Eyebrow className="mb-6">
        ARCHIVE · {all.length.toLocaleString()} GAMES · {earliestYear}–
        {latestYear}
      </Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-4 leading-none"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        Every upset. Every score.
      </h1>

      <p
        className="text-body text-graphite italic mt-4"
        style={{
          fontFamily: "var(--font-eb-garamond)",
          fontSize: "1.25rem",
          lineHeight: "1.6",
        }}
      >
        The full record. NBA back to {earliestYear}, current-season
        coverage across the rest.
      </p>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          By Sport
        </h2>
        <ul className="space-y-4">
          {sports.map(([sport, count]) => (
            <li key={sport} className="border-b border-graphite/10 pb-4">
              <Link
                href={`/${sport}`}
                className="group grid grid-cols-[1fr_auto] items-baseline gap-4"
              >
                <span
                  className="font-display text-ink group-hover:underline"
                  style={{ fontSize: "1.75rem" }}
                >
                  {SPORT_LABEL[sport as SportSlug] ?? sport}
                </span>
                <span
                  className="font-mono text-ink shrink-0"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {count.toLocaleString()}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          Top 100 Upsets on Record
        </h2>
        <ol className="space-y-3">
          {topAllTime.map((e, i) => (
            <li key={e.id} className="border-b border-graphite/10 pb-3">
              <Link
                href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                className="group grid grid-cols-[2.5rem_1fr_2.5rem] gap-3 items-baseline"
              >
                <span
                  className="text-graphite text-xs"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {String(i + 1).padStart(3, "0")}
                </span>
                <div>
                  <div className="text-ink group-hover:underline text-sm">
                    {e.winner.name} d. {e.loser.name}
                  </div>
                  <div className="text-xs text-graphite mt-1">
                    {SPORT_LABEL[e.sport]} · {e.date} · {e.finalScore}
                  </div>
                </div>
                <div
                  className="text-right font-mono text-ink shrink-0 text-sm"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {e.upsetScore}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/methodology"
          className="text-xs uppercase tracking-widest text-graphite hover:text-ink"
        >
          How the score works →
        </Link>
      </div>
    </article>
  );
}
