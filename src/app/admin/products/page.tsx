import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { CONTAINER_NARROW } from "@/lib/layout";
import { coverImage, formatINR } from "@/lib/utils";
import { deleteProduct, updateStock } from "../actions";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await ensureSeed();
  const { error } = await searchParams;
  const rows = await db.select().from(products).orderBy(desc(products.id));
  return (
    <div className={CONTAINER_NARROW}>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl">Products</h1>
        <Link href="/admin/products/new" className="btn-maroon">+ New product</Link>
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}
      <div className="mt-8 overflow-x-auto rounded-2xl bg-ivory">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-widest text-maroon">
            <tr>
              <th scope="col" className="p-4">Product</th>
              <th scope="col">Weave</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col" className="p-4 text-right"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/20">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverImage(p.images[0])} alt="" className="h-14 w-11 rounded-lg object-cover" />
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
                    <input name="stock" type="number" min={0} defaultValue={p.stock} aria-label={`Stock for ${p.name}`} className="field !w-20 !rounded-lg !py-1.5" />
                    <button className="text-xs text-maroon underline underline-offset-4" aria-label={`Save stock for ${p.name}`}>Save</button>
                  </form>
                </td>
                <td className="pr-4 text-right">
                  <Link href={`/admin/products/${p.id}`} className="mr-4 text-xs underline underline-offset-4">Edit</Link>
                  <details className="inline-block align-middle text-left">
                    <summary aria-label={`Delete ${p.name}`} className="cursor-pointer list-none text-xs text-maroon underline underline-offset-4 [&::-webkit-details-marker]:hidden">Delete</summary>
                    <form action={deleteProduct} className="mt-2 flex items-center gap-2">
                      <input type="hidden" name="id" value={p.id} />
                      <button className="text-xs text-maroon underline underline-offset-4" aria-label={`Confirm removal of ${p.name}`}>Confirm</button>
                    </form>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
