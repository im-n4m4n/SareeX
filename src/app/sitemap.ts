import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/queries";
import { articles } from "@/lib/journal";
import { SITE_URL } from "@/lib/utils";

/**
 * force-dynamic re-ran listProducts() (with its seed check) on every crawler
 * hit. An hour of staleness is worth far more than a DB round-trip per request.
 */
export const revalidate = 3600;

/** Static copy and the journal ship with the deploy, so the build is their last change. */
const STATIC_LAST_MODIFIED = new Date();

const STATIC_ROUTES = ["", "/shop", "/categories", "/collections", "/craft", "/about", "/journal"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await listProducts();
  return [
    ...STATIC_ROUTES.map((path) => ({ url: SITE_URL + path, lastModified: STATIC_LAST_MODIFIED })),
    ...products.map((p) => ({ url: `${SITE_URL}/product/${p.slug}`, lastModified: p.createdAt })),
    ...articles.map((a) => ({ url: `${SITE_URL}/journal/${a.slug}`, lastModified: STATIC_LAST_MODIFIED })),
  ];
}
