"use client";

import { TICKER_ITEMS } from "@/lib/constants";

export interface TickerItem {
  matchup: string;
  event: string;
  score: number;
}

function buildTickerText(items: readonly TickerItem[]) {
  return items
    .map(
      (item) => `${item.matchup} · ${item.event} · UPSET SCORE ${item.score}`,
    )
    .join(" ✦ ");
}

export default function UpsetTicker({
  items = TICKER_ITEMS,
}: {
  items?: readonly TickerItem[];
}) {
  const text = buildTickerText(items);

  return (
    <div className="overflow-hidden whitespace-nowrap">
      <div className="hairline" />
      <div className="py-3 flex animate-marquee" style={{ width: "max-content" }}>
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
