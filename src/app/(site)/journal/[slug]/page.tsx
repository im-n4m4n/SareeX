import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "@/lib/journal";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  return a ? { title: a.title, description: a.excerpt, openGraph: { images: [a.image] } } : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find((x) => x.slug === slug);
  if (!a) notFound();
  return (
    <article className="pb-10 pt-36">
      <header className="mx-auto max-w-3xl px-5 text-center">
        <p className="overline text-maroon">{a.kicker} · {a.date}</p>
        <h1 className="font-display mt-4 text-6xl leading-[1] md:text-8xl">{a.title}</h1>
        <p className="mt-6 text-lg text-espresso/65">{a.excerpt}</p>
      </header>
      <div className="mx-auto mt-12 aspect-[16/9] max-w-5xl overflow-hidden rounded-3xl px-5 md:px-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img data-kenburns src={a.image} alt="" className="h-full w-full rounded-3xl object-cover" />
      </div>
      <div className="mx-auto mt-14 max-w-2xl space-y-6 px-5 text-lg leading-relaxed text-espresso/80">
        {a.body.map((p, i) => (
          <p key={i} data-silk className={i === 0 ? "font-display text-3xl leading-snug text-espresso" : ""}>{p}</p>
        ))}
        <Link href="/journal" className="inline-block pt-6 text-sm text-maroon underline underline-offset-4">← Back to the Journal</Link>
      </div>
    </article>
  );
}
