# SareeX Codebase Audit — 2026-10-02

Full findings from the 2026-10-02 audit (summary version). Source of truth for the implementation plan in `2026-10-02-sareex-fix-plan.md`.

## Blocking / critical
1. `node_modules` corrupt: `node_modules/.bin` missing, `next/package.json` missing, `es-abstract` broken → `npm run dev/build/lint/typecheck` all fail; tsc errors are mostly install artifacts.
2. Images 404 everywhere: `public/` folder does not exist; all assets referenced as `/images/*.jpg` (seed-data.ts, catalogue-expansion.ts, journal.ts, ~18 component files). OpenGraph image also broken.
3. Uploads non-persistent on Vercel: `uploads/` written to `process.cwd()/uploads`, gitignored + .vercelignored; serverless FS ephemeral → uploaded images vanish.
4. Secrets in working copy: `.env` (live Supabase URL+password, AUTH_SECRET), `.env.local` (live VERCEL_OIDC_TOKEN), `SareeX Details.txt` (DB creds). Need rotation.
5. Order page PII exposure: `/order/[number]` shows name/email/phone/address; `getOrderByNumber` has no user scoping or rate limit.
6. No `middleware.ts`: admin guarded only per-layout + per-action.

## Medium
7. `drizzle.config.ts` does not load dotenv → `drizzle-kit push` fails without manual export.
8. `@playwright/test` in dependencies (should be devDependencies); `playwright.config.ts` missing; no unit tests; no image-200 E2E check.
9. Open redirect: `next.startsWith("/")` allows `//evil.com` (AuthForm).
10. Login has no rate-limiting.
11. `next.config.ts` empty — no images.remotePatterns; all 34 images are plain `<img>` with eslint-disable; next/image unused.

## Minor / hygiene
12. `package.json` name still `nextjs-postgresql-template`; pool global `__arenaNextJsPostgresqlPool`; cookie `aurelle_session`.
13. `void and;` dead statement in `api/misc/[action]/route.ts:107`.
14. `admin/products/[id]/page.tsx` uses `React.ReactNode` without importing types.
15. CheckoutForm flash-of-form before mount; wishlist PUT subscription fires on merge.
16. Color filter uses raw-JSON `ilike` substring match (brittle).
17. README mentions `src/lib/razorpay.ts` which does not exist.
18. `test-results/` has no screenshots despite passing status.

## What works
- Razorpay HMAC verify + webhook idempotency, demo-mode fallback, email fallback, idempotent seed, mounted-flag hydration pattern, robots/sitemap, admin server-action guards, address delete scoping.
