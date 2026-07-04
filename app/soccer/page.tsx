import type { Metadata } from "next";
import SportHub from "@/components/sport/SportHub";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

export const metadata: Metadata = {
  title: "Soccer Upsets — UpsetMetrics",
  description:
    "The FIFA World Cup bracket, every knockout upset, giant-slayers of the group stage. Every completed match scored across FIFA WC, UCL, and the top five European leagues plus MLS.",
  alternates: { canonical: `${SITE}/soccer` },
};

export default function SoccerPage() {
  return (
    <SportHub
      sport="soccer"
      title="Soccer"
      tagline="The World Cup bracket, every knockout upset, the giant-slayers of the group stage. Where 90 minutes can rewrite a country's confidence."
      coverage="Seven competitions: FIFA World Cup, UEFA Champions League, Premier League, La Liga, Serie A, Bundesliga, and MLS. Ingested daily from ESPN. Draws are not scored as upsets in v1.1 (deferred to v2.0 draw-upset handling)."
    />
  );
}
