import { AmbientBackdrop, ArchDivider } from "@/components/Motifs";
import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import Footer from "@/components/Footer";
import WeaveScrollRail from "@/components/WeaveScrollRail";
import Intro from "@/components/Intro";
import Effects from "@/components/Effects";
import { getSession } from "@/lib/auth";
import { getFacets } from "@/lib/queries";

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [session, facets] = await Promise.all([getSession(), getFacets()]);
  return (
    <>
      {/* Intro curtain and custom cursor belong to the storefront, not to the
          admin console (they were mounted in the root layout before). */}
      <Intro />
      <AmbientBackdrop />
      <Navbar user={session ? { name: session.name, role: session.role } : null} categories={facets.categories} />
      <main id="main" className="site-main">{children}</main>
      <div className="site-bottom">
        <ArchDivider from="ivory" to="espresso" />
        <Footer />
      </div>
      <WeaveScrollRail />
      <CartDrawer />
      <Effects />
    </>
  );
}
