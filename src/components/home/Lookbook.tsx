"use client";
import { Mandala, PatternBg } from "../Motifs";

import Link from "next/link";
import { useRef } from "react";
import { useIsomorphicLayoutEffect } from "@/lib/useIsomorphicLayoutEffect";
import { DESKTOP_MQ } from "@/lib/animations";
import { countWord } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const looks = [
  { img: "/images/bridal.jpg", t: "The Bride", s: "Banarasi, window light", href: "/shop?occasion=wedding" },
  { img: "/images/m02.jpg", t: "Heirloom Red", s: "Katan silk, kadhua zari", href: "/shop?weave=banarasi" },
  { img: "/images/m09.jpg", t: "Golden Hour", s: "Wine crepe, liquid drape", href: "/shop?weave=mysore" },
  { img: "/images/m04.jpg", t: "Peacock Blue", s: "Mayura temple border", href: "/shop?weave=kanjivaram" },
  { img: "/images/m06.jpg", t: "Gulabi Morning", s: "Chanderi silk-cotton", href: "/shop?weave=chanderi" },
  { img: "/images/m16.jpg", t: "Dusk Ikat", s: "Patola from Patan", href: "/shop?weave=patola" },
  { img: "/images/m12.jpg", t: "Vermilion Veil", s: "Zari dupatta, temple gold", href: "/shop?category=dupattas" },
  { img: "/images/m07.jpg", t: "Festival of Colour", s: "Bandhani & marigold", href: "/shop?occasion=festive" },
  { img: "/images/saree-editorial.jpg", t: "Studio Silk", s: "Full-length editorial drape", href: "/shop?weave=mysore" },
  { img: "/images/m05.jpg", t: "The Atelier", s: "Brocade, hand-finished", href: "/craft" },
  { img: "/images/festive-diya.jpg", t: "Festival Light", s: "Lamps, gold and ritual", href: "/shop?occasion=festive" },
];

export default function Lookbook() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    mm.add(DESKTOP_MQ, () => {
      const el = track.current!;
      const dist = () => Math.max(el.scrollWidth - (root.current?.clientWidth ?? window.innerWidth), 0);
      const tween = gsap.to(el, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (s) => {
            if (line.current) line.current.style.transform = `scaleX(${s.progress})`;
          },
        },
      });
      Array.from(root.current?.querySelectorAll<HTMLElement>("[data-look]") ?? []).forEach((card, i) => {
        const img = card.querySelector("[data-look-img]");
        const amt = 40 + (i % 3) * 20;
        gsap.fromTo(
          img,
          { x: -amt },
          {
            x: amt,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
    }, root);
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="the-lookbook" data-chapter="The Lookbook" data-surface="light" className="relative overflow-hidden bg-ivory py-16 md:flex md:h-screen md:flex-col md:justify-center md:py-0">
      <PatternBg variant="paisley" />
      <div aria-hidden className="font-display pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[30vw] leading-none text-espresso/[0.04]">LOOKBOOK</div>
      <Mandala className="absolute -right-40 -top-40 h-[480px] w-[480px] text-gold/40" />
      <div className="relative mb-8 flex items-end justify-between px-6 md:px-10">
        <div>
          <p className="overline text-maroon">The Lookbook · SS&apos;26</p>
          <h2 className="font-display mt-2 text-5xl md:text-7xl">
            {countWord(looks.length)} <i>Drapes</i>, One Story
          </h2>
        </div>
        <p className="hidden max-w-xs text-sm text-espresso/60 md:block">Scroll sideways through the season, from dawn at the ghats to a bride&apos;s first light.</p>
      </div>
      <div className="relative overflow-x-auto no-scrollbar md:overflow-visible">
        <div ref={track} className="flex w-max gap-5 px-6 md:gap-8 md:px-10">
          {looks.map((l, i) => (
            <Link key={l.t} href={l.href} data-look className={`sheen group relative h-[62vh] w-[72vw] shrink-0 overflow-hidden rounded-[1.75rem] bg-blush md:h-[58vh] md:w-[30vw] ${i % 2 ? "md:mt-10" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-look-img src={l.img} alt={`${l.t} — ${l.s}`} loading="lazy" className="absolute inset-y-0 -left-[24%] h-full w-[148%] max-w-none object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                <p className="overline text-gold-soft">Look {String(i + 1).padStart(2, "0")}</p>
                <p className="font-display text-4xl">{l.t}</p>
                <p className="text-xs text-ivory/75">{l.s}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="relative mx-6 mt-10 hidden h-px bg-espresso/15 md:mx-10 md:block">
        <div ref={line} className="h-px origin-left scale-x-0 bg-gold" />
      </div>
    </section>
  );
}
