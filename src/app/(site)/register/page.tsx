import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { Lotus } from "@/components/ui";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  // Registering from a checkout redirect used to always land on /account.
  const next = safeNextPath((await searchParams).next);
  return (
    <div className="pattern-paisley relative grid min-h-screen place-items-center px-5 pb-10 pt-32">
      <div className="absolute inset-0 bg-ivory/90" />
      <div className="glass relative w-full max-w-md rounded-[2rem] p-10 shadow-2xl">
        <Lotus className="mx-auto h-8 w-12 text-gold" />
        <p className="overline mt-4 text-center text-maroon">Join the atelier</p>
        <h1 className="font-display mb-8 mt-1 text-center text-5xl">Create account</h1>
        <AuthForm mode="register" next={next} />
      </div>
    </div>
  );
}
