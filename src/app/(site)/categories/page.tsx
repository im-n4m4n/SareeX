import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getFacets } from "@/lib/queries";
import { PatternBg, Ornaments } from "@/components/Motifs";
import { MaskLines } from "@/components/ui";
import WeaveRibbon from "@/components/WeaveRibbon";
import { CONTAINER, PAGE_TOP_HERO, SECTION_Y } from "@/lib/layout";
import { countWord, coverImage } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Wardrobe — Shop by Category", description: "Shop sarees, lehengas, dupattas, brocade blouses, handloom kurta sets, and Kashmiri shawls at Elite Weavers." };

/** Chapter copy is data-driven: categories are admin-creatable, so no fixed count. */
export default async function CategoriesPage() {
  const { categories, collections } = await getFacets();
  return (
    <>
      <section id="category-intro" data-chapter="The Wardrobe" className={`relative overflow-hidden bg-blush pb-20 text-center ${PAGE_TOP_HERO}`}>
        <PatternBg variant="lotus" fade="edges" />
        <Ornaments />
        <div className={`relative ${CONTAINER}`}>
          <p className="overline text-maroon">The handloom wardrobe</p>
          <h1 className="font-display mt-5 text-6xl leading-[.95] md:text-8xl">
            <MaskLines lines={["Beyond the drape.", <i key="possibilities">Always the craft.</i>]} />
          </h1>
          <p data-silk className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-espresso/65">A collection of considered pieces. From your first saree to the finishing touch, woven into a wardrobe that tells your story.</p>
        </div>
      </section>
      <section
        id="wardrobe-categories"
        data-chapter={`Explore ${countWord(categories.length)} Categories`}
        className={`relative ${CONTAINER} ${SECTION_Y}`}
      >
        <div className="grid gap-x-10 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Link key={c.slug} href={`/shop?category=${c.slug}`} data-silk className="group">
              <div className="sheen relative aspect-[3/4] overflow-hidden rounded-t-[130px] rounded-b-xl bg-blush">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-kenburns src={coverImage(c.image)} alt={c.name} loading="lazy" className="h-full w-full object-cover" />
                <span className="pointer-events-none absolute inset-3 rounded-t-[120px] rounded-b-lg border border-gold-soft/55" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-6 text-ivory">
                  <span className="overline text-[9px]">Chapter {String(i + 1).padStart(2, "0")}</span>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-ivory/50 transition duration-500 group-hover:rotate-[-35deg] group-hover:bg-gold group-hover:text-espresso">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-3">
                <h2 className="font-display text-4xl">{c.name}</h2>
                <span className="text-xs text-espresso/50">{c.pieceCount} pieces</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-espresso/65">{c.description}</p>
            </Link>
          ))}
        </div>
        <div data-silk className="mt-20 rounded-2xl border border-gold/30 bg-blush/50 p-8 text-center">
          <p className="overline text-maroon">{collections.length} carefully curated stories</p>
          <h2 className="font-display mt-3 text-4xl">Or discover your next <i>collection.</i></h2>
          <Link href="/collections" className="btn-maroon mt-6">Explore the collections <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
      <WeaveRibbon />
    </>
  );
}
