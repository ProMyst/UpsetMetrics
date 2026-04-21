"use client";

import Eyebrow from "@/components/ui/Eyebrow";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import CountUp from "@/components/ui/CountUp";
import RevealOnScroll from "@/components/motion/RevealOnScroll";

export default function UpsetScoreExplainer() {
  return (
    <section
      style={{
        paddingTop: "var(--section-pad-y)",
        paddingBottom: "var(--section-pad-y)",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <RevealOnScroll>
        <Eyebrow className="mb-4 block">THE METHODOLOGY</Eyebrow>
      </RevealOnScroll>

      <SplitTextReveal
        text="What Makes An Upset?"
        tag="h2"
        className="text-display-l font-display text-ink mb-12"
        splitBy="words"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 mb-16">
        <RevealOnScroll delay={0.1}>
          <p className="text-body text-ink dropcap">
            The Upset Score weighs pre-match expectation against outcome across
            five signals: betting markets, ranking differential, recent form,
            venue history, and narrative weight. One number, 0 to 100, applied
            evenly across every sport we cover.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <p className="text-body text-ink">
            A 90 at Churchill Downs is a 90 in Foxborough. A 72 at Wimbledon is
            a 72 at Daytona. The scale doesn&rsquo;t care what sport you
            prefer&nbsp;&mdash; only how far the result strayed from what the
            world expected.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll delay={0.3}>
        <div className="text-center">
          <CountUp
            end={127}
            suffix=" upsets scored"
            className="text-6xl text-brass"
          />
        </div>
      </RevealOnScroll>
    </section>
  );
}
