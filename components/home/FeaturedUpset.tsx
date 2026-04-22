"use client";

import ParallaxImage from "@/components/ui/ParallaxImage";
import Eyebrow from "@/components/ui/Eyebrow";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import MagneticLink from "@/components/ui/MagneticLink";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import Link from "next/link";

export default function FeaturedUpset() {
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
          <ParallaxImage
            depth={20}
            className="w-full aspect-[4/5]"
          />
        </div>

        {/* Right — text */}
        <div className="lg:col-span-6 lg:col-start-7 flex flex-col gap-8">
          <RevealOnScroll>
            <Eyebrow>THIS WEEK&rsquo;S DEFINING UPSET</Eyebrow>
          </RevealOnScroll>

          <SplitTextReveal
            text="Three Lengths Back at the Turn, Then Something the Grandstand Felt Before It Saw"
            tag="h2"
            className="text-display-l font-display text-ink"
            splitBy="words"
            delay={0.1}
          />

          <RevealOnScroll delay={0.2}>
            <blockquote className="font-display italic text-xl text-graphite border-l-2 border-brass pl-6">
              The rain had stopped twenty minutes before post. The rail was soft,
              the air warm, and a grey colt nobody had backed found a gap at the
              furlong pole that the favorite never closed.
            </blockquote>
          </RevealOnScroll>

          <RevealOnScroll delay={0.3}>
            <p className="text-small text-stone">
              Analysis by J. Harrington &middot; April 2026
            </p>
          </RevealOnScroll>

          <RevealOnScroll delay={0.4}>
            <MagneticLink>
              <Link
                href="/analysis/three-lengths-back-grandstand"
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
