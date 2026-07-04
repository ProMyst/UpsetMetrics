import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { getAllSeasonParams, getSeason } from "@/lib/data/seasons";
import type { SportSlug } from "@/lib/schema/upset";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

const SPORT_LABEL: Record<SportSlug, string> = {
  soccer: "Soccer",
  wnba: "WNBA",
  mlb: "MLB",
  nba: "NBA",
  nfl: "NFL",
};

export function generateStaticParams() {
  return getAllSeasonParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: SportSlug; season: string }>;
}): Promise<Metadata> {
  const { sport, season } = await params;
  const s = getSeason(sport, season);
  if (!s) return { title: "Not Found" };
  const label = SPORT_LABEL[sport];
  return {
    title: `${label} ${season} Upsets — UpsetMetrics`,
    description: `Every ${label} upset from the ${season} season, ranked by Upset Score. ${s.entries.length.toLocaleString()} games scored.`,
    alternates: {
      canonical: `${SITE}/season/${sport}/${season}`,
    },
  };
}

export default async function SeasonPage({
  params,
}: {
  params: Promise<{ sport: SportSlug; season: string }>;
}) {
  const { sport, season } = await params;
  const s = getSeason(sport, season);
  if (!s) notFound();

  const top = s.entries.slice(0, 50);
  const label = SPORT_LABEL[sport];

  return (
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
        <Link href={`/${sport}`} className="hover:text-ink">
          {label}
        </Link>
      </div>

      <Eyebrow className="mb-6">
        {label.toUpperCase()} · {season} SEASON · {s.entries.length.toLocaleString()} GAMES SCORED
      </Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-4 leading-none"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        {label} {season}.
      </h1>

      <p
        className="text-body text-graphite italic mt-4"
        style={{
          fontFamily: "var(--font-eb-garamond)",
          fontSize: "1.25rem",
        }}
      >
        Every scored {label} game from the {season} season, ranked by Upset Score.
      </p>

      <Divider className="my-12" />

      <section>
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          Top {top.length} Upsets of the Season
        </h2>
        <ol className="space-y-3">
          {top.map((e, i) => (
            <li key={e.id} className="border-b border-graphite/10 pb-3">
              <Link
                href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                className="group grid grid-cols-[3rem_1fr_3rem] gap-4 items-baseline"
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
                    {e.date} · {e.finalScore} · {e.stakes}
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
          href={`/${sport}`}
          className="text-xs uppercase tracking-widest text-graphite hover:text-ink"
        >
          ← All {label} upsets
        </Link>
      </div>
    </article>
  );
}
