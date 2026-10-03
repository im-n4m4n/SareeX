import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = { id: number; email: string; name: string; role: string };

const COOKIE = "aurelle_session";

const secret = () => {
  if (!process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is required for signing sessions");
  return new TextEncoder().encode(process.env.AUTH_SECRET);
};

export async function createSession(user: Session) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    // Derived from the runtime environment, not from a public URL variable:
    // NEXT_PUBLIC_SITE_URL could be http:// on a production HTTPS deploy,
    // which silently dropped the Secure flag from a 30-day session cookie.
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login?next=/admin");
  if (s.role !== "admin") redirect("/account");
  return s;
}
