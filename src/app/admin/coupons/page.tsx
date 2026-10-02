import { desc } from "drizzle-orm";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { deleteCoupon, saveCoupon, toggleCoupon } from "../actions";

export default async function AdminCoupons() {
  await ensureSeed();
  const rows = await db.select().from(coupons).orderBy(desc(coupons.id));
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-5xl">Coupons</h1>
      <form action={saveCoupon} className="mt-8 grid gap-3 rounded-2xl bg-ivory p-5 sm:grid-cols-5">
        <input name="code" required placeholder="CODE" className="field uppercase" />
        <select name="type" className="field"><option value="percent">Percent %</option><option value="flat">Flat ₹</option></select>
        <input name="value" type="number" min={1} required placeholder="Value" className="field" />
        <input name="minOrder" type="number" min={0} placeholder="Min order ₹" className="field" />
        <button className="btn-maroon">Save</button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-ivory">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-maroon"><tr><th className="p-4">Code</th><th>Discount</th><th>Min order</th><th>Used</th><th></th></tr></thead>
          <tbody className="divide-y divide-gold/20">
            {rows.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-medium">{c.code}</td>
                <td>{c.type === "percent" ? `${c.value}%` : `₹${c.value}`}</td>
                <td>₹{c.minOrder}</td>
                <td>{c.usageCount}</td>
                <td className="flex gap-4 p-4 text-xs">
                  <form action={toggleCoupon}>
                    <input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={String(c.active)} />
                    <button className={c.active ? "text-forest underline underline-offset-4" : "text-espresso/50 underline underline-offset-4"}>{c.active ? "Active" : "Inactive"}</button>
                  </form>
                  <form action={deleteCoupon}><input type="hidden" name="id" value={c.id} /><button className="text-maroon underline underline-offset-4">Delete</button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
