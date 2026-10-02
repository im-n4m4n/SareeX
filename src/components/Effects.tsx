"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Gold scroll-progress thread, cursor ring, magnetic buttons and card tilt. */
export default function Effects() {
  const bar = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const progress = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
      },
    });

    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !ring.current || !dot.current) return () => progress.kill();

    const r = ring.current;
    const d = dot.current;
    gsap.set([r, d], { xPercent: -50, yPercent: -50, opacity: 0 });
    const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });

    let hovering = false;
    let mag: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      const target = e.target as Element | null;
      if (!target || !target.closest) return;

      const hot = !!target.closest("a,button,[role=button],input,select,textarea,label,[data-cursor]");
      if (hot !== hovering) {
        hovering = hot;
        gsap.to(r, { scale: hot ? 1.9 : 1, backgroundColor: hot ? "rgba(201,162,75,0.16)" : "rgba(201,162,75,0)", duration: 0.45, ease: "power3.out", overwrite: "auto" });
        gsap.to(d, { scale: hot ? 0 : 1, duration: 0.3, overwrite: "auto" });
      }
      gsap.to([r, d], { opacity: 1, duration: 0.3, overwrite: "auto" });

      const m = target.closest<HTMLElement>(".btn-gold,.btn-maroon,.btn-ghost,[data-magnetic]");
      if (mag && mag !== m) {
        gsap.to(mag, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1,0.4)" });
        mag = null;
      }
      if (m) {
        const b = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - b.left - b.width / 2) * 0.25, y: (e.clientY - b.top - b.height / 2) * 0.35, duration: 0.4, ease: "power3.out" });
        mag = m;
      }

      const t = target.closest<HTMLElement>("[data-tilt]");
      if (tilt && tilt !== t) {
        gsap.to(tilt, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "power3.out" });
        tilt = null;
      }
      if (t) {
        const b = t.getBoundingClientRect();
        const px = (e.clientX - b.left) / b.width - 0.5;
        const py = (e.clientY - b.top) / b.height - 0.5;
        gsap.to(t, { rotationY: px * 9, rotationX: -py * 9, transformPerspective: 900, duration: 0.5, ease: "power2.out" });
        tilt = t;
      }
    };
    const onLeave = () => gsap.to([r, d], { opacity: 0, duration: 0.3 });

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      progress.kill();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={bar} aria-hidden className="fixed inset-x-0 top-0 z-[120] h-[2px] origin-left scale-x-0 bg-gradient-to-r from-maroon via-gold to-gold-soft" />
      <div ref={ring} aria-hidden className="cursor-ring pointer-events-none fixed left-0 top-0 z-[250] h-10 w-10 rounded-full border border-gold" />
      <div ref={dot} aria-hidden className="cursor-dot pointer-events-none fixed left-0 top-0 z-[250] h-1.5 w-1.5 rounded-full bg-gold" />
    </>
  );
}
