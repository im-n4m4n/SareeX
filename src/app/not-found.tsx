import Link from "next/link";
import { Lotus } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="pattern-paisley relative grid min-h-screen place-items-center bg-ivory px-6 text-center">
      <div className="absolute inset-0 bg-ivory/90" />
      <div className="relative">
        <Lotus className="mx-auto h-10 w-16 text-gold" />
        <p className="overline mt-6 text-maroon">Error 404</p>
        <h1 className="font-display mt-2 text-7xl">A thread came loose.</h1>
        <p className="mt-3 text-sm text-espresso/65">The page you&apos;re looking for has wandered off the loom.</p>
        <Link href="/" className="btn-maroon mt-8">Return home</Link>
      </div>
    </div>
  );
}
