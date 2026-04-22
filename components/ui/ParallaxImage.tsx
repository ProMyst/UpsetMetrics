"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, GSAP_EASE_SILK } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

interface ParallaxImageProps {
  src?: string;
  alt?: string;
  className?: string;
  depth?: number;
  overlayOpacity?: number;
}

export default function ParallaxImage({
  src,
  alt = "",
  className,
  depth = 20,
  overlayOpacity = 0,
}: ParallaxImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    if (prefersReducedMotion) {
      container.style.clipPath = "inset(0% 0 0 0)";
      return;
    }

    const ctx = gsap.context(() => {
      // Clip-path reveal + scale on scroll-enter
      gsap.fromTo(
        container,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.4,
          ease: GSAP_EASE_SILK,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true,
          },
        }
      );

      gsap.fromTo(
        image,
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1.4,
          ease: GSAP_EASE_SILK,
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            once: true,
          },
        }
      );

      // Parallax scrub
      gsap.fromTo(
        image,
        { yPercent: -depth / 2 },
        {
          yPercent: depth / 2,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [depth, prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: "hidden",
        position: "relative",
        clipPath: prefersReducedMotion ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
      }}
    >
      <div
        ref={imageRef}
        style={{
          width: "100%",
          height: "100%",
          willChange: prefersReducedMotion ? "auto" : "transform",
        }}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: "300px",
              backgroundColor: "var(--color-navy)",
              opacity: 0.08,
            }}
          />
        )}
      </div>
      {overlayOpacity > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "var(--color-ink)",
            opacity: overlayOpacity,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}
