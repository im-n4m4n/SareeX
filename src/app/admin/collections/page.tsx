import { asc } from "drizzle-orm";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { ensureSeed } from "@/db/seed";
import { CONTAINER_NARROW } from "@/lib/layout";
import { coverImage } from "@/lib/utils";
import { saveCollection, deleteCollection } from "../actions";
import { requireAdmin } from "@/lib/auth";

export default async function AdminCollections({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  await ensureSeed();
  const rows = await db.select().from(collections).orderBy(asc(collections.id));
  const { error } = await searchParams;
  return (
    <div className={CONTAINER_NARROW}>
      <p className="overline text-maroon">The curated catalogue</p><h1 className="font-display mt-2 text-5xl">Collections</h1>
      <p className="mt-3 text-sm text-espresso/65">Create, edit, and feature the stories customers explore. Assign products to an edit in the product form.</p>
      {error && <p role="alert" className="mt-5 rounded-xl bg-maroon/10 p-4 text-sm text-maroon">{error}</p>}
      <form action={saveCollection} className="mt-8 grid gap-4 rounded-2xl bg-ivory p-6 sm:grid-cols-2">
        <h2 className="font-display text-3xl sm:col-span-2">New collection</h2>
        <label className="text-xs text-espresso/65">Name<input name="name" required minLength={2} placeholder="Collection name" className="field mt-2" /></label>
        <label className="text-xs text-espresso/65">Slug<input name="slug" placeholder="Optional — created from the name" className="field mt-2" /></label>
        <label className="text-xs text-espresso/65 sm:col-span-2">Story<textarea name="description" required placeholder="Tell the story of this edit" className="field mt-2 min-h-20" /></label>
        <label className="text-xs text-espresso/65 sm:col-span-2">Cover image<input name="image" placeholder="/images/bridal.jpg or an https:// URL" className="field mt-2" /></label>
        <label className="flex items-center gap-2 text-xs"><input name="featured" type="checkbox" defaultChecked /> Featured edit</label>
        <button className="btn-maroon justify-self-end">Create collection</button>
      </form>
      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        {rows.map((c) => <article key={c.id} className="overflow-hidden rounded-2xl border border-gold/20 bg-ivory">
          <div className="flex items-center gap-5 p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage(c.image)} alt={c.name} className="h-28 w-20 shrink-0 rounded-t-[35px] rounded-b-md object-cover" /><div><h2 className="font-display text-3xl leading-tight">{c.name}</h2><p className="mt-2 text-xs text-espresso/50">/{c.slug}</p>{c.featured && <span className="mt-2 inline-block rounded-full bg-gold/20 px-3 py-1 text-[10px] text-maroon">Featured</span>}</div>
          </div>
          <form action={saveCollection} className="space-y-3 border-t border-gold/20 p-5">
            <input type="hidden" name="id" value={c.id} /><input type="hidden" name="slug" value={c.slug} />
            <label className="block text-xs text-espresso/65">Name<input name="name" defaultValue={c.name} required className="field mt-1" /></label>
            <label className="block text-xs text-espresso/65">Description<textarea name="description" defaultValue={c.description} className="field mt-1 min-h-20" /></label>
            <label className="block text-xs text-espresso/65">Cover image<input name="image" defaultValue={c.image ?? ""} className="field mt-1" /></label>
            <div className="flex items-center justify-between"><label className="flex items-center gap-2 text-xs"><input name="featured" type="checkbox" defaultChecked={c.featured} />Featured</label><button className="rounded-full bg-maroon px-5 py-2 text-xs text-ivory" aria-label={`Save changes to ${c.name}`}>Save changes</button></div>
          </form>
          <div className="px-5 pb-5 text-right">
            <details className="inline-block text-left">
              <summary aria-label={`Delete collection ${c.name}`} className="cursor-pointer list-none text-xs text-maroon underline underline-offset-4 [&::-webkit-details-marker]:hidden">Delete empty collection</summary>
              <form action={deleteCollection} className="mt-2 text-right">
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs text-maroon underline underline-offset-4" aria-label={`Confirm removal of collection ${c.name}`}>Confirm</button>
              </form>
            </details>
          </div>
        </article>)}
      </div>
    </div>
  );
}
