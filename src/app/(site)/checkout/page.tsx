import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const s = await getSession();
  let address: Record<string, string> | null = null;
  if (s) {
    const [a] = await db.select().from(addresses).where(eq(addresses.userId, s.id)).orderBy(desc(addresses.isDefault)).limit(1);
    if (a) address = { line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode };
  }
  return (
    <div className="mx-auto max-w-[1200px] px-5 pb-10 pt-36 md:px-10">
      <p className="overline text-maroon">Secure checkout</p>
      <h1 className="font-display mt-2 text-6xl">Almost yours.</h1>
      <div className="gold-rule mt-6" />
      <CheckoutForm prefill={{ name: s?.name ?? "", email: s?.email ?? "", address }} />
    </div>
  );
}
