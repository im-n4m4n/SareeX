import { Mandala, PatternBg } from "./Motifs";
import Link from "next/link";
import { Camera as Instagram, MessageCircle, Play as Youtube, Share2 as Facebook } from "lucide-react";
import NewsletterForm from "./NewsletterForm";
import { Lotus } from "./ui";

const cols = [
  {
    title: "Shop",
    links: [
      ["New Arrivals", "/shop?new=1"],
      ["Banarasi", "/shop?weave=banarasi"],
      ["Kanjivaram", "/shop?weave=kanjivaram"],
      ["Lehengas", "/shop?category=lehengas"],
      ["Dupattas & Blouses", "/categories"],
      ["Kurta Sets", "/shop?category=kurta-sets"],
      ["Collections", "/collections"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Size Guide", "/craft#size-guide"],
      ["Shipping & Returns", "/about#shipping"],
      ["Track Order", "/account"],
      ["Contact / WhatsApp", "https://wa.me/919999999999"],
    ],
  },
  {
    title: "The House",
    links: [
      ["Our Story", "/about"],
      ["The Craft", "/craft"],
      ["Journal", "/journal"],
      ["Admin", "/admin"],
    ],
  },
];

export default function Footer() {
  return (
    <footer id="weavers-circle" data-chapter="The Weavers Circle" data-surface="dark" className="relative mt-0 overflow-hidden bg-espresso pb-8 pt-28 text-ivory">
      <PatternBg variant="brocade" strength="strong" fade="bottom" />
      <Mandala className="absolute -right-48 -top-32 h-[560px] w-[560px] text-gold/25" />
      <Mandala reverse className="absolute -left-56 top-1/3 h-[480px] w-[480px] text-gold/15" />
      <div className="border-temple absolute inset-x-0 top-0 opacity-70" />
      <div
        aria-hidden
        className="brand-watermark font-display pointer-events-none absolute inset-x-0 bottom-0 select-none text-center text-[22vw] leading-[0.78] tracking-[0.04em] text-gold/[0.07]"
      >
        ELITE WEAVERS
      </div>

      <div className="relative mx-auto max-w-[1300px] px-5 md:px-10">
        <div data-silk className="mx-auto -mb-0 rounded-[2rem] bg-ivory p-8 text-espresso shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] md:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <Lotus className="h-7 w-10 text-gold" />
              <p className="overline mt-4 text-maroon">The Elite Weavers Circle</p>
              <h3 className="font-display mt-2 text-4xl leading-tight md:text-5xl">
                Get <i>10% off</i> your first saree
              </h3>
              <p className="mt-3 max-w-sm text-sm text-espresso/70">
                Weaver stories, early access to heirloom drops and styling notes — letters, not noise.
              </p>
              <div className="mt-6 max-w-sm">
                <NewsletterForm />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {cols.map((c) => (
                <div key={c.title}>
                  <p className="overline text-maroon">{c.title}</p>
                  <ul className="mt-4 space-y-3 text-sm">
                    {c.links.map(([label, href]) => (
                      <li key={label}>
                        <Link href={href} className="text-espresso/75 transition hover:text-maroon">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="gold-rule my-8" />
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-espresso/70">
              {["UPI", "VISA", "Mastercard", "RuPay", "Razorpay"].map((p) => (
                <span key={p} className="rounded-md border border-espresso/15 px-2.5 py-1.5 tracking-wider">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-espresso/70">
              <a href="https://instagram.com/eliteweavers.official" aria-label="Instagram"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="Facebook"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="YouTube"><Youtube className="h-4 w-4" /></a>
              <a href="https://wa.me/919999999999" aria-label="WhatsApp"><MessageCircle className="h-4 w-4" /></a>
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-[10vw] mt-8 flex flex-col items-center justify-between gap-2 text-xs text-ivory/60 md:flex-row">
          <p>© {new Date().getFullYear()} Elite Weavers Atelier. Woven in India, worn everywhere.</p>
          <p className="flex gap-5">
            <Link href="/about">Privacy</Link>
            <Link href="/about">Terms</Link>
            <Link href="/about#shipping">Shipping & Returns</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
