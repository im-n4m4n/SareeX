import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { CONTAINER_NARROW } from "@/lib/layout";
import { deleteCategory, saveCategory } from "../actions";

export default async function AdminCategories({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await ensureSeed();
  const { error } = await searchParams;
  const rows = await db.select().from(categories).orderBy(asc(categories.id));
  return (
    <div className={CONTAINER_NARROW}>
      <h1 className="font-display text-5xl">Categories</h1>
      {error && <p role="alert" className="mt-5 rounded-xl bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}
      <form action={saveCategory} className="mt-8 grid gap-3 rounded-2xl bg-ivory p-5 sm:grid-cols-2">
        <div className="text-xs text-espresso/60">
          <label htmlFor="category-name" className="mb-1.5 block">Name</label>
          <input id="category-name" name="name" required placeholder="e.g. Dupattas" className="field" />
        </div>
        <div className="text-xs text-espresso/60">
          <label htmlFor="category-image" className="mb-1.5 block">Image URL (optional)</label>
          <input id="category-image" name="image" placeholder="/images/dupattas.jpg or an https:// URL" className="field" />
        </div>
        <div className="text-xs text-espresso/60 sm:col-span-2">
          <label htmlFor="category-description" className="mb-1.5 block">Description</label>
          <input id="category-description" name="description" placeholder="How this category is introduced on the storefront" className="field" />
        </div>
        <button className="btn-maroon sm:col-span-2">Save category</button>
      </form>
      <ul className="mt-6 divide-y divide-gold/20 rounded-2xl bg-ivory">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-display text-2xl">{c.name}</p>
              <p className="text-xs text-espresso/55">/{c.slug} · {c.description}</p>
            </div>
            <details className="text-left">
              <summary aria-label={`Delete category ${c.name}`} className="cursor-pointer list-none text-xs text-maroon underline underline-offset-4 [&::-webkit-details-marker]:hidden">Delete</summary>
              <form action={deleteCategory} className="mt-2 text-right">
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-maroon underline underline-offset-4" aria-label={`Confirm removal of category ${c.name}`}>Confirm</button>
              </form>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
