import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Local-disk uploads. For production on serverless hosts, swap this body for
// a Cloudinary / UploadThing upload and return the hosted URL instead.
export async function POST(req: Request) {
  const s = await getSession();
  if (!s || s.role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "No file" }, { status: 400 });
  const ext = EXT[file.type];
  if (!ext) return Response.json({ error: "Only JPG, PNG or WebP images" }, { status: 400 });
  if (file.size > 6 * 1024 * 1024) return Response.json({ error: "Max 6 MB" }, { status: 400 });

  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return Response.json({ url: `/api/uploads/${name}` });
}
