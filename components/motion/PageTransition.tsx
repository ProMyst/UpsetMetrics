"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";

const SILK_EASING = [0.22, 1, 0.36, 1] as const;

interface PageTransitionProps {
  children: React.ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.6,
            ease: SILK_EASING,
          },
        }}
        exit={{
          opacity: 0,
          y: 20,
          transition: {
            duration: 0.4,
            ease: SILK_EASING,
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
