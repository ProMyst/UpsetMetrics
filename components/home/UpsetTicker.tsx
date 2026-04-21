"use client";

import { TICKER_ITEMS } from "@/lib/constants";

// TODO: refactor to render items as individual spans when we introduce hover interactions per-upset

function buildTickerText() {
  return TICKER_ITEMS.map(
    (item) => `${item.matchup} · ${item.event} · UPSET SCORE ${item.score}`
  ).join(" ✦ ");
}

export default function UpsetTicker() {
  const text = buildTickerText();

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="hairline" />
      <div className="py-3 flex animate-marquee">
        <span className="font-mono text-stone uppercase shrink-0" style={{ fontSize: "0.6875rem", letterSpacing: "0.15em" }}>
          {text}{" "}✦{" "}
        </span>
        <span className="font-mono text-stone uppercase shrink-0" style={{ fontSize: "0.6875rem", letterSpacing: "0.15em" }}>
          {text}{" "}✦{" "}
        </span>
      </div>
      <div className="hairline" />
    </div>
  );
}
