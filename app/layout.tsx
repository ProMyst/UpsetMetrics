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

const siteDescription =
  "A weekly record of the unexpected, across the world's sports. The Top 10 Upsets of the Week, delivered every Monday morning. From NASCAR to Nantucket — scored on one scale.";

export const metadata: Metadata = {
  title: "Upsetmetrics — A Record of the Unexpected",
  description: siteDescription,
  openGraph: {
    title: "Upsetmetrics — A Record of the Unexpected",
    description: siteDescription,
    siteName: "Upsetmetrics",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upsetmetrics — A Record of the Unexpected",
    description: siteDescription,
  },
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
        <SmoothScrollProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
