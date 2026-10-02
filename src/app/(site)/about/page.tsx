import { Mandala, Ornaments, PatternBg, PetalFall } from "@/components/Motifs";
import Link from "next/link";
import type { Metadata } from "next";
import { MaskLines, Lotus } from "@/components/ui";

export const metadata: Metadata = { title: "Our Story", description: "Elite Weavers is a luxury Indian saree house working directly with weaving families across India." };

export default function AboutPage() {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden bg-espresso text-ivory">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-kenburns src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/20 to-espresso/50" />
        <PetalFall count={12} />
        <Mandala className="absolute -right-40 top-10 h-[620px] w-[620px] text-gold/25" />
        <div className="relative mx-auto flex min-h-screen max-w-[1300px] flex-col justify-end px-6 pb-24 md:px-12">
          <Lotus className="h-9 w-14 text-gold-soft" />
          <h1 className="font-display mt-6 text-7xl leading-[0.95] md:text-[9rem]">
            <MaskLines lines={["More than a saree,", <i key="f" className="text-gold-soft">it&apos;s a feeling.</i>]} />
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1200px] gap-16 px-5 py-28 md:grid-cols-2 md:px-10">
        <p data-silk data-ink-reveal className="font-display text-4xl leading-snug">
          Elite Weavers began with a grandmother&apos;s trunk of Banarasi silks — heavy with gold, soft with age, and full of stories.
        </p>
        <div data-silk className="space-y-5 text-espresso/75">
          <p>We work directly with weaving families in Varanasi, Kanchipuram, Chanderi, Kutch and Patan — paying fair, advance prices so looms stay alive and the next generation chooses to stay at them.</p>
          <p>Every piece is inspected in our Delhi atelier, wrapped in muslin, and shipped with a card naming the weaver who made it.</p>
        </div>
      </section>

      <section id="shipping" className="relative scroll-mt-28 overflow-hidden bg-blush px-5 py-24 md:px-10">
        <PatternBg variant="block" fade="edges" />
        <Ornaments tone="maroon" />
        <div className="relative mx-auto grid max-w-[1200px] gap-10 md:grid-cols-3">
          {[
            ["Shipping", "Complimentary across India above ₹5,000. Dispatch in 2–3 days. International delivery in 5–8 days to the US, UK, UAE, Canada and Singapore."],
            ["Returns", "7-day returns on unworn sarees with tags. Made-to-measure and stitched pieces are final sale."],
            ["Care", "Dry clean silks. Store in muslin, refold every three months along a different crease, and let your gold breathe."],
          ].map(([t, d]) => (
            <div key={t} data-silk>
              <h3 className="font-display text-4xl">{t}</h3>
              <div className="gold-rule my-4" />
              <p className="text-sm leading-relaxed text-espresso/70">{d}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="py-20 text-center">
        <Link href="/shop" className="btn-maroon">Shop the Collection</Link>
      </div>
    </>
  );
}
