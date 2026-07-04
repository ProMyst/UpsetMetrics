import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import {
  getAllEditions,
  getEditionBySlug,
  formatEditionDate,
} from "@/lib/data/editions";
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
  return getAllEditions()
    .filter((e) => e.published)
    .map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ed = getEditionBySlug(slug);
  if (!ed || !ed.published) return { title: "Not Found" };
  const title = `Monday Edition · ${formatEditionDate(ed.publishDate)}`;
  const description =
    ed.coldOpen.slice(0, 155) ||
    `The top 10 upsets from the week ending ${ed.coverageEnd}.`;
  return {
    title: `${title} — UpsetMetrics`,
    description,
    alternates: { canonical: `${SITE}/edition/${slug}` },
    openGraph: { title, description, type: "article", publishedTime: ed.publishDate },
  };
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ed = getEditionBySlug(slug);
  if (!ed || !ed.published) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Monday Edition · ${formatEditionDate(ed.publishDate)}`,
    datePublished: ed.publishDate,
    author: { "@type": "Organization", name: "UpsetMetrics" },
    publisher: { "@type": "Organization", name: "UpsetMetrics" },
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
        <Eyebrow className="mb-6">
          MONDAY EDITION · {formatEditionDate(ed.publishDate).toUpperCase()}
        </Eyebrow>

        <h1
          className="text-display-l font-display text-ink mb-4 leading-none"
          style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
        >
          The week the favorites blinked.
        </h1>

        <p
          className="text-body text-graphite italic mt-4"
          style={{
            fontFamily: "var(--font-eb-garamond)",
            fontSize: "1.25rem",
            lineHeight: "1.6",
          }}
        >
          {ed.gamesConsidered.toLocaleString()} games considered ·{" "}
          {ed.topUpsets.length} named upsets · Methodology v
          {ed.methodologyVersion}
        </p>

        <Divider className="my-12" />

        {ed.coldOpen && (
          <section className="mb-16">
            {ed.coldOpen.split("\n\n").map((p, i) => (
              <p
                key={i}
                className="text-body text-ink mb-6"
                style={{ lineHeight: "1.7", fontSize: "1.125rem" }}
              >
                {p}
              </p>
            ))}
          </section>
        )}

        <section className="mb-16">
          <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-8">
            The Top {ed.topUpsets.length}
          </h2>
          <ol className="space-y-6">
            {ed.topUpsets.map((e, i) => (
              <li key={e.id} className="border-b border-graphite/10 pb-6">
                <Link
                  href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                  className="group grid grid-cols-[3rem_1fr_3rem] gap-4 items-baseline"
                >
                  <span
                    className="text-graphite"
                    style={{
                      fontSize: "2rem",
                      fontFamily: "var(--font-fraunces)",
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div
                      className="font-display text-ink group-hover:underline"
                      style={{ fontSize: "1.5rem" }}
                    >
                      {e.winner.name} d. {e.loser.name}
                    </div>
                    <div className="text-sm text-graphite mt-1">
                      {SPORT_LABEL[e.sport]} · {e.stakes} · {e.date} ·{" "}
                      {e.finalScore}
                    </div>
                    {e.context && (
                      <p className="text-body text-ink mt-3" style={{ lineHeight: "1.7" }}>
                        {e.context}
                      </p>
                    )}
                  </div>
                  <div
                    className="text-right font-mono text-ink shrink-0"
                    style={{
                      fontSize: "1.5rem",
                      fontFeatureSettings: '"tnum" 1',
                    }}
                  >
                    {e.upsetScore}
                  </div>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {ed.alsoRans.length > 0 && (
          <section className="mb-16">
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              Also-Rans
            </h2>
            <ul className="space-y-3">
              {ed.alsoRans.map((e) => (
                <li key={e.id} className="border-b border-graphite/10 pb-3">
                  <Link
                    href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                    className="group grid grid-cols-[1fr_3rem] gap-4 items-baseline"
                  >
                    <div>
                      <div className="text-ink group-hover:underline">
                        {e.winner.name} d. {e.loser.name}
                      </div>
                      <div className="text-xs text-graphite mt-1">
                        {SPORT_LABEL[e.sport]} · {e.date} · {e.finalScore}
                      </div>
                    </div>
                    <div
                      className="text-right font-mono text-ink shrink-0"
                      style={{ fontFeatureSettings: '"tnum" 1' }}
                    >
                      {e.upsetScore}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {ed.longRead && (
          <section className="mb-16">
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              The Long Read
            </h2>
            {ed.longRead.split("\n\n").map((p, i) => (
              <p
                key={i}
                className="text-body text-ink mb-6"
                style={{ lineHeight: "1.75", fontSize: "1.125rem" }}
              >
                {p}
              </p>
            ))}
          </section>
        )}

        {(ed.streakWatch || ed.weekAhead) && (
          <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
            {ed.streakWatch && (
              <div>
                <h3 className="text-eyebrow uppercase tracking-widest text-graphite mb-3">
                  Streak Watch
                </h3>
                <p className="text-body text-ink" style={{ lineHeight: "1.7" }}>
                  {ed.streakWatch}
                </p>
              </div>
            )}
            {ed.weekAhead && (
              <div>
                <h3 className="text-eyebrow uppercase tracking-widest text-graphite mb-3">
                  Ahead This Week
                </h3>
                <p className="text-body text-ink" style={{ lineHeight: "1.7" }}>
                  {ed.weekAhead}
                </p>
              </div>
            )}
          </section>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/newsletter"
            className="text-xs uppercase tracking-widest text-graphite hover:text-ink"
          >
            ← Subscribe to next Monday's edition
          </Link>
        </div>
      </article>
    </>
  );
}
