import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { deleteCategory, saveCategory } from "../actions";

export default async function AdminCategories() {
  await ensureSeed();
  const rows = await db.select().from(categories).orderBy(asc(categories.id));
  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-5xl">Categories</h1>
      <form action={saveCategory} className="mt-8 grid gap-3 rounded-2xl bg-ivory p-5 sm:grid-cols-2">
        <input name="name" required placeholder="Name (e.g. Dupattas)" className="field" />
        <input name="image" placeholder="Image URL (optional)" className="field" />
        <input name="description" placeholder="Description" className="field sm:col-span-2" />
        <button className="btn-maroon sm:col-span-2">Save category</button>
      </form>
      <ul className="mt-6 divide-y divide-gold/20 rounded-2xl bg-ivory">
        {rows.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-display text-2xl">{c.name}</p>
              <p className="text-xs text-espresso/55">/{c.slug} · {c.description}</p>
            </div>
            <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="text-xs text-maroon underline underline-offset-4">Delete</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
