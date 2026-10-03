"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ChevronDown, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_SWATCHES } from "@/lib/types";

type Facet = { slug: string; name: string; pieceCount?: number };
type Facets = { weaves: Facet[]; occasions: Facet[]; fabrics: string[]; categories: Facet[]; collections: Facet[] };

function useParamUpdate() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  return {
    sp,
    set(patch: Record<string, string | null>) {
      const n = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => v ? n.set(k, v) : n.delete(k));
      const query = n.toString();
      // replace, not push: Back should not walk through every filter click.
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    clear() { router.replace(pathname, { scroll: false }); },
  };
}
// Marigold, Saffron and Lilac exist in the catalogue; the old hardcoded list
// omitted them, so three real colours could never be filtered.
const colors = COLOR_SWATCHES.map((c) => [c.name, c.hex] as const);
const prices = [["0-5000", "Under ₹5,000"], ["5000-15000", "₹5,000 – ₹15,000"], ["15000-30000", "₹15,000 – ₹30,000"], ["30000-", "₹30,000 & above"]];

function Group({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gold/25 py-4">
      <button type="button" className="flex w-full items-center justify-between text-[13px] font-medium" onClick={() => setOpen(!open)} aria-expanded={open}>{title}<ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-500", open && "rotate-180")} /></button>
      <div className="grid transition-[grid-template-rows,opacity] duration-500 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }} inert={!open}>
        <div className="overflow-hidden"><div className="mt-4 space-y-2.5" role="radiogroup" aria-label={title}>{children}</div></div>
      </div>
    </div>
  );
}
function Option({ active, label, total, onClick }: { active: boolean; label: string; total?: number; onClick: () => void }) {
  // Single-select facets: radio semantics, not independent toggles.
  return <button type="button" role="radio" aria-checked={active} onClick={onClick} className="flex w-full items-center gap-2.5 text-left text-xs text-espresso/70 hover:text-maroon"><span className={cn("grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border", active ? "border-maroon" : "border-espresso/25")}>{active && <span className="h-1.5 w-1.5 rounded-full bg-maroon" />}</span><span className="flex-1">{label}</span>{total !== undefined && <span className="text-[10px] text-espresso/40">{total}</span>}</button>;
}

export function Filters({ facets }: { facets: Facets }) {
  const { sp, set, clear } = useParamUpdate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const get = (key: string) => sp.get(key) ?? "";
  const count = ["weave", "occasion", "color", "fabric", "price", "category", "q", "collection", "new"].filter((k) => get(k)).length;
  const select = (key: string, value: string) => set({ [key]: get(key) === value ? null : value });
  return (
    <aside className="h-fit rounded-2xl border border-gold/25 bg-ivory/90 px-5 py-6 shadow-[0_20px_50px_-35px_rgba(28,21,18,0.25)] lg:sticky lg:top-28">
      <button type="button" className="flex w-full items-center justify-between lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen}><span className="font-display text-2xl">Find your weave</span><span className="flex items-center gap-2 text-xs lg:hidden"><SlidersHorizontal className="h-4 w-4" />{count > 0 && `(${count})`}<ChevronDown className={cn("h-4 w-4 transition", mobileOpen && "rotate-180")} /></span></button>
      <div data-lenis-prevent className={cn("no-scrollbar mt-4 lg:max-h-[68vh] lg:overflow-y-auto", !mobileOpen && "max-lg:hidden")}>
        <Group title="Category" defaultOpen>
          <Option active={!get("category")} label="All pieces" onClick={() => set({ category: null })} />
          {facets.categories.map((c) => <Option key={c.slug} active={get("category") === c.slug} label={c.name} total={c.pieceCount} onClick={() => select("category", c.slug)} />)}
        </Group>
        <Group title="Curated Collection" defaultOpen={!!get("collection")}>
          {facets.collections.map((c) => <Option key={c.slug} active={get("collection") === c.slug} label={c.name} total={c.pieceCount} onClick={() => select("collection", c.slug)} />)}
        </Group>
        <Group title="Weave & Region" defaultOpen={!!get("weave")}>
          {facets.weaves.map((w) => <Option key={w.slug} active={get("weave") === w.slug} label={w.name} onClick={() => select("weave", w.slug)} />)}
        </Group>
        <Group title="Occasion" defaultOpen={!!get("occasion")}>
          {facets.occasions.map((o) => <Option key={o.slug} active={get("occasion") === o.slug} label={o.name} onClick={() => select("occasion", o.slug)} />)}
        </Group>
        <Group title="Colour" defaultOpen={!!get("color")}><div className="flex flex-wrap gap-3">{colors.map(([name, hex]) => <button key={name} type="button" title={name} aria-label={`Filter colour ${name}`} aria-pressed={get("color") === name} onClick={() => select("color", name)} className={cn("h-7 w-7 rounded-full border-2 border-ivory ring-1 transition", get("color") === name ? "scale-110 ring-maroon" : "ring-espresso/20")} style={{ background: hex }} />)}</div></Group>
        <Group title="Fabric" defaultOpen={!!get("fabric")}>{facets.fabrics.map((f) => <Option key={f} active={get("fabric") === f} label={f} onClick={() => select("fabric", f)} />)}</Group>
        <Group title="Price" defaultOpen={!!get("price")}>{prices.map(([value, label]) => <Option key={value} active={get("price") === value} label={label} onClick={() => select("price", value)} />)}</Group>
        {count > 0 && <button type="button" onClick={clear} className="mt-3 w-full rounded-full border border-maroon/30 py-2.5 text-xs text-maroon transition hover:bg-maroon hover:text-ivory">Clear all filters ({count})</button>}
        <p className="font-display mt-6 text-center text-lg italic text-maroon/65">A legacy in every thread</p>
      </div>
    </aside>
  );
}

