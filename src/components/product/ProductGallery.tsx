"use client";

import { useState } from "react";
import { Box, Image as ImageIcon } from "lucide-react";
import SilkViewer from "../SilkViewer";
import { cn } from "@/lib/utils";

export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const [mode, setMode] = useState<"photo" | "3d">("photo");
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);

  return (
    <div className="flex gap-4">
      <div className="flex w-16 shrink-0 flex-col gap-3 md:w-20">
        {images.map((src, i) => (
          <button
            key={src + i}
            onClick={() => {
              setIdx(i);
              setMode("photo");
            }}
            aria-label={`View image ${i + 1}`}
            className={cn("aspect-[3/4] overflow-hidden rounded-xl border-2 transition", i === idx && mode === "photo" ? "border-gold" : "border-transparent opacity-70 hover:opacity-100")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div
        data-reveal="24"
        className="relative aspect-[3/4] min-w-0 flex-1 overflow-hidden rounded-3xl bg-blush shadow-[0_30px_70px_-40px_rgba(28,21,18,0.7)]"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        {mode === "photo" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[idx]}
            alt={`${name} — view ${idx + 1}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out"
            style={{ transformOrigin: origin, transform: zoom ? "scale(1.8)" : "scale(1)" }}
          />
        ) : (
          <SilkViewer image={images[idx]} />
        )}
        <button
          onClick={() => setMode(mode === "photo" ? "3d" : "photo")}
          className="glass absolute bottom-4 left-4 z-10 flex items-center gap-2.5 rounded-full px-4 py-2.5 text-xs"
        >
          {mode === "photo" ? <Box className="h-4 w-4 text-maroon" /> : <ImageIcon className="h-4 w-4 text-maroon" />}
          {mode === "photo" ? "View in 3D" : "Back to photos"}
        </button>
      </div>
    </div>
  );
}
