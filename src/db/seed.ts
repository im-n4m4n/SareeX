import bcrypt from "bcryptjs";
import { db } from "./index";
import { products, categories, weaves, occasions, collections, coupons, users, reviews, orderItems, orders } from "./schema";
import { eq } from "drizzle-orm";
import { seedProducts, seedCategories, seedWeaves, seedOccasions, seedCollections, seedCoupons, seedReviews } from "./seed-data";
import { extraProducts, extraCategories, extraCollections, extraWeaves } from "./catalogue-expansion";

/** Additive, idempotent seed: existing products, inventory, and orders are never overwritten. */
export async function seedDatabase(force = false) {
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

  const inserted = await db.insert(products).values([...seedProducts, ...extraProducts]).onConflictDoNothing().returning({ id: products.id });
  // Example reviews are seeded only when a product is newly inserted.
  if (inserted.length) {
    await db.insert(reviews).values(inserted.slice(0, 4).flatMap((p) => seedReviews.map((r) => ({ ...r, productId: p.id }))));
  }

  const email = "admin@eliteweavers.in";
  const [admin] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (!admin) {
    await db.insert(users).values({
      email,
      name: "Elite Weavers Admin",
      passwordHash: await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || "admin123", 10),
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
