"use client";

import { useEffect, useRef } from "react";
import { gsap, GSAP_EASE_SILK } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import Divider from "@/components/ui/Divider";

interface CardData {
  sport: string;
  headline: string;
  score: number;
  colSpan: string;
  offsetClass?: string;
}

const cards: CardData[] = [
  {
    sport: "Tennis",
    headline: "Aces on the Chalk",
    score: 87,
    colSpan: "lg:col-span-7",
  },
  {
    sport: "Golf",
    headline: "The Twelfth Green Knew First",
    score: 78,
    colSpan: "lg:col-span-5",
  },
  {
    sport: "Horse Racing",
    headline: "Three Lengths Back, Then Not",
    score: 93,
    colSpan: "lg:col-span-4",
  },
  {
    sport: "Sailing",
    headline: "A Capsize in Light Air",
    score: 81,
    colSpan: "lg:col-span-5",
    offsetClass: "lg:mt-12",
  },
  {
    sport: "NASCAR",
    headline: "From Twenty-Eighth to Victory Lane",
    score: 76,
    colSpan: "lg:col-span-3",
  },
  {
    sport: "NFL",
    headline: "The Dynasty Stumbled on Sunday",
    score: 89,
    colSpan: "lg:col-span-5",
  },
];

export default function ThisWeekGrid() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const cardEls = grid.querySelectorAll<HTMLElement>("[data-card]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardEls,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 0.8,
          stagger: 0.08,
          ease: GSAP_EASE_SILK,
          scrollTrigger: {
            trigger: grid,
            start: "top 75%",
            once: true,
          },
        }
      );
    }, grid);

    return () => ctx.revert();
  }, []);

  return (
    <section
      style={{
        paddingTop: "var(--section-pad-y)",
        paddingBottom: "var(--section-pad-y)",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <Eyebrow className="mb-4 block">THIS WEEK</Eyebrow>
      <SplitTextReveal
        text="Across Every Field"
        tag="h2"
        className="text-display-l font-display text-ink mb-12"
        splitBy="words"
      />

      <div
        ref={gridRef}
        className="grid grid-cols-1 lg:grid-cols-12 gap-4"
      >
        {cards.map((card) => (
          <div
            key={card.headline}
            data-card
            className={`
              ${card.colSpan} ${card.offsetClass ?? ""}
              group bg-cream border border-transparent hover:border-stone/30
              p-6 lg:p-8
              transition-all duration-500
              hover:scale-[1.01]
            `}
            style={{ clipPath: "inset(100% 0 0 0)" }}
          >
            <Eyebrow className="mb-4 block">{card.sport}</Eyebrow>
            <h3 className="text-h2 font-display text-ink mb-4">
              {card.headline}
            </h3>
            <Divider className="my-4" />
            <div className="flex items-center justify-between">
              <span className="text-mono text-sm text-stone">
                Upset Score: {card.score}
              </span>
              <span
                className="text-brass text-sm transition-transform duration-300 group-hover:translate-x-1"
                style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
              >
                &rarr;
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
