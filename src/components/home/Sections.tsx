import { Mandala, Ornaments, PatternBg } from "../Motifs";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, Gem, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "@/db/schema";
import type { Facet } from "@/lib/types";
import { coverImage } from "@/lib/utils";
import { CONTAINER } from "@/lib/layout";
import ProductCard from "../ProductCard";
import { SectionTitle, Stars } from "../ui";

const features = [
  { Icon: Gem, title: "Premium Fabrics", text: "Pure silks, cottons & more" },
  { Icon: Leaf, title: "Authentic Handcraft", text: "Tradition in every thread" },
  { Icon: ShieldCheck, title: "Trusted Quality", text: "Every saree, carefully checked" },
  { Icon: Truck, title: "Fast & Safe Delivery", text: "Across India & beyond" },
  { Icon: Heart, title: "Personalised Experience", text: "Style advice & custom options" },
];

export function WhyStrip({ weaves }: { weaves: Facet[] }) {
  return (
    <section id="heritage" data-chapter="Our Heritage" data-surface="light" className="relative overflow-hidden bg-ivory py-24 md:py-28">
      <PatternBg variant="jaal" fade="radial" />
      <Ornaments />
      <div className={CONTAINER + " relative"}>
        <SectionTitle center overline="Why choose Elite Weavers" title="Timeless Elegance, Crafted for You" />
        <div className="mt-14 grid grid-cols-2 gap-y-10 md:grid-cols-5">
          {features.map(({ Icon, title, text }, i) => (
            <div key={title} data-silk data-tilt className={"flex flex-col items-center px-4 text-center " + (i > 0 ? "md:border-l md:border-gold/25" : "")}>
              <span className="relative grid h-16 w-16 place-items-center rounded-full bg-blush text-maroon">
                <span className="ring-spin absolute -inset-1.5 rounded-full border border-dashed border-gold/70" />
                <Icon className="h-6 w-6" strokeWidth={1.3} />
              </span>
              <h3 className="font-display mt-4 text-xl">{title}</h3>
              <p className="mt-1 text-xs text-espresso/60">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 grid grid-cols-2 gap-4 md:grid-cols-5">
          {weaves.map((w) => (
            <Link
              key={w.slug}
              href={"/shop?weave=" + w.slug}
              data-silk
              data-tilt
              className="sheen group relative aspect-[4/5] overflow-hidden rounded-2xl bg-espresso"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage(w.image)} alt={w.name + " weave"} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-[1400ms] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-espresso/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-ivory">
                <p className="font-display text-2xl">{w.name}</p>
                <p className="text-xs text-ivory/75">{w.tagline}</p>
                <span className="mt-3 grid h-8 w-8 place-items-center rounded-full border border-ivory/60 transition group-hover:bg-gold group-hover:text-espresso">
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewArrivals({ products }: { products: Product[] }) {
  return (
    <section id="new-arrivals" data-chapter="New Arrivals" data-surface="light" className="relative overflow-hidden bg-blush py-24 md:py-28">
      <PatternBg variant="brocade" fade="top" />
      <Ornaments tone="maroon" />
      <div className={CONTAINER + " relative"}>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionTitle overline="Just In" title={<>New <i>Arrivals</i></>} />
          <Link data-silk href="/shop?new=1" className="btn-ghost w-fit text-maroon hover:bg-maroon hover:text-ivory">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="gold-rule mt-8" />
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function OccasionCard({ o, className, big }: { o: Facet; className: string; big?: boolean }) {
  return (
    <Link
      href={"/shop?occasion=" + o.slug}
      data-silk
      className={"sheen group relative overflow-hidden rounded-3xl bg-espresso " + className}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-kenburns src={coverImage(o.image, "/images/m05.jpg")} alt={o.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/15 to-transparent" />
      <span className="pointer-events-none absolute inset-4 z-10 rounded-2xl border border-gold-soft/0 transition-[inset,border-color] duration-700 group-hover:inset-3 group-hover:border-gold-soft/70" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6 text-ivory md:p-8">
        <div>
          <p className="overline text-gold-soft">{o.tagline}</p>
          <h3 className={"font-display mt-2 leading-none " + (big ? "text-5xl md:text-6xl" : "text-3xl md:text-4xl")}>{o.name}</h3>
        </div>
        <span className="btn-gold translate-x-6 px-5 py-2.5 text-xs opacity-0 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:opacity-100 max-md:translate-x-0 max-md:opacity-100">
          Explore
        </span>
      </div>
    </Link>
  );
}

/**
 * The four cards below used to reference an undefined <Card> component, which
 * is what broke the production build. They now use the OccasionCard that was
 * already defined in this file, and the fifth seeded occasion ("Everyday") is
 * finally surfaced — the 12-column grid previously left five columns empty on
 * the second row.
 */
export function Occasions({ occasions }: { occasions: Facet[] }) {
  const by = Object.fromEntries(occasions.map((o) => [o.slug, o])) as Record<string, Facet | undefined>;
  const card = (slug: string, className: string, big?: boolean) => {
    const o = by[slug];
    return o ? <OccasionCard key={slug} o={o} big={big} className={className} /> : null;
  };
  return (
    <section id="occasions" data-chapter="For Every Occasion" data-surface="light" className="relative overflow-hidden bg-ivory py-24 md:py-28">
      <PatternBg variant="check" fade="edges" />
      <Ornaments />
      <div className={CONTAINER + " relative"}>
        <SectionTitle center overline="Dressed for the moment" title={<>Shop by <i>Occasion</i></>} />
        <div className="mt-14 grid gap-4 md:min-h-[820px] md:grid-cols-12 md:grid-rows-2">
          {card("wedding", "min-h-[520px] md:col-span-5 md:row-span-2", true)}
          {card("evening", "min-h-[300px] md:col-span-7")}
          {card("day", "min-h-[300px] md:col-span-4")}
          {card("festive", "min-h-[300px] md:col-span-4")}
          {card("casual", "min-h-[300px] md:col-span-4")}
        </div>
      </div>
    </section>
  );
}

const reviews = [
  { name: "Priya S.", city: "Mumbai", img: "/images/m02.jpg", text: "The saree looks even more beautiful in person. The zari work is rich, the pallu pleats beautifully, and it arrived wrapped like a gift." },
  { name: "Ananya R.", city: "Houston, USA", img: "/images/m06.jpg", text: "Absolutely in love with my Kanjivaram. It drapes so well and everyone at the wedding asked where it was from. Worth every penny." },
  { name: "Meera K.", city: "Chennai", img: "/images/m04.jpg", text: "My first purchase, and I'm already planning the next. Beautiful collection and the WhatsApp stylist truly understood my taste." },
];

/** One rating value for the whole block. Previously the stars said five, the text said 4.9 and the product default said 4.8. */
const KIND_WORDS_RATING = 4.9;
const KIND_WORDS_REVIEWS = 500;

export function Testimonials() {
  return (
    <section id="kind-words" data-chapter="Kind Words" data-surface="light" className="relative overflow-hidden bg-ivory py-24 md:py-28">
      <PatternBg variant="lotus" fade="top" />
      <div data-rotate="90" className="absolute -left-48 top-20"><Mandala className="h-[520px] w-[520px] text-gold/40" /></div>
      <div data-rotate="-90" className="absolute -right-48 bottom-0"><Mandala reverse className="h-[520px] w-[520px] text-maroon/25" /></div>
      <div className={CONTAINER + " relative"}>
        <SectionTitle center overline="Kind words" title={<>Loved by Every <i>Silhouette</i></>} />
        <div data-silk className="mt-8 flex flex-col items-center gap-3">
          <div className="flex -space-x-3">
            {["m03", "m06", "m07", "m08", "m12"].map((m) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={m} src={"/images/" + m + ".jpg"} alt="" className="h-11 w-11 rounded-full border-2 border-ivory object-cover" />
            ))}
          </div>
          <p className="flex items-center gap-2 text-sm">
            <Stars value={KIND_WORDS_RATING} /> <b>{KIND_WORDS_RATING}/5</b> — {KIND_WORDS_REVIEWS}+ Happy Customers
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <figure
              key={r.name}
              data-silk data-tilt
              className={"glass relative rounded-3xl p-8 shadow-[0_30px_60px_-40px_rgba(107,30,42,0.5)] " + (i === 1 ? "md:translate-y-12" : "")}
            >
              <span className="font-display absolute right-6 top-0 text-[9rem] leading-none text-gold/30" aria-hidden>
                &ldquo;
              </span>
              <Stars value={5} />
              <blockquote className="font-display relative mt-5 text-[1.6rem] leading-snug">{r.text}</blockquote>
              <figcaption className="mt-8 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium">{r.name}</p>
                  <p className="text-xs text-espresso/55">Verified buyer · {r.city}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
