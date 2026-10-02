"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { categories, collections, coupons, orders, products } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  tagline: z.string().trim().default(""),
  description: z.string().trim().default(""),
  story: z.string().trim().default(""),
  price: z.coerce.number().int().min(1),
  compareAtPrice: z.coerce.number().int().optional().or(z.literal("").transform(() => undefined)),
  category: z.string().min(1),
  weave: z.string().min(1),
  fabric: z.string().trim().min(1),
  occasion: z.string().min(1),
  collection: z.string().optional(),
  work: z.string().trim().default(""),
  blouse: z.string().trim().default("Unstitched (0.8 m)"),
  length: z.string().trim().default("5.5 m (with blouse piece)"),
  care: z.string().trim().default("Dry clean only"),
  colors: z.string().default(""),
  images: z.string().default(""),
  stock: z.coerce.number().int().min(0),
  badge: z.string().trim().optional(),
});

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const raw = Object.fromEntries(formData);
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    redirect(`/admin/products/${raw.id || "new"}?error=${encodeURIComponent(parsed.error.issues[0].path.join(".") + ": " + parsed.error.issues[0].message)}`);
  }
  const d = parsed.data;
  const colors = d.colors
    .split(/[\n,]/)
    .map((c) => c.trim())
    .filter(Boolean)
    .map((c) => {
      const [name, hex] = c.split(":").map((x) => x.trim());
      return { name, hex: hex?.startsWith("#") ? hex : "#C9A24B" };
    });
  const images = d.images.split("\n").map((s) => s.trim()).filter(Boolean);
  const values = {
    name: d.name,
    slug: slugify(d.slug || d.name),
    tagline: d.tagline,
    description: d.description,
    story: d.story,
    price: d.price,
    compareAtPrice: d.compareAtPrice ?? null,
    category: d.category,
    weave: d.weave,
    fabric: d.fabric,
    occasion: d.occasion,
    collection: d.collection || null,
    work: d.work,
    blouse: d.blouse,
    length: d.length,
    care: d.care,
    colors,
    images,
    stock: d.stock,
    badge: d.badge || null,
    isNew: formData.get("isNew") === "on",
    featured: formData.get("featured") === "on",
  };
  const id = Number(raw.id);
  if (id) await db.update(products).set(values).where(eq(products.id, id));
  else await db.insert(products).values(values);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, Number(formData.get("id"))));
  revalidatePath("/admin/products");
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const stock = z.coerce.number().int().min(0).safeParse(formData.get("stock"));
  if (!stock.success) return;
  await db.update(products).set({ stock: stock.data }).where(eq(products.id, Number(formData.get("id"))));
  revalidatePath("/admin/products");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const status = z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).safeParse(formData.get("status"));
  if (!status.success) return;
  await db.update(orders).set({ status: status.data }).where(eq(orders.id, Number(formData.get("id"))));
  revalidatePath("/admin/orders");
}

export async function saveCoupon(formData: FormData) {
  await requireAdmin();
  const p = z
    .object({
      code: z.string().trim().min(3).transform((s) => s.toUpperCase()),
      type: z.enum(["percent", "flat"]),
      value: z.coerce.number().int().min(1),
      minOrder: z.coerce.number().int().min(0).default(0),
    })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  await db.insert(coupons).values(p.data).onConflictDoUpdate({ target: coupons.code, set: p.data });
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await db.update(coupons).set({ active: formData.get("active") !== "true" }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin();
  await db.delete(coupons).where(eq(coupons.id, Number(formData.get("id"))));
  revalidatePath("/admin/coupons");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const p = z
    .object({ name: z.string().trim().min(2), description: z.string().trim().default(""), image: z.string().trim().optional() })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) return;
  const slug = slugify(p.data.name);
  await db
    .insert(categories)
    .values({ slug, name: p.data.name, description: p.data.description, image: p.data.image || null })
    .onConflictDoUpdate({ target: categories.slug, set: { name: p.data.name, description: p.data.description, image: p.data.image || null } });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, Number(formData.get("id"))));
  revalidatePath("/admin/categories");
}

const collectionSchema = z.object({
  name: z.string().trim().min(2, "Collection name must have at least two characters").max(100),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(1000).default(""),
  image: z.string().trim().refine((v) => !v || (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//.test(v), "Use a local image path or an HTTPS image URL").optional(),
});

export async function saveCollection(formData: FormData) {
  await requireAdmin();
  const parsed = collectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) redirect(`/admin/collections?error=${encodeURIComponent(parsed.error.issues[0].message)}`);
  const d = parsed.data;
  const values = { name: d.name, slug: slugify(d.slug || d.name), description: d.description, image: d.image || null, featured: formData.get("featured") === "on" };
  const id = Number(formData.get("id"));
  if (Number.isInteger(id) && id > 0) await db.update(collections).set(values).where(eq(collections.id, id));
  else await db.insert(collections).values(values).onConflictDoUpdate({ target: collections.slug, set: values });
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  revalidatePath("/");
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin();
  const id = z.coerce.number().int().positive().safeParse(formData.get("id"));
  if (!id.success) return;
  const [collection] = await db.select().from(collections).where(eq(collections.id, id.data)).limit(1);
  if (!collection) return;
  const [hasProducts] = await db.select({ id: products.id }).from(products).where(eq(products.collection, collection.slug)).limit(1);
  if (hasProducts) redirect("/admin/collections?error=Move%20products%20to%20another%20collection%20before%20deleting%20this%20edit.");
  await db.delete(collections).where(eq(collections.id, id.data));
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}
