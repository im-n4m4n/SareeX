export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatINR(n: number) {
  return "₹\u00A0" + n.toLocaleString("en-IN");
}

export const SHIPPING_FREE_ABOVE = 5000;
export const SHIPPING_FLAT = 199;

export function shippingFor(subtotal: number) {
  return subtotal === 0 || subtotal >= SHIPPING_FREE_ABOVE ? 0 : SHIPPING_FLAT;
}

export function discountPercent(price: number, compare?: number | null) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
