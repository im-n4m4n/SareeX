"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { addresses, users } from "@/db/schema";
import { createSession, requireUser } from "@/lib/auth";

const addressSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(7),
  line1: z.string().trim().min(4),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().min(4),
  country: z.string().trim().min(2).default("India"),
});

export async function addAddress(formData: FormData) {
  const s = await requireUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const existing = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, s.id));
  await db.insert(addresses).values({ ...parsed.data, userId: s.id, isDefault: existing.length === 0 });
  revalidatePath("/account");
  // /checkout prefills from the newest default address.
  revalidatePath("/checkout");
}

const positiveId = (value: FormDataEntryValue | null) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export async function deleteAddress(formData: FormData) {
  const s = await requireUser();
  // Number(null) is 0 and Number.isInteger(0) is true, so the old guard let a
  // missing id through and queried id 0.
  const id = positiveId(formData.get("id"));
  if (id === null) return;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, s.id)));
  // Keep exactly one default address when the current default is removed.
  const remaining = await db.select().from(addresses).where(eq(addresses.userId, s.id));
  if (remaining.length && !remaining.some((a) => a.isDefault)) {
    await db.update(addresses).set({ isDefault: true }).where(eq(addresses.id, remaining[0].id));
  }
  revalidatePath("/account");
}

export async function updateProfile(formData: FormData) {
  const s = await requireUser();
  const parsed = z
    .object({ name: z.string().trim().min(2), phone: z.string().trim().optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db.update(users).set({ name: parsed.data.name, phone: parsed.data.phone || null }).where(eq(users.id, s.id));
  await createSession({ ...s, name: parsed.data.name });
  revalidatePath("/account");
}
