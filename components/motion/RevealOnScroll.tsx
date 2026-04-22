"use client";

import { useEffect, useRef } from "react";
import { gsap, GSAP_EASE_SILK } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}

export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion) {
      el.style.opacity = "1";
      return;
    }

    const offsets = {
      up: { x: 0, y: 60 },
      left: { x: -60, y: 0 },
      right: { x: 60, y: 0 },
    };

    const { x, y } = offsets[direction];

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, x, y },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1.2,
          delay,
          ease: GSAP_EASE_SILK,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [delay, direction, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ opacity: prefersReducedMotion ? 1 : 0 }}
    >
      {children}
    </div>
  );
}
