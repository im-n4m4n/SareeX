"use client";
import { PatternBg } from "../Motifs";

import { useEffect, useRef } from "react";
import { SECTION_Y_TIGHT } from "@/lib/layout";
import gsap from "gsap";
import { Camera } from "lucide-react";
import { getLenis, prefersReducedMotion } from "@/lib/animations";

const feed = ["m01", "m05", "m10", "silk-green", "m06", "m14", "m03", "silk-maroon", "m08", "m16", "m12", "m04"];

export default function InstaMarquee() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current!;
    if (prefersReducedMotion()) return;
    let visible = false;
    const base = 0.7;
    let x = 0;
    let speed = base;
    const tick = () => {
      // marquee speed eases with Lenis scroll velocity
      const v = Math.abs(getLenis()?.velocity ?? 0);
      speed += (base + v * 0.45 - speed) * 0.08;
      x -= speed;
      // Two copies of the feed with gap-4 (16px) between all 24 tiles and no
      // trailing gap, so one full copy is (scrollWidth + 16) / 2.
      const half = (el.scrollWidth + 16) / 2;
      if (-x >= half) x += half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: "200px" });
    io.observe(el);
    const gated = () => { if (visible) tick(); };
    gsap.ticker.add(gated);
    return () => { io.disconnect(); gsap.ticker.remove(gated); };
  }, []);

  return (
    <section id="weavers-social" data-chapter="The Weavers Community" data-surface="light" className={SECTION_Y_TIGHT + " relative overflow-hidden bg-ivory"} aria-label="Instagram feed">
      <PatternBg variant="lotus" fade="edges" />
      <div className="border-temple absolute inset-x-0 top-6 opacity-70" />
      <div className="border-temple absolute inset-x-0 bottom-6 opacity-70" />
      <div className="relative">
        <div ref={track} className="flex w-max gap-4 will-change-transform">
          {[...feed, ...feed].map((f, i) => (
            <a key={i} href="https://instagram.com/eliteweavers.official" aria-hidden tabIndex={-1} className="group relative h-64 w-64 shrink-0 overflow-hidden rounded-2xl md:h-72 md:w-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/images/${f}.jpg`} alt="" loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-110" />
              <div className="absolute inset-0 bg-espresso/0 transition group-hover:bg-espresso/25" />
            </a>
          ))}
        </div>
        <a
          href="https://instagram.com/eliteweavers.official"
          className="glass absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 whitespace-nowrap rounded-full px-7 py-4 text-sm shadow-2xl transition hover:scale-105"
        >
          <Camera className="h-4 w-4 text-maroon" />
          <span className="font-display text-lg">@eliteweavers.official</span>
          <span className="h-4 w-px bg-gold" />
          <span className="overline text-maroon">Follow Us</span>
        </a>
      </div>
    </section>
  );
}
