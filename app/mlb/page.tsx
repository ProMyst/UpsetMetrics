import type { Metadata } from "next";
import SportHub from "@/components/sport/SportHub";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "MLB Upsets — UpsetMetrics",
  description:
    "Every MLB upset scored on one transparent 0-100 scale. 162 games a year, then October — where the upsets that piled up quietly for six months finally get named.",
  alternates: { canonical: `${SITE}/mlb` },
};

export default function MlbPage() {
  return (
    <SportHub
      sport="mlb"
      title="MLB"
      tagline="The longest season in American sport. The upsets that pile up quietly for six months then explode in October."
      coverage="Every completed MLB game from the current season, ingested daily via the MLB StatsAPI. Coverage extends through the playoffs and World Series."
    />
  );
}
