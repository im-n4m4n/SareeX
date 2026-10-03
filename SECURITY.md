# Security notes

## Rotate these before the next deploy

The following secrets were committed to the working tree in plaintext at some
point and must be treated as compromised:

| Secret | Where it was exposed | Action |
|---|---|---|
| Supabase database password | `SareeX Details.txt` (repo root, not gitignored) | Rotate in the Supabase dashboard, then update `DATABASE_URL` in `.env` and `DIRECT_DATABASE_URL` in `.env.local`. |
| `AUTH_SECRET` | `.env` (gitignored, but present in the working copy) | Generate a new 32+ byte random string. Existing sessions are invalidated. |
| `VERCEL_OIDC_TOKEN` | `.env.local` | Short-lived; regenerate with `vercel env pull`. |

`SareeX Details.txt` no longer contains the password or the connection string,
and `.gitignore` now blocks `*Details.txt` and `*credentials*.txt` as a guard.

## Controls in place

- Session cookies are `httpOnly`, `sameSite=lax` and `Secure` whenever
  `NODE_ENV=production` (`src/lib/auth.ts`).
- Admin routes and every admin server action call `requireAdmin()`.
- `/order/[number]` requires an admin session, the signed-in owner, or the
  httpOnly cookie written at checkout — an order number alone is not enough.
- Login, registration, newsletter, coupon and review endpoints are rate limited
  (`src/lib/rateLimit.ts`); the limiter is per-instance and should move to a
  shared store if the deployment scales horizontally.
- Both Razorpay routes verify HMAC signatures with `timingSafeEqual`.
- Uploaded files are served only when the filename matches
  `/^[\w-]+\.(jpg|png|webp)$/`, which blocks path traversal.
- Security headers (nosniff, frame options, referrer policy, HSTS) are set in
  `next.config.ts`.

## Known gaps

- `/api/admin/upload` writes to the local filesystem. On Vercel that is
  ephemeral, so uploads disappear on redeploy — swap in object storage.
- There is no CSP yet; adding one requires nonces for the inline JSON-LD and
  the Google Fonts stylesheet.
