import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getFacets, listProducts } from "@/lib/queries";
import ProductCard from "@/components/ProductCard";
import { ActiveFilters, Filters, Toolbar } from "@/components/ShopControls";
import { MaskLines, Lotus } from "@/components/ui";
import { CONTAINER } from "@/lib/layout";
import { Mandala, PatternBg, PetalFall } from "@/components/Motifs";
import WeaveRibbon from "@/components/WeaveRibbon";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The Handloom Wardrobe", description: "Shop Elite Weavers sarees, lehengas, dupattas, blouses, kurta sets, and shawls by collection, weave, occasion, colour, and fabric." };

type SP = Record<string, string | string[] | undefined>;
const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || undefined;

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const range = one(sp.price)?.split("-") ?? [];
  const toPrice = (v: string | undefined) => v && Number.isFinite(Number(v)) ? Number(v) : undefined;
  const [products, facets] = await Promise.all([
    listProducts({ q: one(sp.q), weave: one(sp.weave), occasion: one(sp.occasion), category: one(sp.category), collection: one(sp.collection), color: one(sp.color), fabric: one(sp.fabric), min: toPrice(range[0]), max: toPrice(range[1]), sort: one(sp.sort), isNew: one(sp.new) === "1" }),
    getFacets(),
  ]);
  const view = one(sp.view) === "list" ? "list" : "grid";
  const collection = facets.collections.find((c) => c.slug === one(sp.collection));
  const category = facets.categories.find((c) => c.slug === one(sp.category));
  const weave = facets.weaves.find((w) => w.slug === one(sp.weave));
  const title = one(sp.q) ? `Results for “${one(sp.q)}”` : collection?.name ?? (weave ? `${weave.name} ${category?.name ?? "Pieces"}` : category?.name ?? (one(sp.new) ? "New Arrivals" : "All Pieces"));
  const allCount = facets.categories.reduce((n, c) => n + c.pieceCount, 0);

  return (
    <>
      <section id="shop-story" data-chapter="The Wardrobe" data-surface="dark" className="relative min-h-[410px] overflow-hidden bg-espresso pb-14 pt-40 text-ivory md:pb-20 md:pt-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={collection?.image ?? category?.image ?? "/images/m05.jpg"} alt="" className="absolute inset-y-0 right-0 h-full w-full object-cover object-[50%_25%] opacity-65 md:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/75 to-espresso/10" />
        <PatternBg variant="brocade" fade="edges" className="max-w-xl" />
        <Mandala className="absolute -right-32 -top-32 h-[460px] w-[460px] text-gold/25" />
        <div className={"relative " + CONTAINER}>
          <p className="overline text-gold-soft">The Elite Weavers Atelier</p>
          <h1 className="font-display mt-4 text-5xl leading-[1] md:text-7xl"><MaskLines lines={["Timeless weaves,", <i key="occasion" className="text-gold-soft">for every occasion.</i>]} /></h1>
          <p data-silk className="mt-6 max-w-lg text-sm leading-relaxed text-ivory/75">From everyday elegance to wedding heirlooms. Discover pieces that carry the soul of the loom and the signature of the hands that made them.</p>
        </div>
        <PetalFall count={8} />
        <div className="border-temple absolute inset-x-0 bottom-0" />
      </section>
      <section id="shop-pieces" data-chapter="Find Your Piece" data-surface="light" className={"relative pb-16 pt-8 " + CONTAINER}>
        <nav aria-label="Breadcrumb" className="text-[11px] text-espresso/55"><Link href="/">Home</Link><span className="mx-2">/</span><Link href="/shop">Shop</Link><span className="mx-2">/</span><span className="text-espresso">{title}</span></nav>
        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {facets.categories.map((c) => <Link key={c.slug} href={`/shop?category=${c.slug}`} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] transition ${category?.slug === c.slug ? "border-maroon bg-maroon text-ivory" : "border-gold/35 bg-ivory/75 text-espresso/70 hover:border-maroon"}`}>{c.name}<span className="ml-2 opacity-50">{c.pieceCount}</span></Link>)}
        </div>
        <div className="mt-9 grid items-start gap-9 lg:grid-cols-[240px_1fr]">
          <Filters facets={facets} />
          <div>
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
              <div><h2 className="font-display text-4xl leading-tight md:text-5xl">{title}</h2><p className="mt-2 max-w-xl text-[13px] leading-relaxed text-espresso/60">{collection?.description ?? category?.description ?? "A curated collection of timeless weaves, hand-finished with care."}</p></div>
              <Toolbar count={products.length} />
            </div>
            <ActiveFilters facets={facets} />
            {products.length === 0 ? <div className="rounded-3xl border border-gold/25 bg-ivory/70 py-24 text-center mt-10"><Lotus className="mx-auto h-10 w-14 text-gold" /><p className="font-display mt-4 text-3xl">No pieces match those filters.</p><p className="mt-2 text-sm text-espresso/60">Try a different weave or explore the full wardrobe.</p><Link href="/shop" className="btn-maroon mt-6">Clear filters</Link></div> : <div key={JSON.stringify(sp)} className={view === "list" ? "mt-10 grid gap-8" : "mt-10 grid grid-cols-2 gap-x-4 gap-y-10 xl:grid-cols-3 xl:gap-x-6"}>{products.map((p) => <ProductCard key={p.id} product={p} layout={view} />)}</div>}
            <div data-silk className="relative mt-16 overflow-hidden rounded-2xl bg-maroon text-ivory">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/silk-maroon.jpg" alt="" className="absolute inset-y-0 right-0 h-full w-2/3 object-cover opacity-40" />
              <div className="absolute inset-0 bg-gradient-to-r from-maroon via-maroon/90 to-transparent" />
              <div className="relative flex flex-col justify-between gap-6 p-7 md:flex-row md:items-center md:p-9"><div><h3 className="font-display text-3xl leading-tight md:text-4xl">Crafted in tradition.<br /><i className="text-gold-soft">Worn in today.</i></h3><p className="mt-3 text-xs text-ivory/70">{allCount} considered pieces. {facets.weaves.length} weaving traditions. One shared love of craft.</p></div><Link href="/craft" className="btn-ghost w-fit shrink-0 text-gold-soft hover:bg-gold hover:text-espresso">The craft <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
          </div>
        </div>
      </section>
      <WeaveRibbon />
    </>
  );
}
