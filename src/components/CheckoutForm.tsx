"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMounted } from "@/lib/useMounted";
import { Lock } from "lucide-react";
import { cartKey, cartSubtotal, useCart } from "@/lib/store";
import { formatINR, shippingFor } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: () => void) => void };
  }
}

type Prefill = {
  name: string;
  email: string;
  phone?: string;
  address?: Record<string, string> | null;
};

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** sr-only label so every control has an accessible name (placeholders are not labels). */
function Field({
  id,
  label,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string; label: string }) {
  return (
    <span className={className}>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input id={id} className="field" {...rest} />
    </span>
  );
}

export default function CheckoutForm({ prefill }: { prefill: Prefill }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const mounted = useMounted();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [applying, setApplying] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState("");
  const [f, setF] = useState({
    email: prefill.email,
    fullName: prefill.name,
    phone: prefill.phone ?? "",
    line1: prefill.address?.line1 ?? "",
    line2: prefill.address?.line2 ?? "",
    city: prefill.address?.city ?? "",
    state: prefill.address?.state ?? "",
    pincode: prefill.address?.pincode ?? "",
    country: prefill.address?.country ?? "India",
  });

  const list = mounted ? items : [];
  const subtotal = cartSubtotal(list);
  const discount = applied?.discount ?? 0;
  // Shipping is decided on the goods value, so applying a coupon can never
  // push an order below the free-shipping threshold the site advertises.
  const shipping = shippingFor(subtotal);
  const total = subtotal - discount + shipping;
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF((prev) => ({ ...prev, [k]: e.target.value }));

  async function applyCoupon() {
    if (applying) return;
    setCouponMsg("");
    setApplying(true);
    try {
      const res = await fetch("/api/misc/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, subtotal }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setApplied(d);
        setCouponMsg(d.code + " applied — you save " + formatINR(d.discount));
      } else {
        setApplied(null);
        setCouponMsg(d.error ?? "Invalid code");
      }
    } catch {
      setApplied(null);
      setCouponMsg("Could not reach the server. Please try again.");
    } finally {
      setApplying(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          coupon: applied?.code,
          items: list.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })),
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? "Checkout failed");

      if (d.mode === "demo") {
        clear();
        router.push("/order/" + d.number);
        return;
      }
      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Could not load Razorpay. Check your connection.");
      const rz = new window.Razorpay({
        key: d.razorpay.key,
        amount: d.razorpay.amount,
        currency: "INR",
        name: "Elite Weavers",
        description: "Order " + d.number,
        order_id: d.razorpay.orderId,
        prefill: { name: d.razorpay.name, email: d.razorpay.email, contact: d.razorpay.phone },
        theme: { color: "#6B1E2A" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (r: Record<string, string>) => {
          const v = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number: d.number, ...r }),
          });
          if (v.ok) {
            clear();
            router.push("/order/" + d.number);
          } else {
            setError("Payment could not be verified. If you were charged, we'll confirm shortly.");
            setBusy(false);
          }
        },
      });
      rz.on("payment.failed", () => {
        setError("Payment failed. Please try again.");
        setBusy(false);
      });
      rz.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  if (mounted && list.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-4xl">Your bag is empty.</p>
        <Link href="/shop" className="btn-maroon mt-6">Continue shopping</Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-8">
        <section>
          <h2 className="font-display text-3xl">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="co-email" label="Email" type="email" required placeholder="Email" value={f.email} onChange={set("email")} autoComplete="email" />
            <Field id="co-phone" label="Phone (WhatsApp preferred)" required inputMode="tel" placeholder="Phone (WhatsApp preferred)" value={f.phone} onChange={set("phone")} autoComplete="tel" />
          </div>
        </section>
        <section>
          <h2 className="font-display text-3xl">Shipping address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field id="co-name" label="Full name" className="sm:col-span-2" required placeholder="Full name" value={f.fullName} onChange={set("fullName")} autoComplete="name" />
            <Field id="co-line1" label="Address line 1" className="sm:col-span-2" required placeholder="Address line 1" value={f.line1} onChange={set("line1")} autoComplete="address-line1" />
            <Field id="co-line2" label="Apartment, landmark (optional)" className="sm:col-span-2" placeholder="Apartment, landmark (optional)" value={f.line2} onChange={set("line2")} autoComplete="address-line2" />
            <Field id="co-city" label="City" required placeholder="City" value={f.city} onChange={set("city")} autoComplete="address-level2" />
            <Field id="co-state" label="State" required placeholder="State" value={f.state} onChange={set("state")} autoComplete="address-level1" />
            <Field id="co-pin" label="PIN / ZIP code" required inputMode="numeric" placeholder="PIN / ZIP code" value={f.pincode} onChange={set("pincode")} autoComplete="postal-code" />
            <Field id="co-country" label="Country" required placeholder="Country" value={f.country} onChange={set("country")} autoComplete="country-name" />
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-3xl border border-gold/25 bg-blush/50 p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-3xl">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {list.map((i) => (
            <li key={cartKey(i)} className="flex gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.image} alt="" className="h-20 w-16 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-display text-lg leading-tight">{i.name}</p>
                <p className="text-xs text-espresso/55">
                  {i.color ? i.color + " · " : ""}Qty {i.quantity}
                </p>
              </div>
              <p>{formatINR(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex gap-2">
          <label className="sr-only" htmlFor="co-coupon">Coupon code</label>
          <input
            id="co-coupon"
            className="field py-2.5"
            placeholder="Coupon code"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value);
              // Editing the code invalidates the applied discount.
              setApplied(null);
              setCouponMsg("");
            }}
          />
          <button type="button" onClick={applyCoupon} disabled={applying} className="rounded-full border border-maroon px-5 text-xs text-maroon transition hover:bg-maroon hover:text-ivory disabled:opacity-50">
            {applying ? "Applying…" : "Apply"}
          </button>
        </div>
        {couponMsg && <p role="status" className={"mt-2 text-xs " + (applied ? "text-forest" : "text-maroon")}>{couponMsg}</p>}
        <dl className="mt-6 space-y-2.5 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatINR(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-forest"><dt>Discount</dt><dd>− {formatINR(discount)}</dd></div>}
          <div className="flex justify-between"><dt>Shipping</dt><dd>{shipping === 0 ? "Complimentary" : formatINR(shipping)}</dd></div>
          <div className="gold-rule" />
          <div className="flex items-baseline justify-between"><dt>Total</dt><dd className="font-display text-4xl">{formatINR(total)}</dd></div>
        </dl>
        {error && <p role="alert" className="mt-4 rounded-xl bg-maroon/10 p-3 text-xs text-maroon">{error}</p>}
        <button disabled={busy} aria-busy={busy} className="btn-gold mt-6 w-full justify-center disabled:opacity-60">
          <Lock className="h-4 w-4" /> {busy ? "Processing…" : "Pay securely"}
        </button>
        <p className="mt-3 text-center text-[11px] text-espresso/55">UPI · Cards · Netbanking via Razorpay. All taxes included.</p>
      </aside>
    </form>
  );
}