export function ActiveFilters({ facets }: { facets: Facets }) {
  const { sp, set } = useParamUpdate();
  const keys = ["q", "category", "collection", "weave", "occasion", "color", "fabric", "price", "new"];
  const items = keys.flatMap((key) => {
    const value = sp.get(key);
    if (!value) return [];
    let label = value;
    if (key === "q") label = `“${value}”`;
    else if (key === "category") label = facets.categories.find((f) => f.slug === value)?.name ?? value;
    else if (key === "collection") label = facets.collections.find((f) => f.slug === value)?.name ?? value;
    else if (key === "weave") label = facets.weaves.find((f) => f.slug === value)?.name ?? value;
    else if (key === "occasion") label = facets.occasions.find((f) => f.slug === value)?.name ?? value;
    else if (key === "price") label = prices.find(([v]) => v === value)?.[1] ?? value;
    else if (key === "new") label = "New arrivals";
    return [{ key, label }];
  });
  if (!items.length) return null;
  return <div className="mt-6 flex flex-wrap gap-2">{items.map((i) => <button key={i.key} type="button" onClick={() => set({ [i.key]: null })} className="flex items-center gap-2 rounded-full border border-maroon/15 bg-blush/60 px-3 py-1.5 text-[11px] text-maroon" aria-label={`Remove ${i.label} filter`}>{i.label}<X className="h-3 w-3" /></button>)}</div>;
}

export function Toolbar({ count }: { count: number }) {
  const { sp, set } = useParamUpdate();
  const view = sp.get("view") === "list" ? "list" : "grid";
  return <div className="flex flex-wrap items-center gap-3"><span className="text-xs text-espresso/55">{count} {count === 1 ? "piece" : "pieces"}</span><label className="sr-only" htmlFor="sort">Sort pieces</label><select id="sort" value={sp.get("sort") ?? ""} onChange={(e) => set({ sort: e.target.value || null })} className="rounded-full border border-espresso/15 bg-ivory px-4 py-2.5 text-xs outline-none focus:border-gold"><option value="">Sort by: Popularity</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select><div className="flex rounded-full border border-espresso/15 p-1">{(["grid", "list"] as const).map((v) => <button type="button" key={v} aria-label={`${v} view`} aria-pressed={view === v} onClick={() => set({ view: v === "grid" ? null : v })} className={cn("rounded-full p-2", view === v ? "bg-espresso text-ivory" : "text-espresso/60")}>{v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}</button>)}</div></div>;
}
