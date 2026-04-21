"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { NAV_ITEMS, SPORTS, EASE_SILK } from "@/lib/constants";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

const easeSilk = EASE_SILK as unknown as [number, number, number, number];

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const nonDropdownItems = NAV_ITEMS.filter((item) => !item.hasDropdown);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button on open; return focus to hamburger on close
  useEffect(() => {
    if (isOpen) {
      // Small delay so AnimatePresence has rendered the button
      const timer = setTimeout(() => closeRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    } else {
      // Return focus to the hamburger button
      const hamburger = document.querySelector<HTMLButtonElement>(
        '[aria-controls="mobile-nav"]'
      );
      hamburger?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: easeSilk }}
          className="fixed inset-0 z-40 bg-ivory overflow-y-auto"
        >
          {/* Close button */}
          <button
            ref={closeRef}
            onClick={onClose}
            className="absolute top-6 z-50 p-2 text-ink focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
            style={{ right: "var(--gutter)" }}
            aria-label="Close menu"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>

          <div
            className="flex flex-col justify-center min-h-screen py-24"
            style={{
              paddingLeft: "var(--gutter)",
              paddingRight: "var(--gutter)",
            }}
          >
            {/* Sports section */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-eyebrow text-stone mb-6"
            >
              SPORTS
            </motion.span>

            <div className="flex flex-col gap-2 mb-12">
              {SPORTS.map((sport, i) => (
                <motion.div
                  key={sport.slug}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: easeSilk,
                  }}
                >
                  <Link
                    href={`/${sport.slug}`}
                    onClick={onClose}
                    className="text-display-l text-ink hover:text-brass transition-colors duration-300 block focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
                  >
                    {sport.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pages section */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + SPORTS.length * 0.08, duration: 0.4 }}
              className="text-eyebrow text-stone mb-6"
            >
              PAGES
            </motion.span>

            <div className="flex flex-col gap-2">
              {nonDropdownItems.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: (SPORTS.length + i) * 0.08,
                    ease: easeSilk,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="text-display-l text-ink hover:text-brass transition-colors duration-300 block focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
