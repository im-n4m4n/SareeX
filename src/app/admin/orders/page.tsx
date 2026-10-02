import Link from "next/link";
import { desc, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatINR } from "@/lib/utils";
import { updateOrderStatus } from "../actions";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default async function AdminOrders() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id))) : [];
  return (
    <div>
      <h1 className="font-display text-5xl">Orders</h1>
      <div className="mt-8 space-y-4">
        {rows.length === 0 && <p className="text-sm text-espresso/60">No orders yet.</p>}
        {rows.map((o) => (
          <div key={o.id} className="rounded-2xl bg-ivory p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link href={`/order/${o.number}`} className="font-display text-2xl hover:text-maroon">{o.number}</Link>
                <p className="text-xs text-espresso/55">{o.name} · {o.email} · {o.createdAt.toLocaleString("en-IN")}</p>
              </div>
              <p className="text-sm">{formatINR(o.total)} · <span className={o.paymentStatus === "paid" ? "text-forest" : "text-maroon"}>{o.paymentStatus}</span></p>
              <form action={updateOrderStatus} className="flex items-center gap-2">
                <input type="hidden" name="id" value={o.id} />
                <select name="status" defaultValue={o.status} className="field !w-auto !py-2 text-xs capitalize">
                  {statuses.map((s) => <option key={s}>{s}</option>)}
                </select>
                <button className="rounded-full bg-maroon px-4 py-2 text-xs text-ivory">Update</button>
              </form>
            </div>
            <ul className="mt-3 text-xs text-espresso/65">
              {items.filter((i) => i.orderId === o.id).map((i) => <li key={i.id}>{i.name} × {i.quantity}{i.color ? ` (${i.color})` : ""}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
