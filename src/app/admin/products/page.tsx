import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { formatINR } from "@/lib/utils";
import { deleteProduct, updateStock } from "../actions";

export default async function AdminProducts() {
  await ensureSeed();
  const rows = await db.select().from(products).orderBy(desc(products.id));
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl">Products</h1>
        <Link href="/admin/products/new" className="btn-maroon">+ New product</Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-ivory">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-maroon">
            <tr><th className="p-4">Product</th><th>Weave</th><th>Price</th><th>Stock</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.images[0]} alt="" className="h-14 w-11 rounded-lg object-cover" />
                    <div>
                      <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-maroon">{p.name}</Link>
                      <p className="text-xs capitalize text-espresso/50">{p.category} · {p.occasion}</p>
                    </div>
                  </div>
                </td>
                <td className="capitalize">{p.weave}</td>
                <td>{formatINR(p.price)}</td>
                <td>
                  <form action={updateStock} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={p.id} />
                    <input name="stock" type="number" min={0} defaultValue={p.stock} className="field !w-20 !rounded-lg !py-1.5" />
                    <button className="text-xs text-maroon underline underline-offset-4">Save</button>
                  </form>
                </td>
                <td className="pr-4 text-right">
                  <Link href={`/admin/products/${p.id}`} className="mr-4 text-xs underline underline-offset-4">Edit</Link>
                  <form action={deleteProduct} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button className="text-xs text-maroon underline underline-offset-4">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
