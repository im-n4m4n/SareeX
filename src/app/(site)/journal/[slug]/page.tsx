import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { articles } from "@/lib/journal";
import { CONTAINER_READING, PAGE_TOP } from "@/lib/layout";
import { coverImage } from "@/lib/utils";

// No generateStaticParams here: the (site) layout awaits cookies() through
// getSession(), so this route is always rendered on demand. The export only
// bought a build-time prerender pass whose output could never be served.

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
    <article className={`${PAGE_TOP} pb-10`}>
      <header className={`${CONTAINER_READING} text-center`}>
        <div className="mx-auto max-w-3xl">
          <p className="overline text-maroon">{a.kicker} · {a.date}</p>
          <h1 className="font-display mt-4 text-6xl leading-[1] md:text-8xl">{a.title}</h1>
          <p className="mt-6 text-lg text-espresso/65">{a.excerpt}</p>
        </div>
      </header>
      <div className={`${CONTAINER_READING} mt-12`}>
        <div className="aspect-[16/9] overflow-hidden rounded-3xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-kenburns src={coverImage(a.image)} alt={`${a.title} — ${a.kicker}`} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className={`${CONTAINER_READING} mt-14`}>
        <div className="mx-auto max-w-2xl space-y-6 text-lg leading-relaxed text-espresso/80">
          {a.body.map((p, i) => (
            <p key={p} data-silk className={i === 0 ? "font-display text-3xl leading-snug text-espresso" : ""}>{p}</p>
          ))}
          <Link href="/journal" className="inline-block pt-6 text-sm text-maroon underline underline-offset-4">← Back to the Journal</Link>
        </div>
      </div>
    </article>
  );
}
