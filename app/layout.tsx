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
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Upsetmetrics — A Record of the Unexpected",
  description:
    "A weekly record of the unexpected, across the world's sports. Tennis, the turf, the paddock, the grid, and the fields beyond.",
  openGraph: {
    title: "Upsetmetrics — A Record of the Unexpected",
    description:
      "A weekly record of the unexpected, across the world's sports. Tennis, the turf, the paddock, the grid, and the fields beyond.",
    siteName: "Upsetmetrics",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upsetmetrics — A Record of the Unexpected",
    description:
      "A weekly record of the unexpected, across the world's sports. Tennis, the turf, the paddock, the grid, and the fields beyond.",
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
