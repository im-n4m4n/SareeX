"use client";

import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/lib/useMounted";
import { Heart, Minus, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, X, Ruler } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart, useWishlist } from "@/lib/store";
import { SHIPPING_FREE_ABOVE, cn, formatINR } from "@/lib/utils";

export default function ProductBuy({ product: p }: { product: Product }) {
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const [color, setColor] = useState(p.colors[0]?.name);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState("M");
  const madeToMeasure = ["lehengas", "blouses"].includes(p.category);
  const hasSizes = p.category === "kurta-sets";
  const [guide, setGuide] = useState(false);
  const mounted = useMounted();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const soldOut = p.stock <= 0;
  const hasColors = p.colors.length > 0;
  const maxQty = Math.max(p.stock, 1);

  // The size guide is a dialog: mark it modal, move focus in, close on Escape,
  // and hand focus back on close.
  useEffect(() => {
    if (!guide) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setGuide(false);
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("keydown", esc);
      restoreRef.current?.focus?.();
      restoreRef.current = null;
    };
  }, [guide]);

  return (
    <div>
      {hasColors && (
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <p className="text-sm">
              Colour: <b className="font-medium">{color}</b>
            </p>
          </div>
          <div className="mt-3 flex gap-3">
            {p.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={c.name}
                aria-pressed={color === c.name}
                onClick={() => setColor(c.name)}
                className={cn("h-9 w-9 rounded-full border-2 border-ivory ring-1 transition", color === c.name ? "scale-110 ring-maroon" : "ring-espresso/20")}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full border border-espresso/20 px-5 py-2 text-sm">{madeToMeasure ? "Made to Measure" : hasSizes ? "Select Size" : "Free Size"}</span>
        <button type="button" onClick={() => setGuide(true)} className="flex items-center gap-2 text-xs underline underline-offset-4">
          <Ruler className="h-4 w-4" /> Size guide
        </button>
      </div>

      {hasSizes && <div className="mt-4 flex gap-2" role="group" aria-label="Choose a garment size">{["XS", "S", "M", "L", "XL", "XXL"].map((value) => <button type="button" key={value} aria-pressed={size === value} onClick={() => setSize(value)} className={cn("h-10 w-10 rounded-full border text-xs transition", size === value ? "border-maroon bg-maroon text-ivory" : "border-espresso/20 hover:border-gold")}>{value}</button>)}</div>}

      <p className={cn("mt-5 text-xs", p.stock <= 5 ? "text-maroon" : "text-espresso/60")}>
        {soldOut ? "Currently sold out" : p.stock <= 5 ? "Only " + p.stock + " left — woven in small batches" : "In stock · ships in 2–3 days"}
      </p>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-espresso/20">
          <button type="button" aria-label="Decrease quantity" className="p-3.5 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-7 text-center text-sm">{qty}</span>
          <button type="button" aria-label="Increase quantity" className="p-3.5 disabled:opacity-30" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          type="button"
          disabled={soldOut}
          onClick={() => add({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? "", price: p.price, color: hasSizes ? (color ? color + " · Size " + size : "Size " + size) : color, stock: p.stock }, qty)}
          className="btn-maroon flex-1"
        >
          <ShoppingBag className="h-4 w-4" /> {soldOut ? "Sold out" : "Add to Cart"}
        </button>
        <button
          type="button"
          onClick={() => toggle(p.id)}
          aria-pressed={mounted && wished}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="grid h-12 w-12 place-items-center rounded-full border border-espresso/20 transition hover:border-maroon"
        >
          <Heart className={cn("h-5 w-5", mounted && wished && "fill-maroon text-maroon")} />
        </button>
      </div>

      <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-espresso/70">
        <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-gold" /> Secure Checkout</li>
        <li className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-gold" /> Free shipping over {formatINR(SHIPPING_FREE_ABOVE)}</li>
        <li className="flex items-center gap-1.5"><RotateCcw className="h-4 w-4 text-gold" /> Easy Returns</li>
      </ul>

      {guide && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-espresso/60 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Size guide" onClick={() => setGuide(false)}>
          <div data-lenis-prevent className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-ivory p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="overline text-maroon">Size &amp; Fit</p>
                <h3 className="font-display text-4xl">Draping Guide</h3>
              </div>
              <button ref={closeRef} type="button" aria-label="Close size guide" onClick={() => setGuide(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-espresso/70">Sarees are one-size-fits-all. For blouses and lehengas, we stitch to your measurements.</p>
            <table className="mt-6 w-full text-left text-sm">
              <caption className="sr-only">Blouse measurements by size, in inches</caption>
              <thead className="text-xs uppercase tracking-widest text-maroon">
                <tr><th scope="col" className="py-2">Size</th><th scope="col">Bust</th><th scope="col">Waist</th><th scope="col">Blouse length</th></tr>
              </thead>
              <tbody className="divide-y divide-gold/25">
                {[["XS", "32\"", "26\"", "14\""], ["S", "34\"", "28\"", "14.5\""], ["M", "36\"", "30\"", "15\""], ["L", "38\"", "32\"", "15\""], ["XL", "40\"", "34\"", "15.5\""], ["XXL", "42\"", "36\"", "16\""]].map((r) => (
                  <tr key={r[0]}>{r.map((c, i) => <td key={i} className="py-2.5">{c}</td>)}</tr>
                ))}
              </tbody>
            </table>
            <div className="mt-6 rounded-2xl bg-blush p-4 text-xs leading-relaxed text-espresso/80">
              <b>Saree length:</b> 5.5 m body + 0.8 m blouse piece. <b>Petticoat tip:</b> choose a shade 1–2 tones deeper than your saree. Need help? WhatsApp our stylists for a free fitting consultation.
              {madeToMeasure && <> <b>Made to measure:</b> we email you for measurements right after checkout.</>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
