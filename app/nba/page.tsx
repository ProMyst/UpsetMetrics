import Link from "next/link";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { getUpsetsBySport } from "@/lib/data/upsets";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "NBA Upsets — UpsetMetrics",
  description:
    "Every NBA upset ever recorded, scored on one transparent 0-100 scale. Backed by real closing moneyline odds for every game since 2007.",
  alternates: { canonical: `${SITE}/nba` },
};

export default function NbaPage() {
  const all = getUpsetsBySport("nba");
  const top = all.slice(0, 25);
  const seasons = Array.from(
    new Set(all.map((e) => e.season).filter(Boolean)),
  ).sort();

  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: "72ch",
        padding: "var(--section-pad-y) var(--gutter)",
      }}
    >
      <Eyebrow className="mb-6">
        NBA · {all.length.toLocaleString()} games scored ·{" "}
        {seasons.length} seasons
      </Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-4 leading-none"
        style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
      >
        NBA.
      </h1>

      <p
        className="text-body text-graphite italic mt-4"
        style={{ fontFamily: "var(--font-eb-garamond)", fontSize: "1.25rem" }}
      >
        Regular season, playoffs, the Finals. Every game scored on the same
        transparent scale. Real closing moneyline data on every game since
        2007.
      </p>

      <Divider className="my-12" />

      <section>
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          The Top 25 NBA Upsets on Record
        </h2>
        <ol className="space-y-4">
          {top.map((e, i) => (
            <li key={e.id} className="border-b border-graphite/10 pb-4">
              <Link
                href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                className="group grid grid-cols-[3rem_1fr_3rem] gap-4 items-baseline"
              >
                <span
                  className="text-graphite text-sm"
                  style={{ fontFeatureSettings: '"tnum" 1' }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-ink group-hover:underline">
                    {e.winner.name} d. {e.loser.name}
                  </div>
                  <div className="text-xs text-graphite mt-1">
                    {e.date} · {e.finalScore} · {e.stakes}
                  </div>
                </div>
                <div
                  className="text-right font-mono text-ink shrink-0"
                  style={{ fontSize: "1.25rem", fontFeatureSettings: '"tnum" 1' }}
                >
                  {e.upsetScore}
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Divider className="my-12" />

      <section>
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          Coverage
        </h2>
        <p className="text-body text-ink mb-4" style={{ lineHeight: "1.7" }}>
          Every NBA game from 1970 through the most recent completed date.
          Games from 2007 onward carry real closing moneylines from The
          Odds API for the pregame-odds factor. Games before 2007 use a
          record-based proxy documented on the{" "}
          <Link
            href="/methodology"
            className="underline decoration-graphite/40 hover:decoration-ink"
          >
            methodology page
          </Link>
          .
        </p>
        <p className="text-body text-graphite" style={{ lineHeight: "1.7" }}>
          {all.length.toLocaleString()} games scored across{" "}
          {seasons.length} seasons.
        </p>
      </section>
    </article>
  );
}
