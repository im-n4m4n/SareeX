"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewForm({ productId, signedIn }: { productId: number; signedIn: boolean }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <p className="rounded-2xl bg-blush p-5 text-sm">
        <a href="/login" className="underline underline-offset-4">Sign in</a> to share your experience with this saree.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/misc/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, rating, title, body }),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) {
      setMsg("Thank you — your review is live.");
      setBody("");
      setTitle("");
      router.refresh();
    } else setMsg(d.error ?? "Could not post review");
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gold/25 bg-ivory p-5">
      <p className="font-display text-2xl">Write a review</p>
      <div className="flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} aria-label={`${n} stars`} onClick={() => setRating(n)}>
            <Star className={cn("h-6 w-6", n <= rating ? "fill-gold text-gold" : "text-espresso/25")} />
          </button>
        ))}
      </div>
      <input className="field" placeholder="Headline" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
      <textarea className="field min-h-24" placeholder="How did it drape? How did it feel?" value={body} onChange={(e) => setBody(e.target.value)} required minLength={10} />
      <div className="flex items-center gap-4">
        <button className="btn-maroon" disabled={busy}>Post review</button>
        {msg && <span className="text-xs text-espresso/70">{msg}</span>}
      </div>
    </form>
  );
}
