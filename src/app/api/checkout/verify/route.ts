import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { finalizeOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

const schema = z.object({
  number: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Invalid payload" }, { status: 400 });
  const d = parsed.data;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return Response.json({ error: "Payments not configured" }, { status: 500 });

  const expected = createHmac("sha256", secret).update(`${d.razorpay_order_id}|${d.razorpay_payment_id}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(d.razorpay_signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Signature mismatch" }, { status: 400 });
  }
  const [order] = await db.select().from(orders).where(eq(orders.number, d.number)).limit(1);
  if (!order || order.razorpayOrderId !== d.razorpay_order_id) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  await finalizeOrder(order.id, d.razorpay_payment_id);
  return Response.json({ ok: true });
}
