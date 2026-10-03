"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReviewForm({ productId, signedIn }: { productId: number; signedIn: boolean }) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!signedIn) {
    return (
      <p className="rounded-2xl bg-blush p-5 text-sm">
        <Link href="/login" className="underline underline-offset-4">Sign in</Link> to share your experience with this saree.
      </p>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/misc/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setState("ok");
        setMsg("Thank you — your review is live.");
        setBody("");
        setTitle("");
        router.refresh();
      } else {
        setState("error");
        setMsg(d.error ?? "Could not post review");
      }
    } catch {
      // Otherwise the button stayed disabled with no explanation.
      setState("error");
      setMsg("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-gold/25 bg-ivory p-5">
      <p className="font-display text-2xl">Write a review</p>
      {/* Real radio inputs: the previous buttons had no role and no checked state,
          so the chosen rating was never announced. */}
      <fieldset className="flex gap-1">
        <legend className="sr-only">Your rating</legend>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer rounded p-0.5 focus-within:ring-2 focus-within:ring-gold">
            <input
              type="radio"
              name="rating"
              value={n}
              checked={rating === n}
              onChange={() => setRating(n)}
              className="sr-only"
            />
            <span className="sr-only">{n + " star" + (n === 1 ? "" : "s")}</span>
            <Star aria-hidden className={cn("h-6 w-6", n <= rating ? "fill-gold text-gold" : "text-espresso/25")} />
          </label>
        ))}
      </fieldset>
      <span className="block">
        <label className="sr-only" htmlFor="review-title">Headline</label>
        <input id="review-title" className="field" placeholder="Headline" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
      </span>
      <span className="block">
        <label className="sr-only" htmlFor="review-body">Your review</label>
        <textarea id="review-body" className="field min-h-24" placeholder="How did it drape? How did it feel?" value={body} onChange={(e) => setBody(e.target.value)} required minLength={10} />
      </span>
      <div className="flex items-center gap-4">
        <button type="submit" className="btn-maroon" disabled={busy} aria-busy={busy}>Post review</button>
        {msg && (
          <span role={state === "error" ? "alert" : "status"} className={cn("text-xs", state === "error" ? "text-maroon" : "text-forest")}>
            {msg}
          </span>
        )}
      </div>
    </form>
  );
}
