import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/utils";

/** Private surfaces: admin, APIs, account/order pages and anything cart/checkout. */
const PRIVATE_ROUTES = ["/admin", "/api", "/account", "/checkout", "/login", "/register", "/order", "/cart"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: PRIVATE_ROUTES },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
