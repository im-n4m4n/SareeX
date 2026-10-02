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
}

export async function deleteAddress(formData: FormData) {
  const s = await requireUser();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return;
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, s.id)));
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
