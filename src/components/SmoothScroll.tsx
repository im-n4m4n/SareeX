"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initSilk, prefersReducedMotion, setLenis, getLenis } from "@/lib/animations";
import { isWishlistSyncSuppressed, useWishlist } from "@/lib/store";

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
    // Observe the content region, not the whole document: body-wide mutations
    // rescheduled a full animation scan on every unrelated DOM change.
    const observed = document.getElementById("main") ?? document.body;
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
    mo.observe(observed, { childList: true, subtree: true });

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
        // A hand-typed malformed escape must not throw and break this route change.
        let id = window.location.hash.slice(1);
        try { id = decodeURIComponent(id); } catch { /* keep the raw value */ }
        const target = document.getElementById(id);
        if (target) getLenis()?.scrollTo(target, { offset: -100, immediate: prefersReducedMotion() });
      }
    }, 100);
    return () => clearTimeout(t);
  }, [pathname]);

  // Sync wishlist with account (if signed in)
  useEffect(() => {
    let disposed = false;
    let unsub: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let canSync = false;

    fetch("/api/misc/wishlist")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("wishlist fetch failed"))))
      .then((d: { ids: number[] | null }) => {
        // The component may have unmounted before the response landed; without
        // this guard the subscription below was created after cleanup had
        // already run, leaking a listener that kept writing to the server.
        if (disposed) return;
        if (!d.ids) return;
        canSync = true;
        // The server list is authoritative. Merging it with whatever was left
        // in this browser leaked one shopper's saved pieces into the next
        // account that signed in here.
        useWishlist.getState().setIds(d.ids);
        unsub = useWishlist.subscribe((s, prev) => {
          if (s.ids === prev.ids) return;
          if (!canSync || isWishlistSyncSuppressed()) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            fetch("/api/misc/wishlist", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ids: s.ids }),
            }).catch(() => {});
          }, 600);
        });
      })
      .catch(() => {});

    return () => {
      disposed = true;
      unsub?.();
      clearTimeout(timer);
    };
  }, []);

  return <>{children}</>;
}
