"use client";

import ParallaxImage from "@/components/ui/ParallaxImage";
import Eyebrow from "@/components/ui/Eyebrow";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import MagneticLink from "@/components/ui/MagneticLink";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import Link from "next/link";

export interface FeaturedUpsetData {
  headline: string;          // e.g., "Sweden 5-1 Netherlands"
  href: string;              // /upset/[year]/[sport]/[date]/[slug]
  eyebrow: string;           // e.g., "THIS WEEK'S DEFINING UPSET"
  quote: string;             // 1-2 sentence editorial pull
  attribution: string;       // e.g., "Group Stage · June 20, 2026"
  score: number;
}

/**
 * Fallback content when no real upset data is available (build without
 * ingested entries). Keeps the visual composition intact so the page
 * still renders.
 */
const FALLBACK: FeaturedUpsetData = {
  headline:
    "Three Lengths Back at the Turn, Then Something the Grandstand Felt Before It Saw",
  href: "/methodology",
  eyebrow: "THIS WEEK'S DEFINING UPSET",
  quote:
    "The rain had stopped twenty minutes before post. The rail was soft, the air warm, and a grey colt nobody had backed found a gap at the furlong pole that the favorite never closed.",
  attribution: "Sample · methodology in draft",
  score: 92,
};

export default function FeaturedUpset({
  data = FALLBACK,
}: {
  data?: FeaturedUpsetData;
}) {
  return (
    <section
      style={{
        paddingTop: "var(--section-pad-y)",
        paddingBottom: "var(--section-pad-y)",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-start">
        {/* Left — image */}
        <div className="lg:col-span-5">
          <ParallaxImage depth={20} className="w-full aspect-[4/5]" />
        </div>

        {/* Right — text */}
        <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-8">
          <RevealOnScroll>
            <div className="flex items-baseline gap-6">
              <Eyebrow>{data.eyebrow}</Eyebrow>
              <span
                className="font-mono text-ink"
                style={{
                  fontSize: "0.875rem",
                  fontFeatureSettings: '"tnum" 1',
                }}
              >
                UPSET SCORE {data.score}
              </span>
            </div>
          </RevealOnScroll>

          <SplitTextReveal
            text={data.headline}
            tag="h2"
            className="text-display-l font-display text-ink"
            splitBy="words"
            delay={0.1}
          />

          <RevealOnScroll delay={0.2}>
            <blockquote className="font-display italic text-xl text-graphite border-l-2 border-brass pl-6">
              {data.quote}
            </blockquote>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <p className="text-small text-stone">{data.attribution}</p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.4}>
            <MagneticLink>
              <Link
                href={data.href}
                className="font-display text-ink underline underline-offset-4"
              >
                Read the analysis &rarr;
              </Link>
            </MagneticLink>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
