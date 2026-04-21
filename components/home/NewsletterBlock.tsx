"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import Eyebrow from "@/components/ui/Eyebrow";
import SplitTextReveal from "@/components/ui/SplitTextReveal";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import { EASE_SILK } from "@/lib/constants";

const silk = EASE_SILK as unknown as [number, number, number, number];

export default function NewsletterBlock() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      id="newsletter"
      style={{
        paddingTop: "var(--section-pad-y)",
        paddingBottom: "var(--section-pad-y)",
        paddingLeft: "var(--gutter)",
        paddingRight: "var(--gutter)",
      }}
    >
      <RevealOnScroll>
        <div className="max-w-2xl mx-auto text-center">
          <Eyebrow className="mb-4 block">THE MONDAY EDITION</Eyebrow>

          <div className="mb-8">
            <SplitTextReveal
              text="Every Monday. The week's upsets, ranked."
              tag="h2"
              className="text-display-l font-display text-ink"
              splitBy="words"
            />
          </div>

          <p className="text-body text-graphite max-w-[52ch] mx-auto mb-10">
            One email, sent Monday morning, with the ten most improbable results
            from the weekend just passed. Scored, ranked, and written with the same
            care we&rsquo;d want from anyone we read. No ads. No filler. Four
            minutes with coffee.
          </p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4, ease: silk }}
                className="flex flex-col items-center gap-6"
              >
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  className="
                    w-full max-w-sm mx-auto
                    bg-transparent border-0 border-b border-stone/40
                    text-body text-ink
                    py-3
                    outline-none
                    placeholder:text-stone/50
                    focus:border-brass transition-colors
                    text-center
                  "
                />
                <button
                  type="submit"
                  className="
                    text-eyebrow text-ink
                    cursor-pointer
                    hover:text-brass transition-colors
                    tracking-widest uppercase
                    bg-transparent border-0
                  "
                >
                  Subscribe
                </button>
              </motion.form>
            ) : (
              <motion.p
                key="thanks"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: silk }}
                className="font-display italic text-2xl text-ink"
              >
                You&rsquo;re on the list. See you Monday.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </RevealOnScroll>
    </section>
  );
}
