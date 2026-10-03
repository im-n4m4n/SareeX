import { Lotus } from "./ui";
import { cn } from "@/lib/utils";

/** Scroll-drawn embroidery: winding zari vines, leaves, and lotus blooms. */
export default function WeaveRibbon() {
  return (
    <div aria-hidden className={cn("relative overflow-hidden bg-ivory py-5")}>
      <svg data-embroider viewBox="0 0 1200 52" preserveAspectRatio="xMidYMid slice" className="mx-auto h-10 w-full text-gold" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 26 C25 6 50 46 75 26 S125 6 150 26 S200 46 225 26 S275 6 300 26 S350 46 375 26 S425 6 450 26 S500 46 525 26 S575 6 600 26 S650 46 675 26 S725 6 750 26 S800 46 825 26 S875 6 900 26 S950 46 975 26 S1025 6 1050 26 S1100 46 1125 26 S1175 6 1200 26" strokeOpacity="0.6" />
        {Array.from({ length: 16 }, (_, i) => (
          <g key={i} transform={`translate(${i * 75 + 36} 26)`}>
            <path d="M0 0 Q-7 -14 -14 -9 Q-8 2 0 0 M0 0 Q7 14 14 9 Q8 -2 0 0" strokeOpacity="0.65" />
            <circle cx="0" cy="0" r="1.5" fill="currentColor" stroke="none" />
          </g>
        ))}
      </svg>
      <span className="absolute left-1/2 top-1/2 grid h-12 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center bg-ivory"><Lotus className="h-7 w-11 text-gold" /></span>
    </div>
  );
}
