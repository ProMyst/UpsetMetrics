import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import {
  getUpsetsBySport,
  getTopUpsetsForWeek,
} from "@/lib/data/upsets";
import type { SportSlug } from "@/lib/schema/upset";

interface Props {
  sport: SportSlug;
  title: string;
  tagline: string;
  coverage: string;
}

/**
 * Data-driven sport hub. Renders:
 *   - Header with total games scored + seasons covered
 *   - The Top 25 upsets ever recorded in this sport
 *   - Recent upsets from the last 30 days (if any)
 *   - Coverage explainer with link back to methodology
 *
 * Every sport gets its own /[sport] page instantiating this component.
 * When a sport has zero ingested data yet (e.g., NFL in July), the
 * component gracefully explains the coverage window.
 */
export default function SportHub({ sport, title, tagline, coverage }: Props) {
  const all = getUpsetsBySport(sport);
  const top = all.slice(0, 25);
  const seasons = Array.from(
    new Set(all.map((e) => e.season).filter(Boolean)),
  ).sort();
  const recent = all.filter((e) => {
    const days = (Date.now() - new Date(e.date).getTime()) / 86_400_000;
    return days <= 30;
  }).slice(0, 10);

  const hasData = all.length > 0;

  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: "72ch",
        padding: "var(--section-pad-y) var(--gutter)",
      }}
    >
      <Eyebrow className="mb-6">
        {hasData
          ? `${title.toUpperCase()} · ${all.length.toLocaleString()} games scored · ${seasons.length} seasons`
          : `${title.toUpperCase()} · COVERAGE STARTS SOON`}
      </Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-4 leading-none"
        style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
      >
        {title}.
      </h1>

      <p
        className="text-body text-graphite italic mt-4"
        style={{ fontFamily: "var(--font-eb-garamond)", fontSize: "1.25rem" }}
      >
        {tagline}
      </p>

      {!hasData && (
        <>
          <Divider className="my-12" />
          <p className="text-body text-ink" style={{ lineHeight: "1.7" }}>
            {coverage}
          </p>
          <p
            className="text-body text-graphite mt-6"
            style={{ lineHeight: "1.7" }}
          >
            Check back once the first games have been scored. In the meantime, see the{" "}
            <Link
              href="/methodology"
              className="underline decoration-graphite/40 hover:decoration-ink"
            >
              methodology
            </Link>{" "}
            for how upsets are ranked.
          </p>
        </>
      )}

      {hasData && (
        <>
          {recent.length > 0 && (
            <>
              <Divider className="my-12" />
              <section>
                <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
                  Recent · Last 30 Days
                </h2>
                <ol className="space-y-3">
                  {recent.map((e) => (
                    <li
                      key={e.id}
                      className="border-b border-graphite/10 pb-3"
                    >
                      <Link
                        href={`/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`}
                        className="group grid grid-cols-[1fr_3rem] gap-4 items-baseline"
                      >
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
                          style={{
                            fontSize: "1rem",
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
            </>
          )}

          <Divider className="my-12" />

          <section>
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              The Top 25 on Record
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
                      style={{
                        fontSize: "1.25rem",
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
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              Coverage
            </h2>
            <p
              className="text-body text-ink mb-4"
              style={{ lineHeight: "1.7" }}
            >
              {coverage}
            </p>
            <p
              className="text-body text-graphite"
              style={{ lineHeight: "1.7" }}
            >
              {all.length.toLocaleString()} games scored across{" "}
              {seasons.length} seasons. See the{" "}
              <Link
                href="/methodology"
                className="underline decoration-graphite/40 hover:decoration-ink"
              >
                methodology page
              </Link>{" "}
              for the full formula.
            </p>
          </section>
        </>
      )}
    </article>
  );
}
