# Elite Weavers — Luxury Indian Saree Atelier

Next.js (App Router) · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Lenis · React Three Fiber · Drizzle ORM · PostgreSQL.

See [`PRD.md`](./PRD.md) for the full product spec.

## Setup
```bash
npm install
cp .env.example .env        # set DATABASE_URL and AUTH_SECRET
npx drizzle-kit push        # create tables
npm run dev
```
The catalogue seeds itself on first request. To (re)seed manually:
```bash
npx tsx --env-file=.env src/db/run-seed.ts          # seed if empty
npx tsx --env-file=.env src/db/run-seed.ts --force  # wipe catalogue & reseed
```

## Demo accounts (created by the seed)
- Admin: `admin@eliteweavers.in` / `admin123` → `/admin`
- Coupon: `ELITE10` (10% off), `WELCOME500` (₹500 off above ₹5,000)

## Environment variables
See `.env.example`.
- **Razorpay**: set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`. Point the Razorpay webhook to `/api/webhooks/razorpay` with `RAZORPAY_WEBHOOK_SECRET`. Without keys, checkout runs in *demo mode* (order confirmed instantly).
- **Resend**: set `RESEND_API_KEY`. Without it, emails are logged to the console.
- **Auth**: JWT cookie sessions (`jose`) with bcrypt credentials and role-based admin. OAuth providers (Google) can be added by issuing the same session cookie from a provider callback in `src/app/api/auth/[action]/route.ts`.
- **Uploads**: admin product form uploads to a local `uploads/` folder served at `/api/uploads/[name]`; swap `src/app/api/admin/upload/route.ts` for Cloudinary/UploadThing in production (ephemeral FS on Vercel).

## Structure
- `src/app` — routes (shop, product, checkout, account, admin, API)
- `src/components` — sections, cart drawer, 3D scene, animation providers
- `src/lib` — auth, queries, email, razorpay, animation helpers
- `src/db` — Drizzle schema, seed data

## Animation notes
`SmoothScroll` wires Lenis to GSAP's ticker. Any element with `data-silk` gets the silk entrance; `data-mask` spans are masked line reveals; `data-kenburns` frames get scale 1.15 → 1. With `prefers-reduced-motion`, pinning/scrubbing are disabled and static layouts render.

## Elite Weavers catalogue and motion update
- **36 seeded products, six categories, nine collections, and twelve weave traditions.** Categories: sarees, lehengas, dupattas, blouses, kurta sets, shawls & stoles.
- Collections: The Heirloom Edit, Summer Muslin, Festival of Colour, The Bridal Vows, Temple & Gold, Moonlit Drapes, Garden of Blooms, Indigo Stories, Everyday Poetry.
- The seed now upgrades existing databases additively: existing inventory, orders, users, and product edits are preserved. Do not use `--force` on a live store.
- The zari side rail displays live page progress, clickable chapter stops, and a back-to-top control. Mobile uses a compact bottom progress strip.
- Scroll-drawn embroidery, pinned fabric-unfold scene, ink-filled editorial copy, and a parallax wordmark supplement the silk reveals.
- The homepage 3D Canvas is lazy-loaded near the viewport and replaced by a silk poster on mobile or reduced-motion devices.
- Legacy browser cart storage keys are retained to preserve saved bags during the rename.
- Set `SEED_ADMIN_PASSWORD` before the first seed to replace the default demo administrator password.

### Browser regression checks
Start the preview, then run:
```bash
npx playwright install chromium
npx playwright test --workers=1
```
Override `TEST_BASE_URL` to test a deployed preview. Screenshots are written to `test-results/`.
