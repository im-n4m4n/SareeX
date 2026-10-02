"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/db/schema";
import { useWishlist } from "@/lib/store";
import ProductCard from "./ProductCard";
import Link from "next/link";

export function WishlistGrid() {
  const ids = useWishlist((s) => s.ids);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      return;
    }
    fetch(`/api/misc/products?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products));
  }, [ids]);

  if (products === null) return <p className="text-sm text-espresso/60">Loading your wishlist…</p>;
  if (!products.length)
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
      className="btn-ghost text-maroon hover:bg-maroon hover:text-ivory"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </button>
  );
}
