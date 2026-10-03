import { createHmac, timingSafeEqual } from "crypto";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { finalizeOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook not configured" }, { status: 503 });

  const raw = await req.text();
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(raw) as {
    event: string;
    payload?: { payment?: { entity?: { id: string; order_id: string } } };
  };
  const pay = event.payload?.payment?.entity;
  if (pay && (event.event === "payment.captured" || event.event === "order.paid")) {
    const [order] = await db.select().from(orders).where(eq(orders.razorpayOrderId, pay.order_id)).limit(1);
    if (order) await finalizeOrder(order.id, pay.id);
  }
  if (pay && event.event === "payment.failed") {
    // Never regress an order that has already been paid.
    await db
      .update(orders)
      .set({ paymentStatus: "failed" })
      .where(and(eq(orders.razorpayOrderId, pay.order_id), ne(orders.paymentStatus, "paid")));
  }
  return Response.json({ ok: true });
}
