import Link from "next/link";
import { ArrowRight, Sparkles, Flame, Gift } from "lucide-react";
import { listProducts } from "@/lib/queries";
import { coverImage, formatINR } from "@/lib/utils";
import { CONTAINER } from "@/lib/layout";
import { Mandala, PatternBg, PetalFall } from "@/components/Motifs";
import { SectionTitle } from "@/components/ui";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diwali & Dussehra Special — Elite Weavers",
  description:
    "A festival edit of Diwali and Dussehra sarees: diya-glow Banarasi silks, marigold Kanjivarams and festive Bandhani, with a special season offer.",
};

export default async function DiwaliPage() {
  const festive = await listProducts({ occasion: "festive", limit: 8, sort: "newest" });

  return (
    <div className="theme-diwali -mt-[76px]">
      {/* ---- Festival hero banner ---- */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden pb-16 pt-40">
        <div data-hero-frame className="absolute inset-0 overflow-hidden bg-deep-plum">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/m24.jpg"
            alt="A model in a deep plum Banarasi silk saree surrounded by glowing diyas"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-plum-deep via-deep-plum/55 to-deep-plum/30" />
          <Mandala className="absolute -right-40 top-10 h-[560px] w-[560px] text-marigold/25" />
          <PetalFall count={12} />
        </div>

        <div className={CONTAINER + " relative"}>
          <p className="overline flex items-center gap-3 text-marigold">
            <Flame className="h-4 w-4" />
            Festival Season · Diwali &amp; Dussehra 2026
          </p>
          <h1 className="font-display mt-5 max-w-3xl text-[clamp(3rem,9vw,7.5rem)] font-light leading-[0.92] text-ivory">
            Shubh <span className="text-festive-gradient italic">Deepavali.</span>
          </h1>
          <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ivory/80">
            Drapes that carry the light of the season — diya-glow Banarasi silks, marigold
            Kanjivarams, festive Bandhani and Patola heirlooms, handwoven for the nights
            that shine the brightest.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="#festival-edit" className="btn-gold">
              Shop the Festival Edit <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#festival-offer" className="btn-ghost text-ivory hover:bg-ivory hover:text-deep-plum">
              <Gift className="h-4 w-4" /> Season Offer
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Special offer banner card ---- */}
      <section id="festival-offer" className={CONTAINER + " relative pb-4 pt-14"}>
        <div className="festival-card diya-glow relative overflow-hidden p-8 md:p-12">
          <PatternBg variant="paisley" strength="soft" fade="edges" />
          <Mandala reverse className="absolute -bottom-32 -left-32 h-[380px] w-[380px] text-saffron/20" />
          <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="overline flex items-center gap-2 text-marigold">
                <Sparkles className="h-3.5 w-3.5" /> Special Festival Offer
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight text-ivory md:text-5xl">
                15% off this <span className="text-festive-gradient italic">festival season</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm text-ivory/70">
                Use code <span className="offer-ring bg-saffron/20 px-3 py-1 font-semibold tracking-[0.2em] text-marigold">DIWALI15</span> at
                checkout on orders above {formatINR(5000)}. Valid through the Diwali season.
              </p>
            </div>
            <Link href="/shop?occasion=festive" className="btn-gold shrink-0">
              Explore Festive Sarees <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---- Festive saree grid ---- */}
      <section id="festival-edit" className={CONTAINER + " relative py-20"}>
        <SectionTitle
          center
          overline="The Festival Edit"
          title={
            <>
              Diwali &amp; <i>Dussehra</i> Drapes
            </>
          }
        />
        <p className="mx-auto mt-4 max-w-xl text-center text-sm text-ivory/65">
          Handwoven silks in the colours of the season — saffron, marigold, deep plum and
          ruby — picked for puja evenings, family gatherings and card-game nights.
        </p>
        <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {festive.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link href="/shop?occasion=festive" className="btn-ghost inline-flex text-ivory hover:bg-ivory hover:text-deep-plum">
            View all festive sarees <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
