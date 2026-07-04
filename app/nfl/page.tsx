import type { Metadata } from "next";
import SportHub from "@/components/sport/SportHub";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "NFL Upsets — UpsetMetrics",
  description:
    "Every NFL upset scored on one transparent 0-100 scale. The most single-game-volatile league in American sport.",
  alternates: { canonical: `${SITE}/nfl` },
};

export default function NflPage() {
  return (
    <SportHub
      sport="nfl"
      title="NFL"
      tagline="The most single-game-volatile league in American sport. Every week produces at least one result that shouldn't have happened."
      coverage="Coverage begins with preseason play in August 2026 and extends through the Super Bowl. The regular season ingest scaffolding is ready; games start scoring the moment the first Thursday-night whistle blows."
    />
  );
}
