import type { Metadata } from "next";
import Link from "next/link";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import { getAllEditions } from "@/lib/data/editions";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "The Monday Edition — UpsetMetrics",
  description:
    "One email each Monday at 8am. The top ten upsets of the week, scored on one transparent scale across every sport. No ads. No filler. No sports-betting angle.",
  alternates: { canonical: `${SITE}/newsletter` },
};

export default function NewsletterPage() {
  const editions = getAllEditions().filter((e) => e.published).slice(0, 5);

  return (
    <article
      className="mx-auto"
      style={{
        maxWidth: "72ch",
        padding: "var(--section-pad-y) var(--gutter)",
      }}
    >
      <Eyebrow className="mb-6">THE MONDAY EDITION</Eyebrow>

      <h1
        className="text-display-l font-display text-ink mb-4 leading-none"
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        One email. Every Monday. 8&nbsp;a.m.
      </h1>

      <p
        className="text-body text-graphite italic mt-4"
        style={{
          fontFamily: "var(--font-eb-garamond)",
          fontSize: "1.25rem",
          lineHeight: "1.6",
        }}
      >
        The top ten upsets of the week, scored on one transparent scale
        across every sport. No ads. No filler. No sports-betting angle.
        Read while the coffee is still hot.
      </p>

      <Divider className="my-12" />

      <section className="mb-16">
        <form
          action="/api/subscribe"
          method="POST"
          className="flex flex-col sm:flex-row gap-4"
        >
          <input
            type="email"
            name="email"
            required
            placeholder="you@domain.com"
            aria-label="Email address"
            className="flex-1 px-4 py-3 bg-cream border border-graphite/30 focus:border-ink focus:outline-none text-ink"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-ink text-cream uppercase tracking-widest text-sm hover:bg-graphite transition-colors"
            style={{ letterSpacing: "0.16em" }}
          >
            Subscribe
          </button>
        </form>
        <p className="text-xs text-graphite mt-3">
          Free. Unsubscribe anytime with one click. We never share your
          email.
        </p>
      </section>

      <Divider className="my-12" />

      <section className="mb-16">
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          What each edition contains
        </h2>
        <ul
          className="text-body text-ink space-y-4"
          style={{ lineHeight: "1.7" }}
        >
          <li>
            <strong>The cold open</strong> — one paragraph on the upset of
            the week and why it mattered
          </li>
          <li>
            <strong>The top ten</strong> — every upset that qualified,
            ranked by Upset Score with a sentence of context each
          </li>
          <li>
            <strong>Also-rans</strong> — three upsets that just missed the
            cut and are worth remembering
          </li>
          <li>
            <strong>The long read</strong> — 300-400 words on the single
            biggest story of the weekend
          </li>
          <li>
            <strong>Streak Watch and Ahead this Week</strong> — favorites
            running out of luck and games with upset potential
          </li>
        </ul>
      </section>

      {editions.length > 0 && (
        <>
          <Divider className="my-12" />
          <section className="mb-16">
            <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
              Recent Editions
            </h2>
            <ul className="space-y-4">
              {editions.map((e) => (
                <li key={e.slug} className="border-b border-graphite/10 pb-4">
                  <Link href={`/edition/${e.slug}`} className="group block">
                    <div
                      className="font-display text-ink group-hover:underline"
                      style={{ fontSize: "1.35rem" }}
                    >
                      {e.slug} · {e.gamesConsidered.toLocaleString()} games
                      considered
                    </div>
                    <div className="text-xs text-graphite mt-1">
                      Published {e.publishDate} · Methodology v
                      {e.methodologyVersion}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Divider className="my-12" />

      <section>
        <h2 className="text-eyebrow uppercase tracking-widest text-graphite mb-6">
          The Sunday Test
        </h2>
        <p
          className="text-body text-ink"
          style={{ lineHeight: "1.7", fontSize: "1.125rem" }}
        >
          By Monday morning most sports newsletters have already been
          skimmed and forgotten. The Monday Edition is written for the
          reader who wants to actually understand what happened over the
          weekend — not just the scores, but which of them the market did
          not expect. If that is the reader you are, this is the note you
          will start looking for on Sunday nights.
        </p>
      </section>
    </article>
  );
}
