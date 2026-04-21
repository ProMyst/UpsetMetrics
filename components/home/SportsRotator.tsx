"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface Sport {
  name: string;
  tagline: string;
  color: string;
}

const sports: Sport[] = [
  { name: "Tennis", tagline: "Grand Slams, Masters, and the moments between", color: "var(--color-moss)" },
  { name: "Horse Racing", tagline: "Churchill Downs to Royal Ascot", color: "var(--color-brass)" },
  { name: "Formula 1", tagline: "The grid, the paddock, the unexpected", color: "var(--color-claret)" },
  { name: "Equestrian", tagline: "Show jumping, dressage, eventing", color: "var(--color-navy)" },
  { name: "Lacrosse", tagline: "College and professional", color: "var(--color-moss)" },
  { name: "Yachting", tagline: "America\u2019s Cup and offshore", color: "var(--color-navy)" },
  { name: "Polo", tagline: "The sport of kings", color: "var(--color-brass)" },
  { name: "Golf", tagline: "Majors, tours, and long-shot Sundays", color: "var(--color-moss)" },
];

export default function SportsRotator() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

        // Background fade
        if (bg) {
          gsap.fromTo(
            bg,
            { opacity: 0 },
            {
              opacity: 0.05,
              scrollTrigger: {
                trigger: container,
                start: `${(i / sports.length) * 100}% top`,
                end: `${((i + 0.5) / sports.length) * 100}% top`,
                scrub: true,
              },
            }
          );
          gsap.fromTo(
            bg,
            { opacity: 0.05 },
            {
              opacity: 0,
              scrollTrigger: {
                trigger: container,
                start: `${((i + 0.5) / sports.length) * 100}% top`,
                end: `${((i + 1) / sports.length) * 100}% top`,
                scrub: true,
              },
            }
          );
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

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
