import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { CONTAINER_NARROW } from "@/lib/layout";
import { formatINR } from "@/lib/utils";
import { deleteCoupon, saveCoupon, toggleCoupon } from "../actions";

export default async function AdminCoupons({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await ensureSeed();
  const { error } = await searchParams;
  const rows = await db.select().from(coupons).orderBy(desc(coupons.id));
  return (
    <div className={CONTAINER_NARROW}>
      <h1 className="font-display text-5xl">Coupons</h1>
      {error && <p role="alert" className="mt-5 rounded-xl bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}
      <form action={saveCoupon} className="mt-8 grid gap-3 rounded-2xl bg-ivory p-5 sm:grid-cols-5">
        <div className="text-xs text-espresso/60">
          <label htmlFor="coupon-code" className="mb-1.5 block">Code</label>
          <input id="coupon-code" name="code" required placeholder="ELITE10" className="field uppercase" />
        </div>
        <div className="text-xs text-espresso/60">
          <label htmlFor="coupon-type" className="mb-1.5 block">Type</label>
          <select id="coupon-type" name="type" className="field">
            <option value="percent">Percent %</option>
            <option value="flat">Flat ₹</option>
          </select>
        </div>
        <div className="text-xs text-espresso/60">
          <label htmlFor="coupon-value" className="mb-1.5 block">Value</label>
          <input id="coupon-value" name="value" type="number" min={1} required placeholder="10" className="field" />
        </div>
        <div className="text-xs text-espresso/60">
          <label htmlFor="coupon-min-order" className="mb-1.5 block">Min order (₹)</label>
          <input id="coupon-min-order" name="minOrder" type="number" min={0} placeholder="0" className="field" />
        </div>
        <button className="btn-maroon self-end" aria-label="Save coupon">Save</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-ivory">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-maroon">
            <tr>
              <th scope="col" className="p-4">Code</th>
              <th scope="col">Discount</th>
              <th scope="col">Min order</th>
              <th scope="col">Used</th>
              <th scope="col" className="p-4 text-right"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-medium">{c.code}</td>
                <td>{c.type === "percent" ? `${c.value}%` : formatINR(c.value)}</td>
                <td>{formatINR(c.minOrder)}</td>
                <td>{c.usageCount}</td>
                <td className="p-4">
                  {/* flex belongs on this inner div: display:flex on a <td> breaks the table layout. */}
                  <div className="flex items-center justify-end gap-4 text-xs">
                    <form action={toggleCoupon}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="active" value={String(c.active)} />
                      <button
                        aria-pressed={c.active}
                        aria-label={`${c.code} coupon is ${c.active ? "active" : "inactive"} — switch it ${c.active ? "off" : "on"}`}
                        className={c.active ? "text-forest underline underline-offset-4" : "text-espresso/50 underline underline-offset-4"}
                      >
                        {c.active ? "Active" : "Inactive"}
                      </button>
                    </form>
                    <details className="text-left">
                      <summary aria-label={`Delete coupon ${c.code}`} className="cursor-pointer list-none text-maroon underline underline-offset-4 [&::-webkit-details-marker]:hidden">Delete</summary>
                      <form action={deleteCoupon} className="mt-2 text-right">
                        <input type="hidden" name="id" value={c.id} />
                        <button className="text-maroon underline underline-offset-4" aria-label={`Confirm removal of coupon ${c.code}`}>Confirm</button>
                      </form>
                    </details>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
