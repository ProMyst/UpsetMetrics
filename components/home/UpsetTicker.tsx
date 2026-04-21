"use client";

import { TICKER_ITEMS } from "@/lib/constants";

function buildTickerText() {
  return TICKER_ITEMS.map(
    (item) => `${item.matchup} \u00B7 ${item.event} \u00B7 UPSET SCORE ${item.score}`
  ).join(" \u2726 ");
}

export default function UpsetTicker() {
  const text = buildTickerText();

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="hairline" />
      <div className="py-3 flex animate-marquee">
        <span className="font-mono text-xs text-stone tracking-wider uppercase shrink-0">
          {text} &nbsp;\u2726&nbsp;{" "}
        </span>
        <span className="font-mono text-xs text-stone tracking-wider uppercase shrink-0">
          {text} &nbsp;\u2726&nbsp;{" "}
        </span>
      </div>
      <div className="hairline" />
    </div>
  );
}
