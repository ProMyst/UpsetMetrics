"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { SPORTS, EASE_SILK } from "@/lib/constants";

interface SportsDropdownProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const easeSilk = EASE_SILK as unknown as [number, number, number, number];

export default function SportsDropdown({
  isOpen,
  onMouseEnter,
  onMouseLeave,
}: SportsDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: easeSilk }}
          className="absolute top-full left-0 w-full bg-cream border-t border-stone/20 z-50"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div
            role="menu"
            className="mx-auto grid grid-cols-3 gap-x-8 gap-y-6 py-10"
            style={{
              maxWidth: "var(--layout-max)",
              paddingLeft: "var(--gutter)",
              paddingRight: "var(--gutter)",
            }}
          >
            {SPORTS.map((sport, i) => (
              <motion.div
                key={sport.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: i * 0.05,
                  ease: easeSilk,
                }}
              >
                <Link
                  href={`/${sport.slug}`}
                  className="group block py-2 focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
                  role="menuitem"
                >
                  <span className="font-display italic text-ink text-lg group-hover:text-brass transition-colors duration-300">
                    {sport.name}
                  </span>
                  <p className="text-small text-stone mt-0.5">
                    {sport.description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
