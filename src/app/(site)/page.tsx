import { ArchDivider, Mandala, PatternBg } from "@/components/Motifs";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import Hero from "@/components/home/Hero";
import { WhyStrip, NewArrivals, Occasions, Testimonials } from "@/components/home/Sections";
import CraftSplit from "@/components/home/CraftSplit";
import DrapeScene from "@/components/home/DrapeScene";
import Lookbook from "@/components/home/Lookbook";
import InstaMarquee from "@/components/home/InstaMarquee";
import CategoryGallery from "@/components/home/CategoryGallery";
import CollectionShowcase from "@/components/home/CollectionShowcase";
import WeaveStory from "@/components/home/WeaveStory";
import WeaveRibbon from "@/components/WeaveRibbon";
import { getFacets, listProducts } from "@/lib/queries";
import { CONTAINER } from "@/lib/layout";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [arrivals, festive, facets] = await Promise.all([
    listProducts({ isNew: true, category: "sarees", limit: 4, sort: "newest" }),
    listProducts({ occasion: "festive", limit: 4, sort: "newest" }),
    getFacets(),
  ]);
  const heroWeaves = ["banarasi", "kanjivaram", "chanderi", "bandhani", "patola"]
    .map((slug) => facets.weaves.find((w) => w.slug === slug))
    .filter((w): w is NonNullable<typeof w> => !!w);

  return (
    <>
      <Hero />
      <WhyStrip weaves={heroWeaves} />
      <ArchDivider from="ivory" to="blush" />
      <NewArrivals products={arrivals} />
      <ArchDivider from="blush" to="plum-deep" />
      {/* Festival Season entry — additive banner, links to the Diwali Special page. */}
      <section className="relative overflow-hidden bg-plum-deep">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/m29-w.jpg" alt="" aria-hidden className="h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-plum-deep via-plum-deep/80 to-plum-deep/30" />
        </div>
        <Mandala className="absolute -right-36 -top-24 h-[420px] w-[420px] text-marigold/20" />
        <Mandala reverse className="absolute -bottom-40 -left-32 h-[380px] w-[380px] text-saffron/15" />
        <div className={CONTAINER + " relative flex flex-col items-start gap-8 py-20 text-ivory md:flex-row md:items-center md:justify-between md:py-28"}>
          <div>
            <p className="overline flex items-center gap-2 text-marigold">
              <Sparkles className="h-3.5 w-3.5" /> Festival Season is here
            </p>
            <h2 className="font-display mt-4 text-4xl leading-tight md:text-6xl">
              Diwali &amp; Dussehra <span className="text-festive-gradient italic">Special</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm text-ivory/80">
              Diya-glow silks, marigold Kanjivarams and festive heirlooms — with 15% off
              using code DIWALI15 through the festival season.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <Link href="/diwali" className="btn-gold">
              Let&apos;s have a look <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
      <ArchDivider from="plum-deep" to="ivory" />
      <CategoryGallery categories={facets.categories} />
      <WeaveRibbon />
      <CollectionShowcase collections={facets.collections} />
      <WeaveRibbon />
      <Occasions occasions={facets.occasions} />
      <WeaveStory />
      <CraftSplit />
      <DrapeScene />
      <ArchDivider from="espresso" to="ivory" />
      <Lookbook />
      <WeaveRibbon />
      <Testimonials />
      <WeaveRibbon />
      <InstaMarquee />
    </>
  );
}
