import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";
import { Lotus } from "@/components/ui";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="pattern-paisley relative grid min-h-screen place-items-center px-5 pb-10 pt-32">
      <div className="absolute inset-0 bg-ivory/90" />
      <div className="glass relative w-full max-w-md rounded-[2rem] p-10 shadow-2xl">
        <Lotus className="mx-auto h-8 w-12 text-gold" />
        <p className="overline mt-4 text-center text-maroon">Join the atelier</p>
        <h1 className="font-display mb-8 mt-1 text-center text-5xl">Create account</h1>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
