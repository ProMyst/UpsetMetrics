"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

function easeOut(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export default function CountUp({
  end,
  duration = 2500,
  prefix = "",
  suffix = "",
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState("0");
  const hasAnimated = useRef(false);

  // Show final value immediately for reduced motion (derived, no effect needed)
  const displayValue = prefersReducedMotion ? formatNumber(end) : display;

  const animate = useCallback(() => {
    if (hasAnimated.current || prefersReducedMotion) return;
    hasAnimated.current = true;

    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setDisplay(formatNumber(eased * end));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, [end, duration, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [animate, prefersReducedMotion]);

  return (
    <span ref={ref} className={`text-mono ${className ?? ""}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}
