"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, GSAP_EASE_SILK } from "@/lib/gsap";
import Eyebrow from "@/components/ui/Eyebrow";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import Divider from "@/components/ui/Divider";

export interface WeekCard {
  sport: string;          // "NBA", "Soccer", etc. (display label)
  headline: string;       // "Netherlands d. Sweden"
  href: string;           // link to the upset page
  score: number;
  colSpan: string;
  offsetClass?: string;
  event?: string;
}

const FALLBACK: WeekCard[] = [
  { sport: "Sample", headline: "Aces on the Chalk", href: "/methodology", score: 87, colSpan: "lg:col-span-7" },
  { sport: "Sample", headline: "The Twelfth Green Knew First", href: "/methodology", score: 78, colSpan: "lg:col-span-5" },
  { sport: "Sample", headline: "Three Lengths Back, Then Not", href: "/methodology", score: 93, colSpan: "lg:col-span-4" },
  { sport: "Sample", headline: "A Capsize in Light Air", href: "/methodology", score: 81, colSpan: "lg:col-span-5", offsetClass: "lg:mt-12" },
  { sport: "Sample", headline: "From Twenty-Eighth to Victory Lane", href: "/methodology", score: 76, colSpan: "lg:col-span-3" },
  { sport: "Sample", headline: "The Dynasty Stumbled on Sunday", href: "/methodology", score: 89, colSpan: "lg:col-span-5" },
];

export default function ThisWeekGrid({
  cards = FALLBACK,
}: {
  cards?: WeekCard[];
}) {
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
        },
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

      <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {cards.map((card) => (
          <Link
            key={card.headline + card.href}
            href={card.href}
            data-card
            className={`
              ${card.colSpan} ${card.offsetClass ?? ""}
              group bg-cream border border-transparent hover:border-stone/30
              p-6 lg:p-8
              transition-all duration-500
              hover:scale-[1.01] block
            `}
            style={{ clipPath: "inset(100% 0 0 0)" }}
          >
            <Eyebrow className="mb-4 block">
              {card.sport}
              {card.event ? ` · ${card.event}` : ""}
            </Eyebrow>
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
                style={{
                  transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
