import Link from "next/link";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { getAllUpsets } from "@/lib/data/upsets";
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

export const metadata: Metadata = {
  title: "The 100 Biggest Upsets Ever Recorded — UpsetMetrics",
  description:
    "One ranked list, one transparent 0-100 scale, every sport we cover. The Miracle on Grass, Switzerland d. Germany 1938, Bolivia at altitude, and every other result the market never saw coming — sorted by Upset Score.",
  alternates: { canonical: `${SITE}/all-time` },
};

export default function AllTimePage() {
  const top100 = getAllUpsets().slice(0, 100);

  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: "72ch",
        padding: "var(--section-pad-y) var(--gutter)",
      }}
    >
      <Eyebrow className="mb-6">THE ALL-TIME LIST</Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-4 leading-none"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        The 100 biggest upsets ever recorded.
      </h1>

      <p
        className="text-body text-graphite italic mt-4"
        style={{
          fontFamily: "var(--font-eb-garamond)",
          fontSize: "1.25rem",
          lineHeight: "1.6",
        }}
      >
        One list. One scale. Every sport. The results the market never
        saw coming, ranked by Upset Score across NBA, WNBA, MLB, and
        Soccer.
      </p>

      <Divider className="my-12" />

      <section>
        <ol className="space-y-6">
          {top100.map((e, i) => (
            <li key={e.id} className="border-b border-graphite/10 pb-6">
              <Link
                href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                className="group grid grid-cols-[3rem_1fr_3.5rem] gap-4 items-baseline"
              >
                <span
                  className="text-graphite"
                  style={{
                    fontSize: "1.5rem",
                    fontFamily: "var(--font-fraunces)",
                    fontFeatureSettings: '"tnum" 1',
                  }}
                >
                  {String(i + 1).padStart(3, "0")}
                </span>
                <div>
                  <div
                    className="font-display text-ink group-hover:underline"
                    style={{ fontSize: "1.35rem", lineHeight: "1.3" }}
                  >
                    {e.winner.name} d. {e.loser.name}
                  </div>
                  <div className="text-xs text-graphite mt-2">
                    {SPORT_LABEL[e.sport]} · {e.stakes} · {e.date} ·{" "}
                    {e.finalScore}
                    {e.event ? ` · ${e.event}` : ""}
                  </div>
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

      <Divider className="my-12" />

      <section>
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-4">
          How the ranking works
        </h2>
        <p className="text-body text-ink" style={{ lineHeight: "1.7" }}>
          Every game across every sport is scored on the same transparent
          0-100 scale. Five weighted factors: pregame odds (40%), rank
          gap (25%), streak context (15%), stakes (10%), margin (10%). Where
          real closing moneylines are available (NBA 2007+ via The Odds
          API), the pregame factor uses market data. Elsewhere it uses
          Elo ratings or rolling head-to-head records. Every entry stamps
          which methodology version scored it. See the{" "}
          <Link
            href="/methodology"
            className="underline decoration-graphite/40 hover:decoration-ink"
          >
            methodology page
          </Link>{" "}
          for the full formula and source code.
        </p>
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/newsletter"
          className="text-xs uppercase tracking-widest text-graphite hover:text-ink"
        >
          Get next Monday's edition →
        </Link>
      </div>
    </article>
  );
}
