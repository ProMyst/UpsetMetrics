import type { Metadata } from "next";
import SportHub from "@/components/sport/SportHub";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "WNBA Upsets — UpsetMetrics",
  description:
    "Every WNBA upset scored on one transparent 0-100 scale. The growing league, the deepest era of parity, the nights the favorite falls.",
  alternates: { canonical: `${SITE}/wnba` },
};

export default function WnbaPage() {
  return (
    <SportHub
      sport="wnba"
      title="WNBA"
      tagline="The most competitive era the league has seen. Every rookie standout, every seed reshuffle, every night the favorite falls."
      coverage="Every completed WNBA game from the current season, ingested daily from ESPN. The archive extends back to the last full season. Games are scored on standings-based factors while the season is young."
    />
  );
}
