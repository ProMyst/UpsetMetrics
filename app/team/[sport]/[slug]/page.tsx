import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { getAllTeamParams, getTeam } from "@/lib/data/teams";
import type { SportSlug, UpsetEntry } from "@/lib/schema/upset";

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
  return getAllTeamParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: SportSlug; slug: string }>;
}): Promise<Metadata> {
  const { sport, slug } = await params;
  const team = getTeam(sport, slug);
  if (!team) return { title: "Not Found" };
  return {
    title: `${team.displayName} Upsets — UpsetMetrics`,
    description: `Every ${team.displayName} upset — as underdog (${team.asWinner.length}) and as favorite (${team.asLoser.length}). Scored on one transparent 0-100 scale.`,
    alternates: {
      canonical: `${SITE}/team/${sport}/${slug}`,
    },
  };
}

function UpsetRow({ e }: { e: UpsetEntry }) {
  return (
    <Link
      href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
      className="group grid grid-cols-[1fr_3rem] gap-4 items-baseline py-3 border-b border-graphite/10"
    >
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
  );
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ sport: SportSlug; slug: string }>;
}) {
  const { sport, slug } = await params;
  const team = getTeam(sport, slug);
  if (!team) notFound();

  const totalGames = team.entries.length;
  const asWinnerTop = team.asWinner.slice(0, 15);
  const asLoserTop = team.asLoser.slice(0, 15);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: team.displayName,
    sport: SPORT_LABEL[team.sport],
    url: `${SITE}/team/${sport}/${slug}`,
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
          <Link href={`/${sport}`} className="hover:text-ink">
            {SPORT_LABEL[sport]}
          </Link>
        </div>

        <Eyebrow className="mb-6">
          {SPORT_LABEL[sport].toUpperCase()} · {totalGames} SCORED GAMES ·{" "}
          {team.asWinner.length} AS UNDERDOG · {team.asLoser.length} AS FAVORITE
        </Eyebrow>

        <h1
          className="text-display-l font-display text-ink mb-4 leading-none"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          {team.displayName}.
        </h1>

        <p
          className="text-body text-graphite italic mt-4"
          style={{
            fontFamily: "var(--font-eb-garamond)",
            fontSize: "1.25rem",
          }}
        >
          Every scored upset {team.displayName} was in, on either side of the
          score line.
        </p>

        <Divider className="my-12" />

        {team.asWinner.length > 0 && (
          <section className="mb-16">
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              Won as Underdog · Top {asWinnerTop.length}
            </h2>
            <div>
              {asWinnerTop.map((e) => (
                <UpsetRow key={e.id} e={e} />
              ))}
            </div>
            {team.asWinner.length > 15 && (
              <p className="text-xs text-graphite mt-4">
                Plus {team.asWinner.length - 15} more.
              </p>
            )}
          </section>
        )}

        {team.asLoser.length > 0 && (
          <section className="mb-16">
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              Lost as Favorite · Top {asLoserTop.length}
            </h2>
            <div>
              {asLoserTop.map((e) => (
                <UpsetRow key={e.id} e={e} />
              ))}
            </div>
            {team.asLoser.length > 15 && (
              <p className="text-xs text-graphite mt-4">
                Plus {team.asLoser.length - 15} more.
              </p>
            )}
          </section>
        )}

        <div className="mt-16 text-center">
          <Link
            href={`/${sport}`}
            className="text-xs uppercase tracking-widest text-graphite hover:text-ink"
          >
            ← All {SPORT_LABEL[sport]} upsets
          </Link>
        </div>
      </article>
    </>
  );
}
