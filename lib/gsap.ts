"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// cubic-bezier(0.22, 1, 0.36, 1) — the silk easing curve
// Implemented as a GSAP-compatible ease function since CustomEase requires GSAP Club
function silk(progress: number): number {
  // Attempt to approximate cubic-bezier(0.22, 1, 0.36, 1)
  // using de Casteljau's algorithm for a cubic Bezier curve
  // Control points: P0=(0,0), P1=(0.22,1), P2=(0.36,1), P3=(1,1)
  const p1x = 0.22, p1y = 1.0, p2x = 0.36, p2y = 1.0;

  // Newton-Raphson to find t for a given x (progress)
  let t = progress;
  for (let i = 0; i < 8; i++) {
    const x = 3 * p1x * (1 - t) * (1 - t) * t
            + 3 * p2x * (1 - t) * t * t
            + t * t * t
            - progress;
    const dx = 3 * p1x * (1 - 2 * t + t * t - 2 * (1 - t) * t)
             + 3 * p2x * (2 * (1 - t) * t - t * t + (1 - t) * 2 * t)
             + 3 * t * t;
    if (Math.abs(dx) < 1e-7) break;
    t -= x / dx;
    t = Math.min(1, Math.max(0, t));
  }

  // Evaluate y at t
  return 3 * p1y * (1 - t) * (1 - t) * t
       + 3 * p2y * (1 - t) * t * t
       + t * t * t;
}

// Export the ease name constant for consistent usage
export const GSAP_EASE_SILK = silk;

export { gsap, ScrollTrigger };
