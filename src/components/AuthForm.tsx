"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/" + mode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(d.error ?? "Something went wrong");
        setBusy(false);
        return;
      }
      router.push(next ?? (d.role === "admin" ? "/admin" : "/account"));
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <span className="block">
          <label className="sr-only" htmlFor="auth-name">Full name</label>
          <input id="auth-name" className="field" required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
        </span>
      )}
      <span className="block">
        <label className="sr-only" htmlFor="auth-email">Email</label>
        <input id="auth-email" className="field" type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
      </span>
      <span className="block">
        <label className="sr-only" htmlFor="auth-password">Password</label>
        <input id="auth-password" className="field" type="password" required minLength={mode === "register" ? 6 : 1} placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      </span>
      {error && <p role="alert" className="text-xs text-maroon">{error}</p>}
      <button type="submit" disabled={busy} aria-busy={busy} className="btn-maroon w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
      <p className="text-center text-xs text-espresso/65">
        {mode === "login" ? (
          <>New to Elite Weavers? <Link href={next ? "/register?next=" + encodeURIComponent(next) : "/register"} className="underline underline-offset-4">Create an account</Link></>
        ) : (
          <>Already a member? <Link href={next ? "/login?next=" + encodeURIComponent(next) : "/login"} className="underline underline-offset-4">Sign in</Link></>
        )}
      </p>
    </form>
  );
}
