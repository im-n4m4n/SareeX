import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ensureSeed } from "@/db/seed";
import { users } from "@/db/schema";
import { createSession, destroySession, getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export async function GET(_req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  if (action !== "me") return Response.json({ error: "Not found" }, { status: 404 });
  const s = await getSession();
  return Response.json({ user: s });
}

export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  await ensureSeed();

  if (action === "logout") {
    await destroySession();
    return Response.json({ ok: true });
  }

  const body = await req.json().catch(() => ({}));

  if (action === "register") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const { name, email, password } = parsed.data;
    const [exists] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (exists) return Response.json({ error: "An account with this email already exists" }, { status: 409 });
    const [u] = await db
      .insert(users)
      .values({ name, email, passwordHash: await bcrypt.hash(password, 10) })
      .returning();
    await createSession({ id: u.id, email: u.email, name: u.name, role: u.role });
    return Response.json({ ok: true, role: u.role });
  }

  if (action === "login") {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: "Enter a valid email and password" }, { status: 400 });
    const [u] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);
    if (!u || !(await bcrypt.compare(parsed.data.password, u.passwordHash))) {
      return Response.json({ error: "Incorrect email or password" }, { status: 401 });
    }
    await createSession({ id: u.id, email: u.email, name: u.name, role: u.role });
    return Response.json({ ok: true, role: u.role });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}
