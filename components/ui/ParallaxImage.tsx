"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

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

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    const ctx = gsap.context(() => {
      // Clip-path reveal + scale on scroll-enter
      gsap.fromTo(
        container,
        { clipPath: "inset(100% 0 0 0)" },
        {
          clipPath: "inset(0% 0 0 0)",
          duration: 1.4,
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
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
          ease: "cubic-bezier(0.22, 1, 0.36, 1)",
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
  }, [depth]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        overflow: "hidden",
        position: "relative",
        clipPath: "inset(100% 0 0 0)",
      }}
    >
      <div
        ref={imageRef}
        style={{
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
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
