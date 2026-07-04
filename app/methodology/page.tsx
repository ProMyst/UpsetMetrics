import Link from "next/link";
import type { Metadata } from "next";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { WEIGHTS, METHODOLOGY_VERSION } from "@/lib/scoring/upset-score";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "Methodology — The Upset Score | UpsetMetrics",
  description:
    "How UpsetMetrics scores every upset on a 0-100 scale across five signals: pregame odds, ranking gap, recent form, stakes, and margin. Every input published; every weight open.",
  alternates: { canonical: `${SITE}/methodology` },
};

export default function MethodologyPage() {
  const factors = [
    {
      key: "pregameOdds",
      title: "Pregame Odds",
      weight: WEIGHTS.pregameOdds,
      body: [
        "The loudest signal an upset ever gets. The market — bookmakers, prediction markets, or crowdsourced ELO — has already priced what should happen. When the outcome deviates from the price, that gap is where the upset lives.",
        "We use the losing side's implied win probability from moneyline odds. A team at +450 (18.2% implied win chance) losing is a much bigger upset than a team at -180 (64.3%) losing. Where odds are not available (some historical soccer, some older MLB), we substitute an ELO differential normalized to the same 0-1 scale.",
      ],
    },
    {
      key: "rankGap",
      title: "Rank Gap",
      weight: WEIGHTS.rankGap,
      body: [
        "The underlying quality gap between the two sides. Odds move day-to-day on injuries, weather, momentum. Rankings move slower and describe the season's shape.",
        "We use each league's power ranking or ELO where computed, and the standings-implied win percentage otherwise. The larger the gap in the loser's favor, the higher this factor.",
      ],
    },
    {
      key: "streak",
      title: "Streak Context",
      weight: WEIGHTS.streak,
      body: [
        "Not every upset happens in a vacuum. When the losing side arrived on a 10-game win streak and the winning side arrived on a 4-game slide, the upset is louder — narratively and analytically. Streaks compress the story.",
        "We reward loser hotness AND winner coldness. Both count. A cold team beating a hot team gets full credit.",
      ],
    },
    {
      key: "stakes",
      title: "Stakes",
      weight: WEIGHTS.stakes,
      body: [
        "A June road game is not a Game 7. A group stage is not the final. When the game matters more, an upset in it means more.",
        "Regular season = 0.4. Playoffs = 0.85. Championship / World Series / Super Bowl / World Cup Final = 1.0. Rivalry games and knockout stages sit between.",
      ],
    },
    {
      key: "margin",
      title: "Margin",
      weight: WEIGHTS.margin,
      body: [
        "A one-run walk-off is a smaller upset than a wire-to-wire beatdown of a favorite. Both count, but the beatdown counts more.",
        "We scale margin by sport: MLB's blowout threshold is six runs, NBA's is 20 points, NFL's is three touchdowns, WNBA's is 15 points, soccer's is three goals.",
      ],
    },
  ];

  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: "72ch",
        padding: "var(--section-pad-y) var(--gutter)",
      }}
    >
      <Eyebrow className="mb-6">METHODOLOGY · VERSION {METHODOLOGY_VERSION}</Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-6 leading-none"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        The Upset Score.
      </h1>

      <p
        className="text-body text-graphite italic mb-8"
        style={{
          fontFamily: "var(--font-eb-garamond)",
          fontSize: "1.25rem",
          lineHeight: "1.6",
        }}
      >
        One number, zero to one hundred, computed the same way across
        every sport in our catalog. A 90 is a 90 whether it happened in
        Foxborough or at Churchill Downs.
      </p>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          The Formula
        </h2>
        <p className="text-body text-ink mb-6" style={{ lineHeight: "1.7" }}>
          Every upset is a weighted sum of five factors, each normalized to a
          0-1 scale, then multiplied by 100 for readability. The weights are
          fixed and public. The inputs are cited on every entry page.
        </p>
        <pre
          className="p-6 text-sm overflow-x-auto"
          style={{
            background: "var(--color-paper-warm, #EBE5D5)",
            border: "1px solid var(--color-graphite-30, rgba(0,0,0,0.15))",
            fontFamily: "var(--font-jetbrains-mono)",
          }}
        >
{`UpsetScore =
    ${WEIGHTS.pregameOdds} × PregameOdds     // what the market thought
  + ${WEIGHTS.rankGap} × RankGap             // quality gap between the two
  + ${WEIGHTS.streak} × StreakContext        // loser was hot, winner was cold
  + ${WEIGHTS.stakes} × Stakes               // playoffs > regular season
  + ${WEIGHTS.margin} × Margin               // blowout > squeaker

Result: 0-100, higher = bigger upset.
`}
        </pre>
      </section>

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          The Five Factors
        </h2>
        {factors.map((f) => (
          <div key={f.key} className="mb-12">
            <div className="flex items-baseline justify-between mb-3">
              <h3
                className="font-display text-ink"
                style={{ fontSize: "1.75rem" }}
              >
                {f.title}
              </h3>
              <span
                className="text-sm text-graphite"
                style={{ fontFamily: "var(--font-jetbrains-mono)" }}
              >
                weight {f.weight}
              </span>
            </div>
            {f.body.map((p, i) => (
              <p
                key={i}
                className="text-body text-ink mb-4"
                style={{ lineHeight: "1.7" }}
              >
                {p}
              </p>
            ))}
          </div>
        ))}
      </section>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          Source Code
        </h2>
        <p className="text-body text-ink mb-4" style={{ lineHeight: "1.7" }}>
          The formula lives at{" "}
          <code
            className="text-sm"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            lib/scoring/upset-score.ts
          </code>{" "}
          in our public repository. Every factor is a small pure function
          with a single obvious purpose. Anyone can audit the math.
        </p>
        <p className="text-body text-ink mb-4" style={{ lineHeight: "1.7" }}>
          The methodology version is bumped whenever the formula changes.
          Existing scored upsets keep the version they were scored under; new
          games get the current version. Every entry page shows which
          version scored it.
        </p>
        <p className="text-body text-ink" style={{ lineHeight: "1.7" }}>
          <a
            href="https://github.com/ProMyst/UpsetMetrics"
            className="underline decoration-graphite/40 hover:decoration-ink"
            target="_blank"
            rel="noopener"
          >
            Public repository →
          </a>
        </p>
      </section>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          Provenance
        </h2>
        <p className="text-body text-ink mb-4" style={{ lineHeight: "1.7" }}>
          Every scored upset carries a{" "}
          <code
            className="text-sm"
            style={{ fontFamily: "var(--font-jetbrains-mono)" }}
          >
            provenance
          </code>{" "}
          field with the exact source, source game ID, and the URL to the
          original data. We do not scrape blind. We do not manually enter
          numbers without citing them.
        </p>
        <p className="text-body text-ink mb-3" style={{ lineHeight: "1.7" }}>
          Current sources:
        </p>
        <ul className="text-body text-ink mb-4" style={{ lineHeight: "1.8" }}>
          <li>
            •{" "}
            <a
              href="https://statsapi.mlb.com"
              className="underline decoration-graphite/40 hover:decoration-ink"
              target="_blank"
              rel="noopener"
            >
              MLB StatsAPI
            </a>{" "}
            for MLB
          </li>
          <li>
            •{" "}
            <a
              href="https://site.api.espn.com"
              className="underline decoration-graphite/40 hover:decoration-ink"
              target="_blank"
              rel="noopener"
            >
              ESPN Scoreboard API
            </a>{" "}
            for WNBA, NBA, NFL, and Soccer (FIFA WC, UCL, and top-flight
            European + MLS)
          </li>
        </ul>
        <p className="text-body text-ink" style={{ lineHeight: "1.7" }}>
          When a source updates a score after the fact (rare), our
          re-ingestion job picks up the change on the next run.
        </p>
      </section>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          Known Limitations
        </h2>
        <p className="text-body text-ink mb-4" style={{ lineHeight: "1.7" }}>
          Version 1.0 uses standings-implied win percentage as a proxy for
          pregame odds and ranking gap. That works well in mature seasons
          and less well in the first two weeks when records are small
          samples. Refinements:
        </p>
        <ul className="text-body text-ink mb-4" style={{ lineHeight: "1.8" }}>
          <li>• v1.1 will layer real closing moneyline odds where available</li>
          <li>• v1.2 will compute rolling ELO ratings per sport</li>
          <li>
            • v2.0 will incorporate injury reports and rest day differentials
          </li>
        </ul>
        <p className="text-body text-graphite" style={{ lineHeight: "1.7" }}>
          Every version is announced in the newsletter with backfill notes.
          A game scored 82 under v1.0 may score 78 under v1.1 if a factor
          changes; we archive both and show which methodology version each
          score was computed under.
        </p>
      </section>

      <div className="mt-16 text-center">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-graphite hover:text-ink"
        >
          ← Back to UpsetMetrics
        </Link>
      </div>
    </article>
  );
}
