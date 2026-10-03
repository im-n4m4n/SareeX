import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Mandala, PatternBg } from "../Motifs";
import { SectionTitle } from "../ui";
import { CONTAINER } from "@/lib/layout";

export type DiscoverCollection = { slug: string; name: string; description: string; image: string | null; pieceCount: number; featured?: boolean };

export default function CollectionShowcase({ collections }: { collections: DiscoverCollection[] }) {
  const preferred = ["bridal-vows", "temple-gold", "garden-of-blooms", "indigo-stories"]
    .map((slug) => collections.find((c) => c.slug === slug))
    .filter((c): c is DiscoverCollection => !!c);
  const filler = collections.filter((c) => !preferred.some((p) => p.slug === c.slug));
  const edits = [...preferred, ...filler].slice(0, 4);
  return (
    <section id="curated-edits" data-chapter="The Collections" data-surface="light" className="relative overflow-hidden bg-sand py-24 md:py-32">
      <PatternBg variant="paisley" fade="edges" />
      <Mandala className="absolute -left-40 -top-40 h-[520px] w-[520px] text-gold/40" />
      <div className={"relative " + CONTAINER}>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <SectionTitle overline="Carefully curated. Forever treasured." title={<>A world of <i>weaves.</i></>} />
            <p data-silk className="mt-5 max-w-xl text-sm leading-relaxed text-espresso/65">{collections.length} stories, each with its own rhythm. For first vows, festive evenings, and the beauty of ordinary days.</p>
          </div>
          <Link href="/collections" data-silk className="btn-ghost w-fit shrink-0 text-maroon hover:bg-maroon hover:text-ivory">Explore all collections <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2 md:gap-x-8 md:gap-y-20">
          {edits.map((c, i) => (
            <Link key={c.slug} href={`/shop?collection=${c.slug}`} data-silk className={"group " + (i % 2 ? "md:mt-24" : "")}>
              <div className="sheen relative aspect-[4/5] overflow-hidden rounded-[160px_160px_12px_12px] bg-espresso md:aspect-[5/6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img data-kenburns src={c.image ?? "/images/bridal.jpg"} alt={c.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent" />
                <span className="pointer-events-none absolute inset-4 rounded-[150px_150px_6px_6px] border border-gold-soft/55" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-7 text-ivory">
                  <span className="overline text-[10px]">Edit No. {String(collections.findIndex((x) => x.slug === c.slug) + 1).padStart(2, "0")}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-ivory/50 transition duration-500 group-hover:rotate-45 group-hover:bg-gold group-hover:text-espresso"><ArrowUpRight className="h-5 w-5" /></span>
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-4xl leading-none md:text-5xl">{c.name}</h3>
                <span className="whitespace-nowrap text-xs text-espresso/50">{c.pieceCount} pieces</span>
              </div>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-espresso/65">{c.description}</p>
            </Link>
          ))}
        </div>
        <div className="gold-rule mb-8 mt-16" />
        <div className="flex flex-wrap justify-center gap-2.5">
          {collections.map((c) => <Link key={c.slug} href={`/shop?collection=${c.slug}`} className="collection-pill">{c.name}<span className="ml-2 opacity-45">{String(c.pieceCount).padStart(2, "0")}</span></Link>)}
        </div>
      </div>
    </section>
  );
}
