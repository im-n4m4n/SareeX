import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses } from "@/db/schema";
import { getSession } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";
import { CONTAINER_NARROW, PAGE_TOP } from "@/lib/layout";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const s = await getSession();
  let prefill = { name: "", email: "", phone: "", address: null as Record<string, string> | null };
  if (s) {
    const [a] = await db.select().from(addresses).where(eq(addresses.userId, s.id)).orderBy(desc(addresses.isDefault)).limit(1);
    prefill = {
      name: a?.fullName ?? s.name,
      email: s.email,
      phone: a?.phone ?? "",
      // fullName and phone were dropped before, so the customer retyped them.
      address: a
        ? { line1: a.line1, line2: a.line2 ?? "", city: a.city, state: a.state, pincode: a.pincode, country: a.country }
        : null,
    };
  }
  return (
    <div className={CONTAINER_NARROW + " " + PAGE_TOP + " pb-10"}>
      <p className="overline text-maroon">Secure checkout</p>
      <h1 className="font-display mt-2 text-6xl">Almost yours.</h1>
      <div className="gold-rule mt-6" />
      <CheckoutForm prefill={prefill} />
    </div>
  );
}
