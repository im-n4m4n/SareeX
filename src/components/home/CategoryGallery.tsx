"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Ornaments, PatternBg } from "../Motifs";
import { SectionTitle } from "../ui";

export type DiscoverCategory = { slug: string; name: string; description: string; image: string | null; pieceCount: number };

export default function CategoryGallery({ categories }: { categories: DiscoverCategory[] }) {
  const row = useRef<HTMLDivElement>(null);
  function slide(direction: number) {
    row.current?.scrollBy({ left: direction * (row.current.clientWidth * 0.75), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return (
    <section id="wardrobe" data-chapter="The Wardrobe" data-surface="light" className="relative overflow-hidden bg-ivory py-24 md:py-28">
      <PatternBg variant="block" fade="edges" />
      <Ornaments tone="maroon" />
      <div className="relative mx-auto max-w-[1400px]">
        <div className="flex items-end justify-between gap-6 px-6 md:px-10">
          <div>
            <SectionTitle overline="The considered wardrobe" title={<>Many ways to wear <i>heritage.</i></>} />
            <p data-silk className="mt-5 max-w-lg text-sm leading-relaxed text-espresso/65">Six yards are only the beginning. Discover the handwoven pieces that make every part of your wardrobe feel like you.</p>
          </div>
          <div data-silk className="hidden shrink-0 items-center gap-2 sm:flex">
            <button onClick={() => slide(-1)} aria-label="Previous categories" className="category-arrow"><ArrowLeft className="h-4 w-4" /></button>
            <button onClick={() => slide(1)} aria-label="Next categories" className="category-arrow"><ArrowRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div ref={row} data-lenis-prevent className="category-gallery no-scrollbar mt-12 flex gap-5 overflow-x-auto px-6 pb-8 md:gap-6 md:px-10">
          {categories.map((c, i) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} data-silk className="category-card group w-[70vw] max-w-[250px] shrink-0 md:w-[230px]">
              <div className="sheen category-photo relative aspect-[3/4] overflow-hidden rounded-[90px_90px_14px_14px] bg-blush">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image ?? "/images/m02.jpg"} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/45 to-transparent" />
                <div className="pointer-events-none absolute inset-3 rounded-[80px_80px_8px_8px] border border-gold-soft/60" />
                <span className="overline absolute bottom-4 left-5 text-[9px] text-ivory/80">Chapter {String(i + 1).padStart(2, "0")}</span>
                <span className="absolute bottom-4 right-4 grid h-8 w-8 place-items-center rounded-full border border-ivory/40 text-ivory transition duration-500 group-hover:rotate-[-35deg] group-hover:bg-gold group-hover:text-espresso"><ArrowRight className="h-3.5 w-3.5" /></span>
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-2">
                <h3 className="font-display text-3xl">{c.name}</h3>
                <span className="text-[10px] tracking-wide text-espresso/50">{c.pieceCount} pieces</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="px-6 text-[10px] uppercase tracking-[0.2em] text-maroon/65 sm:hidden">Swipe to discover the wardrobe →</p>
      </div>
    </section>
  );
}
