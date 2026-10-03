import { cookies } from "next/headers";
import { z } from "zod";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { applyCoupon, getCouponByCode } from "@/lib/queries";
import { finalizeOrder, newOrderNumber } from "@/lib/orders";
import { shippingFor } from "@/lib/utils";
import { RECENT_ORDERS_COOKIE, withRecentOrder } from "@/lib/orderAccess";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  fullName: z.string().trim().min(2, "Enter your full name"),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{7,15}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(4, "Enter your address"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "Enter your city"),
  state: z.string().trim().min(2, "Enter your state"),
  pincode: z.string().trim().min(4, "Enter a valid PIN / ZIP").max(10),
  country: z.string().trim().min(2).default("India"),
  coupon: z.string().trim().optional(),
  items: z
    .array(z.object({ productId: z.number().int(), quantity: z.number().int().min(1).max(20), color: z.string().optional() }))
    .min(1, "Your bag is empty"),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const d = parsed.data;

  // The same product can appear as several lines (different colours), so stock
  // must be checked against the summed quantity per product or two lines of 5
  // both pass a stock of 5 and oversell.
  const wanted = new Map<number, number>();
  for (const i of d.items) wanted.set(i.productId, (wanted.get(i.productId) ?? 0) + i.quantity);

  const rows = await db.select().from(products).where(inArray(products.id, Array.from(wanted.keys())));
  if (rows.length !== wanted.size) {
    return Response.json({ error: "An item in your bag is no longer available" }, { status: 400 });
  }
  for (const p of rows) {
    const qty = wanted.get(p.id) ?? 0;
    if (p.stock < qty) return Response.json({ error: "Only " + p.stock + " left of " + p.name }, { status: 400 });
  }
  const lines = d.items.map((i) => {
    const p = rows.find((r) => r.id === i.productId)!;
    return { p, quantity: i.quantity, color: i.color };
  });

  const subtotal = lines.reduce((n, l) => n + l.p.price * l.quantity, 0);
  let discount = 0;
  let couponCode: string | null = null;
  if (d.coupon) {
    const c = await getCouponByCode(d.coupon);
    if (c) {
      discount = applyCoupon(c, subtotal);
      if (discount > 0) couponCode = c.code;
    }
  }
  // Shipping is decided on the goods value, so a coupon can never push an order
  // below the advertised free-shipping threshold. Matches the cart page.
  const shipping = shippingFor(subtotal);
  const total = subtotal - discount + shipping;
  const session = await getSession();
  const number = newOrderNumber();

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  let razorpayOrderId: string | null = null;
  if (keyId && keySecret) {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + Buffer.from(keyId + ":" + keySecret).toString("base64"),
      },
      body: JSON.stringify({ amount: total * 100, currency: "INR", receipt: number }),
    });
    if (!res.ok) return Response.json({ error: "Could not start payment. Please try again." }, { status: 502 });
    razorpayOrderId = ((await res.json()) as { id: string }).id;
  }

  const [order] = await db
    .insert(orders)
    .values({
      number,
      userId: session?.id ?? null,
      email: d.email,
      name: d.fullName,
      phone: d.phone,
      shippingAddress: {
        fullName: d.fullName,
        phone: d.phone,
        line1: d.line1,
        line2: d.line2,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        country: d.country,
      },
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      razorpayOrderId,
      paymentMethod: razorpayOrderId ? "razorpay" : "demo",
    })
    .returning();

  await db.insert(orderItems).values(
    lines.map((l) => ({
      orderId: order.id,
      productId: l.p.id,
      name: l.p.name,
      image: l.p.images[0] ?? null,
      price: l.p.price,
      quantity: l.quantity,
      color: l.color ?? null,
    })),
  );

  // Proof of ownership for the confirmation page (works for guests too).
  const jar = await cookies();
  jar.set(RECENT_ORDERS_COOKIE, withRecentOrder(jar.get(RECENT_ORDERS_COOKIE)?.value, number).join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  if (!razorpayOrderId) {
    await finalizeOrder(order.id);
    return Response.json({ mode: "demo", number });
  }
  return Response.json({
    mode: "razorpay",
    number,
    razorpay: {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? keyId,
      orderId: razorpayOrderId,
      amount: total * 100,
      name: d.fullName,
      email: d.email,
      phone: d.phone,
    },
  });
}
