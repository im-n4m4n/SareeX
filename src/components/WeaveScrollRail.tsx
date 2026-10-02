"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp, ChevronDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis, prefersReducedMotion } from "@/lib/animations";
import { Lotus } from "./ui";
import { cn } from "@/lib/utils";

type Chapter = { id: string; label: string; position: number; surface: string; fraction?: number };
const sameChapters = (a: Chapter[], b: Chapter[]) => JSON.stringify(a) === JSON.stringify(b);

/** A zari selvedge that is both a textile motif and a real, accessible page-progress navigator. */
export default function WeaveScrollRail() {
  const pathname = usePathname();
  const rail = useRef<HTMLElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const shuttle = useRef<HTMLDivElement>(null);
  const desktopNumber = useRef<HTMLSpanElement>(null);
  const mobileNumber = useRef<HTMLSpanElement>(null);
  const mobileTitle = useRef<HTMLSpanElement>(null);
  const currentName = useRef<HTMLSpanElement>(null);
  const mobileFill = useRef<HTMLSpanElement>(null);
  const circle = useRef<SVGCircleElement>(null);
  const scrollData = useRef({ progress: 0, active: 0 });
  const chapterData = useRef<Chapter[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let frame = 0;
    let scanTimer: ReturnType<typeof setTimeout>;
    let lastPercent = -1;
    let lastIndex = -1;
    let maxScroll = 1;

    const update = () => {
      const y = Math.max(window.scrollY, 0);
      const progress = Math.min(y / maxScroll, 1);
      const percent = Math.round(progress * 100);
      const data = chapterData.current;
      let index = 0;
      const readingPosition = y + Math.min(window.innerHeight * 0.28, 220);
      data.forEach((c, i) => { if (c.position <= readingPosition) index = i; });
      scrollData.current = { progress, active: index };

      if (fill.current) fill.current.style.transform = `scaleY(${progress})`;
      if (shuttle.current) shuttle.current.style.top = `${progress * 100}%`;
      if (mobileFill.current) mobileFill.current.style.transform = `scaleX(${progress})`;
      if (circle.current) circle.current.style.strokeDashoffset = String(113.1 * (1 - progress));
      if (rail.current) {
        rail.current.setAttribute("data-surface", data[index]?.surface ?? "light");
        if (!prefersReducedMotion()) document.documentElement.style.setProperty("--edge-y", `${-(y * 0.16) % 96}px`);
      }
      if (lastPercent !== percent) {
        lastPercent = percent;
        const t = `${String(percent).padStart(2, "0")}%`;
        if (desktopNumber.current) desktopNumber.current.textContent = t;
        if (mobileNumber.current) mobileNumber.current.textContent = t;
        rail.current?.querySelector("[role=progressbar]")?.setAttribute("aria-valuenow", String(percent));
      }
      if (lastIndex !== index) {
        lastIndex = index;
        setActive(index);
        const label = data[index]?.label ?? "Your journey";
        if (currentName.current) currentName.current.textContent = label;
        if (mobileTitle.current) mobileTitle.current.textContent = label;
      }
    };

    const scan = () => {
      if (disposed) return;
      maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
      const all = ScrollTrigger.getAll();
      const data = elements.map((el, i) => {
        if (!el.id) el.id = `weave-chapter-${i + 1}`;
        const pin = all.find((t) => t.trigger === el && !!t.pin);
        const anchor = el.closest<HTMLElement>(".pin-spacer") ?? el;
        const position = pin ? pin.start : anchor.getBoundingClientRect().top + window.scrollY;
        return { id: el.id, label: el.dataset.chapter ?? `Chapter ${i + 1}`, position: Math.max(position, 0), surface: el.dataset.surface ?? "light", fraction: Math.min(Math.max(position, 0) / maxScroll, 1) };
      }).sort((a, b) => a.position - b.position);
      // Every route gets a useful beginning/end, even a short account or product page.
      if (!data.length || data[0].position > 100) data.unshift({ id: "main", label: (document.querySelector("main h1")?.textContent?.trim().replace(/\s+/g, " ").slice(0, 32) || "Your journey"), position: 0, surface: "light", fraction: 0 });
      chapterData.current = data;
      setChapters((previous) => sameChapters(previous, data) ? previous : data);
      lastIndex = -1;
      update();
    };
    const queueScan = () => { clearTimeout(scanTimer); scanTimer = setTimeout(scan, 140); };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; update(); });
    };
    const observer = new MutationObserver(queueScan);
    const main = document.getElementById("main");
    if (main) observer.observe(main, { childList: true, subtree: true });
    ScrollTrigger.addEventListener("refresh", queueScan);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", queueScan, { passive: true });
    const ro = new ResizeObserver(queueScan);
    ro.observe(document.body);
    scanTimer = setTimeout(scan, 350);

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(scanTimer);
      observer.disconnect();
      ro.disconnect();
      ScrollTrigger.removeEventListener("refresh", queueScan);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", queueScan);
    };
  }, [pathname]);

  function go(index: number) {
    const c = chapterData.current[index];
    if (!c) return;
    const position = Math.max(c.position - (index === 0 ? 0 : 82), 0);
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(position, { duration: prefersReducedMotion() ? 0 : 1.45, immediate: prefersReducedMotion() });
    else window.scrollTo({ top: position, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }
  function top() {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: prefersReducedMotion() ? 0 : 1.5, immediate: prefersReducedMotion() });
    else window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "instant" : "smooth" });
  }

  return (
    <>
      <div className="woven-edge woven-edge-left" aria-hidden data-motion-ui />
      <aside ref={rail} className="weave-scroll-rail" aria-label="Your scroll journey" data-motion-ui data-surface="light">
        <Lotus className="mx-auto h-6 w-8" />
        <span className="rail-heading">THE JOURNEY</span>
        <span className="sr-only" role="progressbar" aria-label="Page scroll progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0} />
        <div className="weave-track">
          <div className="weave-track-pattern" aria-hidden />
          <div ref={fill} className="weave-progress-fill" aria-hidden />
          <nav aria-label="Jump to a chapter" className="absolute inset-0">
            {chapters.map((c, i) => {
              const t = (c.fraction ?? 0) * 100;
              return (
                <button key={c.id} onClick={() => go(i)} className={cn("weave-stop group", i === active && "is-current")} style={{ top: `${t}%` }} aria-label={`Jump to ${c.label}`} aria-current={i === active ? "location" : undefined}>
                  <span className="stop-diamond" />
                  <span className="weave-stop-label"><span className="mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>{c.label}</span>
                </button>
              );
            })}
          </nav>
          <div ref={shuttle} className="weave-shuttle" aria-hidden><Lotus className="h-5 w-7" /></div>
        </div>
        <span ref={desktopNumber} className="font-display rail-percentage">00%</span>
        <span ref={currentName} className="rail-current">The beginning</span>
        <button onClick={top} className="weave-top" aria-label="Scroll back to top">
          <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.2" />
            <circle ref={circle} cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.2" fill="none" strokeDasharray="113.1" strokeDashoffset="113.1" transform="rotate(-90 20 20)" />
          </svg>
          <ArrowUp className="h-3.5 w-3.5" />
        </button>
      </aside>
      <div className="weave-mobile" data-motion-ui>
        <Lotus className="h-4 w-6 shrink-0 text-gold" />
        <span ref={mobileTitle} className="max-w-36 truncate text-[10px] tracking-wide">The beginning</span>
        <span className="weave-mobile-line"><span ref={mobileFill} /></span>
        <span ref={mobileNumber} className="text-[10px] tabular-nums text-gold">00%</span>
        <button onClick={() => go(Math.min(scrollData.current.active + 1, chapterData.current.length - 1))} aria-label="Scroll to next chapter" className="p-1.5"><ChevronDown className="h-3.5 w-3.5" /></button>
        <button onClick={top} aria-label="Scroll back to top" className="p-1.5"><ArrowUp className="h-3.5 w-3.5" /></button>
      </div>
    </>
  );
}
