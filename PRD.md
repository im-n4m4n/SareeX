# Elite Weavers — Product Requirements Document

## 1. Vision & Positioning
Elite Weavers is a luxury Indian saree house for the digital age: a couture flagship that sells handloom Banarasi, Kanjivaram, Chanderi, Bandhani, Patola and contemporary drapes with the storytelling of a fashion editorial. Every pixel carries textile memory — zari borders, paisley, temple-border dividers, kanjivaram checks — and every motion is silk: slow, continuous, never a hard cut.

**Principles:** cultural authenticity over trend; editorial storytelling over catalogue noise; negative space; craft transparency (hours of handwork, weaver region, zari purity).

## 2. Target Audience & Personas
| Persona | Needs |
|---|---|
| **Meera, NRI diaspora (38, Houston)** | Authentic weaves, international shipping, trust signals, easy returns, WhatsApp concierge |
| **Ananya, Indian luxury shopper (29, Mumbai)** | Contemporary drapes, designer organza/georgette, fast delivery, gifting |
| **Priya, Bridal customer (26, Delhi)** | Bridal Banarasi & Kanjivaram, lehengas, made-to-measure blouse, appointment-like service |
| **Lakshmi, Heritage collector (52, Chennai)** | Weave provenance, GI-tag info, pure zari, limited editions |

## 3. User Stories & Core Journeys
- **Browse** the homepage story → New Arrivals → Occasions → Craft → Lookbook.
- **Discover** by weave, occasion, colour, fabric, price; search; sort.
- **Product detail**: 3:4 gallery, Ken-Burns zoom, 3D drape viewer, fabric details, weave story, size/blouse guide, reviews.
- **Cart**: slide-in drawer with quantity steppers and free-shipping progress. Coupons are applied at checkout; shipping is decided on the goods value, so a coupon never removes free shipping.
- **Wishlist**: heart on any card (persisted, synced to account when signed in).
- **Checkout**: address form (Zod validated), coupon, Razorpay payment, confirmation email.
- **Order tracking**: order confirmation page with status timeline; order history in account.
- **Admin**: manage products, inventory, orders (status), coupons, categories, image upload.

## 4. Sitemap & Routes
`/` Home · `/shop` (filters) · `/collections` · `/product/[slug]` · `/cart` · `/checkout` · `/order/[number]` · `/account` (orders, wishlist, addresses, profile) · `/login` · `/register` · `/about` · `/craft` · `/journal` · `/journal/[slug]` · `/admin` · `/admin/products` · `/admin/orders` · `/admin/coupons` · `/admin/categories` · `/admin/collections`.

## 5. Feature List
Product catalogue · multi-facet filters · search · sorting · 3D drape viewer (R3F) · size & blouse guide modal · cart drawer · wishlist · Razorpay checkout (+ demo mode) · order history · admin CRUD · inventory decrement · email notifications (Resend) · reviews & ratings · coupons (`ELITE10`) · newsletter · JSON-LD structured data.

## 6. Tech Stack
Next.js (App Router, Server Components & Actions) · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · React Three Fiber + drei + three · Framer Motion (micro) · **Drizzle ORM + PostgreSQL** (the project's provisioned ORM, replacing Prisma with an identical relational model) · JWT cookie auth with `jose` + `bcryptjs` (credentials, role-based admin; Google OAuth hook-point documented) · Razorpay REST (orders + HMAC verification + webhooks) · local upload route with Cloudinary-ready hook · Resend REST · Zod · Lucide React · Zustand (cart & wishlist, persisted).

## 7. Data Models
`users`, `products`, `categories`, `weaves`, `occasions`, `collections`, `orders`, `order_items`, `wishlists`, `addresses`, `reviews`, `coupons`, `subscribers`. Products carry weave, fabric, occasion, colours (name+hex), images, price/compare-at, stock, badge, rating, story, work, blouse, length, care.

## 8. Design System
- **Palette:** ivory `#FAF7F2`, blush `#F3E6E0`, espresso `#1C1512`, champagne gold `#C9A24B`, maroon `#6B1E2A`, indigo `#1F2A44`, emerald `#0F5132`.
- **Type:** Cormorant Garamond (display, italics for emphasis), Inter (body), overlines `text-[11px] tracking-[0.3em] uppercase`.
- **Motifs:** SVG paisley, temple-border, zari lattice, kanjivaram check, brocade — 5–15% opacity textile textures.
- **Components:** pill CTAs, 3:4 `rounded-2xl` cards, gold hairline dividers, glass cards, bento grids, lotus mark.

## 9. Animation Strategy
Lenis + GSAP ticker sync (`lerp: 0.1`) · ScrollTrigger pinned hero (image scales into a `rounded-3xl` frame, headline drifts slower) · silk entrance (opacity 0→1, y 60→0, skewY 4→0, 1.1s `power4.out`, stagger 0.08) · masked headline lines · pinned split craft section with counters · pinned R3F silk drape scene (camera orbit/dolly on scroll) · horizontal lookbook with per-image parallax and gold progress line · Ken-Burns scale 1.15→1 · marquee speed eased by Lenis velocity · `prefers-reduced-motion` disables pin/scrub and shows static layouts.

## 10. SEO, Accessibility, Performance, Deployment
Metadata API + OpenGraph + `Product`/`Organization` JSON-LD · semantic landmarks, focus rings, alt text, AA contrast, keyboard-closable drawer/modals · lazy-loaded Canvas (dynamic import, DPR `[1,2]`), mobile gets lighter geometry · no GLTF payload (texture-only 3D) · deploy on Vercel with managed Postgres; env variables in `.env.example`.

## Brand and discovery expansion
The storefront is named **Elite Weavers**. The catalogue contains six garment categories and nine editorial collections, with additive PostgreSQL seeding that preserves existing purchases and inventory. `/categories` provides wardrobe discovery and `/admin/collections` provides role-protected collection management. A traditional zari selvedge acts as a live scroll-progress rail and chapter navigator. New motion includes a pinned thread-to-heirloom scene, scroll-drawn vine embroidery, editorial ink reveals, and an independent footer wordmark parallax. Mobile and reduced-motion use a poster instead of the heavy 3D scene.


## Engineering invariants (added after the audit)

- **One container contract.** `src/lib/layout.ts` exports `CONTAINER`, `CONTAINER_WIDE`, `CONTAINER_NARROW`, `CONTAINER_READING` and the `SECTION_Y`/`PAGE_TOP` rhythm values. Do not hand-write widths or gutters.
- **Component CSS lives in `@layer components`.** Unlayered rules beat every Tailwind utility regardless of specificity, so anything added to `globals.css` must sit inside the layer.
- **Shared constants.** Shipping thresholds and their prose (`SHIPPING_SUMMARY`), colour swatches (`COLOR_SWATCHES`), the cart line key (`cartKey`) and the motion media queries (`DESKTOP_MQ`) each have exactly one definition.
- **Nullable images** go through `coverImage()` — an empty `src` makes the browser re-request the page.
- **Order privacy.** `/order/[number]` is readable only by an admin, the signed-in owner, or the browser cookie written at checkout.
- **The `carts` table is unused** and reserved for server-side bag recovery.
