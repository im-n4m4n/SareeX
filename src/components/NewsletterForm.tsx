"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const res = await fetch("/api/misc/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const d = await res.json();
    if (res.ok) {
      setState("done");
      setMsg(`Welcome to Elite Weavers. Use code ${d.code} for 10% off your first saree.`);
    } else {
      setState("error");
      setMsg(d.error ?? "Something went wrong");
    }
  }

  if (state === "done") return <p className="font-display text-2xl text-maroon">{msg}</p>;
  return (
    <form onSubmit={submit} className="w-full">
      <div className="flex items-center rounded-full border border-espresso/20 bg-ivory p-1.5 pl-5 focus-within:border-gold">
        <label htmlFor="nl-email" className="sr-only">
          Email address
        </label>
        <input
          id="nl-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full bg-transparent text-sm outline-none"
        />
        <button disabled={state === "loading"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-maroon text-ivory transition hover:bg-espresso" aria-label="Subscribe">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-maroon">{msg}</p>}
    </form>
  );
}
