"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { Mandala, PatternBg } from "../Motifs";
import { Lotus } from "../ui";

const statement = "Before it becomes your heirloom, it is a thousand quiet gestures. A thread dyed. A shuttle passed. A motif remembered. This is the beauty of a thing made slowly.".split(" ");

export default function WeaveStory() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
      const paths = Array.from(root.current!.querySelectorAll<SVGPathElement>("[data-thread-path]"));
      paths.forEach((path) => {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "+=160%", pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to(paths, { strokeDashoffset: 0, duration: 3.5, stagger: 0.07, ease: "none" }, 0)
        .fromTo("[data-story-panel='1']", { y: 100, rotation: -12, scale: 0.78 }, { y: -25, rotation: -4, scale: 1, duration: 2.6, ease: "power2.out" }, 0)
        .fromTo("[data-story-panel='2']", { y: 150, rotation: 16, scale: 0.75 }, { y: 20, rotation: 6, scale: 1, duration: 2.6, ease: "power2.out" }, 0.5)
        .fromTo("[data-story-word]", { opacity: 0.18 }, { opacity: 1, stagger: 0.075, duration: 0.3, ease: "none" }, 0.3)
        .fromTo("[data-story-seal]", { rotation: -45, scale: 0.65, opacity: 0 }, { rotation: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" }, 1.5)
        .fromTo("[data-story-progress]", { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 3.7, ease: "none" }, 0);
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="thread-story" data-chapter="Thread to Heirloom" data-surface="dark" className="weave-story relative overflow-hidden bg-[#3d1521] px-6 py-20 text-ivory lg:flex lg:min-h-[730px] lg:h-screen lg:items-center lg:px-12 lg:py-24">
      <PatternBg variant="brocade" fade="edges" />
      <Mandala reverse className="absolute -right-44 -top-36 h-[540px] w-[540px] text-gold/20" />
      <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        {Array.from({ length: 7 }, (_, i) => (
          <path key={i} data-thread-path d={`M -100 ${690 + i * 16} C 230 ${340 + i * 24}, 415 ${915 - i * 21}, 700 ${460 + i * 17} S 1050 ${160 + i * 21}, 1540 ${360 + i * 18}`} stroke="#C9A24B" strokeWidth={i === 3 ? "1.7" : "0.8"} strokeOpacity={i === 3 ? "0.6" : "0.25"} fill="none" />
        ))}
      </svg>
      <div className="relative mx-auto grid w-full max-w-[1340px] gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
        <div className="relative mx-auto h-[450px] w-full max-w-[520px] sm:h-[540px]">
          <div data-story-panel="1" className="absolute left-[2%] top-0 h-[88%] w-[60%] -rotate-6 overflow-hidden rounded-t-[140px] rounded-b-xl border border-gold/35 bg-espresso shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/m02.jpg" alt="A traditional red and gold saree, woven for celebrations" loading="lazy" className="h-full w-full object-cover" />
            <span className="pointer-events-none absolute inset-3 rounded-t-[130px] rounded-b-lg border border-gold-soft/40" />
          </div>
          <div data-story-panel="2" className="absolute bottom-0 right-0 h-[70%] w-[54%] rotate-6 overflow-hidden rounded-t-[120px] rounded-b-xl border border-gold/45 bg-maroon shadow-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/silk-maroon.jpg" alt="Close-up of the intricate gold zari in a Banarasi silk weave" loading="lazy" className="h-full w-full object-cover" />
            <span className="pointer-events-none absolute inset-3 rounded-t-[110px] rounded-b-lg border border-gold-soft/40" />
          </div>
          <div data-story-seal className="weaver-seal absolute -left-2 bottom-6 z-10 flex h-28 w-28 flex-col items-center justify-center rounded-full border border-gold bg-[#3d1521] shadow-xl sm:h-32 sm:w-32">
            <Lotus className="h-7 w-10 text-gold" />
            <span className="mt-1 text-[9px] uppercase tracking-[0.22em] text-gold-soft">Made by hand</span>
            <span className="font-display text-2xl italic">Loved for life</span>
          </div>
        </div>
        <div>
          <p className="overline text-gold-soft">The art of becoming</p>
          <h2 data-silk className="font-display mt-4 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">From thread<br />to <i className="zari-text">heirloom.</i></h2>
          <p className="font-display mt-8 text-[25px] leading-[1.4] lg:text-[29px]">
            {statement.map((word, i) => <span key={i} data-story-word className="inline-block mr-[0.26em]">{word}</span>)}
          </p>
          <div className="mt-8 flex justify-between border-t border-gold/30 pt-5 text-[10px] uppercase tracking-[0.19em] text-gold-soft/75">
            <span>Woven with intention</span><span>Worn with feeling</span>
          </div>
          <Link href="/craft" className="btn-ghost mt-8 text-gold-soft hover:bg-gold hover:text-espresso">Meet the craft <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
      <div className="absolute inset-x-6 bottom-6 h-px bg-gold/20 lg:inset-x-12"><div data-story-progress className="h-full bg-gold" /></div>
    </section>
  );
}
