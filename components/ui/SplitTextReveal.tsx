"use client";

import { useEffect, useRef, createElement } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

interface SplitTextRevealProps {
  text: string;
  tag?: Tag;
  className?: string;
  splitBy?: "chars" | "words" | "lines";
  delay?: number;
  stagger?: number;
}

function splitText(text: string, splitBy: "chars" | "words" | "lines") {
  switch (splitBy) {
    case "chars":
      return text.split("").map((c) => (c === " " ? "\u00A0" : c));
    case "words":
      return text.split(/\s+/).filter(Boolean);
    case "lines":
      return text.split("\n").filter(Boolean);
  }
}

export default function SplitTextReveal({
  text,
  tag = "p",
  className,
  splitBy = "words",
  delay = 0,
  stagger = 0.06,
}: SplitTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const piecesRef = useRef<(HTMLSpanElement | null)[]>([]);

  const pieces = splitText(text, splitBy);

  useEffect(() => {
    const els = piecesRef.current.filter(Boolean) as HTMLSpanElement[];
    if (els.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: "110%", opacity: 0 },
        {
          y: "0%",
          opacity: 1,
          duration: 1.2,
          delay,
          stagger,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [text, delay, stagger, splitBy]);

  const children = pieces.map((piece, i) => (
    <span
      key={`${piece}-${i}`}
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "top",
      }}
    >
      <span
        ref={(el) => {
          piecesRef.current[i] = el;
        }}
        style={{
          display: "inline-block",
          willChange: "transform",
          transform: "translateY(110%)",
          opacity: 0,
        }}
      >
        {piece}
      </span>
      {splitBy === "words" && i < pieces.length - 1 ? "\u00A0" : ""}
    </span>
  ));

  return createElement(
    tag,
    {
      ref: containerRef,
      className,
    },
    children
  );
}
