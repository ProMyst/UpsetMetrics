import Hero from "@/components/home/Hero";
import UpsetTicker, { type TickerItem } from "@/components/home/UpsetTicker";
import FeaturedUpset, {
  type FeaturedUpsetData,
} from "@/components/home/FeaturedUpset";
import ThisWeekGrid, { type WeekCard } from "@/components/home/ThisWeekGrid";
import SportsRotator from "@/components/home/SportsRotator";
import UpsetScoreExplainer from "@/components/home/UpsetScoreExplainer";
import NewsletterBlock from "@/components/home/NewsletterBlock";
import Divider from "@/components/ui/Divider";
import { getAllUpsets } from "@/lib/data/upsets";
import type { SportSlug } from "@/lib/schema/upset";

const SPORT_LABEL: Record<SportSlug, string> = {
  soccer: "SOCCER",
  wnba: "WNBA",
  mlb: "MLB",
  nba: "NBA",
  nfl: "NFL",
};

function upsetHref(e: {
  date: string;
  sport: SportSlug;
  slug: string;
}): string {
  return `/upset/${e.date.slice(0, 4)}/${e.sport}/${e.date}/${e.slug}`;
}

/**
 * Server-rendered homepage. Pulls real upset data at build time and
 * hands it to each client component as props. When the data folder is
 * empty (fresh clone before ingest), the components' FALLBACK stays
 * intact so the layout never breaks.
 */
export default function Home() {
  const all = getAllUpsets();

  // The ticker: top 12 upsets across every sport
  const tickerItems: TickerItem[] = all.slice(0, 12).map((e) => ({
    matchup: `${e.winner.name.toUpperCase()} d. ${e.loser.name.toUpperCase()}`,
    event: e.event?.toUpperCase() ?? SPORT_LABEL[e.sport],
    score: e.upsetScore,
  }));

  // Feature the single biggest recent upset (last 30 days if present,
  // otherwise the biggest of all time as a demonstration)
  const now = Date.now();
  const recent = all.filter(
    (e) => (now - new Date(e.date).getTime()) / 86_400_000 <= 30,
  );
  const featured = recent[0] ?? all[0];
  const featuredData: FeaturedUpsetData | undefined = featured
    ? {
        headline: `${featured.winner.name} d. ${featured.loser.name}`,
        href: upsetHref(featured),
        eyebrow: recent.length > 0
          ? "THIS WEEK'S DEFINING UPSET"
          : "THE DEFINING UPSET ON RECORD",
        quote: featured.context ??
          `A ${featured.stakes.toLowerCase()} result the market did not expect. Final score ${featured.finalScore}. Upset Score ${featured.upsetScore}.`,
        attribution: `${featured.stakes} · ${featured.date} · Methodology v${featured.methodologyVersion}`,
        score: featured.upsetScore,
      }
    : undefined;

  // This-week grid: top 6 across sports with a varied column layout
  const gridCandidates = recent.length >= 6 ? recent.slice(0, 6) : all.slice(0, 6);
  const colSpans = ["lg:col-span-7", "lg:col-span-5", "lg:col-span-4", "lg:col-span-5", "lg:col-span-3", "lg:col-span-5"];
  const offsetClasses = [undefined, undefined, undefined, "lg:mt-12", undefined, undefined];
  const gridCards: WeekCard[] = gridCandidates.map((e, i) => ({
    sport: SPORT_LABEL[e.sport],
    headline: `${e.winner.name} d. ${e.loser.name}`,
    href: upsetHref(e),
    score: e.upsetScore,
    colSpan: colSpans[i] ?? "lg:col-span-4",
    offsetClass: offsetClasses[i],
    event: e.event ?? undefined,
  }));

  return (
    <>
      <Hero />
      <UpsetTicker items={tickerItems.length ? tickerItems : undefined} />
      <Divider className="my-0" />
      <FeaturedUpset data={featuredData} />
      <Divider />
      <ThisWeekGrid cards={gridCards.length ? gridCards : undefined} />
      <Divider />
      <SportsRotator />
      <Divider />
      <UpsetScoreExplainer />
      <Divider />
      <NewsletterBlock />
    </>
  );
}
