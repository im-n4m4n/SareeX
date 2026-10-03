/**
 * Small fixed-window rate limiter for the credential and public write routes.
 *
 * In-memory: it protects a single long-lived instance (the common case here)
 * and degrades to a no-op behind multiple serverless instances. Swap the Map
 * for Redis/Upstash if the deployment scales horizontally.
 */
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const MAX_KEYS = 5000;

function prune(now: number) {
  if (buckets.size < MAX_KEYS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    prune(now);
    return { ok: true, retryAfter: 0 };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  existing.count += 1;
  return { ok: true, retryAfter: 0 };
}

export function clientKey(req: Request, scope: string) {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  return scope + ":" + ip;
}
