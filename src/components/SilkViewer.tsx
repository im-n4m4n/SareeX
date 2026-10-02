"use client";

import dynamic from "next/dynamic";

const SilkCanvas = dynamic(() => import("./SilkCanvas"), { ssr: false, loading: () => null });

export default function SilkViewer({ image }: { image: string }) {
  return (
    <div className="relative h-full w-full bg-gradient-to-b from-navy to-espresso">
      <SilkCanvas image={image} interactive ratio={0.75} />
      <p className="pointer-events-none absolute left-4 top-4 rounded-full bg-ivory/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-ivory/80 backdrop-blur">
        Drag to drape · 3D fabric preview
      </p>
    </div>
  );
}
