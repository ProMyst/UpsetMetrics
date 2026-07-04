import type { Metadata } from "next";
import SportHub from "@/components/sport/SportHub";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "NBA Upsets — UpsetMetrics",
  description:
    "Every NBA upset ever recorded, scored on one transparent 0-100 scale. Real closing moneyline odds on every game since 2007.",
  alternates: { canonical: `${SITE}/nba` },
};

export default function NbaPage() {
  return (
    <SportHub
      sport="nba"
      title="NBA"
      tagline="Regular season, playoffs, the Finals. Every game scored on the same transparent scale. Real closing moneyline data on every game since 2007."
      coverage="Every NBA game from 1970 through the most recent completed date. Games from 2007 onward carry real closing moneylines from The Odds API. Games before 2007 use a record-based proxy."
    />
  );
}
