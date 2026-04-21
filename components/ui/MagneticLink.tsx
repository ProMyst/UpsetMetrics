"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "@/lib/gsap";

interface MagneticLinkProps {
  children: React.ReactNode;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export default function MagneticLink({
  children,
  className,
  onMouseEnter,
  onMouseLeave,
}: MagneticLinkProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const RADIUS = 120;
  const STRENGTH = 0.3;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < RADIUS) {
      gsap.to(el, {
        x: dx * STRENGTH,
        y: dy * STRENGTH,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, []);

  const handleMouseLeaveInternal = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.4)",
    });
    onMouseLeave?.();
  }, [onMouseLeave]);

  const handleMouseEnterInternal = useCallback(() => {
    onMouseEnter?.();
  }, [onMouseEnter]);

  useEffect(() => {
    if (isTouchDevice()) return;

    const el = ref.current;
    if (!el) return;

    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseenter", handleMouseEnterInternal);
    el.addEventListener("mouseleave", handleMouseLeaveInternal);

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseenter", handleMouseEnterInternal);
      el.removeEventListener("mouseleave", handleMouseLeaveInternal);
    };
  }, [handleMouseMove, handleMouseEnterInternal, handleMouseLeaveInternal]);

  return (
    <span
      ref={ref}
      className={className}
      style={{ display: "inline-block", willChange: "transform" }}
    >
      {children}
    </span>
  );
}
