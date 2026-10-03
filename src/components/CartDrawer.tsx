"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useMounted } from "@/lib/useMounted";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { cartCount, cartKey, cartSubtotal, useCart } from "@/lib/store";
import { SHIPPING_FREE_ABOVE, formatINR } from "@/lib/utils";
import { getLenis } from "@/lib/animations";

export default function CartDrawer() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const mounted = useMounted();
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const l = getLenis();
    if (open) {
      l?.stop();
      // Move focus into the dialog and give it back on close.
      restoreRef.current = document.activeElement as HTMLElement | null;
      closeRef.current?.focus();
    } else {
      l?.start();
      restoreRef.current?.focus?.();
      restoreRef.current = null;
    }
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, setOpen]);

  const subtotal = cartSubtotal(items);
  const count = cartCount(items);
  const remaining = Math.max(SHIPPING_FREE_ABOVE - subtotal, 0);

  return (
    <AnimatePresence>
      {mounted && open && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-espresso/50 backdrop-blur-md"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-md flex-col bg-ivory shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <p className="overline text-maroon">Your Bag</p>
                <h2 className="font-display text-3xl">
                  {count === 0 ? "Empty" : count + (count === 1 ? " piece" : " pieces")}
                </h2>
              </div>
              <button ref={closeRef} onClick={() => setOpen(false)} aria-label="Close bag" className="rounded-full border border-espresso/15 p-2 hover:border-gold">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="border-temple" />

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <ShoppingBag className="h-10 w-10 text-gold" />
                <p className="font-display text-2xl">Your bag is waiting to be draped.</p>
                <Link href="/shop" onClick={() => setOpen(false)} className="btn-maroon">
                  Explore Sarees
                </Link>
              </div>
            ) : (
              <>
                <div className="px-6 pt-4">
                  <p className="text-xs text-espresso/70">
                    {remaining > 0 ? (
                      <>Add <b>{formatINR(remaining)}</b> more for complimentary shipping</>
                    ) : (
                      <>You&apos;ve unlocked <b>complimentary shipping</b></>
                    )}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-espresso/10">
                    <div className="h-full rounded-full bg-gold transition-all duration-700" style={{ width: Math.min(100, (subtotal / SHIPPING_FREE_ABOVE) * 100) + "%" }} />
                  </div>
                </div>
                <ul data-lenis-prevent className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
                  {items.map((i) => (
                    <li key={cartKey(i)} className="flex gap-4">
                      <Link href={"/product/" + i.slug} onClick={() => setOpen(false)} className="h-28 w-[84px] shrink-0 overflow-hidden rounded-xl bg-blush">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                      </Link>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between gap-2">
                          <p className="font-display text-xl leading-tight">{i.name}</p>
                          <button aria-label={"Remove " + i.name} onClick={() => remove(i.productId, i.color)} className="text-espresso/40 hover:text-maroon">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        {i.color && <p className="text-xs text-espresso/60">{i.color}</p>}
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-espresso/15">
                            {/* Decrementing from 1 used to remove the line with no warning. */}
                            <button
                              aria-label="Decrease quantity"
                              className="p-2 disabled:opacity-30"
                              disabled={i.quantity <= 1}
                              onClick={() => setQty(i.productId, i.color, i.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center text-sm">{i.quantity}</span>
                            <button aria-label="Increase quantity" className="p-2 disabled:opacity-30" disabled={i.quantity >= i.stock} onClick={() => setQty(i.productId, i.color, i.quantity + 1)}>
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="text-sm font-medium">{formatINR(i.price * i.quantity)}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="space-y-4 border-t border-gold/30 bg-blush/50 px-6 py-5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-espresso/70">Subtotal</span>
                    <span className="font-display text-3xl">{formatINR(subtotal)}</span>
                  </div>
                  <p className="text-xs text-espresso/60">Taxes included. Coupons are applied at checkout.</p>
                  <Link href="/checkout" onClick={() => setOpen(false)} className="btn-gold w-full justify-center">
                    Checkout
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)} className="block text-center text-xs underline underline-offset-4">
                    View full bag
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
