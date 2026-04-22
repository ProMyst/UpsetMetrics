"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import MagneticLink from "@/components/ui/MagneticLink";

interface NavLinksProps {
  onSportsEnter: () => void;
  onSportsLeave: () => void;
}

export default function NavLinks({ onSportsEnter, onSportsLeave }: NavLinksProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {NAV_ITEMS.map((item, i) => (
        <MagneticLink
          key={item.label}
          onMouseEnter={item.hasDropdown ? onSportsEnter : undefined}
          onMouseLeave={item.hasDropdown ? onSportsLeave : undefined}
        >
          <Link
            href={item.href}
            className="relative text-small font-body text-graphite pb-1 block focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onFocus={() => setHoveredIndex(i)}
            onBlur={() => setHoveredIndex(null)}
          >
            {item.label}
            <span
              className="absolute bottom-0 left-0 h-px bg-ink transition-transform duration-300 origin-left w-full"
              style={{
                transform: hoveredIndex === i ? "scaleX(1)" : "scaleX(0)",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </Link>
        </MagneticLink>
      ))}
    </nav>
  );
}
