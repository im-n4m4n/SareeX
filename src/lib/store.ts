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

/**
 * One canonical identity for a cart line. Previously the store used
 * "id:color" while the drawer, cart page and checkout used "id-color",
 * so a colourless line keyed as "12-undefined".
 */
export const cartKey = (i: { productId: number; color?: string }) =>
  i.productId + ":" + (i.color ?? "");

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
          // Sold-out pieces must never enter the bag, and a line must never
          // carry quantity 0 (setQty filters zeroes, add did not).
          if (item.stock <= 0) return { open: true };
          const cap = Math.max(1, Math.min(qty, item.stock));
          const existing = s.items.find((i) => cartKey(i) === cartKey(item));
          const items = existing
            ? s.items.map((i) =>
                cartKey(i) === cartKey(item)
                  ? { ...i, stock: item.stock, quantity: Math.min(i.quantity + cap, item.stock) }
                  : i,
              )
            : [...s.items, { ...item, quantity: cap }];
          return { items, open: true };
        }),
      setQty: (productId, color, qty) =>
        set((s) => ({
          items: s.items
            .map((i) =>
              cartKey(i) === cartKey({ productId, color })
                ? { ...i, quantity: Math.max(0, Math.min(qty, i.stock)) }
                : i,
            )
            .filter((i) => i.quantity > 0),
        })),
      remove: (productId, color) =>
        set((s) => ({ items: s.items.filter((i) => cartKey(i) !== cartKey({ productId, color })) })),
      clear: () => set({ items: [] }),
    }),
    // Legacy key retained so previously saved bags survive the rename.
    { name: "aurelle-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

type WishState = {
  ids: number[];
  toggle: (id: number) => void;
  setIds: (ids: number[]) => void;
  clear: () => void;
};

export const useWishlist = create<WishState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
      setIds: (ids) => set({ ids }),
      clear: () => set({ ids: [] }),
    }),
    { name: "aurelle-wishlist" },
  ),
);

/**
 * Local clear for logout. The wishlist sync subscriber watches the store, so a
 * plain setIds([]) would push an empty list to the server and delete the
 * customer's saved pieces. This flag makes that one write a no-op.
 */
let wishlistSyncSuppressed = false;
export const isWishlistSyncSuppressed = () => wishlistSyncSuppressed;
export function clearWishlistLocally() {
  wishlistSyncSuppressed = true;
  useWishlist.getState().setIds([]);
  wishlistSyncSuppressed = false;
}

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity * i.price, 0);
export const cartGoodsTotal = (items: CartItem[], discount = 0) =>
  Math.max(0, cartSubtotal(items) - discount);
