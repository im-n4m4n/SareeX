import { ArchDivider } from "@/components/Motifs";
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

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [arrivals, facets] = await Promise.all([
    listProducts({ isNew: true, category: "sarees", limit: 4, sort: "newest" }),
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
      <ArchDivider from="blush" to="ivory" />
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
