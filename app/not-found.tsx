import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ padding: "var(--section-pad-y) var(--gutter)" }}
    >
      <div className="text-center max-w-2xl">
        <Eyebrow className="mb-8">ERROR · 404</Eyebrow>
        <h1
          className="text-display-l text-ink mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page Not Found
        </h1>
        <Divider className="my-8" />
        <p className="text-body text-graphite mb-12">
          This record doesn&rsquo;t exist in our archive. It may have been
          moved, renamed, or never written at all.
        </p>
        <Link
          href="/"
          className="font-display text-ink underline underline-offset-4 hover:text-brass transition-colors duration-300"
        >
          Return to the front page &rarr;
        </Link>
      </div>
    </section>
  );
}
