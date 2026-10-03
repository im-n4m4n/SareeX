import Link from "next/link";
import type { Metadata } from "next";
import { articles } from "@/lib/journal";
import { MaskLines } from "@/components/ui";
import { CONTAINER, PAGE_TOP_HERO } from "@/lib/layout";
import { coverImage } from "@/lib/utils";

export const metadata: Metadata = { title: "Journal", description: "Weaver stories, textile notes and drape guides from the Elite Weavers atelier." };

export default function JournalPage() {
  return (
    <div className={`${CONTAINER} ${PAGE_TOP_HERO} pb-10`}>
      <p className="overline text-maroon">The Journal</p>
      <h1 className="font-display mt-3 text-7xl leading-none md:text-9xl">
        <MaskLines lines={["Notes from", <i key="l">the loom.</i>]} />
      </h1>
      <div className="gold-rule mt-12" />
      <div className="mt-14 grid gap-8 md:grid-cols-3">
        {articles.map((a, i) => (
          <Link key={a.slug} href={`/journal/${a.slug}`} data-silk className={`group ${i === 1 ? "md:mt-12" : ""}`}>
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-blush">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage(a.image)} alt={a.title} loading="lazy" className="h-full w-full object-cover transition duration-[1400ms] group-hover:scale-110" />
            </div>
            <p className="overline mt-5 text-maroon">{a.kicker} · {a.date}</p>
            <h2 className="font-display mt-2 text-4xl leading-tight">{a.title}</h2>
            <p className="mt-2 text-sm text-espresso/65">{a.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
