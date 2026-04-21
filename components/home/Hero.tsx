"use client";

import { motion } from "motion/react";
import Eyebrow from "@/components/ui/Eyebrow";
import { EASE_SILK } from "@/lib/constants";

const silk = EASE_SILK as unknown as [number, number, number, number];

const headline = "The Upsets We Will Remember";
const chars = headline.split("").map((c) => (c === " " ? "\u00A0" : c));

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.5,
    },
  },
};

const charVariants = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 1.4,
      ease: silk,
    },
  },
};

export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col justify-center bg-ivory relative">
      <div
        className="mx-auto w-full text-center"
        style={{ padding: "0 var(--gutter)" }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: silk }}
        >
          <Eyebrow className="mb-8 block">VOL. I &middot; EST. 2026</Eyebrow>
        </motion.div>

        {/* Headline — character-by-character reveal */}
        <motion.h1
          className="text-display-xl font-display text-ink"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label={headline}
        >
          {chars.map((char, i) => (
            <span
              key={`${char}-${i}`}
              style={{
                display: "inline-block",
                overflow: "hidden",
                verticalAlign: "top",
              }}
            >
              <motion.span
                style={{ display: "inline-block", willChange: "transform" }}
                variants={charVariants}
              >
                {char}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-2xl font-body italic text-graphite max-w-[52ch] mx-auto mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease: silk }}
        >
          A weekly record of the unexpected, across the world&rsquo;s sports.
          Tennis, the turf, the paddock, the grid, and the fields beyond.
        </motion.p>

        {/* Brass rule */}
        <motion.div
          className="bg-brass h-[0.5px] w-full max-w-md mx-auto mt-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.5, ease: silk }}
          style={{ transformOrigin: "left" }}
        />

        {/* Scroll indicator */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8, ease: silk }}
        >
          <span className="text-mono text-xs text-stone tracking-widest uppercase animate-bob inline-block">
            SCROLL
          </span>
        </motion.div>
      </div>
    </section>
  );
}
