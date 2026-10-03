import { cache } from "react";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import {
  products,
  weaves,
  occasions,
  collections,
  categories,
  reviews,
  orders,
  orderItems,
  coupons,
  type Product,
} from "@/db/schema";
import { and, asc, count, desc, eq, gte, ilike, inArray, lt, or, sql, type SQL } from "drizzle-orm";

export type ProductFilters = {
  q?: string;
  weave?: string;
  occasion?: string;
  category?: string;
  collection?: string;
  color?: string;
  fabric?: string;
  min?: number;
  max?: number;
  sort?: string;
  isNew?: boolean;
  featured?: boolean;
  limit?: number;
};

export async function listProducts(f: ProductFilters = {}): Promise<Product[]> {
  await ensureSeed();
  const where: SQL[] = [];
  if (f.q) {
    const like = "%" + f.q + "%";
    where.push(
      or(
        ilike(products.name, like),
        ilike(products.weave, like),
        ilike(products.fabric, like),
        ilike(products.description, like),
        ilike(products.occasion, like),
        ilike(products.category, like),
        ilike(products.collection, like),
      )!,
    );
  }
  if (f.weave) where.push(eq(products.weave, f.weave));
  if (f.occasion) where.push(eq(products.occasion, f.occasion));
  if (f.category) where.push(eq(products.category, f.category));
  if (f.collection) where.push(eq(products.collection, f.collection));
  if (f.fabric) where.push(ilike(products.fabric, "%" + f.fabric + "%"));
  if (f.color) where.push(sql`${products.colors}::text ilike ${"%" + f.color + "%"}`);
  if (f.min !== undefined) where.push(gte(products.price, f.min));
  // Exclusive upper bound: with lte a product priced exactly on a bucket edge
  // matched two price filters at once.
  if (f.max !== undefined) where.push(lt(products.price, f.max));
  if (f.isNew) where.push(eq(products.isNew, true));
  if (f.featured) where.push(eq(products.featured, true));

  const order =
    f.sort === "price-asc"
      ? asc(products.price)
      : f.sort === "price-desc"
        ? desc(products.price)
        : f.sort === "newest"
          ? desc(products.createdAt)
          : desc(products.reviewCount);

  const q = db
    .select()
    .from(products)
    .where(where.length ? and(...where) : undefined)
    .orderBy(order, f.sort === "newest" ? desc(products.id) : asc(products.id));
  return f.limit ? q.limit(f.limit) : q;
}

/**
 * Request-scoped memoisation: generateMetadata and the page body both resolve
 * the same product, and the (site) layout plus the route both resolve facets.
 * Without cache() that was two identical round-trips per render.
 */
export const getProduct = cache(async (slug: string) => {
  await ensureSeed();
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return p ?? null;
});

export async function getProductsByIds(ids: number[]) {
  const wanted = Array.from(new Set(ids.filter((n) => Number.isInteger(n) && n > 0)));
  if (!wanted.length) return [];
  await ensureSeed();
  const rows = await db.select().from(products).where(inArray(products.id, wanted));
  // Preserve the caller's order (wishlist order) instead of the DB's.
  return wanted.map((id) => rows.find((r) => r.id === id)).filter((p): p is Product => !!p);
}

export const getFacets = cache(async () => {
  await ensureSeed();
  const [w, o, col, cat, fabrics, categoryCounts, collectionCounts] = await Promise.all([
    db.select().from(weaves).orderBy(asc(weaves.id)),
    db.select().from(occasions).orderBy(asc(occasions.id)),
    db.select().from(collections).orderBy(asc(collections.id)),
    db.select().from(categories).orderBy(asc(categories.id)),
    db.selectDistinct({ fabric: products.fabric }).from(products).orderBy(asc(products.fabric)),
    db.select({ slug: products.category, total: count() }).from(products).groupBy(products.category),
    db.select({ slug: products.collection, total: count() }).from(products).groupBy(products.collection),
  ]);
  return {
    weaves: w,
    occasions: o,
    collections: col.map((c) => ({ ...c, pieceCount: collectionCounts.find((n) => n.slug === c.slug)?.total ?? 0 })),
    categories: cat.map((c) => ({ ...c, pieceCount: categoryCounts.find((n) => n.slug === c.slug)?.total ?? 0 })),
    fabrics: fabrics.map((f) => f.fabric),
  };
});

export const getProductReviews = cache(async (productId: number) => {
  return db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
});

export async function getOrderByNumber(number: string) {
  const [o] = await db.select().from(orders).where(eq(orders.number, number)).limit(1);
  if (!o) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
  return { order: o, items };
}

export async function getCouponByCode(code: string) {
  await ensureSeed();
  const [c] = await db.select().from(coupons).where(eq(coupons.code, code.trim().toUpperCase())).limit(1);
  return c && c.active ? c : null;
}

export function applyCoupon(c: { type: string; value: number; minOrder: number }, subtotal: number) {
  if (subtotal < c.minOrder) return 0;
  const d = c.type === "percent" ? Math.round((subtotal * c.value) / 100) : c.value;
  return Math.min(d, subtotal);
}
