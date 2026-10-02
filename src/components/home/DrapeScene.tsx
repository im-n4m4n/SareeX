"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mandala, PatternBg } from "../Motifs";

const SilkCanvas = dynamic(() => import("../SilkCanvas"), { ssr: false, loading: () => null });
const captions = [
  { o: "Chapter I", t: "Feel the fall", d: "Pure katan silk moves like water — heavy, liquid, alive." },
  { o: "Chapter II", t: "Catch the light", d: "A woven zari border catches the light with a warm, quiet glow." },
  { o: "Chapter III", t: "Wear the weave", d: "Six yards. Generations of Indian loom memory." },
];

export default function DrapeScene() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0.35);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)").matches) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setReady(true); io.disconnect(); }
    }, { rootMargin: "600px" });
    if (root.current) io.observe(root.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      progress.current = 0;
      const tl = gsap.timeline();
      captions.forEach((_, i) => {
        const target = `[data-cap='${i}']`;
        tl.fromTo(target, { opacity: 0, y: 45 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, i * 1.4)
          .to(target, { opacity: i === captions.length - 1 ? 1 : 0, y: i === captions.length - 1 ? 0 : -45, duration: 0.6, ease: "power3.in" }, i * 1.4 + 1);
      });
      ScrollTrigger.create({ trigger: root.current, start: "top top", end: "+=200%", pin: true, scrub: 1, animation: tl, anticipatePin: 1, onUpdate: (self) => { progress.current = self.progress; } });
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="silk-in-motion" data-chapter="Silk in Motion" data-surface="dark" className="relative h-[90svh] min-h-[620px] overflow-hidden bg-gradient-to-b from-navy via-[#161d33] to-espresso text-ivory md:h-screen" aria-label="Scroll-driven silk drape">
      {/* The poster is immediate; a heavy Canvas is never loaded on mobile or reduced-motion. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/silk-maroon.jpg" alt="Gold zari woven into richly textured maroon Banarasi silk" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-t from-espresso via-navy/45 to-navy/70" />
      <PatternBg variant="jaal" fade="radial" />
      <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center"><Mandala className="h-[110vmin] w-[110vmin] text-gold/25" /></div>
      {ready && <SilkCanvas image="/images/silk-maroon.jpg" progress={progress} ratio={1.45} />}
      <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between px-6 py-24 md:px-14">
        <p className="overline text-gold">The Drape <span className="hidden md:inline">· Scroll to move the silk</span></p>
        <div className="relative h-56 max-w-xl md:h-64">{captions.map((c, i) => <div key={c.t} data-cap={i} className="absolute inset-0 flex flex-col justify-end" style={{ opacity: i === 0 ? 1 : 0 }}><p className="overline text-gold-soft">{c.o}</p><h2 className="font-display mt-2 text-6xl leading-none md:text-8xl">{c.t}</h2><p className="mt-4 max-w-sm text-sm text-ivory/75">{c.d}</p></div>)}</div>
      </div>
    </section>
  );
}
