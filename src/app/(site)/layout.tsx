import { AmbientBackdrop, ArchDivider } from "@/components/Motifs";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import WeaveScrollRail from "@/components/WeaveScrollRail";
import { getSession } from "@/lib/auth";
import { getFacets } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [session, facets] = await Promise.all([getSession(), getFacets()]);
  return (
    <>
      <AmbientBackdrop />
      <Navbar user={session ? { name: session.name, role: session.role } : null} categories={facets.categories} />
      <main id="main" className="site-main">{children}</main>
      <div className="site-bottom">
        <ArchDivider from="ivory" to="espresso" />
        <Footer />
      </div>
      <WeaveScrollRail />
      <CartDrawer />
    </>
  );
}
