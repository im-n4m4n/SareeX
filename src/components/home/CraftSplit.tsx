"use client";
import { Mandala, PatternBg } from "../Motifs";

import Link from "next/link";
import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight } from "lucide-react";
import { DESKTOP_MQ } from "@/lib/animations";

const copy =
  "Every Elite Weavers saree begins at a wooden handloom, where gold zari is woven thread by thread. Dyed in small batches, finished by hand, and blessed by the weavers who made it.".split(" ");

const stats = [
  { value: 120, suffix: "+", label: "hours of handwork" },
  { value: 100, suffix: "%", label: "pure fabrics" },
  { value: 6, suffix: " wks", label: "made to measure" },
];

export default function CraftSplit() {
  const root = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_MQ, () => {
      // Scoped to this section: gsap.utils.toArray is document-wide and would
      // silently absorb any future [data-count] element elsewhere.
      const nums = Array.from(root.current?.querySelectorAll<HTMLElement>("[data-count]") ?? []);
      const state = nums.map(() => ({ v: 0 }));
      nums.forEach((n) => (n.textContent = "0"));
      gsap.set("[data-word]", { opacity: 0.14 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: "top top", end: "+=160%", pin: true, scrub: 1 },
      });
      tl.fromTo("[data-craft-img]", { scale: 1.3, yPercent: 4 }, { scale: 1.02, yPercent: -4, ease: "none", duration: 3 }, 0)
        .to("[data-word]", { opacity: 1, stagger: 0.08, ease: "none", duration: 1.6 }, 0)
        .fromTo("[data-stat]", { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.3, ease: "power2.out", duration: 0.6 }, 1.2);
      nums.forEach((n, i) => {
        tl.to(
          state[i],
          {
            v: Number(n.dataset.count),
            duration: 1,
            ease: "none",
            onUpdate: () => {
              n.textContent = String(Math.round(state[i].v));
            },
          },
          1.4 + i * 0.3,
        );
      });
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="craft" data-chapter="The Art of the Loom" data-surface="dark" className="relative overflow-hidden bg-espresso text-ivory md:h-screen">
      <div className="grid h-full md:grid-cols-2">
        <div className="relative h-[60vh] overflow-hidden md:h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-craft-img src="/images/craft-loom.jpg" alt="Gold zari threads on a wooden handloom" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-espresso/60 max-md:bg-gradient-to-b" />
          <div className="glass-dark absolute bottom-8 left-8 rounded-2xl px-5 py-3 text-xs tracking-wide">
            Madanpura, Varanasi · Loom No. 14
          </div>
        </div>
        <div className="pattern-brocade relative flex flex-col justify-center px-8 py-20 md:px-16">
          <div className="absolute inset-0 bg-espresso/90" />
          <PatternBg variant="jaal" fade="radial" />
          <Mandala className="absolute -right-44 -top-44 h-[560px] w-[560px] text-gold/25" />
          <Mandala reverse className="absolute -bottom-52 -left-40 h-[460px] w-[460px] text-gold/15" />
          <div className="relative">
            <p className="overline text-gold">Fabric &amp; Craft</p>
            <h2 className="font-display mt-4 text-5xl leading-[1.02] md:text-7xl">
              Hand-finished, <i className="text-gold-soft">thread by thread.</i>
            </h2>
            <p className="font-display mt-8 max-w-xl text-2xl leading-snug md:text-[1.7rem]">
              {copy.map((w, i) => (
                <span key={i} data-word className="inline-block pr-[0.28em]">
                  {w}
                </span>
              ))}
            </p>
            <div className="mt-12 grid grid-cols-1 gap-6 border-t border-gold/30 pt-8 sm:grid-cols-3 sm:gap-4">
              {stats.map((s) => (
                <div key={s.label} data-stat>
                  <p className="font-display text-4xl text-gold sm:text-5xl md:text-6xl">
                    <span data-count={s.value}>{s.value}</span>
                    {s.suffix}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-ivory/65">{s.label}</p>
                </div>
              ))}
            </div>
            <Link href="/craft" className="btn-ghost mt-10 w-fit text-gold-soft hover:bg-gold hover:text-espresso">
              Discover the craft <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
