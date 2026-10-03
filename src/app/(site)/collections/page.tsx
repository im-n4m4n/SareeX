import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Ornaments, PatternBg } from "@/components/Motifs";
import { getFacets } from "@/lib/queries";
import { MaskLines, SectionTitle } from "@/components/ui";
import { CONTAINER, PAGE_TOP_HERO, SECTION_Y } from "@/lib/layout";
import { countWord, coverImage } from "@/lib/utils";
import CollectionExplorer from "@/components/CollectionExplorer";
import CategoryGallery from "@/components/home/CategoryGallery";
import WeaveRibbon from "@/components/WeaveRibbon";

export const dynamic = "force-dynamic";

/** Collections are admin-creatable, so the description count follows the data. */
export async function generateMetadata(): Promise<Metadata> {
  const { collections } = await getFacets();
  return {
    title: "The Collections",
    description: `${countWord(collections.length)} curated stories from Elite Weavers. Discover Bridal Vows, Temple & Gold, Moonlit Drapes, Garden of Blooms, and more.`,
  };
}

export default async function CollectionsPage() {
  const facets = await getFacets();
  return (
    <>
      <section id="collection-intro" data-chapter="Our Collections" data-surface="light" className={`relative overflow-hidden bg-blush pb-20 text-center ${PAGE_TOP_HERO}`}>
        <PatternBg variant="paisley" strength="strong" fade="edges" />
        <Ornaments tone="maroon" />
        <div className={`relative ${CONTAINER}`}>
          <p className="overline text-maroon">The Elite Weavers Collections</p>
          <h1 className="font-display mt-5 text-6xl leading-[.95] md:text-8xl">
            <MaskLines lines={[`${facets.collections.length} stories.`, <i key="possibilities">Endless possibilities.</i>]} />
          </h1>
          <p data-silk className="mx-auto mt-7 max-w-lg text-sm leading-relaxed text-espresso/65">A loom for every region. A drape for every chapter. Meet the edits that celebrate all the ways you wear heritage.</p>
        </div>
      </section>
      <section id="collection-stories" data-chapter="The Curated Edits" className={`${CONTAINER} ${SECTION_Y}`}>
        <SectionTitle overline="Find your story" title={<>The <i>Curated Edits</i></>} />
        <CollectionExplorer collections={facets.collections} />
      </section>
      <WeaveRibbon />
      <CategoryGallery categories={facets.categories} />
      <section id="regional-weaves" data-chapter="Regional Heritage" className={`relative overflow-hidden bg-sand ${SECTION_Y}`}>
        <PatternBg variant="jaal" fade="edges" />
        <div className={`relative ${CONTAINER}`}>
          <SectionTitle overline="The handloom atlas" title={<>Rooted in <i>region.</i></>} />
          <div className="mt-12 grid gap-x-12 md:grid-cols-2">
            {facets.weaves.map((w) => (
              <Link key={w.slug} href={`/shop?weave=${w.slug}`} data-silk className="group flex items-center gap-5 border-t border-gold/30 py-6 transition hover:pl-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage(w.image)} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-display text-3xl">{w.name}</h3>
                  <p className="overline mt-1 text-[9px] text-maroon">{w.region}</p>
                  <p className="mt-2 text-xs leading-relaxed text-espresso/65">{w.story}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-gold transition group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <WeaveRibbon />
    </>
  );
}
