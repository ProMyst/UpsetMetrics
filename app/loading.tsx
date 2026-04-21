import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";

export default function Loading() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ padding: "var(--section-pad-y) var(--gutter)" }}
    >
      <div className="text-center max-w-2xl">
        <Eyebrow className="mb-8">LOADING</Eyebrow>
        <h1
          className="text-display-l text-ink mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          One moment.
        </h1>
        <div className="animate-pulse-brass">
          <Divider className="my-8" />
        </div>
        <p className="text-body text-graphite">
          The page is being prepared.
        </p>
      </div>
    </section>
  );
}
