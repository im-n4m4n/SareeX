import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Feather, Gem, Hand, Sparkles } from "lucide-react";
import { getFacets, getProduct, getProductReviews, listProducts } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { coverImage, discountPercent, formatINR, SITE_URL } from "@/lib/utils";
import { CONTAINER_WIDE, PAGE_TOP } from "@/lib/layout";
import ProductGallery from "@/components/product/ProductGallery";
import ProductBuy from "@/components/product/ProductBuy";
import ProductTabs from "@/components/product/ProductTabs";
import ReviewForm from "@/components/product/ReviewForm";
import ProductCard from "@/components/ProductCard";
import { Lotus, Stars } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return {};
  const images = p.images.length ? p.images : [coverImage(p.images[0])];
  return {
    title: p.name,
    description: p.description.slice(0, 155),
    openGraph: { title: p.name + " · Elite Weavers", description: p.tagline, images },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const [reviews, related, session, facets] = await Promise.all([
    getProductReviews(p.id),
    listProducts({ weave: p.weave, limit: 6 }).then(async (r) => {
      const others = r.filter((x) => x.id !== p.id);
      if (others.length >= 4) return others.slice(0, 4);
      const more = await listProducts({ limit: 8 });
      return [...others, ...more.filter((x) => x.id !== p.id && !others.some((o) => o.id === x.id))].slice(0, 4);
    }),
    getSession(),
    getFacets(),
  ]);
  const off = discountPercent(p.price, p.compareAtPrice);
  // Facet display names, not raw slugs ("Handloom Cotton", not "Cotton").
  const weaveName = facets.weaves.find((w) => w.slug === p.weave)?.name ?? p.weave;
  const occasionName = facets.occasions.find((o) => o.slug === p.occasion)?.name ?? p.occasion;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: p.images.map((i) => (i.startsWith("http") ? i : SITE_URL + i)),
    description: p.description,
    brand: { "@type": "Brand", name: "Elite Weavers" },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: p.price,
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: SITE_URL + "/product/" + p.slug,
    },
  };
  // Only publish an aggregate rating when there is at least one real rating;
  // the previous code floored reviewCount at 1, so brand-new products claimed
  // "4.8 from 1 review".
  if (p.reviewCount > 0 || reviews.length > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: p.rating,
      reviewCount: Math.max(p.reviewCount, reviews.length),
    };
  }

  const chips = [
    { key: "fabric", Icon: Gem, t: p.fabric },
    { key: "handwoven", Icon: Hand, t: "Handwoven" },
    { key: "work", Icon: Sparkles, t: p.work.split(",")[0] },
    { key: "weight", Icon: Feather, t: "Lightweight" },
  ].filter((c) => c.t);

  return (
    <div className={PAGE_TOP}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={CONTAINER_WIDE}>
        <Link href="/shop" className="inline-flex items-center gap-2 text-xs text-espresso/60 hover:text-maroon">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Collection
        </Link>

        <div className="mt-5 grid gap-10 xl:grid-cols-[1.15fr_1fr_0.8fr]">
          <ProductGallery images={p.images} name={p.name} />

          <div>
            <div className="flex flex-wrap gap-2">
              {p.badge && <span className="rounded-full bg-gold/80 px-3 py-1 text-[11px] font-medium">{p.badge}</span>}
              <span className="rounded-full bg-blush px-3 py-1 text-[11px] font-medium">{weaveName} · Handwoven</span>
            </div>
            <h1 className="font-display mt-4 text-5xl leading-[1.02] md:text-6xl">{p.name}</h1>
            <p className="mt-2 text-sm text-espresso/65">{p.tagline}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {p.reviewCount > 0 ? (
                <>
                  <Stars value={p.rating} /> <b>{p.rating.toFixed(1)}</b>
                  <a href="#reviews" className="text-espresso/55 underline-offset-4 hover:underline">
                    ({p.reviewCount} ratings{reviews.length > 0 ? ", " + reviews.length + " written" : ""})
                  </a>
                </>
              ) : (
                <a href="#reviews" className="text-espresso/55 underline-offset-4 hover:underline">Be the first to review this piece</a>
              )}
            </div>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-4xl">{formatINR(p.price)}</span>
              {p.compareAtPrice && off > 0 && (
                <>
                  <span className="text-sm text-espresso/45 line-through">{formatINR(p.compareAtPrice)}</span>
                  <span className="rounded-full bg-maroon/10 px-2.5 py-1 text-[11px] font-medium text-maroon">{off}% OFF</span>
                </>
              )}
            </div>
            <p className="mt-5 text-sm leading-relaxed text-espresso/75">{p.description}</p>
            <div className="mt-6 grid grid-cols-4 gap-2 text-center">
              {chips.map(({ key, Icon, t }) => (
                <div key={key} className="flex flex-col items-center gap-2">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-blush text-maroon"><Icon className="h-5 w-5" strokeWidth={1.3} /></span>
                  <span className="text-[11px] leading-tight text-espresso/70">{t}</span>
                </div>
              ))}
            </div>
            <ProductBuy product={p} />
          </div>

          <div className="relative h-fit overflow-hidden rounded-3xl border border-gold/20 bg-ivory p-7 shadow-[0_30px_60px_-45px_rgba(28,21,18,0.6)]">
            <div className="pattern-paisley pat-soft absolute -bottom-10 -right-10 h-56 w-56" aria-hidden />
            <div className="relative">
              <ProductTabs
                details={[
                  ["Fabric", p.fabric],
                  ["Work", p.work],
                  ["Blouse", p.blouse],
                  ["Length", p.length],
                  ["Occasion", occasionName],
                  ["Care", p.care],
                ]}
              />
              <div className="mt-10">
                <Lotus className="h-6 w-9 text-gold" />
                <h2 className="font-display mt-2 text-3xl">Crafted by Artisans</h2>
                <p className="mt-2 text-sm leading-relaxed text-espresso/70">{p.story}</p>
                <Link href="/craft" className="mt-4 inline-block text-sm text-maroon underline underline-offset-4">Our Craftsmanship →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className={"mt-24 grid gap-12 scroll-mt-28 lg:grid-cols-[1fr_1.3fr] " + CONTAINER_WIDE} id="reviews">
        <div>
          <h2 className="font-display text-4xl">What Our Customers Say</h2>
          <p className="mt-1 text-sm text-espresso/60">Real stories. Real love.</p>
          <div className="mt-6">
            <ReviewForm productId={p.id} signedIn={!!session} />
          </div>
        </div>
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-sm text-espresso/60">Be the first to review this saree.</p>}
          {/* Every review is rendered; the count in the header used to promise
              more than the six that were shown. */}
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-gold/20 bg-ivory p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-display grid h-10 w-10 place-items-center rounded-full bg-maroon text-lg text-ivory">{r.name[0]}</span>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="text-[11px] text-espresso/50">Verified buyer</p>
                  </div>
                </div>
                <Stars value={r.rating} />
              </div>
              {r.title && <p className="font-display mt-4 text-xl">{r.title}</p>}
              <p className="mt-1 text-sm leading-relaxed text-espresso/75">{r.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={"mt-24 " + CONTAINER_WIDE}>
        <h2 className="font-display text-4xl">Styled Looks</h2>
        <p className="mt-1 text-sm text-espresso/60">See how our sarees come to life.</p>
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {related.map((r) => (
            <ProductCard key={r.id} product={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
