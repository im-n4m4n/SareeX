"use client";

import { useState } from "react";

export default function ImageField({ defaultValue }: { defaultValue: string[] }) {
  const [urls, setUrls] = useState(defaultValue.join("\n"));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const d = await res.json();
    setBusy(false);
    if (res.ok) setUrls((u) => (u ? u + "\n" : "") + d.url);
    else setErr(d.error ?? "Upload failed");
  }

  return (
    <div>
      <textarea name="images" value={urls} onChange={(e) => setUrls(e.target.value)} className="field min-h-28 font-mono !text-xs" placeholder="One image URL per line (first is the cover)" />
      <div className="mt-2 flex items-center gap-3 text-xs">
        <label className="cursor-pointer rounded-full border border-maroon px-4 py-2 text-maroon hover:bg-maroon hover:text-ivory">
          {busy ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} />
        </label>
        {err && <span className="text-maroon">{err}</span>}
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {urls.split("\n").filter(Boolean).map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={u} alt="" className="h-20 w-16 rounded-lg object-cover" />
        ))}
      </div>
    </div>
  );
}
