"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ProductTabs({ details }: { details: [string, string][] }) {
  const [tab, setTab] = useState<"Details" | "Shipping" | "Returns">("Details");
  return (
    <div>
      <div className="grid grid-cols-3 border-b border-espresso/10 text-sm" role="tablist">
        {(["Details", "Shipping", "Returns"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn("relative pb-3 transition", tab === t ? "text-espresso" : "text-espresso/50")}
          >
            {t}
            {tab === t && <span className="absolute inset-x-4 -bottom-px h-0.5 bg-gold" />}
          </button>
        ))}
      </div>
      <div className="mt-6 text-sm" role="tabpanel">
        {tab === "Details" && (
          <dl className="space-y-4">
            {details.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[100px_1fr] gap-3">
                <dt className="text-espresso/60">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {tab === "Shipping" && (
          <ul className="space-y-3 text-espresso/75">
            <li>Free shipping across India on orders above ₹5,000; ₹199 otherwise.</li>
            <li>Dispatch in 2–3 working days. Lehengas are made to measure in 4–6 weeks.</li>
            <li>International shipping to US, UK, UAE, Canada & Singapore in 5–8 days. Duties may apply.</li>
          </ul>
        )}
        {tab === "Returns" && (
          <ul className="space-y-3 text-espresso/75">
            <li>Easy 7-day returns for unworn sarees with tags and the original packaging.</li>
            <li>Made-to-measure pieces and stitched blouses are final sale.</li>
            <li>Natural-dye and handloom irregularities are marks of authenticity, not defects.</li>
          </ul>
        )}
      </div>
    </div>
  );
}
