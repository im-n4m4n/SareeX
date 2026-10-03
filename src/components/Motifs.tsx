import type { CSSProperties } from "react";

/** Inline style bag that also carries CSS custom properties. */
type CSSVars = CSSProperties & Record<string, string | number>;
import { cn } from "@/lib/utils";
import { Lotus } from "./ui";

/** Slowly rotating line-drawn mandala (rangoli / temple ceiling inspired). */
export function Mandala({ className, reverse }: { className?: string; reverse?: boolean }) {
  const outer = Array.from({ length: 24 }, (_, i) => i * 15);
  const inner = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={cn(reverse ? "mandala-spin-rev" : "mandala-spin", className)}
      aria-hidden
    >
      <g transform="translate(200 200)">
        <circle r="196" />
        <circle r="188" strokeDasharray="2 6" />
        <circle r="150" />
        <circle r="100" />
        <circle r="52" />
        <circle r="10" />
        {outer.map((a) => (
          <path key={`o${a}`} transform={`rotate(${a})`} d="M0 -150 Q16 -172 0 -186 Q-16 -172 0 -150Z" />
        ))}
        {inner.map((a) => (
          <path key={`i${a}`} transform={`rotate(${a})`} d="M0 -52 Q26 -78 0 -100 Q-26 -78 0 -52Z" />
        ))}
        {inner.map((a) => (
          <path key={`l${a}`} transform={`rotate(${a + 15})`} d="M0 -100 L0 -150" strokeOpacity=".6" />
        ))}
        {outer.map((a) => (
          <circle key={`d${a}`} transform={`rotate(${a + 7.5}) translate(0 -168)`} r="2.2" fill="currentColor" stroke="none" />
        ))}
      </g>
    </svg>
  );
}

/** Boteh / paisley motif. */
export function Paisley({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1.2" className={className} aria-hidden>
      <path d="M52 6C80 10 96 36 90 64C84 92 60 114 36 108C16 103 8 82 20 68C30 56 50 60 50 74C50 84 38 84 38 76" />
      <path d="M52 20C72 24 82 42 78 62C74 82 58 98 42 96" strokeOpacity=".6" />
      <path d="M52 34C64 38 70 48 68 60" strokeOpacity=".4" />
      <circle cx="56" cy="46" r="4" />
      <circle cx="62" cy="64" r="2.5" />
      <circle cx="50" cy="80" r="2" />
      <path d="M52 6c-2-4 0-6 4-6" />
    </svg>
  );
}

const tiles = { paisley: 120, brocade: 64, check: 28, block: 80, jaal: 90, lotus: 100 } as const;
const fades = {
  none: "",
  top: "[mask-image:linear-gradient(to_bottom,black,transparent_85%)]",
  bottom: "[mask-image:linear-gradient(to_top,black,transparent_85%)]",
  radial: "[mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]",
  edges: "[mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_95%)]",
} as const;

/** Textile pattern layer that drifts one tile at a time on the compositor. */
export function PatternBg({
  variant = "paisley",
  strength = "soft",
  animate = true,
  fade = "none",
  className,
}: {
  variant?: keyof typeof tiles;
  strength?: "soft" | "strong";
  animate?: boolean;
  fade?: keyof typeof fades;
  className?: string;
}) {
  const t = tiles[variant];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", fades[fade], className)}>
      <div
        className={cn("absolute", `pattern-${variant}`, strength === "strong" ? "pat-strong" : "pat-soft", animate && "pattern-animate")}
        style={{ "--tile": `${t}px`, top: -t, left: -t, right: 0, bottom: 0 } as CSSVars}
      />
    </div>
  );
}

/** Floating paisleys, lotus and a scroll-rotating mandala for a section background. */
export function Ornaments({ tone = "gold", className }: { tone?: "gold" | "maroon" | "light"; className?: string }) {
  const c = tone === "maroon" ? "text-maroon/30" : tone === "light" ? "text-ivory/25" : "text-gold/55";
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div data-drift="-90" className="absolute left-[3%] top-[8%]">
        <Paisley className={cn("float-slow h-28 w-24 rotate-12", c)} />
      </div>
      <div data-drift="70" className="absolute right-[5%] top-[34%]">
        <Paisley className={cn("float-slow-b h-36 w-28 -rotate-[25deg] scale-x-[-1]", c)} />
      </div>
      <div data-drift="-60" className="absolute bottom-[7%] left-[9%]">
        <Lotus className={cn("float-slow h-14 w-20", c)} />
      </div>
      <div data-rotate="120" className="absolute -right-28 -top-28">
        <Mandala className={cn("h-72 w-72", c)} />
      </div>
      <div data-rotate="-120" className="absolute -bottom-32 -left-28 hidden md:block">
        <Mandala reverse className={cn("h-64 w-64", c)} />
      </div>
    </div>
  );
}

/** Marigold petals falling + zari dust rising — for dark hero imagery. */
export function PetalFall({ count = 16 }: { count?: number }) {
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => {
        const d = 11 + ((i * 5) % 9);
        const size = 10 + ((i * 7) % 12);
        const tone = i % 3 === 0 ? "petal-rose" : i % 3 === 1 ? "" : "petal-gold";
        return (
          <span
            key={`p${i}`}
            className={cn("petal", tone)}
            style={{ left: `${(i * 37 + 11) % 100}%`, width: size, height: r1(size * 1.35), animationDelay: `${r1(-((i * 1.7) % d))}s`, "--d": `${d}s` } as CSSVars}
          />
        );
      })}
      {Array.from({ length: Math.round(count * 0.75) }, (_, i) => {
        const d = 9 + ((i * 3) % 8);
        const s = 2 + (i % 3);
        return (
          <span
            key={`d${i}`}
            className="dust"
            style={{ left: `${(i * 53 + 7) % 100}%`, width: s, height: s, animationDelay: `${r1(-((i * 2.3) % d))}s`, "--d": `${d}s` } as CSSVars}
          />
        );
      })}
    </div>
  );
}

const bg = { ivory: "bg-ivory", blush: "bg-blush", espresso: "bg-espresso", "plum-deep": "bg-plum-deep" } as const;
const tx = { ivory: "text-ivory", blush: "text-blush", espresso: "text-espresso", "plum-deep": "text-plum-deep" } as const;

/** Mughal-arch scalloped transition between two sections with a gold hairline. */
export function ArchDivider({ from, to }: { from: keyof typeof bg; to: keyof typeof tx }) {
  return (
    <div aria-hidden className={cn("relative -mb-px h-7 overflow-hidden", bg[from])}>
      <div className={cn("edge-arches absolute inset-x-0 bottom-0", tx[to])} />
      <div className="edge-arches-line absolute inset-x-0 bottom-0" />
    </div>
  );
}

/** Fixed, page-wide textile ambience visible wherever a section has no solid background. */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <PatternBg variant="paisley" fade="radial" />
      <div className="absolute -right-[18vmin] top-[8vh]">
        <Mandala className="h-[80vmin] w-[80vmin] text-gold/30" />
      </div>
      <div className="absolute -bottom-[22vmin] -left-[22vmin]">
        <Mandala reverse className="h-[70vmin] w-[70vmin] text-maroon/20" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(243,230,224,0.7),transparent_60%)]" />
    </div>
  );
}
