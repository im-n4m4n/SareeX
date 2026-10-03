import type { Metadata } from "next";
import CartView from "@/components/CartView";
import { PAGE_TOP } from "@/lib/layout";

// Server wrapper: a "use client" page cannot export metadata, so /cart used to
// inherit the site title and description.
export const metadata: Metadata = {
  title: "Shopping Bag",
  description: "Review the pieces in your Elite Weavers bag before checkout.",
  robots: { index: false },
};

export default function CartPage() {
  return (
    <div className={PAGE_TOP}>
      <CartView />
    </div>
  );
}
