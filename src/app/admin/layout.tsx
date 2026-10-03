import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const s = await requireAdmin();
  return (
    <div className="min-h-screen bg-[#f6f1ea] md:grid md:grid-cols-[250px_1fr]">
      {/* Fixed-height sidebar: without overflow handling the last link is clipped on short viewports. */}
      <aside className="bg-espresso p-6 text-ivory md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <Link href="/" className="font-display block text-[23px] tracking-[0.07em]">Elite Weavers</Link>
        <p className="overline mt-1 text-[10px] text-gold">Atelier Admin</p>
        <AdminNav />
        <p className="mt-8 hidden text-xs text-ivory/50 md:block">Signed in as {s.email}</p>
      </aside>
      <main className="min-w-0 py-6 md:py-10" data-lenis-prevent>
        {children}
      </main>
    </div>
  );
}
