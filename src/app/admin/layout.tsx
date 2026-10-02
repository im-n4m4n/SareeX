import Link from "next/link";
import type { ReactNode } from "react";
import { BarChart3, Package, ShoppingBag, Tag, Layers, BookOpen, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Dashboard", Icon: BarChart3 },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/orders", label: "Orders", Icon: ShoppingBag },
  { href: "/admin/coupons", label: "Coupons", Icon: Tag },
  { href: "/admin/categories", label: "Categories", Icon: Layers },
  { href: "/admin/collections", label: "Collections", Icon: BookOpen },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const s = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f6f1ea] md:grid md:grid-cols-[250px_1fr]">
      <aside className="bg-espresso p-6 text-ivory md:sticky md:top-0 md:h-screen">
        <Link href="/" className="font-display block text-[23px] tracking-[0.07em]">Elite Weavers</Link>
        <p className="overline mt-1 text-[10px] text-gold">Atelier Admin</p>
        <nav className="mt-10 flex gap-2 overflow-x-auto md:flex-col" aria-label="Admin">
          {nav.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm text-ivory/80 transition hover:bg-ivory/10 hover:text-ivory">
              <Icon className="h-4 w-4 text-gold" /> {label}
            </Link>
          ))}
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-ivory/60 hover:text-ivory md:mt-6">
            <ExternalLink className="h-4 w-4" /> View storefront
          </Link>
        </nav>
        <p className="mt-8 hidden text-xs text-ivory/50 md:block">Signed in as {s.email}</p>
      </aside>
      <div className="min-w-0 p-5 md:p-10" data-lenis-prevent>{children}</div>
    </div>
  );
}
