"use client";

import Link from "next/link";
import Image from "next/image";
import { useMounted } from "@/lib/useMounted";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "@/db/schema";
import { useCart, useWishlist } from "@/lib/store";
import { cn, coverImage, discountPercent, formatINR } from "@/lib/utils";

export default function ProductCard({ product: p, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const add = useCart((s) => s.add);
  const toggle = useWishlist((s) => s.toggle);
  const wished = useWishlist((s) => s.ids.includes(p.id));
  const mounted = useMounted();

  const soldOut = p.stock <= 0;
  const off = discountPercent(p.price, p.compareAtPrice);
  const badge = p.badge ?? (p.isNew ? "New" : null);
  const cover = coverImage(p.images[0]);
  const hover = p.images[1] ?? cover;

  function addToBag() {
    if (soldOut) return;
    add({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      image: cover,
      price: p.price,
      color: p.colors[0]?.name,
      stock: p.stock,
    });
  }

  return (
    <article data-silk className={cn("group", layout === "list" && "grid grid-cols-[140px_1fr] gap-5 sm:grid-cols-[200px_1fr]")}>
      <div className="sheen relative aspect-[3/4] overflow-hidden rounded-2xl bg-blush shadow-[0_18px_40px_-26px_rgba(28,21,18,0.5)]">
        <Link href={"/product/" + p.slug} aria-label={p.name} className="absolute inset-0">
          {/* next/image serves right-sized variants instead of the 500KB+ originals,
              which keeps phones from decoding full-res photos mid-scroll. */}
          <Image
            src={cover}
            alt=""
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:opacity-0"
          />
          <Image
            src={hover}
            alt=""
            aria-hidden
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="scale-105 object-cover opacity-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
          />
        </Link>
        {badge && (
          <span className="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-espresso">
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={() => toggle(p.id)}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={mounted && wished}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-ivory/85 backdrop-blur transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4 transition", mounted && wished ? "fill-maroon text-maroon" : "text-espresso")} />
        </button>
        <button
          type="button"
          onClick={addToBag}
          disabled={soldOut}
          className="absolute inset-x-3 bottom-3 flex translate-y-[130%] items-center justify-center gap-2 rounded-full bg-espresso/90 py-3 text-xs font-medium tracking-wider text-ivory backdrop-blur transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 focus-visible:translate-y-0 disabled:bg-espresso/60 max-md:translate-y-0"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {soldOut ? "Sold out" : "Add to Bag"}
        </button>
      </div>
      <div className={cn("pt-4", layout === "list" && "self-center")}>
        <Link href={"/product/" + p.slug}>
          <h3 className="font-display text-xl leading-tight md:text-2xl">{p.name}</h3>
        </Link>
        <p className="mt-1 text-xs text-espresso/55">{p.tagline}</p>
        {layout === "list" && <p className="mt-3 hidden max-w-lg text-sm text-espresso/70 sm:block">{p.description}</p>}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-medium">{formatINR(p.price)}</span>
          {/* Only claim a discount when there actually is one. */}
          {p.compareAtPrice && off > 0 ? (
            <>
              <span className="text-xs text-espresso/40 line-through">{formatINR(p.compareAtPrice)}</span>
              <span className="text-[10px] font-medium text-maroon">{off}% off</span>
            </>
          ) : null}
        </div>
        {p.colors.length > 0 && (
          <div className="mt-2.5 flex gap-1.5">
            {p.colors.slice(0, 5).map((c) => (
              <span key={c.name} role="img" aria-label={c.name} title={c.name} className="h-3.5 w-3.5 rounded-full border border-espresso/15" style={{ background: c.hex }} />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
