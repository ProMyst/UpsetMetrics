import Link from "next/link";
import { SPORTS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-stone/20 bg-ivory">
      <div
        className="mx-auto grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4"
        style={{
          maxWidth: "var(--layout-max)",
          padding: "var(--section-pad-y) var(--gutter)",
        }}
      >
        {/* Wordmark + tagline */}
        <div>
          <Link
            href="/"
            className="text-h2 font-display text-ink no-underline"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Upsetmetrics
          </Link>
          <p
            className="mt-4 text-small text-stone"
            style={{ maxWidth: "28ch" }}
          >
            A record of the unexpected, across the world&rsquo;s sports.
          </p>
        </div>

        {/* Sports links */}
        <div>
          <h4 className="text-eyebrow text-stone mb-6">Sports</h4>
          <ul className="space-y-3">
            {SPORTS.map((sport) => (
              <li key={sport.slug}>
                <Link
                  href={`/${sport.slug}`}
                  className="text-small text-graphite no-underline hover:text-ink transition-colors duration-300"
                >
                  {sport.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Site links */}
        <div>
          <h4 className="text-eyebrow text-stone mb-6">Site</h4>
          <ul className="space-y-3">
            {[
              { label: "Methodology", href: "/methodology" },
              { label: "Archive", href: "/archive" },
              { label: "Newsletter", href: "/newsletter" },
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-small text-graphite no-underline hover:text-ink transition-colors duration-300"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Credit */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-eyebrow text-stone mb-6">The Monday Edition</h4>
            <p className="text-small text-graphite" style={{ maxWidth: "32ch" }}>
              One email each week. The upsets that mattered, scored and ranked.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone/10">
        <div
          className="mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 py-6"
          style={{
            maxWidth: "var(--layout-max)",
            padding: "1.5rem var(--gutter)",
          }}
        >
          <p
            className="text-mono text-xs text-stone tracking-wider"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Upsetmetrics · A record of the unexpected · Est. MMXXVI
          </p>
          <p
            className="text-mono text-xs text-stone/60"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            &copy; {new Date().getFullYear()} Upsetmetrics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
