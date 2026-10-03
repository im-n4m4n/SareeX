import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products, coupons } from "@/db/schema";
import { sendEmail, orderEmail } from "./email";

/**
 * Marks an order paid, decrements stock, counts the coupon and emails the
 * customer — exactly once.
 *
 * The status flip is a single conditional UPDATE, so two concurrent callers
 * (the Razorpay webhook and the client-side verify route) cannot both pass the
 * guard. The loser falls through and returns the existing row untouched.
 */
export async function finalizeOrder(orderId: number, paymentId?: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;

  const [claimed] = await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      status: "confirmed",
      razorpayPaymentId: paymentId ?? order.razorpayPaymentId,
    })
    .where(and(eq(orders.id, orderId), ne(orders.paymentStatus, "paid")))
    .returning();

  // Already finalised, or claimed by the concurrent caller: nothing more to do.
  if (!claimed) return order;

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
    subject: "Your Elite Weavers order " + order.number + " is confirmed",
    html: orderEmail(order, items),
  });
  return claimed;
}

export function newOrderNumber() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return "EW-" + Date.now().toString().slice(-6) + rand;
}
