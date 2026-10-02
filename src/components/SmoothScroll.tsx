"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initSilk, prefersReducedMotion, setLenis, getLenis } from "@/lib/animations";
import { useWishlist } from "@/lib/store";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Lenis + GSAP ScrollTrigger sync
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduce = prefersReducedMotion();
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: !reduce });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let timer: ReturnType<typeof setTimeout> | undefined;
    const mo = new MutationObserver((records) => {
      // Percentage labels and animated counters should never retrigger global setup.
      const meaningful = records.some((record) => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement;
        if (target?.closest("[data-motion-ui],[data-count]")) return false;
        return Array.from(record.addedNodes).some((node) => node instanceof Element);
      });
      if (!meaningful) return;
      clearTimeout(timer);
      timer = setTimeout(() => initSilk(), 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      mo.disconnect();
      clearTimeout(timer);
      window.removeEventListener("load", onLoad);
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Scroll to top + re-init on route change
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true });
    const t = setTimeout(() => {
      initSilk();
      ScrollTrigger.refresh();
      if (window.location.hash) {
        const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
        if (target) getLenis()?.scrollTo(target, { offset: -100, immediate: prefersReducedMotion() });
      }
    }, 100);
    return () => clearTimeout(t);
  }, [pathname]);

  // Sync wishlist with account (if signed in)
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    fetch("/api/misc/wishlist")
      .then((r) => r.json())
      .then((d: { ids: number[] | null }) => {
        if (!d.ids) return;
        const merged = Array.from(new Set([...d.ids, ...useWishlist.getState().ids]));
        useWishlist.getState().setIds(merged);
        unsub = useWishlist.subscribe((s) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            fetch("/api/misc/wishlist", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: s.ids }),
            });
          }, 600);
        });
      })
      .catch(() => {});
    return () => {
      unsub?.();
      clearTimeout(timer);
    };
  }, []);

  return <>{children}</>;
}
