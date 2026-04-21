"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { SPORTS } from "@/lib/constants";

export default function Footer() {
  const [footerSubmitted, setFooterSubmitted] = useState(false);

  function handleFooterSubmit(e: FormEvent) {
    e.preventDefault();
    setFooterSubmitted(true);
  }
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

        {/* Newsletter */}
        <div className="flex flex-col justify-between">
          <div>
            <h4 className="text-eyebrow text-stone mb-6">The Monday Edition</h4>
            <p className="text-small text-graphite mb-4" style={{ maxWidth: "32ch" }}>
              One email each week. The upsets that mattered, scored and ranked.
            </p>
            {!footerSubmitted ? (
              <form onSubmit={handleFooterSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  className="bg-transparent border-0 border-b border-stone/40 text-small text-ink py-2 outline-none placeholder:text-stone/50 focus:border-brass transition-colors"
                  style={{ maxWidth: "20ch" }}
                />
                <button
                  type="submit"
                  className="text-eyebrow text-ink cursor-pointer hover:text-brass transition-colors tracking-widest uppercase bg-transparent border-0 text-left"
                  style={{ fontSize: "0.625rem" }}
                >
                  Subscribe
                </button>
              </form>
            ) : (
              <p className="font-display italic text-small text-ink">
                Thank you.
              </p>
            )}
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
