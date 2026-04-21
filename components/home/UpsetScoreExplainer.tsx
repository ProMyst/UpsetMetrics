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
            Our Upset Score weighs pre-match expectation against outcome across
            five signals: betting markets, ranking differential, recent form,
            venue history, and narrative weight.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.2}>
          <p className="text-body text-ink">
            Every result on this site is scored on the same 0&ndash;100 scale,
            regardless of sport. A 90 is a 90, whether it happens at Churchill
            Downs or in Foxborough.
          </p>
        </RevealOnScroll>
      </div>

      <RevealOnScroll delay={0.3}>
        <div className="text-center">
          <CountUp
            end={1247}
            suffix=" upsets scored"
            className="text-6xl text-brass"
          />
        </div>
      </RevealOnScroll>
    </section>
  );
}
