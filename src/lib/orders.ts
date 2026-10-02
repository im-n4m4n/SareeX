import { db } from "@/db";
import { orders, orderItems, products, coupons } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { sendEmail, orderEmail } from "./email";

/** Idempotently marks an order as paid, decrements stock, emails the customer. */
export async function finalizeOrder(orderId: number, paymentId?: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || order.paymentStatus === "paid") return order ?? null;

  await db
    .update(orders)
    .set({ paymentStatus: "paid", status: "confirmed", razorpayPaymentId: paymentId ?? order.razorpayPaymentId })
    .where(eq(orders.id, orderId));

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const i of items) {
    await db
      .update(products)
      .set({ stock: sql`GREATEST(${products.stock} - ${i.quantity}, 0)` })
      .where(eq(products.id, i.productId));
  }
  if (order.couponCode) {
    await db
      .update(coupons)
      .set({ usageCount: sql`${coupons.usageCount} + 1` })
      .where(eq(coupons.code, order.couponCode));
  }

  await sendEmail({
    to: order.email,
    subject: `Your Elite Weavers order ${order.number} is confirmed`,
    html: orderEmail(order, items),
  });
  return order;
}

export function newOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `EW-${Date.now().toString().slice(-6)}${rand}`;
}
