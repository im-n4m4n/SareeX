# SareeX — PRD: Mobile Smoothness, Model Imagery Expansion & Diwali Festival Special

**Version:** 1.0 · **Date:** 2026-10-04 · **Status:** Approved for implementation

## 1. Overview

Three upgrades to the Elite Weavers storefront with **zero change to overall site flow or existing UI structure**:

1. **A. Mobile hero performance** — the homepage scroll animation feels laggy on phones.
2. **B. Model imagery & saree variety** — more top beautiful young model images and more saree varieties.
3. **C. Diwali / Dussehra Festival Special** — a dedicated festival-themed page with banner card, festive sarees and a special offer, reachable from a homepage "Festival Season" banner.

## 2. Background & Root-Cause Findings

### A. Hero scroll lag on mobile (confirmed via code audit)
- `src/components/home/Hero.tsx:27` gates the pinned scrub timeline **only** by `prefers-reduced-motion` — no viewport-width gate. Every other pinned section on the site uses `DESKTOP_MQ = "(min-width: 768px) and (prefers-reduced-motion: no-preference)"` (`src/lib/animations.ts:19`). Hero is the only outlier, so the pin + `clip-path` inset animation + 100vw scale tween runs on phones.
- Constant decorative layers compound it: `.mandala-spin` (140s/180s infinite), `.pattern-animate` (90s drift), `PetalFall` (18 petals + ~14 dust motes), and the fixed full-screen `AmbientBackdrop` — none are width-gated.
- All site imagery except Hero uses raw `<img>` delivering 500KB+ originals (e.g. `m16.jpg` 526KB) — heavy decode work during mobile scroll.
- The WebGL `SilkCanvas` is already correctly excluded on mobile (not a culprit).

### B. Imagery today
- `public/images/` holds 24 local JPEGs (~5.4MB): 16 model images (`m01–m16`), atmosphere shots (`festive-diya.jpg`, `silk-maroon.jpg`, etc.). No mobile variants; seed data in `src/db/seed-data.ts` (~12 products) and `src/db/catalogue-expansion.ts` (~20 products) references local paths.

### C. Festival hooks (all additive, no flow change)
- Route group `(site)`; scoped theme via new tokens in `globals.css @theme` + a `.theme-diwali` wrapper class; new utilities only, existing palette untouched.
- Reusable banner pattern: `OccasionCard` (`src/components/home/Sections.tsx:88-104`).
- Festive products queryable via `listProducts({ occasion: "festive" })`; coupon system (`ELITE10` precedent) seeds additively; `Navbar` has a hardcoded `pathname === "/"` over-hero condition that needs `/diwali` added.

## 3. Requirements

### A. Mobile smoothness (P0)
| # | Requirement |
|---|---|
| A1 | Hero pinned scrub animation gated behind `DESKTOP_MQ`; mobile gets the static/entrance hero. |
| A2 | `PetalFall` count halved below 768px (or not rendered on mobile). |
| A3 | `.mandala-spin` / `.pattern-animate` infinite CSS animations disabled under `max-width: 767px`. |
| A4 | `ProductCard` images migrate to `next/image` (responsive sizes, lazy) — hover swap preserved. |
| A5 | Desktop animation experience unchanged. |
| A6 | Existing Playwright mobile/reduced-motion test (0 `.pin-spacer`) stays green. |

### B. Model imagery & variety (P0)
| # | Requirement |
|---|---|
| B1 | 8–10 new editorial-luxury model images (young Indian models) covering Banarasi, Kanjivaram, Chanderi, Bandhani, Patola, Organza, Georgette + festive Diwali looks; ≤300KB each, portrait 3:4, added to `public/images/`. |
| B2 | 8–10 new saree products across weaves/occasions/price bands, several tagged festive + new-arrival, added to seed files (idempotent additive seed). |
| B3 | New imagery woven into homepage surfaces where hardcoded (Testimonials, Lookbook, InstaMarquee picks) without changing section structure. |
| B4 | Homepage New Arrivals grid keeps showing 4 cards (test invariant). |

### C. Diwali Festival Special (P0)
| # | Requirement |
|---|---|
| C1 | `/diwali` page under `(site)` wrapped in `.theme-diwali`; inherits site shell (navbar/footer/cart unchanged). |
| C2 | Festival theme: new tokens (`--color-saffron`, `--color-marigold`, `--color-deep-plum`) + scoped styles (diya glow, festive accents). Global palette untouched. |
| C3 | Premium festive banner card (diya/marigold art + festive model imagery) + "Shubh Deepavali" storytelling block. |
| C4 | Festive & Dussehra saree grid via `listProducts({ occasion: "festive" })` using `ProductCard`. |
| C5 | Special-offer section with coupon **DIWALI15** (15% off, minOrder ₹5,000), seeded additively; verified via coupon API. |
| C6 | Homepage "Festival Season — Diwali Special" banner card (OccasionCard pattern) inserted between New Arrivals and CategoryGallery; links to `/diwali`. Pure addition. |
| C7 | Navbar: "Diwali" link + transparent-over-hero condition extended to `/diwali`. |
| C8 | All new animations gated behind `DESKTOP_MQ` (mobile/reduced-motion test stays green). |

## 4. Non-Goals
- No changes to Home/Shop/Product/Cart/Checkout flows or UI structure.
- No changes to global palette, typography, existing sections' layout.
- No new dependencies.
- No schema changes (coupon expiry fields deferred).

## 5. Acceptance Criteria
1. `npm run typecheck` and `npm run lint` pass.
2. `npm run seed` runs idempotently; new products + DIWALI15 present.
3. Playwright suite green, including: mobile/reduced-motion 0 pin-spacers; `#occasions` = 5 cards; New Arrivals render; **new tests**: `/diwali` renders banner + festive grid; `POST /api/misc/coupon {code:"DIWALI15"}` returns 15% discount.
4. `/diwali` reachable from homepage banner + navbar; theme visually distinct.
5. Pre-existing failures (if any) reported separately and untouched.

## 6. Implementation Plan (ordered)

| Step | Work | Files |
|---|---|---|
| 1 | Baseline: typecheck + lint (done, clean) | — |
| 2 | Generate & optimize 10 new images → `public/images/` | images |
| 3 | Hero mobile gate + decorative reductions | `Hero.tsx`, `globals.css`, `Motifs.tsx` |
| 4 | New products + images in seed data, refresh hardcoded picks | `seed-data.ts`, `catalogue-expansion.ts`, homepage components |
| 5 | Diwali theme tokens + scoped styles | `globals.css` |
| 6 | `/diwali` page + banner card + offer section | `src/app/(site)/diwali/page.tsx` |
| 7 | Homepage festival banner + navbar entry | `(site)/page.tsx`, `Navbar.tsx` |
| 8 | Seed DIWALI15 | `seed-data.ts` |
| 9 | ProductCard → `next/image` | `ProductCard.tsx` |
| 10 | Full validation + new Playwright cases | `tests/storefront.spec.ts` |
