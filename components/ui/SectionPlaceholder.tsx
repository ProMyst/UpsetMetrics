"use client";

import { motion } from "motion/react";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";

const SILK_EASING = [0.22, 1, 0.36, 1] as const;

interface SectionPlaceholderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
}

export default function SectionPlaceholder({
  title,
  subtitle = "This section is being crafted. Check back soon.",
  eyebrow = "COMING SOON",
}: SectionPlaceholderProps) {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ padding: "var(--section-pad-y) var(--gutter)" }}
    >
      <motion.div
        className="text-center max-w-2xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: SILK_EASING }}
      >
        <Eyebrow className="mb-8">{eyebrow}</Eyebrow>
        <h1
          className="text-display-l text-ink mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {title}
        </h1>
        <Divider className="my-8" />
        <p className="text-body text-graphite">{subtitle}</p>
      </motion.div>
    </section>
  );
}
