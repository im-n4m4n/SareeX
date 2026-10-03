import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { getFacets } from "@/lib/queries";
import { CONTAINER_NARROW } from "@/lib/layout";
import ImageField from "@/components/admin/ImageField";
import { saveProduct } from "../../actions";

const L = ({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) => (
  <label className={`block text-xs text-espresso/60 ${wide ? "sm:col-span-2" : ""}`}>
    <span className="mb-1.5 block">{label}</span>
    {children}
  </label>
);

const Sel = ({ name, value, options }: { name: string; value?: string | null; options: { v: string; l: string }[] }) => (
  <select name={name} defaultValue={value ?? (name === "collection" ? "" : options[0]?.v)} className="field">
    {name === "collection" && <option value="">None</option>}
    {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>
);

export default async function ProductForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error } = await searchParams;
  const isNew = id === "new";
  // A non-numeric id would be sent to Postgres as NaN and fail in the driver.
  const numericId = /^[0-9]+$/.test(id) ? Number(id) : null;
  if (!isNew && numericId === null) notFound();
  const [p] = numericId === null ? [undefined] : await db.select().from(products).where(eq(products.id, numericId)).limit(1);
  if (!isNew && !p) notFound();
  const f = await getFacets();

  return (
    <div className={CONTAINER_NARROW}>
      <h1 className="font-display text-5xl">{isNew ? "New product" : `Edit: ${p!.name}`}</h1>
      {error && <p role="alert" className="mt-4 rounded-xl bg-maroon/10 p-3 text-sm text-maroon">{error}</p>}
      <form action={saveProduct} className="mt-8 grid gap-4 rounded-3xl bg-ivory p-6 sm:grid-cols-2 md:p-8">
        {!isNew && <input type="hidden" name="id" value={p!.id} />}
        <L label="Name"><input name="name" required className="field" defaultValue={p?.name} /></L>
        <L label="Slug (optional)"><input name="slug" className="field" defaultValue={p?.slug} /></L>
        <L label="Tagline" wide><input name="tagline" className="field" defaultValue={p?.tagline} /></L>
        <L label="Description" wide><textarea name="description" className="field min-h-24" defaultValue={p?.description} /></L>
        <L label="Weave story" wide><textarea name="story" className="field min-h-20" defaultValue={p?.story} /></L>
        <L label="Price (₹)"><input name="price" type="number" min={1} required className="field" defaultValue={p?.price} /></L>
        <L label="Compare-at price (₹)"><input name="compareAtPrice" type="number" min={0} className="field" defaultValue={p?.compareAtPrice ?? ""} /></L>
        <L label="Category"><Sel name="category" value={p?.category} options={f.categories.map((c) => ({ v: c.slug, l: c.name }))} /></L>
        <L label="Weave"><Sel name="weave" value={p?.weave} options={f.weaves.map((c) => ({ v: c.slug, l: c.name }))} /></L>
        <L label="Occasion"><Sel name="occasion" value={p?.occasion} options={f.occasions.map((c) => ({ v: c.slug, l: c.name }))} /></L>
        <L label="Collection"><Sel name="collection" value={p?.collection} options={f.collections.map((c) => ({ v: c.slug, l: c.name }))} /></L>
        <L label="Fabric"><input name="fabric" required className="field" defaultValue={p?.fabric} /></L>
        <L label="Work"><input name="work" className="field" defaultValue={p?.work} /></L>
        <L label="Blouse"><input name="blouse" className="field" defaultValue={p?.blouse} /></L>
        <L label="Length"><input name="length" className="field" defaultValue={p?.length} /></L>
        <L label="Care"><input name="care" className="field" defaultValue={p?.care} /></L>
        <L label="Badge (e.g. Bestseller)"><input name="badge" className="field" defaultValue={p?.badge ?? ""} /></L>
        <L label="Stock"><input name="stock" type="number" min={0} required className="field" defaultValue={p?.stock ?? 10} /></L>
        <L label="Colours — Name:#hex, comma separated" wide>
          <input name="colors" className="field" defaultValue={p?.colors.map((c) => `${c.name}:${c.hex}`).join(", ")} placeholder="Maroon:#6B1E2A, Emerald:#0F5132" />
        </L>
        {/* A wrapper <div>, not a <label>: ImageField renders its own label for the textarea. */}
        <div className="text-xs text-espresso/60 sm:col-span-2">
          {/* key={p?.id} remounts the field per product — without it, navigating A → B kept A's images and saving overwrote B's. */}
          <ImageField key={p?.id} defaultValue={p?.images ?? []} label="Images" />
        </div>
        <div className="flex gap-6 text-sm sm:col-span-2">
          <label className="flex items-center gap-2"><input type="checkbox" name="isNew" defaultChecked={p?.isNew} /> New arrival</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={p?.featured} /> Featured</label>
        </div>
        <div className="sm:col-span-2"><button className="btn-maroon">Save product</button></div>
      </form>
    </div>
  );
}
