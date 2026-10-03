"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/db/schema";
import { clearWishlistLocally, useWishlist } from "@/lib/store";
import ProductCard from "./ProductCard";
import Link from "next/link";

export function WishlistGrid() {
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!ids.length) return;
    let cancelled = false;
    fetch(`/api/misc/products?ids=${ids.join(",")}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("wishlist fetch failed"))))
      .then((d) => { if (!cancelled) setProducts(Array.isArray(d?.products) ? d.products : []); })
      // Without this the tab stayed on "Loading your wishlist…" forever.
      .catch(() => { if (!cancelled) setProducts([]); });
    return () => { cancelled = true; };
  }, [ids]);

  if (!ids.length) {
    return (
      <div className="py-12 text-center">
        <p className="font-display text-3xl">Nothing saved yet.</p>
        <Link href="/shop" className="btn-maroon mt-5">Discover sarees</Link>
      </div>
    );
  }
  if (products === null) return <p className="text-sm text-espresso/60">Loading your wishlist…</p>;
  if (!products?.length)
    return (
      <div className="py-12 text-center">
        <p className="font-display text-3xl">Nothing saved yet.</p>
        <Link href="/shop" className="btn-maroon mt-5">Discover sarees</Link>
      </div>
    );
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
      {products.filter((p) => ids.includes(p.id)).map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="btn-ghost text-maroon hover:bg-maroon hover:text-ivory"
      onClick={async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // fall through: still clear the local wishlist and leave the page
        }
        // Do not leak one shopper's saved pieces into the next session.
        clearWishlistLocally();
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
