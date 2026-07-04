import Hero from "@/components/home/Hero";
import UpsetTicker, { type TickerItem } from "@/components/home/UpsetTicker";
import FeaturedUpset from "@/components/home/FeaturedUpset";
import ThisWeekGrid from "@/components/home/ThisWeekGrid";
import SportsRotator from "@/components/home/SportsRotator";
import UpsetScoreExplainer from "@/components/home/UpsetScoreExplainer";
import NewsletterBlock from "@/components/home/NewsletterBlock";
import Divider from "@/components/ui/Divider";
import { getAllUpsets } from "@/lib/data/upsets";

/**
 * Homepage is a server component so we can hydrate the ticker with real
 * upset data at build time. Once the JSON entries are ingested, the ticker
 * always shows the current top 12 upsets across every sport.
 */
export default function Home() {
  const topItems: TickerItem[] = getAllUpsets()
    .slice(0, 12)
    .map((e) => ({
      matchup: `${e.winner.name.toUpperCase()} d. ${e.loser.name.toUpperCase()}`,
      event:
        e.event?.toUpperCase() ??
        (e.sport === "soccer"
          ? "SOCCER"
          : e.sport === "wnba"
            ? "WNBA"
            : e.sport === "mlb"
              ? "MLB"
              : e.sport === "nba"
                ? "NBA"
                : "NFL"),
      score: e.upsetScore,
    }));

  return (
    <>
      <Hero />
      <UpsetTicker items={topItems} />
      <Divider className="my-0" />
      <FeaturedUpset />
      <Divider />
      <ThisWeekGrid />
      <Divider />
      <SportsRotator />
      <Divider />
      <UpsetScoreExplainer />
      <Divider />
      <NewsletterBlock />
    </>
  );
}
