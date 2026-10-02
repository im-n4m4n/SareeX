import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { Lotus } from "@/components/ui";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next;
  return (
    <div className="pattern-paisley relative grid min-h-screen place-items-center px-5 pb-10 pt-32">
      <div className="absolute inset-0 bg-ivory/90" />
      <div className="glass relative w-full max-w-md rounded-[2rem] p-10 shadow-2xl">
        <Lotus className="mx-auto h-8 w-12 text-gold" />
        <p className="overline mt-4 text-center text-maroon">Welcome back</p>
        <h1 className="font-display mb-8 mt-1 text-center text-5xl">Sign in</h1>
        <AuthForm mode="login" next={next?.startsWith("/") ? next : undefined} />
      </div>
    </div>
  );
}
