"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useMounted } from "@/lib/useMounted";
import { cartKey, cartSubtotal, useCart } from "@/lib/store";
import { formatINR, shippingFor } from "@/lib/utils";
import { CONTAINER_NARROW } from "@/lib/layout";

export default function CartView() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const mounted = useMounted();

  const list = mounted ? items : [];
  const subtotal = cartSubtotal(list);
  // Same rule as the checkout form and the checkout API: shipping is decided
  // on the goods value, so this screen and the order agree.
  const shipping = shippingFor(subtotal);

  return (
    <div className={CONTAINER_NARROW + " min-h-[70vh] pb-10"}>
      <p className="overline text-maroon">Your Bag</p>
      <h1 className="font-display mt-2 text-6xl">Shopping Bag</h1>
      <div className="gold-rule mt-6" />
      {list.length === 0 ? (
        <div className="py-24 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-gold" />
          <p className="font-display mt-4 text-3xl">Your bag is waiting to be draped.</p>
          <Link href="/shop" className="btn-maroon mt-8">Explore Sarees</Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <ul className="divide-y divide-gold/25">
            {list.map((i) => (
              <li key={cartKey(i)} className="flex gap-5 py-6">
                <Link href={"/product/" + i.slug} className="h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-display text-2xl">{i.name}</p>
                      {i.color && <p className="text-xs text-espresso/55">{i.color}</p>}
                    </div>
                    <button aria-label={"Remove " + i.name} onClick={() => remove(i.productId, i.color)}><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-espresso/15">
                      <button
                        aria-label="Decrease quantity"
                        className="p-2.5 disabled:opacity-30"
                        disabled={i.quantity <= 1}
                        onClick={() => setQty(i.productId, i.color, i.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm">{i.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        className="p-2.5 disabled:opacity-30"
                        disabled={i.quantity >= i.stock}
                        onClick={() => setQty(i.productId, i.color, i.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-medium">{formatINR(i.price * i.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-3xl border border-gold/25 bg-blush/50 p-7">
            <h2 className="font-display text-3xl">Summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</dd></div>
              <div className="gold-rule" />
              <div className="flex justify-between text-lg"><dt>Total</dt><dd className="font-display text-3xl">{formatINR(subtotal + shipping)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-espresso/55">Coupon codes are applied at checkout; shipping is unchanged by a coupon.</p>
            <Link href="/checkout" className="btn-gold mt-6 w-full justify-center">Proceed to Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
