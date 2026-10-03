import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { SITE_URL } from "@/lib/utils";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// One source of truth (previously duplicated here and in lib/utils, which
// could drift). Guarded so a scheme-less env value cannot crash module
// evaluation and take the whole app down.
function siteUrlObject(value: string) {
  try {
    return new URL(value);
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: siteUrlObject(SITE_URL),
  title: { default: "Elite Weavers — Handloom Sarees & Indian Couture", template: "%s · Elite Weavers" },
  description:
    "Elite Weavers is a luxury Indian saree house. Handwoven Banarasi, Kanjivaram, Chanderi, Bandhani and Patola sarees and lehengas, crafted by master weavers.",
  openGraph: {
    title: "Elite Weavers — Draped in Poetry",
    description: "Handwoven Indian sarees and couture for weddings, festivals and every moment that matters.",
    images: ["/images/og-hero.jpg"],
    type: "website",
    siteName: "Elite Weavers",
  },
  // Next does not copy openGraph images into the Twitter card.
  twitter: { card: "summary_large_image", images: ["/images/og-hero.jpg"] },
};

export const viewport: Viewport = { themeColor: "#1C1512" };

export default function RootLayout({ children }: { children: ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Elite Weavers",
    url: SITE_URL,
    // Google ignores SVG for Organization logos; this is a raster asset.
    logo: SITE_URL + "/logo.png",
    description: "Luxury Indian handloom saree house.",
    sameAs: ["https://instagram.com/eliteweavers.official"],
  };
  return (
    <html lang="en" className={display.variable + " " + sans.variable}>
      <body className="antialiased">
        <noscript>
          <style>{"[data-silk],[data-mask],main h1,main h2{opacity:1!important;transform:none!important}.intro{display:none!important}"}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
