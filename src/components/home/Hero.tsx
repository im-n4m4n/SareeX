"use client";
import { Mandala, PatternBg, PetalFall } from "../Motifs";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowRight, Play } from "lucide-react";
import { MaskLines, Lotus } from "../ui";
import { getLenis, prefersReducedMotion } from "@/lib/animations";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // All load and scroll motion is scoped and respects reduced-motion.
    const context = gsap.context(() => {
      if (!prefersReducedMotion()) gsap.fromTo("[data-hero-img]", { scale: 1.12 }, { scale: 1.02, duration: 3.8, ease: "power3.out" });
    }, root);

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=110%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });
      // image scales into a rounded editorial frame
      tl.fromTo(
        "[data-hero-frame]",
        { clipPath: "inset(0% 0% 0% 0% round 0px)" },
        { clipPath: "inset(11% 6% 9% 6% round 48px)", ease: "none" },
        0,
      )
        .to("[data-hero-zoom]", { scale: 0.9, ease: "none" }, 0)
        // headline drifts up at a slower parallax than the page
        .to("[data-hero-copy]", { y: -120, opacity: 0, ease: "none" }, 0.1)
        .to("[data-hero-side]", { opacity: 0, ease: "none" }, 0)
        .to("[data-hero-tag]", { y: -60, ease: "none" }, 0);
    }, root);

    return () => { mm.revert(); context.revert(); };
  }, []);

  return (
    <section ref={root} id="our-story" data-chapter="Draped in Poetry" data-surface="dark" className="relative h-screen min-h-[640px] w-full overflow-hidden bg-ivory">
      <PatternBg variant="paisley" strength="strong" />
      <Mandala className="absolute -left-40 -top-40 h-[480px] w-[480px] text-gold/60" />
      <Mandala reverse className="absolute -bottom-48 -right-40 h-[560px] w-[560px] text-maroon/40" />
      <div data-hero-frame className="absolute inset-0 overflow-hidden bg-espresso will-change-[clip-path]">
        <div data-hero-zoom className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-hero-img
            src="/images/hero.jpg"
            alt="A woman in a flowing maroon Banarasi saree stands beneath a sandstone arch at golden hour"
            className="absolute inset-0 h-full w-full object-cover object-[75%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-espresso/40" />
          <Mandala className="absolute -left-56 top-1/2 h-[760px] w-[760px] -translate-y-1/2 text-gold/25" />
          <PetalFall count={18} />
        </div>
      </div>

      <div data-hero-copy className="relative z-10 mx-auto flex h-full max-w-[1500px] flex-col justify-center px-6 pb-10 pt-24 text-ivory md:px-12">
        <p className="overline flex items-center gap-4 text-gold-soft">
          Spring · Summer &apos;26
          <span className="h-px w-16 bg-gold-soft/60" />
        </p>
        <h1 className="font-display mt-6 text-[clamp(3.6rem,10.5vw,10rem)] font-light leading-[0.9]">
          <MaskLines
            lines={[
              "Draped in",
              <span key="p" className="italic zari-text">
                Poetry.
              </span>,
            ]}
          />
        </h1>
        <p data-silk className="mt-8 max-w-md text-[15px] leading-relaxed text-ivory/80">
          Handwoven Banarasi, Kanjivaram and Chanderi — loomed by master weavers, finished by hand, and made to be remembered. Because every drape has a story.
        </p>
        <div data-silk className="mt-9 flex flex-wrap items-center gap-4">
          <Link href="/shop" className="btn-gold">
            Shop the Collection <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/craft" className="btn-ghost group text-ivory hover:bg-ivory hover:text-espresso">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ivory/15 group-hover:bg-espresso/10">
              <Play className="h-3 w-3 fill-current" />
            </span>
            Watch the Film
          </Link>
        </div>
      </div>

      <div data-hero-side className="absolute bottom-10 left-6 z-10 hidden items-center gap-4 text-ivory/80 md:left-12 md:flex">
        <div className="flex flex-col items-center gap-2 text-[11px] tracking-widest">
          <span className="hero-scroll-line" />
          <span className="mt-1 [writing-mode:vertical-rl] text-[9px] tracking-[.3em]">UNRAVEL THE STORY</span>
        </div>
      </div>
      <div data-hero-tag className="font-display absolute right-8 top-1/3 z-10 hidden -rotate-6 text-3xl italic leading-tight text-gold-soft/90 xl:block">
        <span className="block text-right">Handwoven</span>
        <span className="block text-right">Heritage</span>
        <Lotus className="ml-auto mt-3 h-7 w-11" />
      </div>
      <button data-hero-side type="button" onClick={() => { const el = document.getElementById("heritage"); if (el) { const l = getLenis(); if (l) l.scrollTo(el, { offset: -80, duration: 1.8, immediate: prefersReducedMotion() }); else el.scrollIntoView({ behavior: prefersReducedMotion() ? "instant" : "smooth" }); } }} aria-label="Scroll to discover our heritage" className="absolute bottom-10 right-6 z-10 flex items-center gap-4 text-xs text-ivory/80 md:right-12">
        Scroll to discover
        <span className="grid h-11 w-11 place-items-center rounded-full border border-gold-soft/60"><ArrowDown className="h-4 w-4" /></span>
      </button>
    </section>
  );
}
