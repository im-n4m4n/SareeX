"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cartCount, useCart, useWishlist } from "@/lib/store";
import { getLenis } from "@/lib/animations";
import { BRAND } from "@/lib/brand";
import { Lotus } from "./ui";
import { Mandala, PatternBg } from "./Motifs";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string; image: string | null; pieceCount: number };
const links = [
  { href: "/shop?new=1", label: "New In" },
  { href: "/shop?category=sarees", label: "Sarees" },
  { href: "/categories", label: "Wardrobe", menu: true },
  { href: "/collections", label: "Collections" },
  { href: "/craft", label: "The Craft" },
  { href: "/journal", label: "Journal" },
];

export default function Navbar({ user, categories }: { user: { name: string; role: string } | null; categories: Category[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const wishCount = useWishlist((s) => s.ids.length);

  useEffect(() => {
    setMounted(true);
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setMenu(false); setSearch(false); setMega(false); }, [pathname]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(false); setSearch(false); setMega(false); } };
    window.addEventListener("keydown", esc);
    if (menu || search) getLenis()?.stop();
    else if (!useCart.getState().open) getLenis()?.start();
    return () => window.removeEventListener("keydown", esc);
  }, [menu, search]);

  const overHero = pathname === "/" && !scrolled && !menu && !mega;
  const count = mounted ? cartCount(items) : 0;
  function navigate(href: string) { setSearch(false); setMenu(false); setMega(false); router.push(href); }

  return (
    <>
      <header onMouseLeave={() => setMega(false)} className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-700", overHero ? "bg-transparent text-ivory" : "glass text-espresso shadow-[0_1px_0_rgba(201,162,75,0.25)]")}>
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-ivory focus:px-4 focus:py-2">Skip to content</a>
        <div className="nav-inner mx-auto flex max-w-[1600px] items-center justify-between gap-5 px-5 py-4 md:px-10">
          <button className="lg:hidden" aria-label="Open navigation menu" aria-expanded={menu} onClick={() => setMenu(true)}><Menu className="h-5 w-5" /></button>
          <Link href="/" onClick={() => setMega(false)} className="flex shrink-0 flex-col items-center leading-none" aria-label="Elite Weavers home">
            <Lotus className={cn("h-5 w-8", overHero ? "text-gold-soft" : "text-gold")} />
            <span className="brand-wordmark mt-1">{BRAND.wordmark}</span>
            <span className="brand-tagline">A legacy in every thread</span>
          </Link>
          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex" aria-label="Primary navigation">
            {links.map((l) => l.menu ? (
              <button key={l.label} onMouseEnter={() => setMega(true)} onClick={() => setMega(!mega)} aria-expanded={mega} aria-controls="wardrobe-menu" className="group relative flex items-center gap-1.5 text-[12px] tracking-wide">
                {l.label}<ChevronDown className={cn("h-3 w-3 transition-transform duration-500", mega && "rotate-180")} /><span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </button>
            ) : (
              <Link key={l.label} href={l.href} onMouseEnter={() => setMega(false)} className="group relative text-[12px] tracking-wide">
                {l.label}<span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 md:gap-5">
            <button aria-label="Search the wardrobe" onClick={() => { setMega(false); setSearch(true); }}><Search className="h-[18px] w-[18px]" /></button>
            <Link href={user ? "/account" : "/login"} aria-label="Account" className="hidden sm:block"><User className="h-[18px] w-[18px]" /></Link>
            <Link href="/account?tab=wishlist" aria-label="Wishlist" className="relative hidden sm:block"><Heart className="h-[18px] w-[18px]" />{mounted && wishCount > 0 && <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] text-espresso">{wishCount}</span>}</Link>
            <button aria-label={`Open bag, ${count} items`} className="relative" onClick={() => { setMega(false); setOpen(true); }}><ShoppingBag className="h-[18px] w-[18px]" /><span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-gold text-[9px] font-semibold text-espresso">{count}</span></button>
          </div>
        </div>
        <AnimatePresence>
          {mega && (
            <motion.div id="wardrobe-menu" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: reduce ? 0 : 0.55, ease: [0.16, 1, 0.3, 1] }} className="relative hidden overflow-hidden border-t border-gold/20 bg-ivory text-espresso lg:block">
              <PatternBg variant="lotus" fade="edges" />
              <div className="relative mx-auto grid max-w-[1180px] grid-cols-[1fr_1.7fr] gap-16 px-8 py-9">
                <div><p className="overline text-[9px] text-maroon">The handloom wardrobe</p><div className="mt-5 grid grid-cols-2 gap-x-7 gap-y-4">{categories.map((c) => <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMega(false)} className="stitch-link font-display w-fit text-[24px]">{c.name}<span className="ml-2 align-super font-sans text-[8px] text-gold">{c.pieceCount}</span></Link>)}</div><Link href="/categories" onClick={() => setMega(false)} className="mt-6 inline-flex items-center gap-3 text-xs text-maroon">Explore the full wardrobe <ArrowUpRight className="h-3.5 w-3.5" /></Link></div>
                <div className="grid grid-cols-3 gap-4">{categories.filter((c) => ["dupattas", "blouses", "kurta-sets"].includes(c.slug)).map((c) => <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMega(false)} className="group relative h-56 overflow-hidden rounded-t-[70px] rounded-b-lg bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element */}<img src={c.image ?? ""} alt={c.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-espresso/70 to-transparent" /><span className="font-display absolute bottom-4 inset-x-0 text-center text-2xl text-ivory">{c.name}</span>
                </Link>)}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.4 }} className="fixed inset-0 z-[60] overflow-y-auto bg-espresso text-ivory" data-lenis-prevent role="dialog" aria-modal="true" aria-label="Navigation menu">
            <PatternBg variant="brocade" /><Mandala className="pointer-events-none absolute -bottom-32 -right-32 h-[430px] w-[430px] text-gold/20" />
            <div className="relative flex min-h-full flex-col px-8 py-6"><button className="self-end rounded-full border border-gold/30 p-2" aria-label="Close navigation menu" onClick={() => setMenu(false)}><X className="h-6 w-6" /></button>
              <nav className="mt-4 flex flex-col gap-4" aria-label="Mobile navigation">{links.map((l, i) => <motion.div key={l.label} initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: reduce ? 0 : i * 0.06, duration: reduce ? 0 : 0.6 }}><Link href={l.href} onClick={() => setMenu(false)} className="font-display text-[40px] leading-tight">{l.label}</Link></motion.div>)}</nav>
              <p className="overline mb-3 mt-8 text-[9px] text-gold">Discover more</p><div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-ivory/75">{categories.map((c) => <Link key={c.slug} href={`/shop?category=${c.slug}`} onClick={() => setMenu(false)}>{c.name} <span className="text-xs text-gold/75">{c.pieceCount}</span></Link>)}</div>
              <div className="mt-auto flex gap-6 pt-10 text-xs text-gold-soft"><Link href={user ? "/account" : "/login"} onClick={() => setMenu(false)}>{user ? "My Account" : "Sign In"}</Link><Link href="/account?tab=wishlist" onClick={() => setMenu(false)}>Wishlist</Link>{user?.role === "admin" && <Link href="/admin">Admin</Link>}</div>
            </div>
          </motion.div>
        )}
        {search && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-espresso/60 backdrop-blur-md" onClick={() => setSearch(false)} role="dialog" aria-modal="true" aria-label="Search the wardrobe">
            <motion.form initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ duration: reduce ? 0 : 0.5 }} onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); navigate(`/shop?q=${encodeURIComponent(q)}`); }} className="mx-auto mt-28 w-[92%] max-w-2xl rounded-3xl bg-ivory p-6 shadow-2xl">
              <p className="overline text-maroon">Find your next heirloom</p><div className="mt-3 flex items-center gap-3 border-b border-gold pb-3"><Search className="h-5 w-5 text-gold" /><input autoFocus aria-label="Search term" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Banarasi, dupattas, bridal, indigo…" className="font-display w-full min-w-0 bg-transparent text-2xl outline-none placeholder:text-espresso/40" /><button type="button" aria-label="Close search" onClick={() => setSearch(false)}><X className="h-5 w-5" /></button></div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">{["Banarasi", "Kanjivaram", "Bridal", "Dupatta", "Blouse", "Indigo"].map((term) => <button key={term} type="button" onClick={() => navigate(`/shop?q=${encodeURIComponent(term)}`)} className="rounded-full border border-espresso/15 px-3 py-1.5 transition hover:border-gold">{term}</button>)}</div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
