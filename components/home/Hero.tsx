"use client";

import { motion } from "motion/react";
import Eyebrow from "@/components/ui/Eyebrow";
import MagneticLink from "@/components/ui/MagneticLink";
import { EASE_SILK } from "@/lib/constants";

const silk = EASE_SILK as unknown as [number, number, number, number];

// Alternative headline for future A/B testing: "A Record of the Unexpected."
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
    <section className="min-h-screen flex flex-col justify-center bg-ivory relative hero-section">
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
          className="text-display-xl font-display text-ink hero-headline-letterpress"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          aria-label={headline}
        >
          {chars.map((char, i) => (
            <span
              key={`${char}-${i}`}
              aria-hidden="true"
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
          className="font-body italic text-graphite max-w-[52ch] mx-auto mt-8"
          style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.5rem)" }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3, ease: silk }}
        >
          The Top 10 Upsets of the Week, delivered every Monday morning.
          NASCAR to Nantucket&nbsp;&mdash; the world&rsquo;s sports, scored on one scale.
        </motion.p>

        {/* Brass rule */}
        <motion.div
          className="bg-brass h-[0.5px] w-full max-w-md mx-auto mt-10"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 1.5, ease: silk }}
          style={{ transformOrigin: "left" }}
        />

        {/* Newsletter CTA */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.7, ease: silk }}
        >
          <MagneticLink>
            <a
              href="#newsletter"
              className="text-small font-body italic text-stone hover:text-brass transition-colors duration-300"
            >
              Join the Monday Edition &rarr;
            </a>
          </MagneticLink>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.9, ease: silk }}
        >
          <span className="text-mono text-xs text-stone tracking-widest uppercase animate-bob inline-block">
            SCROLL
          </span>
        </motion.div>
      </div>
    </section>
  );
}
