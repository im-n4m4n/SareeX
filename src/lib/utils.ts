export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatINR(n: number) {
  return "\u20B9\u00A0" + n.toLocaleString("en-IN");
}

/** Free-shipping threshold. Single source of truth — all copy interpolates it. */
export const SHIPPING_FREE_ABOVE = 5000;
export const SHIPPING_FLAT = 199;

/**
 * Shipping is decided on the amount the customer actually pays for goods.
 * The cart, the checkout form and the checkout API must all pass the same
 * figure, or the bag quotes a different total than the order.
 */
export function shippingFor(goodsTotal: number) {
  return goodsTotal <= 0 || goodsTotal >= SHIPPING_FREE_ABOVE ? 0 : SHIPPING_FLAT;
}

/** Prose form of the shipping rule, derived from the constants above. */
export const SHIPPING_SUMMARY =
  "Complimentary shipping across India on orders of " +
  formatINR(SHIPPING_FREE_ABOVE) +
  " or more; " +
  formatINR(SHIPPING_FLAT) +
  " otherwise.";

export function discountPercent(price: number, compare?: number | null) {
  if (!compare || compare <= price) return 0;
  return Math.round(((compare - price) / compare) * 100);
}

// Trailing slashes stripped so SITE_URL + "/shop" cannot produce a double slash.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/[/]+$/, "");

/** Default cover used wherever a nullable image column is rendered. */
export const FALLBACK_IMAGE = "/images/m02.jpg";

/** Empty strings are not "no image" — the browser would re-request the page. */
export function coverImage(url?: string | null, fallback: string = FALLBACK_IMAGE) {
  const v = typeof url === "string" ? url.trim() : "";
  return v ? v : fallback;
}

/**
 * Guard for post-login redirect targets. A bare startsWith("/") also accepts
 * "//evil.com", which the App Router treats as cross-origin.
 */
export function safeNextPath(value?: string | null): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith("/")) return undefined;
  if (value.startsWith("//") || value.startsWith("/\\")) return undefined;
  return value;
}

/** "Six", "Nine", … for copy that must not contradict admin-editable counts. */
const NUMBER_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve"];
export const countWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
