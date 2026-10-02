"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: number;
  slug: string;
  name: string;
  image: string;
  price: number;
  color?: string;
  quantity: number;
  stock: number;
};

const key = (i: { productId: number; color?: string }) => `${i.productId}:${i.color ?? ""}`;

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: number, color: string | undefined, qty: number) => void;
  remove: (productId: number, color?: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      setOpen: (open) => set({ open }),
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => key(i) === key(item));
          const items = existing
            ? s.items.map((i) =>
                key(i) === key(item) ? { ...i, quantity: Math.min(i.quantity + qty, item.stock) } : i,
              )
            : [...s.items, { ...item, quantity: Math.min(qty, item.stock) }];
          return { items, open: true };
        }),
      setQty: (productId, color, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (key(i) === key({ productId, color }) ? { ...i, quantity: Math.min(qty, i.stock) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId, color) =>
        set((s) => ({ items: s.items.filter((i) => key(i) !== key({ productId, color })) })),
      clear: () => set({ items: [] }),
    }),
    { name: "aurelle-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

type WishState = {
  ids: number[];
  toggle: (id: number) => void;
  setIds: (ids: number[]) => void;
};

export const useWishlist = create<WishState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      setIds: (ids) => set({ ids }),
    }),
    { name: "aurelle-wishlist" },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity * i.price, 0);
