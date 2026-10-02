import { Mandala, Ornaments, PatternBg, PetalFall } from "@/components/Motifs";
import Link from "next/link";
import type { Metadata } from "next";
import { getFacets } from "@/lib/queries";
import { MaskLines, SectionTitle } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "The Craft — From Loom to Drape",
  description: "How Elite Weavers sarees are dyed, warped, woven, finished and measured by hand.",
};

const steps = [
  ["01", "Dyeing", "Silk hanks are boiled to remove sericin, then dyed in small copper vats — madder red, indigo, turmeric, pomegranate rind."],
  ["02", "Warping", "Up to 5,600 threads are stretched across the loom frame by hand. A single misstep means unpicking the day's work."],
  ["03", "Weaving", "Two weavers, one loom. Zari motifs are woven in with separate shuttles, one pass at a time — about six inches a day."],
  ["04", "Finishing", "Loose zari floats are trimmed, tassels knotted (kuchu), pallu pressed, and each saree is inspected under daylight."],
  ["05", "Made to Measure", "Blouses and lehengas are cut and hand-stitched to your measurements in our Delhi atelier in 4–6 weeks."],
];

export default async function CraftPage() {
  const f = await getFacets();
  return (
    <>
      <section className="relative flex min-h-[85vh] items-end overflow-hidden bg-espresso text-ivory">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-kenburns src="/images/craft-loom.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/30 to-transparent" />
        <PetalFall count={12} />
        <Mandala className="absolute -right-40 top-10 h-[620px] w-[620px] text-gold/25" />
        <div className="relative mx-auto w-full max-w-[1400px] px-6 pb-20 md:px-12">
          <p className="overline text-gold-soft">The Craft</p>
          <h1 className="font-display mt-4 text-7xl leading-[0.95] md:text-[9rem]">
            <MaskLines lines={["From loom", <i key="d" className="text-gold-soft">to drape.</i>]} />
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-28 md:px-10">
        <SectionTitle overline="Five chapters" title={<>The <i>Making</i> of a Saree</>} />
        <ol className="mt-14">
          {steps.map(([n, t, d]) => (
            <li key={n} data-silk className="grid gap-4 border-t border-gold/30 py-10 md:grid-cols-[120px_1fr_2fr]">
              <span className="font-display text-6xl text-gold">{n}</span>
              <h3 className="font-display text-4xl">{t}</h3>
              <p className="text-espresso/70">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative overflow-hidden bg-blush px-5 py-28 md:px-10">
        <PatternBg variant="brocade" fade="edges" />
        <Ornaments tone="maroon" />
        <div className="relative mx-auto max-w-[1300px]">
          <SectionTitle overline="Regional heritage" title={<>The <i>Weaves</i> We Carry</>} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {f.weaves.map((w) => (
              <Link key={w.slug} href={`/shop?weave=${w.slug}`} data-silk className="glass rounded-3xl p-7 transition hover:-translate-y-1">
                <p className="overline text-[10px] text-maroon">{w.region}</p>
                <h3 className="font-display mt-2 text-4xl">{w.name}</h3>
                <p className="mt-2 text-sm text-espresso/70">{w.story}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="size-guide" className="mx-auto max-w-[1000px] scroll-mt-28 px-5 py-28 md:px-10">
        <SectionTitle overline="Size & Fit" title={<>Draping <i>Guide</i></>} />
        <div className="mt-10 overflow-x-auto rounded-3xl border border-gold/25 bg-ivory p-6">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="text-xs uppercase tracking-widest text-maroon">
              <tr><th className="py-2">Size</th><th>Bust</th><th>Waist</th><th>Hip</th></tr>
            </thead>
            <tbody className="divide-y divide-gold/25">
              {[["XS", 32, 26, 35], ["S", 34, 28, 37], ["M", 36, 30, 39], ["L", 38, 32, 41], ["XL", 40, 34, 43], ["XXL", 42, 36, 45]].map(([s, b, w, h]) => (
                <tr key={s}><td className="py-3 font-medium">{s}</td><td>{b}&quot;</td><td>{w}&quot;</td><td>{h}&quot;</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-espresso/65">All sarees are 5.5 m with a 0.8 m blouse piece. Blouses can be stitched to your measurements — message us on WhatsApp.</p>
      </section>
    </>
  );
}
