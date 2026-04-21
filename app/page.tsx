import Hero from "@/components/home/Hero";
import UpsetTicker from "@/components/home/UpsetTicker";
import FeaturedUpset from "@/components/home/FeaturedUpset";
import ThisWeekGrid from "@/components/home/ThisWeekGrid";
import SportsRotator from "@/components/home/SportsRotator";
import UpsetScoreExplainer from "@/components/home/UpsetScoreExplainer";
import NewsletterBlock from "@/components/home/NewsletterBlock";
import Divider from "@/components/ui/Divider";

export default function Home() {
  return (
    <>
      <Hero />
      <UpsetTicker />
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
