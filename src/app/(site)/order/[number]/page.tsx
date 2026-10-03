import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { getOrderByNumber } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import { canViewOrder } from "@/lib/orderAccess";
import { coverImage, formatINR } from "@/lib/utils";
import { CONTAINER_READING, PAGE_TOP } from "@/lib/layout";
import { Lotus } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order confirmation", robots: { index: false } };

const steps = ["confirmed", "processing", "shipped", "delivered"];

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const data = await getOrderByNumber((await params).number);
  if (!data) notFound();

  // This page shows name, email, phone and the full shipping address, so it
  // must not be readable by anyone who merely holds the URL. Access requires
  // an admin session, the signed-in owner, or the browser cookie written at
  // checkout (which is what lets a guest see their own confirmation).
  const session = await getSession();
  if (!(await canViewOrder(data.order, session))) notFound();

  const { order, items } = data;
  const stepIdx = steps.indexOf(order.status);
  const cancelled = order.status === "cancelled";
  const address = order.shippingAddress;

  return (
    <div className={CONTAINER_READING + " " + PAGE_TOP + " pb-10"}>
      <div className="text-center">
        <Lotus className="mx-auto h-9 w-14 text-gold" />
        <p className="overline mt-4 text-maroon">{order.paymentStatus === "paid" ? "Thank you" : "Order received"}</p>
        <h1 className="font-display mt-2 text-6xl">Your drape is on its way to the atelier.</h1>
        <p className="mt-4 text-sm text-espresso/70">
          Order <b>{order.number}</b> · A confirmation has been sent to {order.email}
        </p>
      </div>

      <div className="mt-12 rounded-3xl border border-gold/25 bg-ivory p-8">
        {cancelled ? (
          <p className="text-center text-maroon">This order was cancelled.</p>
        ) : (
          <ol className="grid grid-cols-4 gap-2">
            {steps.map((s, i) => {
              const done = i <= stepIdx;
              return (
                <li key={s} className="flex flex-col items-center text-center">
                  <span className={"grid h-10 w-10 place-items-center rounded-full border " + (done ? "border-gold bg-gold text-espresso" : "border-espresso/20 text-espresso/30")}>
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={"mt-2 text-xs capitalize " + (done ? "text-espresso" : "text-espresso/40")}>{s}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.id} className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage(i.image)} alt="" className="h-28 w-[84px] rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-display text-2xl">{i.name}</p>
                <p className="text-xs text-espresso/55">
                  {i.color ? i.color + " · " : ""}Qty {i.quantity}
                </p>
              </div>
              <p className="text-sm">{formatINR(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4 rounded-3xl bg-blush/60 p-6 text-sm">
          <dl className="space-y-2">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between"><dt>Discount ({order.couponCode})</dt><dd>− {formatINR(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{order.shipping ? formatINR(order.shipping) : "Complimentary"}</dd></div>
            <div className="flex justify-between border-t border-gold/30 pt-2 text-base"><dt>Total</dt><dd className="font-medium">{formatINR(order.total)}</dd></div>
          </dl>
          <div className="text-xs leading-relaxed text-espresso/70">
            <p className="overline mb-1 text-maroon">Shipping to</p>
            {address.fullName}<br />
            {address.line1}
            {address.line2 ? <><br />{address.line2}</> : null}
            <br />
            {address.city}, {address.state} {address.pincode}
          </div>
          <p className="text-xs text-espresso/60">
            Payment: {order.paymentStatus} ({order.paymentMethod === "demo" ? "demo mode" : "Razorpay"})
          </p>
        </div>
      </div>
      <div className="mt-12 text-center">
        <Link href="/shop" className="btn-maroon">Continue shopping</Link>
      </div>
    </div>
  );
}
