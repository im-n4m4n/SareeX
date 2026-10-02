import Link from "next/link";
import { count, desc, eq, lte, sum } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { formatINR } from "@/lib/utils";

export default async function AdminDashboard() {
  await ensureSeed();
  const [[rev], [oc], [pc], low, recent] = await Promise.all([
    db.select({ v: sum(orders.total) }).from(orders).where(eq(orders.paymentStatus, "paid")),
    db.select({ v: count() }).from(orders),
    db.select({ v: count() }).from(products),
    db.select().from(products).where(lte(products.stock, 5)).limit(8),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);
  const stats = [
    ["Revenue (paid)", formatINR(Number(rev.v ?? 0))],
    ["Orders", String(oc.v)],
    ["Products", String(pc.v)],
    ["Low stock", String(low.length)],
  ];
  return (
    <div>
      <h1 className="font-display text-5xl">Dashboard</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-ivory p-6 shadow-sm">
            <p className="overline text-[10px] text-maroon">{k}</p>
            <p className="font-display mt-2 text-4xl">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section className="rounded-2xl bg-ivory p-6">
          <h2 className="font-display text-3xl">Recent orders</h2>
          <ul className="mt-4 divide-y divide-gold/25 text-sm">
            {recent.length === 0 && <li className="py-3 text-espresso/60">No orders yet.</li>}
            {recent.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <span>{o.number} <span className="text-espresso/50">· {o.name}</span></span>
                <span className="flex items-center gap-3"><span className="rounded-full bg-blush px-2.5 py-0.5 text-xs capitalize">{o.status}</span>{formatINR(o.total)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/orders" className="mt-4 inline-block text-sm text-maroon underline underline-offset-4">All orders</Link>
        </section>
        <section className="rounded-2xl bg-ivory p-6">
          <h2 className="font-display text-3xl">Low inventory</h2>
          <ul className="mt-4 divide-y divide-gold/25 text-sm">
            {low.length === 0 && <li className="py-3 text-espresso/60">All stocked.</li>}
            {low.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3">
                <Link href={`/admin/products/${p.id}`} className="hover:text-maroon">{p.name}</Link>
                <span className={p.stock === 0 ? "text-maroon" : ""}>{p.stock} left</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
