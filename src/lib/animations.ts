"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type Lenis from "lenis";

let lenisRef: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenisRef = l;
};
export const getLenis = () => lenisRef;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Shared motion media queries. These strings were duplicated across five
 * components, so a breakpoint change had to be made in five places.
 */
export const DESKTOP_MQ = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";
export const DESKTOP_WIDE_MQ = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
export const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

/** While the intro curtain is parting (first ~1.3s after a full load), hold reveals back. */
const introDelay = () => (typeof performance === "undefined" ? 0 : Math.max(0, (1300 - performance.now()) / 1000));

/** Removes ScrollTriggers whose trigger element has left the DOM (route changes). */
function killStale() {
  ScrollTrigger.getAll().forEach((t) => {
    const el = t.trigger as Element | undefined;
    if (el && !el.isConnected) t.kill();
  });
}

/**
 * Global scroll choreography. Safe to call repeatedly — each element is processed once.
 *  - data-silk     silk entrance (opacity, y 60→0, skewY 4→0, 1.1s power4.out, stagger 0.08)
 *  - data-mask     masked headline lines sliding up
 *  - data-kenburns scale 1.15 → 1 on scroll
 *  - data-drift    vertical parallax (px, ±)
 *  - data-rotate   scroll-linked rotation (deg)
 *  - data-reveal   clip-path wipe reveal
 *  - .gold-rule / .border-temple  hairlines that draw themselves
 *  - main h1/h2 get the silk entrance automatically
 */
export function initSilk() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  killStale();
  const reduce = prefersReducedMotion();

  // Page headings: auto silk unless they own masked lines / live in a pinned or silk parent
  document.querySelectorAll<HTMLElement>("main h1:not([data-silk-done]), main h2:not([data-silk-done])").forEach((el) => {
    if (el.hasAttribute("data-silk")) return;
    const skip = el.querySelector("[data-mask]") || el.closest("[data-silk],[data-mask],.pin-spacer");
    if (skip) el.setAttribute("data-silk-done", "1");
    else el.setAttribute("data-silk", "");
  });

  const silk = Array.from(document.querySelectorAll<HTMLElement>("[data-silk]:not([data-silk-done])"));
  if (silk.length) {
    if (reduce) {
      silk.forEach((el) => el.setAttribute("data-silk-done", "1"));
    } else {
      gsap.set(silk, { opacity: 0, y: 60, skewY: 4 });
      silk.forEach((el) => el.setAttribute("data-silk-done", "1"));
      ScrollTrigger.batch(silk, {
        start: "top 92%",
        once: true,
        interval: 0.1,
        batchMax: 8,
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            skewY: 0,
            duration: 1.1,
            ease: "power4.out",
            stagger: 0.08,
            delay: introDelay(),
            overwrite: true,
          }),
      });
    }
  }

  const masks = Array.from(document.querySelectorAll<HTMLElement>("[data-mask]:not([data-mask-done])"));
  masks.forEach((el, i) => {
    el.setAttribute("data-mask-done", "1");
    if (reduce) {
      el.style.transform = "none";
      return;
    }
    gsap.set(el, { yPercent: 110 });
    const delay = Number(el.dataset.maskDelay ?? 0) || 0;
    ScrollTrigger.create({
      trigger: el.parentElement ?? el,
      start: "top 96%",
      once: true,
      onEnter: () =>
        gsap.to(el, { yPercent: 0, duration: 1.1, ease: "power4.out", delay: delay + (i % 3) * 0.04 + introDelay() }),
    });
  });

  // Scroll-drawn embroidery. These paths retain their final appearance after entering.
  document.querySelectorAll<SVGSVGElement>("[data-embroider]:not([data-embroider-done])").forEach((svg) => {
    svg.setAttribute("data-embroider-done", "1");
    if (reduce) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>("path"));
    paths.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    });
    gsap.to(paths, {
      strokeDashoffset: 0,
      duration: 2.1,
      stagger: 0.025,
      ease: "power2.inOut",
      scrollTrigger: { trigger: svg, start: "top 95%", once: true },
    });
  });

  // Ink fills across editorial statements as you read them.
  document.querySelectorAll<HTMLElement>("[data-ink-reveal]:not([data-ink-done])").forEach((el) => {
    el.setAttribute("data-ink-done", "1");
    if (reduce) return;
    gsap.fromTo(el, { backgroundPosition: "100% 0%" }, {
      backgroundPosition: "0% 0%", ease: "none",
      scrollTrigger: { trigger: el, start: "top 85%", end: "bottom 45%", scrub: 1 },
    });
  });

  // The oversized wordmark drifts independently from the newsletter card.
  document.querySelectorAll<HTMLElement>(".brand-watermark:not([data-brand-done])").forEach((el) => {
    el.setAttribute("data-brand-done", "1");
    if (reduce) return;
    gsap.fromTo(el, { yPercent: 45 }, {
      yPercent: -8, ease: "none",
      scrollTrigger: { trigger: el.closest("footer") ?? el, start: "top bottom", end: "bottom bottom", scrub: 1 },
    });
  });

  // Hairlines that draw themselves
  document.querySelectorAll<HTMLElement>(".gold-rule:not([data-rule-done]), .border-temple:not([data-rule-done])").forEach((el) => {
    el.setAttribute("data-rule-done", "1");
    if (reduce) return;
    const trigger = { trigger: el, start: "top 98%", once: true };
    if (el.classList.contains("border-temple")) {
      gsap.fromTo(el, { clipPath: "inset(0 50% 0 50%)" }, { clipPath: "inset(0 0% 0 0%)", duration: 1.8, ease: "power3.out", scrollTrigger: trigger });
    } else {
      gsap.fromTo(el, { scaleX: 0 }, { scaleX: 1, duration: 1.8, ease: "power3.out", transformOrigin: "50% 50%", scrollTrigger: trigger });
    }
  });

  if (reduce) return;

  document.querySelectorAll<HTMLElement>("[data-kenburns]:not([data-kb-done])").forEach((el) => {
    el.setAttribute("data-kb-done", "1");
    gsap.fromTo(
      el,
      { scale: 1.15 },
      { scale: 1, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true } },
    );
  });

  // Ornament parallax (skip anything inside a pinned scene — those use CSS motion)
  document.querySelectorAll<HTMLElement>("[data-drift]:not([data-drift-done])").forEach((el) => {
    el.setAttribute("data-drift-done", "1");
    if (el.closest(".pin-spacer")) return;
    const v = Number(el.dataset.drift) || 60;
    gsap.fromTo(
      el,
      { y: -v },
      { y: v, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 1 } },
    );
  });

  document.querySelectorAll<HTMLElement>("[data-rotate]:not([data-rotate-done])").forEach((el) => {
    el.setAttribute("data-rotate-done", "1");
    if (el.closest(".pin-spacer")) return;
    const v = Number(el.dataset.rotate) || 90;
    gsap.fromTo(
      el,
      { rotation: -v / 2 },
      { rotation: v / 2, ease: "none", scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: 1 } },
    );
  });

  document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-reveal-done])").forEach((el) => {
    el.setAttribute("data-reveal-done", "1");
    const r = Number(el.dataset.reveal) || 24;
    gsap.fromTo(
      el,
      { clipPath: `inset(100% 0% 0% 0% round ${r}px)` },
      {
        clipPath: `inset(0% 0% 0% 0% round ${r}px)`,
        duration: 1.5,
        ease: "power4.inOut",
        clearProps: "clipPath",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
  });
}
