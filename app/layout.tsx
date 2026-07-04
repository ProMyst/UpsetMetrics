import type { Metadata, Viewport } from "next";
import { fraunces, ebGaramond, jetbrainsMono } from "@/lib/fonts";
import SmoothScrollProvider from "@/components/motion/SmoothScrollProvider";
import Header from "@/components/nav/Header";
import Footer from "@/components/footer/Footer";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#F5F1E8",
  width: "device-width",
  initialScale: 1,
};

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://upsetmetrics.com";

const siteDescription =
  "The top 10 upsets of the week across NBA, WNBA, MLB, Soccer and NFL, delivered every Monday morning. Every game scored on one transparent 0-100 scale. Free.";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE}/#organization`,
      name: "UpsetMetrics",
      url: SITE,
      description: siteDescription,
      founder: { "@id": `${SITE}/about#matthew` },
      foundingDate: "2026",
      sameAs: ["https://github.com/ProMyst/UpsetMetrics"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#website`,
      url: SITE,
      name: "UpsetMetrics",
      publisher: { "@id": `${SITE}/#organization` },
    },
    {
      "@type": "Person",
      "@id": `${SITE}/about#matthew`,
      name: "Matthew Miller",
      url: `${SITE}/methodology`,
      jobTitle: "Founder",
      worksFor: { "@id": `${SITE}/#organization` },
      sameAs: ["https://github.com/ProMyst"],
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "UpsetMetrics — A Record of the Unexpected",
    template: "%s · UpsetMetrics",
  },
  description: siteDescription,
  keywords: [
    "sports upsets",
    "NBA upsets",
    "WNBA upsets",
    "MLB upsets",
    "soccer upsets",
    "FIFA World Cup",
    "NFL upsets",
    "upset score",
    "sports newsletter",
    "Monday sports newsletter",
    "cross-sport analytics",
  ],
  openGraph: {
    title: "UpsetMetrics — A Record of the Unexpected",
    description: siteDescription,
    siteName: "UpsetMetrics",
    type: "website",
    locale: "en_US",
    url: SITE,
  },
  twitter: {
    card: "summary_large_image",
    title: "UpsetMetrics — A Record of the Unexpected",
    description: siteDescription,
  },
  alternates: { canonical: SITE },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${ebGaramond.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScrollProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
