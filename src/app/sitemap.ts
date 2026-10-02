import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/queries";
import { articles } from "@/lib/journal";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ps = await listProducts();
  const base = ["", "/shop", "/categories", "/collections", "/craft", "/about", "/journal"].map((p) => ({ url: SITE_URL + p }));
  return [
    ...base,
    ...ps.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.createdAt })),
    ...articles.map((a) => ({ url: `${SITE_URL}/journal/${a.slug}` })),
  ];
}
