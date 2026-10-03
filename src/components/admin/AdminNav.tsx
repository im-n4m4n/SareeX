"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Package, ShoppingBag, Tag, Layers, BookOpen, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", Icon: BarChart3 },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/coupons", label: "Coupons", Icon: Tag },
  { href: "/admin/categories", label: "Categories", Icon: Layers },
  { href: "/admin/collections", label: "Collections", Icon: BookOpen },
];

/** Client-side so the current section can be marked aria-current="page". */
export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="mt-10 flex gap-2 overflow-x-auto md:flex-col" aria-label="Admin">
      {nav.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/admin" && pathname.startsWith(href + "/"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition hover:bg-ivory/10 hover:text-ivory",
              active ? "bg-ivory/15 text-ivory" : "text-ivory/80",
            )}
          >
            <Icon className="h-4 w-4 text-gold" aria-hidden="true" /> {label}
          </Link>
        );
      })}
      <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 hover:text-ivory md:mt-6">
        <ExternalLink className="h-4 w-4" aria-hidden="true" /> View storefront
      </Link>
    </nav>
  );
}
