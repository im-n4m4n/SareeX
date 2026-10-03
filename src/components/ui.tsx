import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Headline split into masked lines that slide up (overflow hidden). */
export function MaskLines({
  lines,
  className,
  lineClassName,
  delay = 0,
}: {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
}) {
  return (
    <span className={cn("block", className)}>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <span data-mask data-mask-delay={delay + i * 0.12} className={cn("block", lineClassName)}>
            {l}
          </span>
        </span>
      ))}
    </span>
  );
}

export function SectionTitle({
  overline,
  title,
  center,
  className,
}: {
  overline: string;
  title: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(center && "text-center", className)}>
      <p data-silk className={cn("overline text-maroon", center && "flex items-center justify-center gap-4")}>
        {center && <span className="h-px w-8 bg-gold" />}
        {overline}
        {center && <span className="h-px w-8 bg-gold" />}
      </p>
      <h2 className="font-display mt-3 text-4xl leading-[1.05] md:text-6xl">{title}</h2>
    </div>
  );
}

export function Lotus({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden>
      <path d="M24 3c4 5 6 10 0 18-6-8-4-13 0-18Z" />
      <path d="M24 21C16 19 12 12 14 7c6 1 10 6 10 14ZM24 21c8-2 12-9 10-14-6 1-10 6-10 14Z" />
      <path d="M24 21C14 22 6 17 4 11c7-1 14 3 20 10ZM24 21c10 1 18-4 20-10-7-1-14 3-20 10Z" />
      <path d="M12 27c7 3 17 3 24 0" />
    </svg>
  );
}

const STAR_PATH = "M10 1.5l2.5 5.5 6 .7-4.5 4.1 1.2 5.9L10 14.7 4.8 17.7 6 11.8 1.5 7.7l6-.7L10 1.5z";

function StarRow({ fill }: { fill: boolean }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5 shrink-0"
          fill={fill ? "currentColor" : "none"}
          stroke="currentColor"
          aria-hidden
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </>
  );
}

/**
 * Rating stars with true partial fill.
 *
 * The previous version used Math.round, so 4.9 rendered five full stars next to
 * the text "4.9" — three different numbers for one claim. Two stacked rows in
 * one grid cell let the filled row be clipped to the exact percentage.
 *
 * aria-label on a bare span is ignored by most screen readers, so the wrapper
 * carries role="img" and the SVGs are hidden.
 */
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;
  const pct = (safe / 5) * 100;
  return (
    <span
      className={cn("relative inline-grid text-gold align-middle", className)}
      role="img"
      aria-label={safe.toFixed(1) + " out of 5 stars"}
    >
      <span className="col-start-1 row-start-1 inline-flex gap-0.5">
        <StarRow fill={false} />
      </span>
      <span className="col-start-1 row-start-1 inline-flex overflow-hidden" style={{ width: pct + "%" }} aria-hidden>
        <StarRow fill />
      </span>
    </span>
  );
}
