"use client";

import { useEffect } from "react";
import Eyebrow from "@/components/ui/Eyebrow";
import Divider from "@/components/ui/Divider";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error);
    }
  }, [error]);

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ padding: "var(--section-pad-y) var(--gutter)" }}
    >
      <div className="text-center max-w-2xl">
        <Eyebrow className="mb-8">ERROR · SOMETHING WENT WRONG</Eyebrow>
        <h1
          className="text-display-l font-display text-ink mb-6"
        >
          An unexpected error.
        </h1>
        <Divider className="my-8" />
        <p className="text-body text-graphite mb-12">
          Something went sideways. Try again, or return to the front page.
        </p>
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={reset}
            className="font-display text-ink underline underline-offset-4 hover:text-brass transition-colors duration-300 cursor-pointer"
          >
            Try again
          </button>
          <Link
            href="/"
            className="font-display text-ink underline underline-offset-4 hover:text-brass transition-colors duration-300"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
