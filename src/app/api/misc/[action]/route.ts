import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews, subscribers, wishlists } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { applyCoupon, getCouponByCode, getProductsByIds } from "@/lib/queries";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/rateLimit";
import { BRAND } from "@/lib/brand";

export const dynamic = "force-dynamic";

/** Recompute the stored aggregate from the review rows. */
const sqlCount = (productId: number) => sql`(select count(*) from reviews where product_id = ${productId})`;
const sqlAvg = (productId: number) =>
  sql`(select round(avg(rating)::numeric, 1)::real from reviews where product_id = ${productId})`;

const nl = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email").max(160) });
const coupon = z.object({ code: z.string().trim().min(2).max(40), subtotal: z.number().int().min(0) });
const review = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).default(""),
  body: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});

export async function GET(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const url = new URL(req.url);
  if (action === "products") {
    const ids = (url.searchParams.get("ids") ?? "")
      .split(",")
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 100);
    return Response.json({ products: await getProductsByIds(ids) });
  }
  if (action === "wishlist") {
    const s = await getSession();
    if (!s) return Response.json({ ids: null });
    const rows = await db.select().from(wishlists).where(eq(wishlists.userId, s.id));
    return Response.json({ ids: rows.map((r) => r.productId) });
  }
  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  if (action === "newsletter") {
    const limited = rateLimit(clientKey(req, "newsletter"), 5, 60 * 60 * 1000);
    if (!limited.ok) return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
    const p = nl.safeParse(body);
    if (!p.success) return Response.json({ error: p.error.issues[0].message }, { status: 400 });
    const inserted = await db.insert(subscribers).values({ email: p.data.email }).onConflictDoNothing().returning();
    if (inserted.length) {
      await sendEmail({ to: p.data.email, subject: "Welcome to " + BRAND.name + " — 10% off your first saree", html: welcomeEmail() });
    }
    return Response.json({ ok: true, code: BRAND.welcomeCoupon });
  }

  if (action === "coupon") {
    const limited = rateLimit(clientKey(req, "coupon"), 40, 10 * 60 * 1000);
    if (!limited.ok) return Response.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
    const p = coupon.safeParse(body);
    if (!p.success) return Response.json({ error: "Invalid code" }, { status: 400 });
    const c = await getCouponByCode(p.data.code);
    if (!c) return Response.json({ error: "This code is not valid" }, { status: 404 });
    const discount = applyCoupon(c, p.data.subtotal);
    if (discount <= 0) {
      return Response.json({ error: "Add " + c.minOrder.toLocaleString("en-IN") + " or more to use this code" }, { status: 400 });
    }
    return Response.json({ code: c.code, discount });
  }

  if (action === "reviews") {
    const limited = rateLimit(clientKey(req, "reviews"), 10, 60 * 60 * 1000);
    if (!limited.ok) return Response.json({ error: "Too many reviews. Try again later." }, { status: 429 });
    const p = review.safeParse(body);
    if (!p.success) return Response.json({ error: p.error.issues[0].message }, { status: 400 });
    const s = await getSession();
    if (!s) return Response.json({ error: "Please sign in to write a review" }, { status: 401 });
    // The review is always attributed to the signed-in account; the previous
    // version accepted an arbitrary name, which allowed impersonation next to
    // the "Verified buyer" label.
    const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, p.data.productId)).limit(1);
    if (!exists) return Response.json({ error: "That piece no longer exists" }, { status: 404 });
    await db.insert(reviews).values({
      productId: p.data.productId,
      userId: s.id,
      name: s.name,
      rating: p.data.rating,
      title: p.data.title,
      body: p.data.body,
    });
    await db
      .update(products)
      .set({
        reviewCount: sqlCount(p.data.productId),
        rating: sqlAvg(p.data.productId),
      })
      .where(eq(products.id, p.data.productId));
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function PUT(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action !== "wishlist") return Response.json({ error: "Not found" }, { status: 404 });
  const s = await getSession();
  if (!s) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const ids = z.array(z.number().int().positive()).max(200).safeParse((await req.json().catch(() => ({}))).ids);
  if (!ids.success) return Response.json({ error: "Invalid" }, { status: 400 });
  // A newer request may already have replaced the list; only the latest wins.
  const limited = rateLimit("wishlist:" + s.id, 60, 10 * 60 * 1000);
  if (!limited.ok) return Response.json({ error: "Too many updates" }, { status: 429 });
  const unique = Array.from(new Set(ids.data));
  await db.delete(wishlists).where(eq(wishlists.userId, s.id));
  if (unique.length) {
    await db
      .insert(wishlists)
      .values(unique.map((productId) => ({ userId: s.id, productId })))
      .onConflictDoNothing();
  }
  return Response.json({ ok: true });
}
