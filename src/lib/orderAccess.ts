import { cookies } from "next/headers";

/**
 * Guests must be able to see the confirmation page straight after checkout,
 * but an order number alone must not expose name, email, phone and address to
 * anyone who happens to hold the URL.
 *
 * At checkout the order number is written into a short-lived, httpOnly cookie
 * (proof that this browser placed the order). Access is then granted to:
 *   - an administrator, who needs /order/[number] from the admin console,
 *   - the signed-in owner of the order,
 *   - the browser that placed it (cookie).
 */
export const RECENT_ORDERS_COOKIE = "ew_recent_orders";
const MAX_REMEMBERED = 6;

export function parseRecentOrders(raw?: string | null): string[] {
  return (raw ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function withRecentOrder(raw: string | undefined, number: string): string[] {
  const next = [number, ...parseRecentOrders(raw).filter((n) => n !== number)];
  return next.slice(0, MAX_REMEMBERED);
}

export async function canViewOrder(
  order: { number: string; userId: number | null },
  session: { id: number; role: string } | null,
): Promise<boolean> {
  if (session) {
    if (session.role === "admin") return true;
    if (order.userId !== null && order.userId === session.id) return true;
  }
  const jar = await cookies();
  return parseRecentOrders(jar.get(RECENT_ORDERS_COOKIE)?.value).includes(order.number);
}
