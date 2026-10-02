import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Effects from "@/components/Effects";
import Intro from "@/components/Intro";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Elite Weavers — Handloom Sarees & Indian Couture", template: "%s · Elite Weavers" },
  description:
    "Elite Weavers is a luxury Indian saree house. Handwoven Banarasi, Kanjivaram, Chanderi, Bandhani and Patola sarees and lehengas, crafted by master weavers.",
  openGraph: {
    title: "Elite Weavers — Draped in Poetry",
    description: "Handwoven Indian sarees and couture for weddings, festivals and every moment that matters.",
    images: ["/images/hero.jpg"],
    type: "website",
    siteName: "Elite Weavers",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#1C1512" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Elite Weavers",
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    description: "Luxury Indian handloom saree house.",
    sameAs: ["https://instagram.com/eliteweavers.official"],
  };
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">
        <noscript>
          <style>{`[data-silk],[data-mask],main h1,main h2{opacity:1!important;transform:none!important}.intro{display:none!important}`}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Intro />
        <SmoothScroll>{children}</SmoothScroll>
        <Effects />
      </body>
    </html>
  );
}
