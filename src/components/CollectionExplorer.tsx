"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { DiscoverCollection } from "./home/CollectionShowcase";
import { cn } from "@/lib/utils";

const filters = [
  { key: "all", label: "All stories", slugs: [] },
  { key: "wedding", label: "Wedding & Heirloom", slugs: ["bridal-vows", "heirloom-edit", "temple-gold"] },
  { key: "day", label: "Everyday & Light", slugs: ["summer-muslin", "garden-of-blooms", "everyday-poetry"] },
  { key: "evening", label: "Evening", slugs: ["moonlit-drapes", "indigo-stories"] },
  { key: "festive", label: "Festive", slugs: ["festival-of-colour", "temple-gold", "heirloom-edit"] },
];

export default function CollectionExplorer({ collections }: { collections: DiscoverCollection[] }) {
  const [key, setKey] = useState("all");
  const current = filters.find((f) => f.key === key) ?? filters[0];
  const shown = key === "all" ? collections : collections.filter((c) => current.slugs.includes(c.slug));
  return (
    <div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-gold/25 py-5">
        <div className="flex flex-wrap gap-2">{filters.map((f) => <button key={f.key} type="button" aria-pressed={key === f.key} onClick={() => setKey(f.key)} className={cn("rounded-full border px-4 py-2.5 text-xs transition", key === f.key ? "border-maroon bg-maroon text-ivory" : "border-maroon/20 bg-ivory/80 text-maroon hover:border-maroon")}>{f.label}</button>)}</div>
        <span className="text-[11px] tracking-wide text-espresso/50" aria-live="polite">{shown.length} collections · {shown.reduce((n, c) => n + c.pieceCount, 0)} pieces</span>
      </div>
      {shown.length === 0 && (
        <p className="mt-12 rounded-2xl border border-gold/25 bg-ivory/70 py-16 text-center text-sm text-espresso/60">
          No stories in this edit yet.
        </p>
      )}
      <div key={key} className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((c) => <Link key={c.slug} href={`/shop?collection=${c.slug}`} data-silk className="group">
          <div className="sheen relative aspect-[3/4] overflow-hidden rounded-t-[130px] rounded-b-xl bg-blush">
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-kenburns src={c.image ?? "/images/m02.jpg"} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-espresso/65 via-transparent to-transparent" /><span className="pointer-events-none absolute inset-3 rounded-t-[120px] rounded-b-lg border border-gold-soft/55" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-ivory"><span className="overline text-[9px] text-gold-soft">Story {String(collections.findIndex((x) => x.slug === c.slug) + 1).padStart(2, "0")}</span><span className="grid h-10 w-10 place-items-center rounded-full border border-ivory/50 transition duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-espresso"><ArrowUpRight className="h-4 w-4" /></span></div>
          </div>
          <div className="mt-5 flex items-baseline justify-between gap-2"><h3 className="font-display text-[32px] leading-none">{c.name}</h3><span className="shrink-0 text-[10px] text-espresso/50">{c.pieceCount} pieces</span></div><p className="mt-3 text-[13px] leading-relaxed text-espresso/65">{c.description}</p>
        </Link>)}
      </div>
    </div>
  );
}
