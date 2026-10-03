import Link from "next/link";
import type { Metadata } from "next";
import { Lotus } from "@/components/ui";

/**
 * Next resolves metadata from the not-found boundary for 404 responses
 * (createMetadataComponents is called with errorType: "not-found"), so the
 * noindex below is emitted on the 404 page. This route renders outside the
 * (site) layout, which is why the landmark lives here.
 */
export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main className="pattern-paisley relative grid min-h-screen place-items-center bg-ivory px-6 text-center">
      <div className="absolute inset-0 bg-ivory/90" aria-hidden />
      <div className="relative">
        <Lotus className="mx-auto h-10 w-16 text-gold" />
        <p className="overline mt-6 text-maroon">Error 404</p>
        <h1 className="font-display mt-2 text-7xl">A thread came loose.</h1>
        <p className="mt-3 text-sm text-espresso/65">The page you&apos;re looking for has wandered off the loom.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn-maroon">Return home</Link>
          <Link href="/shop" className="btn-ghost">Shop the collection</Link>
          <Link href="/journal" className="btn-ghost">Read the Journal</Link>
        </div>
      </div>
    </main>
  );
}
