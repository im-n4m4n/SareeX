import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { subscribers, reviews, products, wishlists } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { applyCoupon, getCouponByCode, getProductsByIds } from "@/lib/queries";
import { sendEmail, welcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

const nl = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email") });
const coupon = z.object({ code: z.string().min(2), subtotal: z.number().int().min(0) });
const review = z.object({
  productId: z.number().int(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).default(""),
  body: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
  name: z.string().trim().min(2).max(60).optional(),
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
    const p = nl.safeParse(body);
    if (!p.success) return Response.json({ error: p.error.issues[0].message }, { status: 400 });
    const inserted = await db.insert(subscribers).values({ email: p.data.email }).onConflictDoNothing().returning();
    if (inserted.length) {
      await sendEmail({ to: p.data.email, subject: "Welcome to Elite Weavers — 10% off your first saree", html: welcomeEmail() });
    }
    return Response.json({ ok: true, code: "ELITE10" });
  }

  if (action === "coupon") {
    const p = coupon.safeParse(body);
    if (!p.success) return Response.json({ error: "Invalid code" }, { status: 400 });
    const c = await getCouponByCode(p.data.code);
    if (!c) return Response.json({ error: "This code is not valid" }, { status: 404 });
    const discount = applyCoupon(c, p.data.subtotal);
    if (discount <= 0) {
      return Response.json({ error: `Add ₹${c.minOrder.toLocaleString("en-IN")} or more to use this code` }, { status: 400 });
    }
    return Response.json({ code: c.code, discount });
  }

  if (action === "reviews") {
    const p = review.safeParse(body);
    if (!p.success) return Response.json({ error: p.error.issues[0].message }, { status: 400 });
    const s = await getSession();
    if (!s) return Response.json({ error: "Please sign in to write a review" }, { status: 401 });
    await db.insert(reviews).values({
      productId: p.data.productId,
      userId: s.id,
      name: p.data.name ?? s.name,
      rating: p.data.rating,
      title: p.data.title,
      body: p.data.body,
    });
    await db
      .update(products)
      .set({
        reviewCount: sql`(select count(*) from reviews where product_id = ${p.data.productId})`,
        rating: sql`(select round(avg(rating)::numeric, 1)::real from reviews where product_id = ${p.data.productId})`,
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
  const ids = z.array(z.number().int()).max(200).safeParse((await req.json().catch(() => ({}))).ids);
  if (!ids.success) return Response.json({ error: "Invalid" }, { status: 400 });
  await db.delete(wishlists).where(eq(wishlists.userId, s.id));
  if (ids.data.length) {
    await db
      .insert(wishlists)
      .values(ids.data.map((productId) => ({ userId: s.id, productId })))
      .onConflictDoNothing();
  }
  void and;
  return Response.json({ ok: true });
}
