# SareeX Fix Implementation Plan

> For agentic workers: use superpowers:executing-plans (or subagent-driven-development) task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Repair the SareeX storefront end-to-end — working install/build/lint/typecheck, images rendering everywhere, persistent uploads, secrets hygiene, route security, test infrastructure.

**Architecture:** Sequential hardening in dependency order: unblock tooling first (node_modules), then assets (images), then security, then code hygiene, then tests. Each task independently verifiable.

**Tech Stack:** Next.js 16.2.6, React 19, Drizzle ORM 0.45.2, PostgreSQL (Supabase), Razorpay, jose, Playwright 1.63, Tailwind v4, TypeScript 5.9.3.

**Spec:** docs/superpowers/plans/2026-10-02-sareex-audit.md

## Global Constraints
- Do not change seeded product/content copy or visual design except where a task says so.
- Never print secrets in output.
- Keep existing routes, cookie aurelle_session, and localStorage keys working unless user asks otherwise.
- All verification commands run in C:\ZWorkX\SareeX.
- NOT a git repo — skip Commit steps unless user runs git init.

## Review Focus
- Fresh npm install must yield working `npx tsc --noEmit`, `npm run lint`, `npm run build`.
- Every /images/* path referenced in code+DB must resolve under public/ or a configured remote pattern.
- Admin upload must persist across redeploys (or fail loudly with clear setup error).
- /order/[number] must not leak PII to anonymous guessers.
- Playwright must have config + webServer + image-200 assertions, and pass.

---

### Task 1: Repair node_modules and verify toolchain

**Files:** delete node_modules/; verify package-lock.json.

- [ ] Step 1: Delete corrupt install — `Remove-Item -Recurse -Force C:\ZWorkX\SareeX\node_modules`
- [ ] Step 2: Fresh install — `npm install` in C:\ZWorkX\SareeX. Expect node_modules/.bin, node_modules/next/package.json, node_modules/es-abstract/helpers/IsArray.js to exist.
- [ ] Step 3: Verify binaries — `Test-Path node_modules/.bin, node_modules/next/package.json, node_modules/es-abstract/helpers/IsArray.js` → all True.
- [ ] Step 4: Typecheck — `npx tsc --noEmit` → exit 0 or small list of real errors (burn down in Task 7).
- [ ] Step 5: Lint — `npm run lint` → exit 0 or small list of real errors.
- [ ] Step 6: Build — `npm run build` → completes.

### Task 2: Verify database connectivity and seed state

- [ ] Step 1: Test DB connection from .env DATABASE_URL via pg SELECT 1.
- [ ] Step 2: SELECT count(*) FROM products; → ~36 rows; else `npx tsx src/db/run-seed.ts --env-file=.env`.
- [ ] Step 3: `npm run dev`; curl / and /api/health → homepage renders, health ok.

### Task 3: Restore all image assets (root cause of broken images)

- [ ] Step 1: Enumerate required files: `rg -o '/images/[\w.-]+' src -g '*.ts*' --no-filename | Sort-Object -Unique` plus SELECT DISTINCT images from products.
- [ ] Step 2: Locate original asset files locally; copy to C:\ZWorkX\SareeX\public\images\. If not found — STOP, ask user for originals; no silent placeholders.
- [ ] Step 3: With dev server, curl every /images/<file> → all HTTP 200.
- [ ] Step 4: Homepage visual check — hero, product cards, category tiles show real images.
- [ ] Step 5: curl -I http://localhost:3000/images/hero.jpg → 200.

### Task 4: Persistent uploads (Vercel-safe) OR explicit dev-mode fallback

- [ ] Step 1: Decide with user: (a) Cloudinary/UploadThing (recommended), (b) local disk dev-only with loud production error.
- [ ] Step 2a (Cloudinary): add cloudinary dep; upload to folder sareex; return { url: secure_url }; add CLOUDINARY_* env docs.
- [ ] Step 2b (Local): auto-create uploads/; production (process.env.VERCEL) → 503 "configure Cloudinary".
- [ ] Step 3: Admin login → upload jpg → reload → image renders, URL 200.

### Task 5: Secrets hygiene

- [ ] Step 1: Delete C:\ZWorkX\SareeX\SareeX Details.txt.
- [ ] Step 2: Regenerate .env.local via `vercel env pull`.
- [ ] Step 3: Rotate Supabase DB password + AUTH_SECRET (`openssl rand -base64 48`); restart dev; verify login + demo checkout.
- [ ] Step 4: Confirm .gitignore/.vercelignore cover all secret files.

### Task 6: Route security fixes

- [ ] Step 1: Gate /order/[number] — guest needs matching ?email=; logged-in user must own order or be admin; checkout success links append email. Files: src/lib/orders.ts, src/app/(site)/order/[number]/page.tsx, checkout form.
- [ ] Step 2: Fix open redirect — accept next only if startsWith("/") && !startsWith("//") in AuthForm.tsx + register path.
- [ ] Step 3: Rate-limit login — in-memory 5 attempts/5min per IP+email in auth route; 429 response.
- [ ] Step 4: Middleware — default: keep existing layout/action guards, document in README. Add middleware.ts only if user asks.

### Task 7: Code hygiene + type/lint burn-down

- [ ] Step 1: Remove `void and;` + unused import in src/app/api/misc/[action]/route.ts.
- [ ] Step 2: admin/products/[id]/page.tsx — add `import type { ReactNode } from "react";`, replace React.ReactNode.
- [ ] Step 3: package.json — name sareex; move @playwright/test, @types/*, tsx to devDependencies; npm install.
- [ ] Step 4: drizzle.config.ts — add `import "dotenv/config";`; verify `npx drizzle-kit push` reads .env.
- [ ] Step 5: src/db/index.ts — rename global key to __sareexPgPool.
- [ ] Step 6: CheckoutForm.tsx — render loading state until mounted, then form/empty.
- [ ] Step 7: README.md — fix src/lib/razorpay.ts mention; add uploads + secrets notes.
- [ ] Step 8: Re-run gates: tsc 0 errors, lint 0 errors, build success.

### Task 8: Playwright test infrastructure

- [ ] Step 1: Create playwright.config.ts — testDir ./tests, baseURL TEST_BASE_URL ?? http://127.0.0.1:3000, webServer `npm run dev` port 3000, reuseExistingServer.
- [ ] Step 2: New test — on /shop, every img has naturalWidth > 0.
- [ ] Step 3: `npx playwright install chromium`.
- [ ] Step 4: `npx playwright test` → all 6 existing + new pass.

### Task 9: Final verification sweep

- [ ] Step 1: tsc clean. 2: lint clean. 3: build success. 4: playwright all pass.
- [ ] Step 5: Manual smoke — homepage images, product gallery, 3D drape, add-to-cart, demo checkout, admin upload.
- [ ] Step 6: Mark audit items RESOLVED in docs/superpowers/plans/2026-10-02-sareex-audit.md.

## Execution order
Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9. Tasks 6 and 7 overlap files — sequential.
