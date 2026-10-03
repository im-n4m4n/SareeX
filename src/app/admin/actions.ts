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

/** Fallback swatch for a colour line whose hex is missing or malformed. */
const DEFAULT_HEX = "#C9A24B";
const HEX = /^#[0-9a-fA-F]{3,8}$/;
const MAX_COLORS = 24;
const MAX_COLOR_NAME = 40;
const MAX_IMAGES = 12;
const MAX_IMAGE_LENGTH = 500;

/**
 * A positive row id. Number(null) is 0 and Number.isInteger(0) is true, so
 * Number(formData.get("id")) let an empty field target row 0 / NaN.
 */
const idSchema = z.coerce.number().int().positive();

/** Never returns: sends the admin back to the page with a readable ?error= message. */
function fail(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`);
}

/** "" / null / undefined (and blank strings) mean "not supplied", not zero. */
const blankToUndefined = (v: unknown) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "") ? undefined : v;

/** Compare-at price: an empty field must stay null instead of becoming 0. */
const optionalPositiveInt = z.preprocess(blankToUndefined, z.coerce.number().int().positive().optional());

/** Same rule collections already used: a local path (not protocol-relative) or an HTTPS URL. */
const storableImage = (v: string) => !v || (v.startsWith("/") && !v.startsWith("//")) || v.startsWith("https://");
const IMAGE_RULE = "Use a local image path (/images/…) or an HTTPS image URL";

function firstIssue(error: z.ZodError) {
  const issue = error.issues[0];
  const field = issue.path.join(".");
  return field ? field + ": " + issue.message : issue.message;
}

/** Optional positive id: an absent/empty field means "create a new row". */
function optionalId(formData: FormData, path: string, what: string): number | null {
  const raw = formData.get("id");
  if (raw === null || raw === "") return null;
  const parsed = idSchema.safeParse(raw);
  if (!parsed.success) fail(path, "A valid " + what + " id is required.");
  return parsed.data;
}

function requiredId(formData: FormData, path: string, what: string): number {
  const id = optionalId(formData, path, what);
  if (id === null) fail(path, "A valid " + what + " id is required.");
  return id;
}

/** Image list: at least one entry, capped, and every entry must be storable. */
function parseImages(raw: string, path: string): string[] {
  const images = raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!images.length) fail(path, "Add at least one image — the first is the cover.");
  if (images.length > MAX_IMAGES) fail(path, "Use at most " + MAX_IMAGES + " images.");
  const tooLong = images.find((u) => u.length > MAX_IMAGE_LENGTH);
  if (tooLong) fail(path, "Image URLs must be " + MAX_IMAGE_LENGTH + " characters or fewer.");
  const invalid = images.find((u) => !storableImage(u));
  if (invalid) fail(path, "Images: " + IMAGE_RULE + " (offending entry: " + invalid.slice(0, 60) + ")");
  return images.slice(0, MAX_IMAGES);
}

/** "Name:#hex" lines. Empty names are dropped, bad hexes fall back to gold. */
function parseColors(raw: string): { name: string; hex: string }[] {
  return raw
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, MAX_COLORS)
    .map((entry) => {
      const [name = "", hex = ""] = entry.split(":").map((part) => part.trim());
      return { name: name.slice(0, MAX_COLOR_NAME), hex: HEX.test(hex) ? hex : DEFAULT_HEX };
    })
    .filter((color) => color.name.length > 0);
}

/** Postgres unique_violation — drizzle may wrap the driver error, so walk the cause chain. */
function isUniqueViolation(e: unknown, depth = 0): boolean {
  if (typeof e !== "object" || e === null || depth > 3) return false;
  const { code, cause } = e as { code?: unknown; cause?: unknown };
  return code === "23505" || isUniqueViolation(cause, depth + 1);
}

const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().optional(),
  tagline: z.string().trim().default(""),
  description: z.string().trim().default(""),
  story: z.string().trim().default(""),
  price: z.coerce.number().int().min(1),
  compareAtPrice: optionalPositiveInt,
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

const collectionSchema = z.object({
  name: z.string().trim().min(2, "Collection name must have at least two characters").max(100),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(1000).default(""),
  image: z
    .string()
    .trim()
    .refine(storableImage, IMAGE_RULE)
    .optional(),
});

const orderStatusSchema = z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]);

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const rawId = formData.get("id");
  let id: number | null = null;
  if (rawId !== null && rawId !== "") {
    const parsedId = idSchema.safeParse(rawId);
    if (!parsedId.success) fail("/admin/products/new", "A valid product id is required.");
    id = parsedId.data;
  }
  const backTo = "/admin/products/" + (id ?? "new");
  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(backTo, firstIssue(parsed.error));
  const d = parsed.data;
  const colors = parseColors(d.colors);
  const images = parseImages(d.images, backTo);
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
  try {
    if (id !== null) await db.update(products).set(values).where(eq(products.id, id));
    else await db.insert(products).values(values);
  } catch (e) {
    // products.slug is unique: report the clash instead of an unhandled 23505.
    if (isUniqueViolation(e)) fail(backTo, "That slug is already in use — choose a different one.");
    throw e;
  }
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/products", "product");
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/products", "product");
  const stock = z.coerce.number().int().min(0).safeParse(formData.get("stock"));
  if (!stock.success) fail("/admin/products", "Stock must be a whole number of zero or more.");
  await db.update(products).set({ stock: stock.data }).where(eq(products.id, id));
  revalidatePath("/admin/products");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/orders", "order");
  const status = orderStatusSchema.safeParse(formData.get("status"));
  if (!status.success) fail("/admin/orders", "Unknown order status.");
  await db.update(orders).set({ status: status.data }).where(eq(orders.id, id));
  revalidatePath("/admin/orders");
}

export async function saveCoupon(formData: FormData) {
  await requireAdmin();
  const p = z
    .object({
      code: z.string().trim().min(3, "Coupon code must be at least three characters").transform((s) => s.toUpperCase()),
      type: z.enum(["percent", "flat"]),
      value: z.coerce.number().int().min(1, "Discount must be at least one"),
      minOrder: z.preprocess(blankToUndefined, z.coerce.number().int().min(0).default(0)),
    })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) fail("/admin/coupons", firstIssue(p.error));
  await db.insert(coupons).values(p.data).onConflictDoUpdate({ target: coupons.code, set: p.data });
  revalidatePath("/admin/coupons");
}

export async function toggleCoupon(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/coupons", "coupon");
  await db
    .update(coupons)
    .set({ active: formData.get("active") !== "true" })
    .where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/coupons", "coupon");
  await db.delete(coupons).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const p = z
    .object({
      name: z.string().trim().min(2, "Category name must have at least two characters"),
      description: z.string().trim().default(""),
      image: z.string().trim().optional(),
    })
    .safeParse(Object.fromEntries(formData));
  if (!p.success) fail("/admin/categories", firstIssue(p.error));
  const slug = slugify(p.data.name);
  await db
    .insert(categories)
    .values({ slug, name: p.data.name, description: p.data.description, image: p.data.image || null })
    .onConflictDoUpdate({ target: categories.slug, set: { name: p.data.name, description: p.data.description, image: p.data.image || null } });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/categories", "category");
  const [category] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  if (!category) fail("/admin/categories", "That category no longer exists.");
  // Same guard as deleteCollection: products reference categories by slug.
  const [inUse] = await db.select({ id: products.id }).from(products).where(eq(products.category, category.slug)).limit(1);
  if (inUse) fail("/admin/categories", "Move products out of " + category.name + " before deleting this category.");
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/admin/categories");
}

export async function saveCollection(formData: FormData) {
  await requireAdmin();
  const parsed = collectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail("/admin/collections", firstIssue(parsed.error));
  const d = parsed.data;
  const values = { name: d.name, slug: slugify(d.slug || d.name), description: d.description, image: d.image || null, featured: formData.get("featured") === "on" };
  const id = optionalId(formData, "/admin/collections", "collection");
  if (id !== null) await db.update(collections).set(values).where(eq(collections.id, id));
  else await db.insert(collections).values(values).onConflictDoUpdate({ target: collections.slug, set: values });
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  revalidatePath("/");
}

export async function deleteCollection(formData: FormData) {
  await requireAdmin();
  const id = requiredId(formData, "/admin/collections", "collection");
  const [collection] = await db.select().from(collections).where(eq(collections.id, id)).limit(1);
  if (!collection) fail("/admin/collections", "That collection no longer exists.");
  const [hasProducts] = await db.select({ id: products.id }).from(products).where(eq(products.collection, collection.slug)).limit(1);
  if (hasProducts) fail("/admin/collections", "Move products to another collection before deleting this edit.");
  await db.delete(collections).where(eq(collections.id, id));
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
}
