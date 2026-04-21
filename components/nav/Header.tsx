"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import NavLinks from "./NavLinks";
import SportsDropdown from "./SportsDropdown";
import MobileNav from "./MobileNav";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sportsOpen, setSportsOpen] = useState(false);
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll when mobile nav is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleSportsEnter = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setSportsOpen(true);
  }, []);

  const handleSportsLeave = useCallback(() => {
    closeTimeout.current = setTimeout(() => {
      setSportsOpen(false);
    }, 150);
  }, []);

  return (
    <>
      <header
        className="fixed top-0 left-0 w-full z-50 transition-all duration-500"
        style={{
          background: scrolled ? "rgba(245,241,232,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(107,103,96,0.3)" : "1px solid transparent",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div
          className="flex items-center justify-between py-4"
          style={{
            paddingLeft: "var(--gutter)",
            paddingRight: "var(--gutter)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="font-display font-normal tracking-wide text-ink text-xl">
            Upsetmetrics
          </Link>

          {/* Desktop nav */}
          <NavLinks
            onSportsEnter={handleSportsEnter}
            onSportsLeave={handleSportsLeave}
          />

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-ink"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <line x1="3" y1="7" x2="21" y2="7" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="17" x2="21" y2="17" />
            </svg>
          </button>
        </div>

        {/* Sports dropdown */}
        <SportsDropdown
          isOpen={sportsOpen}
          onMouseEnter={handleSportsEnter}
          onMouseLeave={handleSportsLeave}
        />
      </header>

      {/* Mobile nav overlay */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
