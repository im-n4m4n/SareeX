"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Flame, Gift } from "lucide-react";
import { Mandala, PatternBg, PetalFall } from "@/components/Motifs";
import { SectionTitle } from "@/components/ui";
import ProductCard from "@/components/ProductCard";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DESKTOP_MQ, DESKTOP_WIDE_MQ } from "@/lib/animations";
import { CONTAINER } from "@/lib/layout";
import { formatINR } from "@/lib/utils";
import type { Product } from "@/db/schema";
import { useRef } from "react";

/**
 * Diwali Festival Special — client component so the hero can carry the same
 * silk-smooth pinned scroll language as the homepage hero. All motion is
 * gated by DESKTOP_MQ / DESKTOP_WIDE_MQ and reduced-motion, matching the
 * site convention (mobile/reduced-motion gets the static layout, which keeps
 * the Playwright pin-spacer invariant green).
 */
export default function DiwaliClient({ festive }: { festive: Product[] }) {
  const root = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // Full cinematic pinned scene on wide screens.
    mm.add(DESKTOP_WIDE_MQ, () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "[data-diwali-hero]",
          start: "top top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });
      // image slowly blooms into a rounded editorial frame
      tl.fromTo(
        "[data-diwali-frame]",
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(8% 5% 7% 5% round 48px)", ease: "none" },
        0,
      )
        .fromTo("[data-diwali-zoom]", { scale: 1.12 }, { scale: 1, ease: "none" }, 0)
        .to("[data-diwali-copy]", { y: -110, opacity: 0, ease: "none" }, 0.1)
        .to("[data-diwali-offer]", { autoAlpha: 0, ease: "none" }, 0);
    }, root);

    // Lighter smoothing on tablets: scale + fade only, no pin.
    mm.add(DESKTOP_MQ, () => {
      gsap.fromTo(
        "[data-diwali-zoom]",
        { scale: 1.08 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: "[data-diwali-hero]", start: "top top", end: "60%", scrub: 0.6 },
        },
      );
    }, root);

    // Glow entrance for the offer card on any non-reduced viewport.
    gsap.context(() => {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          "[data-diwali-offer]",
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power4.out",
            scrollTrigger: { trigger: "[data-diwali-offer]", start: "top 85%", once: true },
          },
        );
      }
    }, root);

    return () => { mm.revert(); };
  }, []);

  return (
    <div ref={root} className="theme-diwali -mt-[76px]">
      {/* ---- Festival hero banner ---- */}
      <section data-diwali-hero className="relative flex min-h-screen items-end overflow-hidden pb-16 pt-40">
        <div data-diwali-frame className="absolute inset-0 overflow-hidden bg-deep-plum will-change-[clip-path]">
          <div data-diwali-zoom className="absolute inset-0 will-change-transform">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/m29-w.jpg"
              alt="A glamorous model in a plum and gold silk saree holding a glowing diya among marigolds and fairy lights"
              className="absolute inset-0 h-full w-full object-cover object-center"
              fetchPriority="high"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-plum-deep via-deep-plum/55 to-deep-plum/25" />
          <Mandala className="absolute -right-40 top-10 h-[560px] w-[560px] text-marigold/25 mandala-spin" />
          <PetalFall count={14} />
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
        <div data-diwali-offer className="festival-card diya-glow relative overflow-hidden p-8 md:p-12">
          <PatternBg variant="paisley" strength="soft" fade="edges" />
          <Mandala reverse className="absolute -bottom-32 -left-32 h-[380px] w-[380px] text-saffron/20 mandala-spin-rev" />
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
