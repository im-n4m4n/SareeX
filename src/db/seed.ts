import bcrypt from "bcryptjs";
import { db } from "./index";
import { products, categories, weaves, occasions, collections, coupons, users, reviews, orderItems, orders } from "./schema";
import { eq, sql } from "drizzle-orm";
import { seedProducts, seedCategories, seedWeaves, seedOccasions, seedCollections, seedCoupons, seedReviews } from "./seed-data";
import { extraProducts, extraCategories, extraCollections, extraWeaves } from "./catalogue-expansion";

/**
 * Four catalogue images were referenced before they existed in public/images.
 * The seed is additive, so fixing the source file does not repair a database
 * that was already seeded — those rows would keep rendering broken covers
 * forever. Repoint them in place. Idempotent: it only matches the dead paths,
 * so it is a no-op once applied.
 */
const IMAGE_REPAIRS: Record<string, string> = {
  "/images/dupatta-edit.jpg": "/images/m12.jpg",
  "/images/blouse-edit.jpg": "/images/m05.jpg",
  "/images/kurta-edit.jpg": "/images/m13.jpg",
  "/images/shawl-edit.jpg": "/images/m04.jpg",
};

async function repairLegacyImagePaths() {
  for (const [broken, replacement] of Object.entries(IMAGE_REPAIRS)) {
    await db.update(categories).set({ image: replacement }).where(eq(categories.image, broken));
    await db.update(collections).set({ image: replacement }).where(eq(collections.image, broken));
    await db.update(weaves).set({ image: replacement }).where(eq(weaves.image, broken));
    const affected = await db
      .select({ id: products.id, images: products.images })
      .from(products)
      .where(sql`${products.images}::text like ${'%' + broken + '%'}`);
    for (const p of affected) {
      if (!p.images.includes(broken)) continue;
      await db
        .update(products)
        .set({ images: p.images.map((i) => (i === broken ? replacement : i)) })
        .where(eq(products.id, p.id));
    }
  }
}

/** Additive, idempotent seed: existing products, inventory, and orders are never overwritten. */
export async function seedDatabase(force = false, strict = false) {
  if (force) {
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(reviews);
    await db.delete(products);
    await db.delete(categories);
    await db.delete(weaves);
    await db.delete(occasions);
    await db.delete(collections);
    await db.delete(coupons);
  }

  await db.insert(categories).values([...seedCategories, ...extraCategories]).onConflictDoNothing();
  await db.insert(weaves).values([...seedWeaves, ...extraWeaves]).onConflictDoNothing();
  await db.insert(occasions).values(seedOccasions).onConflictDoNothing();
  await db.insert(collections).values([...seedCollections, ...extraCollections]).onConflictDoNothing();
  await db.insert(coupons).values(seedCoupons).onConflictDoNothing();

  await repairLegacyImagePaths();

  const inserted = await db.insert(products).values([...seedProducts, ...extraProducts]).onConflictDoNothing().returning({ id: products.id });
  // Example reviews are seeded only when a product is newly inserted.
  if (inserted.length) {
    await db.insert(reviews).values(inserted.slice(0, 4).flatMap((p) => seedReviews.map((r) => ({ ...r, productId: p.id }))));
  }

  const email = "admin@eliteweavers.in";
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!admin) {
    const configured = (process.env.SEED_ADMIN_PASSWORD ?? "").trim();
    // An empty value used to fall back to "admin123" silently. In production
    // that is a known-password administrator, so refuse instead.
    if (!configured && process.env.NODE_ENV === "production") {
      // Fail the explicit seed script loudly, but do not take the storefront
      // down on every request: log and skip creating a known-password admin.
      if (strict) throw new Error("SEED_ADMIN_PASSWORD must be set before the first production seed");
      console.error(
        "[seed] SEED_ADMIN_PASSWORD is not set; skipping demo admin creation. " +
          "Run the seed script with the variable set to create one.",
      );
      return;
    }
    await db.insert(users).values({
      email,
      name: "Elite Weavers Admin",
      passwordHash: await bcrypt.hash(configured || "admin123", 10),
      role: "admin",
    }).onConflictDoNothing();
  }
}

let seeding: Promise<void> | null = null;
/** Run the additive catalogue upgrade once per server process, including on existing databases. */
export function ensureSeed(): Promise<void> {
  if (!seeding) {
    seeding = seedDatabase().catch((e) => {
      seeding = null;
      throw e;
    });
  }
  return seeding;
}
