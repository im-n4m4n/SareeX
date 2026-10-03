"use client";

import { useId, useState, type ChangeEvent } from "react";

export default function ImageField({ defaultValue, label = "Images" }: { defaultValue: string[]; label?: string }) {
  const [urls, setUrls] = useState(defaultValue.join("\n"));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const id = useId();

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const d = (await res.json().catch(() => null)) as { url?: unknown; error?: unknown } | null;
      const url = d && typeof d.url === "string" ? d.url : "";
      if (!res.ok) {
        setErr(d && typeof d.error === "string" ? d.error : "Upload failed");
        return;
      }
      if (!url) {
        setErr("Upload finished but no image URL came back.");
        return;
      }
      setUrls((u) => (u.trim() ? u.replace(/\s+$/, "") + "\n" : "") + url);
    } catch {
      setErr("Upload failed — check your connection and try again.");
    } finally {
      // A failed upload must never leave the control stuck on "Uploading…".
      setBusy(false);
      input.value = "";
    }
  }

  const previews = urls
    .split("\n")
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-espresso/60">{label}</label>
      <textarea id={id} name="images" value={urls} onChange={(e) => setUrls(e.target.value)} className="field min-h-28 font-mono !text-xs" placeholder="One image URL per line (first is the cover)" />
      <div className="mt-2 flex items-center gap-3 text-xs">
        <label className="cursor-pointer rounded-full border border-maroon px-4 py-2 text-maroon hover:bg-maroon hover:text-ivory">
          {busy ? "Uploading…" : "Upload image"}
          {/* sr-only, not hidden: display:none would drop the input out of the tab order. */}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={upload} />
        </label>
        {err && <span role="alert" className="text-maroon">{err}</span>}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {previews.map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={u} alt={`Image ${i + 1} preview`} className="h-20 w-16 rounded-lg object-cover" />
        ))}
      </div>
    </div>
  );
}
