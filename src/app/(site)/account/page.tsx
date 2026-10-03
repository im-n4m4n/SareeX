import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses, orders, users } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { cn, formatINR } from "@/lib/utils";
import { CONTAINER_NARROW, PAGE_TOP } from "@/lib/layout";
import { WishlistGrid, LogoutButton } from "@/components/AccountClient";
import { addAddress, deleteAddress, updateProfile } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Account", robots: { index: false } };

const tabs = [
  ["orders", "Orders"],
  ["wishlist", "Wishlist"],
  ["addresses", "Addresses"],
  ["profile", "Profile"],
] as const;

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const s = await requireUser();
  // An unknown tab value used to render an empty page with no active tab.
  const requested = (await searchParams).tab;
  const tab = tabs.some(([k]) => k === requested) ? (requested as string) : "orders";
  const [user] = await db.select().from(users).where(eq(users.id, s.id)).limit(1);
  const myOrders = tab === "orders" ? await db.select().from(orders).where(eq(orders.userId, s.id)).orderBy(desc(orders.createdAt)) : [];
  const myAddresses = tab === "addresses" ? await db.select().from(addresses).where(eq(addresses.userId, s.id)) : [];

  return (
    <div className={CONTAINER_NARROW + " " + PAGE_TOP + " pb-10"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="overline text-maroon">Namaste</p>
          <h1 className="font-display mt-2 text-6xl">{s.name.split(" ")[0]}&apos;s Atelier</h1>
        </div>
        <div className="flex gap-3">
          {s.role === "admin" && <Link href="/admin" className="btn-gold">Admin dashboard</Link>}
          <LogoutButton />
        </div>
      </div>
      <nav className="no-scrollbar mt-8 flex gap-2 overflow-x-auto border-b border-gold/30" aria-label="Account sections">
        {tabs.map(([k, l]) => (
          <Link key={k} href={`/account?tab=${k}`} aria-current={tab === k ? "page" : undefined} className={cn("relative whitespace-nowrap px-5 pb-3 text-sm", tab === k ? "text-espresso" : "text-espresso/50")}>
            {l}
            {tab === k && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-gold" />}
          </Link>
        ))}
      </nav>

      <div className="mt-10">
        {tab === "orders" && (
          myOrders.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-3xl">No orders yet.</p>
              <Link href="/shop" className="btn-maroon mt-5">Begin your collection</Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {myOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/order/${o.number}`} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gold/25 bg-ivory p-5 transition hover:border-gold">
                    <div>
                      <p className="font-display text-2xl">{o.number}</p>
                      <p className="text-xs text-espresso/55">{o.createdAt.toLocaleDateString("en-IN", { dateStyle: "long" })}</p>
                    </div>
                    <span className="rounded-full bg-blush px-3 py-1 text-xs capitalize">{o.status}</span>
                    <p className="font-medium">{formatINR(o.total)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}

        {tab === "wishlist" && <WishlistGrid />}

        {tab === "addresses" && (
          <div className="grid gap-10 md:grid-cols-2">
            <div className="space-y-4">
              {myAddresses.length === 0 && <p className="text-sm text-espresso/60">No saved addresses yet.</p>}
              {myAddresses.map((a) => (
                <div key={a.id} className="rounded-2xl border border-gold/25 bg-ivory p-5 text-sm">
                  <p className="font-medium">{a.fullName} {a.isDefault && <span className="ml-2 rounded-full bg-gold/70 px-2 py-0.5 text-[10px]">Default</span>}</p>
                  <p className="mt-1 text-espresso/70">{a.line1} {a.line2}<br />{a.city}, {a.state} {a.pincode}<br />{a.phone}</p>
                  <form action={deleteAddress}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="mt-3 text-xs text-maroon underline underline-offset-4">Remove</button>
                  </form>
                </div>
              ))}
            </div>
            <form action={addAddress} className="grid h-fit gap-3 rounded-3xl bg-blush/50 p-6 sm:grid-cols-2">
              <p className="font-display text-2xl sm:col-span-2">Add an address</p>
              <span className="sm:col-span-2"><label className="sr-only" htmlFor="ad-name">Full name</label><input id="ad-name" name="fullName" required placeholder="Full name" className="field" /></span>
              <span className="sm:col-span-2"><label className="sr-only" htmlFor="ad-phone">Phone</label><input id="ad-phone" name="phone" required inputMode="tel" placeholder="Phone" className="field" /></span>
              <span className="sm:col-span-2"><label className="sr-only" htmlFor="ad-line1">Address line 1</label><input id="ad-line1" name="line1" required placeholder="Address line 1" className="field" /></span>
              <span className="sm:col-span-2"><label className="sr-only" htmlFor="ad-line2">Address line 2 (optional)</label><input id="ad-line2" name="line2" placeholder="Address line 2" className="field" /></span>
              <span><label className="sr-only" htmlFor="ad-city">City</label><input id="ad-city" name="city" required placeholder="City" className="field" /></span>
              <span><label className="sr-only" htmlFor="ad-state">State</label><input id="ad-state" name="state" required placeholder="State" className="field" /></span>
              <span><label className="sr-only" htmlFor="ad-pin">PIN / ZIP</label><input id="ad-pin" name="pincode" required inputMode="numeric" placeholder="PIN / ZIP" className="field" /></span>
              <span><label className="sr-only" htmlFor="ad-country">Country</label><input id="ad-country" name="country" defaultValue="India" className="field" /></span>
              <button className="btn-maroon sm:col-span-2">Save address</button>
            </form>
          </div>
        )}

        {tab === "profile" && (
          <form action={updateProfile} className="grid max-w-md gap-3">
            <label className="text-xs text-espresso/60" htmlFor="pf-email">Email</label>
            <input id="pf-email" className="field opacity-60" value={user?.email ?? ""} readOnly />
            <label className="text-xs text-espresso/60" htmlFor="pf-name">Name</label>
            <input id="pf-name" name="name" className="field" defaultValue={user?.name} required />
            <label className="text-xs text-espresso/60" htmlFor="pf-phone">Phone</label>
            <input id="pf-phone" name="phone" inputMode="tel" className="field" defaultValue={user?.phone ?? ""} />
            <button className="btn-maroon mt-2">Save profile</button>
          </form>
        )}
      </div>
    </div>
  );
}
