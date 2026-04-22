"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface Sport {
  name: string;
  tagline: string;
  color: string;
}

const sports: Sport[] = [
  { name: "Tennis", tagline: "From the baseline, into the history books.", color: "var(--color-moss)" },
  { name: "Horse Racing", tagline: "Churchill Downs, Royal Ascot, Saratoga in August.", color: "var(--color-brass)" },
  { name: "Formula 1", tagline: "Where the grid order breaks.", color: "var(--color-claret)" },
  { name: "Equestrian", tagline: "Precision, pedigree, and the final fence.", color: "var(--color-navy)" },
  { name: "Lacrosse", tagline: "The fastest game on two feet.", color: "var(--color-moss)" },
  { name: "Yachting", tagline: "When the wind turns on the favored hull.", color: "var(--color-navy)" },
  { name: "Polo", tagline: "The sport of kings, scored.", color: "var(--color-brass)" },
  { name: "Golf", tagline: "The majors, the tours, and the Sunday back nine.", color: "var(--color-moss)" },
  { name: "American", tagline: "NFL, NBA, college football. The chalk breaks.", color: "var(--color-claret)" },
];

export default function SportsRotator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const pin = pinRef.current;
    if (!container || !pin) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${sports.length * 100}%`,
        pin: pin,
        pinSpacing: false,
      });

      sports.forEach((_, i) => {
        const el = container.querySelector<HTMLElement>(`[data-sport="${i}"]`);
        const bg = container.querySelector<HTMLElement>(`[data-sport-bg="${i}"]`);
        if (!el) return;

        // Show
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: container,
              start: `${(i / sports.length) * 100}% top`,
              end: `${((i + 0.5) / sports.length) * 100}% top`,
              scrub: true,
            },
          }
        );

        // Hide
        gsap.fromTo(
          el,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -40,
            scrollTrigger: {
              trigger: container,
              start: `${((i + 0.5) / sports.length) * 100}% top`,
              end: `${((i + 1) / sports.length) * 100}% top`,
              scrub: true,
            },
          }
        );

        // Background fade: 30% fade in, 40% hold at peak, 30% fade out
        if (bg) {
          const rangeStart = i / sports.length;
          const rangeEnd = (i + 1) / sports.length;
          const rangeSize = rangeEnd - rangeStart;
          const fadeInEnd = rangeStart + rangeSize * 0.3;
          const holdEnd = rangeStart + rangeSize * 0.7;

          gsap.fromTo(
            bg,
            { opacity: 0 },
            {
              opacity: 0.10,
              scrollTrigger: {
                trigger: container,
                start: `${rangeStart * 100}% top`,
                end: `${fadeInEnd * 100}% top`,
                scrub: true,
              },
            }
          );
          gsap.fromTo(
            bg,
            { opacity: 0.10 },
            {
              opacity: 0,
              scrollTrigger: {
                trigger: container,
                start: `${holdEnd * 100}% top`,
                end: `${rangeEnd * 100}% top`,
                scrub: true,
              },
            }
          );
        }
      });
    }, container);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  // Reduced motion: render all sports stacked vertically
  if (prefersReducedMotion) {
    return (
      <div style={{ padding: "var(--section-pad-y) var(--gutter)" }}>
        <div className="flex flex-col items-center gap-16">
          {sports.map((sport) => (
            <div key={sport.name} className="text-center">
              <h2 className="text-display-xl font-display italic text-ink">
                {sport.name}
              </h2>
              <p className="text-small text-stone mt-4 tracking-wide">
                {sport.tagline}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height: `${(sports.length + 1) * 100}vh`, position: "relative" }}
    >
      <div
        ref={pinRef}
        className="h-screen w-full flex items-center justify-center relative overflow-hidden"
      >
        {/* Background color blocks */}
        {sports.map((sport, i) => (
          <div
            key={`bg-${sport.name}`}
            data-sport-bg={i}
            className="absolute inset-0"
            style={{ backgroundColor: sport.color, opacity: 0 }}
          />
        ))}

        {/* Sport labels */}
        {sports.map((sport, i) => (
          <div
            key={sport.name}
            data-sport={i}
            className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none"
            style={{ opacity: 0 }}
          >
            <h2 className="text-display-xl font-display italic text-ink">
              {sport.name}
            </h2>
            <p className="text-small text-stone mt-4 tracking-wide">
              {sport.tagline}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
