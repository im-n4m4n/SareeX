# SareeX / Elite Weavers — Full Codebase Audit Report

**Audited:** `C:\ZWorkX\SareeX` — 89 source files under `src/` (~8,400 lines), plus tests, config, seed data, docs and env files.
**Read-only audit. Nothing was modified.** Every finding is either read directly from the file or derived from the command output in section 0.

---

## 0. Evidence — what was actually executed

| Check | Command | Result |
|---|---|---|
| TypeScript | `npx tsc --noEmit --pretty false` | **exit 1 — 4 errors** |
| ESLint | `npx eslint .` | **exit 1 — 4 errors, 12 warnings** |
| Production build | `npx next build` | **exit 1 — "Failed to type check"** |
| Asset resolution | cross-referenced every image path in code against `public/` | **4 referenced files do not exist** |
| Byte encoding | read files as UTF-8, dumped code points | **mojibake confirmed in 3 components** |
| CSS cascade | parsed `.next/static/chunks/0oilivhh82u5r.css` layer blocks | **component CSS is unlayered, so it beats Tailwind utilities** |
| Dead code | grepped every exported symbol across `src/` | list in section 14 |

```
$ npx tsc --noEmit --pretty false
src/components/home/Sections.tsx(122,12): error TS2304: Cannot find name 'Card'.
src/components/home/Sections.tsx(123,12): error TS2304: Cannot find name 'Card'.
src/components/home/Sections.tsx(124,12): error TS2304: Cannot find name 'Card'.
src/components/home/Sections.tsx(125,12): error TS2304: Cannot find name 'Card'.

$ npx next build
Compiled successfully in 6.4min
  Running TypeScript ...
Failed to type check.
./src/components/home/Sections.tsx:122:12
Type error: Cannot find name 'Card'.
Next.js build worker exited with code: 1 and signal: null
```

---

## 1. Severity summary

| # | Severity | Area | Count |
|---|---|---|---|
| 1 | **BLOCKER** | Build does not compile (`Card` undefined) | 1 |
| 2 | **CRITICAL** | Live DB credentials in plaintext at the project root | 1 |
| 3 | **HIGH** | Mojibake in user-visible money/cart text — also fails the E2E suite | 3 files |
| 4 | **HIGH** | `/order/[number]` shows full buyer PII with no ownership check | 1 |
| 5 | **HIGH** | Free-shipping promise violated by coupon/shipping ordering | 1 |
| 6 | **HIGH** | Admin image field can overwrite another product's images | 1 |
| 7 | **HIGH** | 11 records reference 4 images that 404 | 4 files |
| 8 | **MEDIUM** | CSS cascade: unlayered component classes silently defeat Tailwind utilities | systemic |
| 9 | **MEDIUM** | Alignment: 8+ container widths, 5 gutter systems, 5 top paddings | systemic |
| 10 | **MEDIUM** | Same value computed two ways (shipping, reviews, colour names, delete guards) | ~14 |
| 11 | **MEDIUM** | Accessibility gaps (unlabelled forms, fake tabs/radiogroups, no focus traps) | ~25 |
| 12 | **MEDIUM** | SEO (fabricated aggregateRating, indexable auth pages, localhost SITE_URL) | ~10 |
| 13 | **MEDIUM** | Performance (per-pointermove tweens, per-frame geometry, unbounded observers) | ~12 |
| 14 | **LOW / NIT** | Dead code, duplicated types, index keys, dependency hygiene | ~45 |

---

## 2. BLOCKERS

### 2.1 next build fails — the app cannot be deployed

**src/components/home/Sections.tsx:122-125** [CRITICAL / build]

```tsx
122:  <Card slug="wedding" big className="min-h-[520px] md:col-span-5 md:row-span-2" />
123:  <Card slug="evening" className="min-h-[300px] md:col-span-7" />
124:  <Card slug="day" className="min-h-[300px] md:col-span-4" />
125:  <Card slug="festive" className="min-h-[300px] md:col-span-3" />
```

`Card` is **not defined and not imported** anywhere in the module. The card component that *is* defined — `OccasionCard` (L88-110, props `{ o, className, big }`) — is **never used**. The abandoned plumbing proves a half-finished refactor:

```tsx
113: const by = Object.fromEntries(occasions.map((o) => [o.slug, o]));   // never read
114: const wrap = (slug: string, el: React.ReactNode) => el;             // never called
```

`Occasions` is rendered by the home page (`src/app/(site)/page.tsx:36`), so this is a hard `ReferenceError` at render plus a type error at build. **It is the single reason the project cannot ship.**

**Fix** (restores intent with a minimal diff):

```tsx
const Card = ({ slug, ...rest }: { slug: string } & Omit<React.ComponentProps<typeof OccasionCard>, "o">) => {
  const o = by[slug];
  return o ? <OccasionCard o={o} {...rest} /> : null;
};
```

...or simply change the JSX to `<OccasionCard o={by.wedding} big className="..." />`.

After fixing this, re-run `npx tsc --noEmit`: the ESLint error count is exactly these 4, so **no other type error is being masked**.

### 2.2 Live database credentials in the project root

**SareeX Details.txt** [CRITICAL / security]

```
BD Pass : 4FmVaQLIUG0jFkaf
Project Url : https://mtjgislndbjousxuxngf.supabase.co
Publishable Key : sb_publishable_djxwaOnd6ZL9mFvFAggPkA_rMn6kTco
Direct Connection String : postgresql://postgres:4FmVaQLIUG0jFkaf@db.mtjgislndbjousxuxngf.supabase.co:5432/postgres
```

A plaintext Supabase **database password** and a full direct connection string at the workspace root. `.gitignore` covers `.env` and `.env*.local` but **not this filename**, so any future `git init` or `git add .` publishes it.

Also present: `.env` (real `AUTH_SECRET`, real `DATABASE_URL`) and `.env.local` (a live `VERCEL_OIDC_TOKEN`). Both are correctly gitignored; the token is still a live credential in the working copy.

**Fix:** rotate the Supabase password, delete the file, add a secrets ignore pattern, and keep the values only in `.env.local`.

### 2.3 Non-secure session cookies in production

**src/lib/auth.ts:23** [HIGH / security]

```ts
secure: (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https"),
```

The cookie's `Secure` flag is derived from a **public** env var that currently reads `NEXT_PUBLIC_SITE_URL=http://localhost:3000` in `.env`. Deploy with that value, or with the var unset, and the 30-day session cookie is issued without `Secure`. **Fix:** use `process.env.NODE_ENV === "production"`.

---

## 3. Security and data exposure

| ID | Sev | Location | Issue |
|---|---|---|---|
| S1 | HIGH | `(site)/order/[number]/page.tsx:14-17` | No session or ownership check. `getOrderByNumber(number)` (`lib/queries.ts:119`) returns **any** order, and the page renders buyer name, email, phone and full shipping address (L75-77) plus line items. Mitigation: numbers are `EW-` plus 6 timestamp digits plus 6 base-36 chars, so enumeration is impractical — but any link leak (forwarded email, screenshot, referrer) exposes PII. **Fix:** require `getSession()` and `order.userId === s.id`, or a signed token. |
| S2 | MEDIUM | `(site)/login/page.tsx:16` | The guard `next?.startsWith("/") ? next : undefined` accepts a protocol-relative value such as `//evil.com`. `AuthForm.tsx:28` then runs `router.push(next)` immediately after a successful login, giving an open redirect. **Fix:** also reject a leading double slash. |
| S3 | MEDIUM | `api/auth/[action]/route.ts` | No rate limiting or lockout on login; no email verification on register. Credential stuffing is unrestricted. |
| S4 | MEDIUM | `admin/actions.ts:34-35,48-55` | `colors` and `images` are free text with no length cap and no URL validation. The check `hex?.startsWith("#")` lets a value such as a hex-looking string containing a semicolon and a background-image url reach the inline style (CSS injection in `ProductCard.tsx:94` and `ProductBuy.tsx:41`), and any string becomes an image src (`data:` and protocol-relative hosts). The correct rule already exists for collections at L163. **Fix:** validate hex strictly and reuse the collection refine for images. |
| S5 | MEDIUM | `SmoothScroll.tsx:74-75` | Cross-account wishlist bleed: the persisted local wishlist of whoever used the browser last is merged into the newly signed-in account and written back via the debounced PUT. Logout (`api/auth/[action]:32-35`) only destroys the session and never clears `ids`. **Fix:** clear ids on logout, or namespace the persist key per user. |
| S6 | LOW | `api/misc/[action]:55-65` | `POST /api/misc/coupon` is unauthenticated and enumerable (404 "not valid" versus 400 "add more"). Add a throttle. |
| S7 | LOW | `next.config.ts` | Completely empty — no CSP, `X-Frame-Options`, `Referrer-Policy`, HSTS or `images.remotePatterns`. **Fix:** add a `headers()` block. |
| S8 | LOW | `Footer.tsx:26,100` | Placeholder WhatsApp number `https://wa.me/919999999999` is live in two places; the Facebook and YouTube links at L98-99 are dead placeholders pointing at hash. |

---

## 4. Money, cart and order logic

### 4.1 The free-shipping promise is broken by coupon ordering [HIGH]

- `(site)/cart/page.tsx:15` computes shipping from `subtotal` alone
- `components/CheckoutForm.tsx:55` and `api/checkout/route.ts:55` compute shipping from `subtotal - discount`

The cart quotes shipping on the **pre-discount** subtotal; checkout and the server compute it on the **post-discount** subtotal. The rule is advertised three times as "on orders above Rs 5,000" (`ProductTabs.tsx:37`, `ProductBuy.tsx:88`, `(site)/about/page.tsx:40`).

**Worked example — subtotal Rs 5,400 with ELITE10 (10 percent):**

| | Cart page | Checkout / API |
|---|---|---|
| Subtotal | 5,400 | 5,400 |
| Discount | none | minus 540 |
| Shipping | **Complimentary** (5400 >= 5000) | **199** (4860 < 5000) |
| Total | 5,400 | 5,059 |

The customer is told shipping is free on a 5,400 order and is then charged 199 for it. Because the discount exceeds the fee the total still drops, so this is a **trust and promise defect rather than systematic overcharging** — but the shipping line flips from "Complimentary" to 199 between two screens.

**Fix:** decide once. Either compute shipping on `subtotal` everywhere (matches the copy), or keep post-discount and rewrite all three copy sites, then make `cart/page.tsx:15` call the same shared helper checkout uses.

### 4.2 Other cart and order defects

| Sev | Location | Issue | Fix |
|---|---|---|---|
| HIGH | `CartDrawer.tsx:101` | The decrement handler passes `quantity - 1`, and `store.ts:48-49` clamps then filters out non-positive quantities, so pressing minus at qty 1 **silently deletes the line**. The plus button is correctly guarded at L105. | Disable the button at qty 1 and/or clamp at 1. |
| MEDIUM | `lib/store.ts:35-44` | `add()` clamps with `Math.min(qty, item.stock)`; with zero stock it inserts a line with quantity 0 that stays in the bag (only `setQty` filters zeroes). | Guard on `item.stock <= 0`. |
| MEDIUM | `lib/orders.ts:7-14` | `finalizeOrder` is read-then-write "idempotent", not atomic: two concurrent callers (webhook plus verify) both pass the paid check, so stock can be decremented twice and `usageCount` incremented twice. It also **returns the pre-update row**, so callers still see `paymentStatus: "pending"`. | Update with a `payment_status <> 'paid'` predicate and `RETURNING`, and proceed only if a row came back. |
| MEDIUM | `api/checkout/route.ts:35-44` | Stock is validated per **line**, not per **product**. The same product with two colours yields two lines; at stock 5, two lines of qty 5 each pass and oversell to 10. | Aggregate quantities by product before checking. |
| MEDIUM | `(site)/cart/page.tsx:47-49` | The plus stepper is never disabled at max stock, unlike `CartDrawer.tsx:105`; `setQty` clamps silently so the number just stops. | Mirror the drawer disabled state. |
| MEDIUM | `admin/page.tsx:14,21` | The "Low stock" stat is the length of a list limited to 8 — 30 low-stock products report 8. | Separate count query for the stat. |
| MEDIUM | `admin/actions.ts:24,64` | The `compareAtPrice` schema coerces with `z.coerce.number()` and falls back to a literal-empty transform, but that branch is **unreachable** because coercing an empty string yields 0, which passes `.int()`. An empty field is stored as **0**, and the null-coalesce keeps it; the admin form then renders "0". | Preprocess empty and null to undefined before coercing. |
| LOW | `api/webhooks/razorpay:31-33` | `payment.failed` sets `paymentStatus: "failed"` even on an order already marked paid. | Only update when the status is not already paid. |
| LOW | `ProductCard.tsx:85-90` | `discountPercent` returns 0 when the compare price is at or below the price, but the JSX renders whenever `compareAtPrice` is truthy, producing a struck-through price plus "**0 percent off**". Same on the PDP at L93. | Guard the block on a positive percentage. |
| LOW | `(site)/checkout/page.tsx:16` | The saved-address prefill drops `fullName` and `phone` (both stored in `addresses`), so the customer retypes their phone every time. | Include them in the prefill object and in the `Prefill` type. |

---

## 5. Encoding corruption (mojibake) — user-visible, and it fails the E2E suite

Three components contain **double-encoded UTF-8** stored literally in the source. Verified at byte level: the files hold codepoints U+00C2 and U+00E2 where the real characters belong.

| File | Lines | What renders | Should be |
|---|---|---|---|
| `components/product/ProductBuy.tsx` | 57 | "Only N left" followed by a corrupted em-dash; "In stock" followed by a corrupted middle dot and a corrupted en-dash | em-dash, middle dot, en-dash |
| | 72 | the cart colour string uses a corrupted middle dot before "Size" | middle dot |
| | 88 | "Free Shipping over" followed by a corrupted rupee sign and 5,000 | rupee sign |
| | 116 | "choose a shade 1" followed by a corrupted en-dash | en-dash |
| `components/CheckoutForm.tsx` | 69 | coupon message with a corrupted em-dash | em-dash |
| | 178 | cart line meta with a corrupted middle dot | middle dot |
| | 191 | the discount row uses a corrupted minus sign | minus sign |
| | 198 | "Processing" followed by a corrupted ellipsis | ellipsis |
| | 200 | "UPI" and "Cards" separated by a corrupted middle dot | middle dot |
| `components/Navbar.tsx` | 122 | the search placeholder ends with a corrupted ellipsis | ellipsis |

**Two concrete consequences beyond cosmetics:**

1. **The cart line label is corrupted at the data level.** `ProductBuy.tsx:72` writes the corrupted middle dot into the cart item colour string. The Playwright suite asserts exactly the string containing a real middle dot (`tests/storefront.spec.ts`, "New kurta sets support sizes and the cart drawer"). With an exact-text matcher that assertion **cannot pass** while these bytes remain — a byte-level certainty, not a guess.
2. The rupee sign renders corrupted on the PDP shipping promise, which means corrupted currency on a commerce page.

**Fix:** re-save the three files as UTF-8 with the correct literals, and add a CI guard that greps for the mojibake lead bytes under `src/` and fails. Note `ProductTabs.tsx:37` and `lib/utils.ts:6` already hold a correct rupee sign, so this is corruption, not an intentional glyph.


---

## 6. CSS architecture — the cascade bug behind a whole class of "why doesn't my Tailwind work"

```
$ node -e "parse .next/static/chunks/0oilivhh82u5r.css layer blocks"
@layer properties  [13972 ... 15920]
@layer theme       [15920 ... 17606]
@layer base        [17606 ... 21193]
@layer utilities   [21211 ... 79598]

.btn-gold          idx= 82871  UNLAYERED (top level)
.btn-gold:hover    idx= 83207  UNLAYERED (top level)
.field             idx= 82678  UNLAYERED (top level)
.zari-text         idx= 86782  UNLAYERED (top level)
.pat-soft          idx= 83869  UNLAYERED (top level)
.brand-watermark   idx= 95361  UNLAYERED (top level)
.px-5              idx= 53589  utilities
.py-2.5            idx= 54121  utilities
```

Every hand-written rule in `globals.css` lives **outside** any `@layer`. In the CSS cascade, **unlayered declarations beat all layered ones regardless of specificity**, and Tailwind v4 puts its utilities inside `@layer utilities`. Therefore, for any property both declare, the component class always wins.

### 6.1 Silent breakage

**components/home/Sections.tsx:104** [MEDIUM]

```tsx
<span className="btn-gold translate-x-6 px-5 py-2.5 text-xs opacity-0 ...">Explore</span>
```

`globals.css:145-158` declares `.btn-gold` with `padding: 0.95rem 1.8rem` and `font-size: 0.85rem` — unlayered. So the Tailwind padding and text-size utilities on that span are **dead**: the "Explore" pill renders at full button size with 0.85rem text, not the compact size the author intended.

### 6.2 The workarounds it spawned

The same author clearly hit this and patched it ad hoc with the important modifier:

- `components/admin/ImageField.tsx:26` adds an important text-size utility
- `components/CheckoutForm.tsx:185` adds an important vertical padding utility
- `app/admin/products/page.tsx:41` adds important width, radius and padding utilities
- `app/admin/orders/page.tsx:28` adds important width and padding utilities

...while other places (`Sections.tsx:104`) are silently wrong. `cn()` makes it worse:

**lib/utils.ts:1-3** [MEDIUM] — `cn()` is a naive filter-and-join, **not** tailwind-merge. Two conflicting utilities are both emitted and source order decides, so passing two conflicting padding classes is unpredictable. **Fix:** adopt tailwind-merge and move `.btn-*`, `.field`, `.glass` and the pattern classes into `@layer components`.

### 6.3 Duplicate and conflicting rules

| Location | Issue |
|---|---|
| `globals.css:100-102` **and** `globals.css:202` | `.pat-soft` is declared twice — opacity 0.1 then opacity 0.32. The first is dead. |
| `globals.css:430` versus `Footer.tsx:49` | `.brand-watermark` sets `font-size: 13.4vw !important` and always beats the JSX's `text-[22vw]`. The Tailwind class is dead and the two intended sizes disagree by 8.6vw. |
| `globals.css:268-278` versus `WeaveStory.tsx:64` | The selector `h2 i:not([class*="text-"])` has specificity (0,1,2) and beats `.zari-text` at (0,1,0), so the italic word in the heading gets the maroon-to-gold 7s shimmer instead of the intended 6s gold one — the class is inert. *(Careful: the same pattern in `Hero.tsx:82` is on a span, not an italic element, so that one is fine — do not "fix" it.)* |
| Dead class names used in JSX | `woven-edge-left` (`WeaveScrollRail.tsx:137`), `collection-editorial` (`CollectionExplorer.tsx:28`, `CollectionShowcase.tsx:24`), `weave-story` (`WeaveStory.tsx:36`) — **none exist** in `globals.css`, the app's only stylesheet. |

### 6.4 Off-token colours

`@theme` defines 8 colour tokens (`globals.css:4-11`), but these hardcode hex:

- `CollectionShowcase.tsx:11` uses a sand hex
- `(site)/collections/page.tsx:28` uses a **slightly different** sand hex for the same kind of section (one digit apart)
- `WeaveStory.tsx:36,56` use the same deep-maroon hex twice
- `globals.css:17,20` set the page background with a literal hex instead of the ivory token

---

## 7. Layout and alignment (measured, not impressionistic)

### 7.1 Container widths — 11 values for "the content column"

| Width | Uses | Where |
|---|---|---|
| 1600px | 1 | Navbar nav row (`Navbar.tsx:69`) |
| 1500px | 5 | PDP three times, `shop:48`, `Hero.tsx:73` |
| 1400px | 7 | `collections:22`, `craft:31`, `shop:40`, `CategoryGallery:20`, `Sections:23,70` |
| 1360px | 1 | `CollectionShowcase.tsx:14` |
| 1340px | 1 | `WeaveStory.tsx:44` |
| 1320px | 1 | `collections/page.tsx:29` |
| 1300px | 6 | `about:17`, `categories:20`, `craft:55`, `journal:10`, `Footer:54`, `Sections:144` |
| 1200px | 6 | `about:25,38`, `account:30`, `cart:18`, `checkout:19`, `craft:39` |
| 1180px | 1 | Navbar mega menu (`Navbar.tsx:98`) |
| 1000px | 1 | `craft:69` (size guide) |
| 900px | 1 | `order/[number]:22` |

**Concrete misalignments this produces:**

- **/shop** — the hero heading is on 1400 (L40) while the breadcrumb, filter rail and grid are on 1500 (L48): roughly 50px offset at a 1600px viewport, so the H1 and the "Find Your Piece" heading do not share a left edge.
- **/craft** — three widths on one page: 1200 (L39), 1300 (L55), 1000 (L69). "The Making of a Saree" and "The Weaves We Carry" headings sit about 90px apart at 1440px.
- **/collections** — 1400 (L22) then 1320 (L29): the two section headings do not align.
- **Home page** — vertical siblings use 1500, 1400, 1400, 1360, 1340, 1400 and 1300: **six widths**, so the left edge shifts on every scroll.
- **Testimonials** (`Sections.tsx:144`, 1300) are 100px narrower than their own siblings in the same file (1400 at L23, L70 and L119).

### 7.2 Horizontal gutters — 5 different systems

`px-5 md:px-10` (4 uses), `px-6 md:px-12` (6), `px-6 md:px-10` (22), `px-5 md:px-12`, and bare `px-8` / `px-14` / `px-16`. `CategoryGallery` pads its children while siblings pad the section, and `Navbar` is force-padded from CSS with an important override (`globals.css:385`).

### 7.3 Vertical rhythm and top clearance

Section padding in use: `py-16`, `py-20`, `py-24`, `py-24 md:py-28`, `py-28`, `py-32`.
First-content clearance under the same fixed navbar: `pt-28` (PDP), `pt-32` (login and register), `pt-36` (cart, checkout, account, order, journal article), `pt-40` and `pt-40 md:pt-44` (shop, categories, collections, journal index).

### 7.4 Specific alignment defects

| Sev | Location | Issue |
|---|---|---|
| MEDIUM | `Sections.tsx:121-125` | A 12-column, 2-row grid where row 1 is 5+7 = 12 columns but row 2 is 4+3 = **7 columns, leaving 5 empty columns** — a visible hole in the bottom-right of the occasions grid. Also `md:h-[820px]` is a hard height while children declare min-heights of 520px and 300px. |
| MEDIUM | `Navbar.tsx:96-101` | The mega panel is centred on a 1180px track with 32px gutters while its own trigger sits on the 1600px, important-padded nav row, so the "Wardrobe" panel does not line up under the "Wardrobe" link. |
| MEDIUM | `Lookbook.tsx:45-56,79-81` | The parallax exceeds the image bleed. The card is 30vw wide; the image is offset -18 percent and sized 136 percent, giving 18 percent bleed each side (about 78px at 1440px). But the per-card amplitude reaches **100** for cards 2 and 5, so at the scroll extremes the image shifts about 22px past its bleed and a strip of the card background shows through. |
| MEDIUM | `CraftSplit.tsx:83-92` | A three-column grid with 5xl/6xl numerals at **all** widths: at 360px each cell is about 93px while "120+" at 48px Cormorant is about 100px plus the suffix, so the numbers wrap or collide. |
| MEDIUM | `DrapeScene.tsx:57` | The caption box is a fixed 224px (256px at md) holding an overline, a 6xl/8xl heading and a paragraph, absolutely positioned inside an overflow-hidden section. At 360px the tallest caption is about 220px against 224px available, so clipping is likely. |
| LOW | `WeaveRibbon.tsx:8` | A minimum width of 700px inside an overflow-hidden parent on a 375px viewport: the SVG is wider than its container so auto margins resolve to zero, the motif is clipped on the right only, and the centred lotus badge no longer looks centred. |
| LOW | `collections:27` plus `(site)/layout.tsx:18` | The page ends with a fixed ivory ribbon above a sand-coloured section, then the layout appends an ivory-to-espresso arch divider — an ivory strip lands between a sand band and the dark footer. Same pattern on the home page (`page.tsx:33`). |
| LOW | `ProductBuy.tsx:93` versus `craft/page.tsx:74` | Two size-guide tables in one app with **different columns** (Size/Bust/Waist/Blouse length versus Size/Bust/Waist/Hip) and mismatched cell padding, so column one is visibly offset. |
| LOW | `admin/coupons/page.tsx:30` | A flex display applied directly to a table cell breaks its box model and its vertical alignment next to sibling cells. |
| LOW | `journal/[slug]:27` | Padding applied to the aspect-ratio box, so the hero is inset on mobile and flush at md and above while the header and body keep a constant gutter at every size. |
| LOW | admin pages | Column width changes per page under one shell: 3xl (categories), 4xl (coupons), 5xl (collections), uncapped (orders). |

---

## 8. Consistency — the same value computed two (or three) ways

| Value | Computed as | Mismatch |
|---|---|---|
| **Shipping cost** | pre-discount subtotal on the cart page versus post-discount everywhere else | See 4.1 — breaks the advertised promise. |
| **Free-shipping threshold** | the exported constant, plus a prose copy in `ProductTabs.tsx:37`, a second in `ProductBuy.tsx:88`, and a third in `about/page.tsx:40` | Three prose copies plus the constant; change one and four drift. |
| **Flat shipping fee** | the exported constant is imported by nobody; the literal value is typed into the prose in `ProductTabs.tsx:37` | The constant is effectively dead. |
| **"Above Rs 5,000"** | the wording says *above*, but the logic is inclusive | A 5,000 order ships free despite "above". |
| **Review count** | max of stored count and fetched reviews (anchor), versus the six actually rendered, versus a floor of 1 in the JSON-LD | "(124 reviews)" with six shown; JSON-LD claims at least one review even at zero. |
| **Rating** | the star component rounds, so 4.9 fills **five** stars, while the adjacent text says 4.9 and the product default is 4.8 | Three numbers for one claim. |
| **Weave name** | the facet display name versus the raw slug capitalised on the PDP | The PDP says "Cotton" while every filter says "Handloom Cotton" (same for Kota Doria and Mysore Silk). |
| **Occasion name** | the facet display name versus the raw slug capitalised on the PDP | The PDP says "Day" or "Casual" where the facets say "Casual Day" and "Everyday". |
| **Colour names** | ten swatches hardcoded in the filter panel while the catalogue has thirteen; Marigold, Saffron and Lilac are missing, and "Peacock" is compared against data reading "Peacock Blue" | Three real colours are unfilterable. Also a substring match on "gold" also matches "Marigold". |
| **Category and collection counts** | "Explore Six Categories" and "Nine curated stories" are hardcoded while both are admin-creatable | Accurate today, wrong the first time an admin adds one. |
| **Delete guards** | the collection delete refuses when products reference it; the category delete does **not** | Deleting a category orphans products and leaves the shop filtering by a slug with no facet, while the H1 falls back to "All Pieces". |
| **Cart line identity** | a colon-separated key in the store versus hyphen-separated keys in the drawer, cart page and checkout form | Three encodings of one identity; a colourless key becomes a string ending in "undefined". |
| **Admin error contract** | the collection action redirects with an error query parameter and renders `role="alert"`; four other actions return silently | Failed admin submits reload with no message in four of five forms. |
| **Price buckets** | both bounds are inclusive while the labels read "Under Rs 5,000" and "Rs 5,000 – Rs 15,000" | A 5,000 product matches **both** buckets. |
| **The new-arrivals flag** | the query filters only when the parameter equals "1", but the title treats any truthy value as new arrivals | A link with the parameter set to "0" titles the page "New Arrivals" while listing everything. |
| **Storefront top padding** | 28, 32, 36 and 40 units for the same fixed navbar | Four values for one offset. |

---

## 9. Missing assets — 4 referenced images do not exist

`public/images/` contains exactly **21** files: bridal, craft-loom, hero, m01 through m16, silk-green and silk-maroon (all JPG).

Referenced but **absent** — all four come from `src/db/catalogue-expansion.ts`:

| Missing file | Blast radius |
|---|---|
| `/images/dupatta-edit.jpg` | the dupattas category cover plus 2 products (Shahi Banarasi Silk Dupatta, Gulnaar Zari Silk Dupatta) |
| `/images/blouse-edit.jpg` | the blouses category cover plus 2 products (Maharani Emerald Brocade Blouse, Royal Zari Brocade Blouse) |
| `/images/kurta-edit.jpg` | the kurta-sets cover, the everyday-poetry collection cover, plus 2 products (Vasant Ivory Chanderi Set, Savera Handloom Kurta Set) |
| `/images/shawl-edit.jpg` | the shawls-and-stoles cover, the kashmiri weave image, plus 2 products (Neelam Sozni Pashmina Shawl, Kashmir Midnight Paisley Stole) |

**Visible effect:** on `/categories` **4 of the 6** cards render a broken image; the Navbar mega-menu (which shows exactly dupattas, blouses and kurta-sets, `Navbar.tsx:100`) is **entirely broken**; `/shop?category=kurta-sets` and the Playwright dupatta and kurta assertions render broken covers; `/collections` shows one broken weave thumbnail.

**Fix:** add the four images, or repoint those records at existing files — the seed already does exactly this elsewhere.

**Related — an empty string used as an image source** [LOW]: `categories/page.tsx:23`, `collections/page.tsx:30`, `order/[number]:57`, `Sections.tsx:48,96`, `Navbar.tsx:101`, `ProductCard.tsx:28,41`, `ProductGallery.tsx:45,51`, `admin/products/page.tsx:29`. An empty src is not "no image": browsers resolve it to the current document URL and re-request the page as an image. Four components already do it right (`CollectionShowcase.tsx:27`, `CollectionExplorer.tsx:30`, `CategoryGallery.tsx:36`, `admin/collections:30`). **Fix:** one shared cover-image helper.


---

## 10. Accessibility

### High impact

| Location | Issue |
|---|---|
| `CheckoutForm.tsx:151-164,185` | **Nine controls with no accessible name** — placeholder-only, with no label element, no id and htmlFor pairing, and no aria-label. WCAG 3.3.2 and 4.1.2. The correct pattern already exists at `NewsletterForm.tsx:33-35`. |
| `account/page.tsx:94-101,109-114` | The add-address form (eight controls) is placeholder-only, and the profile-form labels are unassociated (a label with no htmlFor). |
| `admin/coupons:14-17`, `admin/categories:14-16`, `admin/orders:28` | Placeholder-only admin controls; required and optional fields are indistinguishable. |
| `AuthForm.tsx:35-38`, `ReviewForm.tsx:52-53` | Placeholder-only. |
| `ProductTabs.tsx:10-24` | Tab list, tab and tabpanel roles with **no ids, no aria-controls, no aria-labelledby, no roving tabindex and no arrow-key handling** — an invalid tabs pattern that assistive tech reports as tabs with no associated panel. |
| `ReviewForm.tsx:45-51` | A radiogroup whose children are plain buttons with no radio role and no aria-checked, so the selected rating is never announced. |
| `CartDrawer.tsx:41-49`, `ProductBuy.tsx:92-120` | Both are dialogs **without aria-modal**, with no focus move, no focus trap and no focus restore. The size guide also has no Escape handler. `Navbar.tsx:110` gets this right — follow that pattern. |
| `Hero.tsx:104,115` plus L44 | The hero timeline's side-element selector matches **two** elements: the decorative marker *and* the real "Scroll to discover" button. The timeline sets opacity to zero on both, and opacity does not remove an element from the tab order, leaving an **invisible but focusable, clickable button**. |
| `ShopControls.tsx:52` | At the large breakpoint the filter panel is always visible, yet the toggle stays tabbable and announces an expanded state for a panel it no longer controls. |
| `ImageField.tsx:30` | The file input uses the hidden class, which means display:none and therefore out of the tab order, and the wrapping label is not focusable — so **keyboard-only admins cannot upload images**. |
| `SilkCanvas.tsx:112-137` | The 3D viewer is pointer-only: no keyboard equivalent for the orbit controls, no role or name on the canvas, and the only instruction text (`SilkViewer.tsx:11`) is decorative and unlinked. |

### Medium and low

- `ui.tsx:74-79` — an aria-label on a bare span with no role is not exposed by most screen readers, and the five inner SVGs have no aria-hidden, so the rating is effectively silent. **Fix:** give the wrapper an image role and hide the SVGs.
- `DrapeScene.tsx:57` — all three captions exist simultaneously, separated only by inline opacity; opacity-zero content stays in the accessibility tree, so assistive tech reads three stacked H2s with no active indicator.
- `InstaMarquee.tsx:41` — 24 sibling links all named "View on Instagram", plus the floating call to action: 25 identical link names.
- `ShopControls.tsx:40-41` — single-select facet groups rendered as independent pressed-state toggles inside no group.
- `WeaveScrollRail.tsx:146-153` — chapter stops are 44 by 23 pixels positioned by percentage; stops closer than about 6 percent overlap, so the later button swallows the click and the earlier label is unreachable.
- `account/page.tsx:43-46`, `admin/layout.tsx:25-29` — the active nav item and tab are conveyed by colour only, with no aria-current.
- `about/page.tsx` — the heading order jumps from H1 (L19) to H3 (L45); there is no H2 on the page.
- `craft/page.tsx:74`, `ProductBuy.tsx:105-114`, the admin tables — header cells without a column scope; one empty header cell at `admin/products:21`.
- `journal/[slug]:29` — the article hero has an empty alt while the index page uses the article title for the same image.
- `ProductCard.tsx:93-95` — colour swatches are exposed only through a title attribute on non-focusable spans.
- `ProductBuy.tsx:77-83` — the wishlist toggle lacks a pressed state while the identical control on ProductCard has one: the same control behaves differently on card and PDP.
- `admin/layout.tsx:36` — no main landmark in the admin shell, so the skip link has no target there; `not-found.tsx` also renders outside the storefront main element.
- `ReviewForm.tsx:19` — a raw anchor to the login page where every other internal link uses the Next.js Link component.
- `AuthForm.tsx:40`, `NewsletterForm.tsx:45`, `CartDrawer.tsx:56` — busy buttons without a busy state, and success messages without a live region.

---

## 11. SEO

| Sev | Location | Issue |
|---|---|---|
| HIGH | `product/[slug]/page.tsx:56` | The JSON-LD `aggregateRating` is emitted **always**, with a floor of one review. A brand-new product with zero reviews advertises "**4.8 from 1 review**" (the rating column defaults to 4.8 in `schema.ts:95`) and contradicts the page's own count at L86, which renders "(0 reviews)". Fabricated aggregate ratings violate Google structured-data policy. **Fix:** emit only when there is at least one real review, computed from those reviews. |
| MEDIUM | `lib/utils.ts:21` plus `app/layout.tsx:18` | The site URL and metadataBase fall back to localhost, and `.env` currently sets exactly that. A production deploy that forgets the variable publishes a localhost sitemap, robots sitemap URL, canonical base and JSON-LD URLs. Two byte-identical copies of the same expression means two sources of truth. |
| MEDIUM | `shop/page.tsx:12` | Static metadata on a force-dynamic route whose visible H1 varies per query, with no canonical alternate, so every filter permutation duplicates one title and description. |
| MEDIUM | `layout.tsx:43` | The Organization logo points at an SVG. Google requires a **raster** logo (at least 112 by 112), so the logo is dropped from rich results. |
| MEDIUM | `collections/page.tsx:26` | The same category gallery (same id, identical cards) is rendered on the home page, on /collections and again as /categories — three URLs, one body of content, no canonical. |
| LOW | `robots.ts:6` | The disallow list omits /login, /register, /order and /cart; only /order and /account carry a noindex directive. |
| LOW | `layout.tsx:32` | A Twitter card is declared with card type "summary_large_image" but images are declared only under openGraph, and Next does not copy them across, so the card can render imageless. |
| LOW | `sitemap.ts:10,13` | Naive string concatenation: a trailing slash in the env var yields a double slash, and the static routes carry no lastModified. |
| LOW | `app/layout.tsx:54,56` | The intro curtain and the custom-cursor effects are mounted in the **root** layout, so the 2.7 second espresso curtain also covers /admin and the auth pages on every hard load. |
| LOW | `not-found.tsx` | No metadata (it inherits the site title) and no noindex directive. |

---

## 12. Performance

| Sev | Location | Issue |
|---|---|---|
| MEDIUM | `Effects.tsx:53,81` | A GSAP tween to opacity 1 is created on **every unthrottled pointermove** — a new tween plus overwrite resolution per pointer event. The hover branch directly above it shows the correct guarded pattern. |
| MEDIUM | `ProductGallery.tsx:35-38` | The mouse-move handler calls getBoundingClientRect **and** sets React state per pointer event, forcing a re-render and a layout read at pointer frequency. Use a ref plus a CSS custom property. |
| MEDIUM | `SilkCanvas.tsx:39-69` | The frame loop iterates every vertex (110 by 90, about **9,900 vertices**) with three trig calls each **and calls computeVertexNormals every frame**, then lerps the camera. This is the heaviest loop in the app and runs whenever the canvas is in view. |
| MEDIUM | `SilkCanvas.tsx:27-32` | A **side effect inside useMemo** (mutating a three.js texture during render) with the lint rule explicitly disabled; React may discard or recompute memos. **Fix:** move it to useEffect. |
| MEDIUM | `SmoothScroll.tsx:26-37` | A MutationObserver on document.body with subtree enabled: **every** React DOM mutation anywhere reschedules a full-document animation scan. `WeaveScrollRail.tsx:100-101` shows the narrower main-element pattern. |
| MEDIUM | `WeaveScrollRail.tsx:57,105-106` | Writes a CSS custom property on documentElement **every scroll frame** (a root custom-property write invalidates style for everything consuming it), and a ResizeObserver on document.body reschedules a rescan that itself writes DOM. |
| MEDIUM | `InstaMarquee.tsx:20-30` | A GSAP ticker callback runs forever doing a Lenis lookup and a style write per frame even when the marquee is far off-screen; there is no IntersectionObserver gate, unlike SilkCanvas which gates correctly. |
| MEDIUM | `shop/page.tsx:61` | Keying the product grid on the serialised search params remounts **every product card** on any filter, sort or view change, so images re-fetch and the entrance animations restart. |
| LOW | `product/[slug]:17-37` | The product query runs twice per request (metadata and page), each awaiting the seed, plus up to two listing queries for the related products row. **Fix:** wrap the queries in React cache. |
| LOW | `sitemap.ts:6` | force-dynamic re-runs the product listing (and the seed guard) on every crawler hit. |
| LOW | `CartDrawer.tsx:13` | Subscribes to the whole Zustand store instead of selectors, so it re-renders on unrelated state. |
| LOW | `SilkCanvas.tsx:80` | A THREE.Color is allocated on every render where a hex or number is accepted. |

---

## 13. React correctness and async error handling

| Sev | Location | Issue |
|---|---|---|
| HIGH | `admin/products/[id]/page.tsx:58` plus `ImageField.tsx:6` | `<ImageField defaultValue={p?.images ?? []} />` has **no key**, and the component initialises state from the prop only on mount. Navigating from "Edit product A" to "Edit product B" is the same route with a different param, so React reuses the instance: the textarea still holds **A's images**, and saving writes them onto **B**. Silent cross-record data corruption. **Fix:** pass `key={p?.id}`, or sync with an effect. |
| MEDIUM | `SmoothScroll.tsx:70-91` | The Zustand subscription is created *inside* the promise callback with no unmount guard: if the component unmounts before the fetch resolves, cleanup already ran with no unsubscribe handle, so the subscription **leaks forever** and keeps writing to the server. |
| MEDIUM | All fetch-in-handler components | **No try/catch anywhere**: `NewsletterForm.tsx:11-27`, `ReviewForm.tsx:24-33`, `ImageField.tsx:10-22`, `AuthForm.tsx:13-30`, `CheckoutForm.tsx:59-74`, `AccountClient.tsx:17-19`. A network blip or a non-JSON error body (for example a 413 or an HTML error page) leaves the UI stuck in a busy state **forever with no message**. |
| MEDIUM | `AccountClient.tsx:12,19,31-32` | State is typed as array-or-null and guarded by a strict null check. On network failure the promise rejects, state stays null and the wishlist tab is stuck on "Loading" permanently. If a 200 ever arrives without a products key, the setter stores undefined, bypassing the guard, and the length access throws. **Fix:** catch into an empty array and use a nullish guard. |
| MEDIUM | `CheckoutForm.tsx:185-188` | Typing in the coupon box after a successful apply keeps the applied state set, so the message stays green and the summary keeps a **stale discount** for a code no longer in the field. |
| LOW | `admin/actions.ts:59` | The slug is derived from the form with no uniqueness handling while the column is unique, so a duplicate name or slug throws an unhandled Postgres 23505 (a 500 page) instead of using the error-redirect path the function already implements at L45. |
| LOW | `admin/products/[id]/page.tsx:27` | A non-numeric id becomes NaN and is sent to Postgres, producing an invalid integer syntax error and an unhandled 500 instead of a not-found response. |
| LOW | `admin/products/[id]/page.tsx:17` | The select defaults to the first option value, and the "None" option is rendered **first**, so for a new product the default becomes the first collection slug: "None" is never preselected and every new product is silently filed under the first collection. |
| LOW | `admin/actions.ts:89-137`, `account/actions.ts:32` | The id from form data is coerced without validation: coercing null yields 0 and the integer check passes, so a missing id issues a query against id 0 instead of failing loudly. |
| LOW | `admin/actions.ts:98,106,121,144,183` | Failed validation returns silently, so a rejected admin submit reloads with **no message**, unlike the collection action which redirects with an error parameter. |
| LOW | `Navbar.tsx:46-52` | Render-phase state updates to reset menus on navigation is a documented React escape hatch, but it re-renders the header on every navigation and is inconsistent with the effect-based resets elsewhere. |
| LOW | `WeaveScrollRail.tsx:88` | The synthetic chapter uses the id "main", conceptually colliding with the storefront main element; any real section with that id yields duplicate React keys. The label is also truncated mid-word at 32 characters and shown verbatim in the mobile bar. |
| LOW | `Navbar.tsx:61` | The transparent-over-hero condition omits the search overlay, so the header stays transparent over the home hero while search is open. |
| NIT | `SmoothScroll.tsx:59` | decodeURIComponent on the location hash throws a URIError on a hand-typed malformed escape, breaking the deferred init for that route change. |

**No conditional hook calls were found anywhere.** Every hook-using component has the client directive, and all client/server boundaries are correct.


---

## 14. Dead code and duplication

**Unused exports and definitions** (verified by grepping every symbol across `src/`):

- `lib/queries.ts:114` — the "all reviews" query helper: zero call sites.
- `components/ui.tsx:29` — the Overline component: zero call sites (it duplicates SectionTitle's hairline markup).
- `components/Motifs.tsx:161` — the GoldDivider component: zero call sites.
- `lib/animations.ts:16` — the isMobile helper: zero call sites.
- `db/schema.ts:178-183` — the **carts table and CartLine type**: defined, created by the migration, and never read or written (the cart is pure client-side Zustand) — yet the PRD lists it as a data model.
- `components/home/Sections.tsx:88-110` — OccasionCard is unreachable, and L113-114 (the lookup map and the wrap helper) are unused (see 2.1).
- `components/WeaveRibbon.tsx:5` — both props (dark and className) are dead; all 10 call sites use the component with no arguments.
- `components/home/WeaveStory.tsx:36` — the weave-story class exists in no stylesheet.

**Unused imports** (ESLint cannot catch these — see section 15):

- `components/product/ProductBuy.tsx:3` — useEffect
- `components/CheckoutForm.tsx:5` — useEffect
- `api/misc/[action]/route.ts:107` — a "void and;" statement is a hand-rolled unused-import suppressor for the "and" import; delete both.

**Duplicated shapes and constants:**

- **Five copies of one facet type**: `Sections.tsx:8`, `ShopControls.tsx:8`, `Navbar.tsx:16`, `CategoryGallery.tsx:9`, `CollectionShowcase.tsx:6`.
- **Four copies of the media-query string**: `CraftSplit.tsx:25`, `DrapeScene.tsx:22,33`, `Lookbook.tsx:27` (768px) and `WeaveStory.tsx:18` (1024px).
- **Three prose copies of the free-shipping rule** and two copies of the flat fee.
- **Four hardcoded slug lists mirroring database data**: `CollectionShowcase.tsx:9`, `CollectionExplorer.tsx:9-15`, `Navbar.tsx:100`, `(site)/page.tsx:21`.
- **Two near-duplicate sand hexes** for the same visual role.

**Index used as key** (mostly static, so NIT; one real risk): `ImageField.tsx:37` (a mutable list), `InstaMarquee.tsx:40`, `CraftSplit.tsx:78`, `WeaveStory.tsx:41,66`, `ui.tsx:19`, `ProductGallery.tsx:19`, `ProductBuy.tsx:111`, `WeaveRibbon.tsx:11`, `journal/[slug]:32`.

**Unused GSAP scoping**: `CraftSplit.tsx:26` and `Lookbook.tsx:45` use document-wide selector queries via the GSAP utility helper. The matchMedia scope argument scopes only selector *strings passed to tweens*, not utility queries, so these are latent cross-section bugs.

**Whitespace-only lines**: `ProductCard.tsx:15`, `CartDrawer.tsx:15`, `CheckoutForm.tsx:50`, `ProductBuy.tsx:21`.

**Marquee loop width off by 8px**: `InstaMarquee.tsx:26` halves the track scroll width to find the wrap point, but the track holds two copies of 12 tiles with a 16px gap between all 24 and **no trailing gap**. So the scroll width is 24 tiles plus 23 gaps, and half of it is 8px short of one full copy (12 tiles plus 12 gaps). The marquee jumps 8px every cycle. **Fix:** add one gap before halving, or wrap each copy in its own element.

---

## 15. Config, dependency and docs hygiene

| Sev | Item | Detail |
|---|---|---|
| MEDIUM | `package.json:2` | The package name is still the starter template's ("nextjs-postgresql-template"). |
| MEDIUM | `package.json` | `@playwright/test` and `tsx` are in **dependencies** (shipped at runtime) though they are build and test only. `@types/bcryptjs` is unnecessary because bcryptjs v3 ships its own types, and `@types/three` is not imported directly. |
| MEDIUM | `eslint.config.mjs:1-7` | The config is only global ignores plus the Next core-web-vitals preset: **no TypeScript-aware rules and no unused-variable rule for TS**, which is exactly why two unused React imports and the dead lookup/wrap helpers slipped through. Separately, the `--format compact` flag used in tooling no longer exists in ESLint 9. |
| MEDIUM | `package.json` and `drizzle.config.ts:7` | `dotenv` is a runtime dependency with **zero references** under `src/` (the seed script uses Node's env-file flag instead). Meanwhile the drizzle config reads the database URL with no loader, so the README's documented push command fails unless the shell exports it. |
| LOW | `tsconfig.json` | Strict mode is on (good), but no-unused-locals, no-unused-parameters and no-unchecked-indexed-access are off — the last one is why array indexing throughout sections 9 and 13 is typed as non-optional. |
| LOW | Repository root | A 528 KB TypeScript build-info file sits in the working tree (gitignored, but stale). `test-results/.last-run.json` claims a passing run while the directory contains **no screenshots** — it is stale and must not be treated as evidence. |
| LOW | `README.md` and `db/seed.ts:40` | The documented demo password comes from a fallback expression, so an **empty** seed password variable still yields the default instead of failing — a production footgun. |
| LOW | `PRD.md` | Claims a Draco-ready GLTF loader that does not exist anywhere (the 3D scene uses a texture loader). The sitemap section omits /categories and /admin/collections, and the data-model section lists the unused carts table. |
| LOW | `.gitignore` | Correctly covers env files, the Vercel directory, uploads, test results and the TS build info — but **not the credentials text file** described in 2.2. |
| NIT | `drizzle.config.ts` | The database URL falls back to an empty string, so drizzle-kit reports a malformed connection rather than a missing environment variable. |
| NIT | `api/uploads/[name]/route.ts` | Path traversal is correctly blocked by a strict filename pattern — good. But uploads are written under the current working directory and both ignore files exclude them, so on Vercel they vanish on redeploy (the README acknowledges this). |

---

## 16. Test-suite status

`tests/storefront.spec.ts` contains 6 tests written against the current markup, and most selectors check out. I verified that these all exist as asserted: the woven-edge element, the rail progressbar role, the thread paths, the story words, the silk-in-motion canvas, 6 category links, 9 collection headings (2 after the "Evening" filter), 3 products for the moonlit-drapes collection, 2 for dupattas, 2 for kurta-sets, the "Elite Weavers home" label and the "Shopping bag" dialog. The seed counts support every count assertion.

**Two blockers make the suite non-green regardless:**

1. `next build` fails, so no production preview can be started.
2. Test 3 ("New kurta sets support sizes and the cart drawer") asserts the exact cart colour string containing a **real** middle dot, but the cart stores the **corrupted** middle dot (section 5). With an exact-text matcher this cannot match. Byte-level certainty, not a guess.

Also missing: there is **no playwright config file** (the spec supplies only baseURL and viewport inline), no test that every image returns 200, and no unit tests at all.

---

## 17. Checked and found CORRECT — do not "fix" these

Recorded so nobody chases phantoms:

- `React.ReactNode` used without importing React (`Sections.tsx:114`, `admin/products/[id]/page.tsx:9`): **my actual tsc run reported only the 4 Card errors**, so these resolve fine. Not a defect.
- `Hero.tsx:82` uses the shimmer class on a **span**, not an italic element, so the heading-italic specificity clash described in 6.3 does **not** apply there. Only `WeaveStory.tsx:64` is genuinely affected.
- Fonts: the Google font loader resolved and emitted local woff2 files, so the 6.4-minute compile is Turbopack, not a network hang.
- Operator precedence in the shipping helper is correct: the equality check and the threshold comparison both bind tighter than the conditional.
- The upload path-traversal guard, the admin check on the upload API, the admin guard on every admin server action, the timing-safe HMAC comparisons in both Razorpay routes, and the env-file ignores are all correct.
- Colour filtering uses a substring match, so the filter label "Peacock" still matches the stored colour name "Peacock Blue".
- The storefront main element exists and matches both the skip link target and the rail's observer target; the hero's scroll target and the footer's size-guide anchor both exist.
- The newsletter input id is unique because the form renders exactly once.
- Tailwind v4 emits the standalone rotate property, so the static rotate utilities and the GSAP rotation tweens in the same element do not conflict.
- The leading important modifier is valid in Tailwind 4.1.17 and those classes are live in the compiled sheet — they are workarounds for section 6, not dead classes.
- The inert attribute on the collapsible filter group is the correct React 19 pattern.
- The rail's progressbar value is not reset by React on re-render (the prop never changes between renders), so the imperative DOM update sticks.
- The reviews API uses parameterised SQL for its count and average subqueries, and the coupon helper returns integers so no fractional currency is ever formatted.
- The intro curtain is aria-hidden and cannot get stuck (pure CSS plus a reduced-motion display:none).
- No conditional hook calls; every client boundary is correctly marked; dynamic imports with server-side rendering disabled are used only inside client components.
- The collection filter counts asserted by the E2E suite are genuinely correct against the seed.

---

## 18. Recommended fix order

**Wave 1 — unblock (hours)**

1. `Sections.tsx:113-125` — make the occasions grid compile and render (the only build blocker).
2. Re-save the three mojibake files as UTF-8.
3. Add the four missing images, or repoint those eleven records at existing files.
4. Rotate the Supabase password, delete the credentials text file, make the session cookie secure in production, and set the real public site URL.
5. Fix the shipping order-of-operations (4.1) and the order-page ownership check.

**Wave 2 — correctness (days)**

6. The cart decrement at qty 1; the zero-stock cart line; order finalisation atomicity; per-product stock aggregation.
7. The admin actions: compare-price coercion, slug conflicts, the collection select default, the category delete guard, and id validation.
8. The admin image field key (cross-record data loss) and try/catch/finally across all six fetch handlers.
9. The scroll-provider subscription leak and the cross-account wishlist merge.
10. Remove the fabricated aggregate rating.

**Wave 3 — structural (a sprint)**

11. **CSS** — move the component classes into a cascade layer, adopt tailwind-merge for the class-name helper, delete the duplicate pattern rule and the important override on the footer watermark, and remove the three dead class names.
12. **Alignment** — one container primitive and two top-padding values; delete the eleven ad-hoc widths.
13. **Constants** — one source of truth for shipping across cart, checkout, API and every copy site; one facet type; one cart line key; one media-query constant.
14. **Accessibility** — labels on the 30-plus unlabelled controls, complete or drop the tab and radio patterns, aria-modal plus focus management on both dialogs, un-hide the hero button, and make the file input keyboard-reachable.
15. **Config** — rename the package, move the test and script runners to devDependencies, drop the unused dependencies, enable TypeScript-aware lint rules with an unused-variable check, turn on no-unchecked-indexed-access, add security headers, and add a Playwright config.

---

*End of report. No files were modified during this audit; the only file written is this report.*

---

## 19. Fix log — every finding addressed

**Final verification, run on the frozen tree after all edits:**

| Gate | Command | Before | After |
|---|---|---|---|
| Types | `npx tsc --noEmit` | 4 errors, exit 1 | **exit 0, 0 errors** |
| Lint | `npx eslint .` | 4 errors, 12 warnings | **exit 0, 0 problems** |
| Build | `npx next build` | failed at type-check | **exit 0, 35 routes emitted** |
| E2E | `npx playwright test --workers=1` | could not pass (see 16) | **8 / 8 passed in 3.0m** |

The suite gained two tests: one that fetches every catalogue cover and asserts
200 (the four 404s are gone), and one that asserts the occasions grid renders
five cards, plus security headers and the anonymous-access rules on /admin and
/order.

### 19.1 Blockers and critical

| Finding | Resolution |
|---|---|
| `Card` undefined in Sections.tsx (build blocker) | The four cards now render through the `OccasionCard` that was already defined; the dead `by`/`wrap` helpers were replaced by a lookup that returns null for a missing slug. The occasions grid also gained the fifth seeded occasion, which closed the five-column hole in its 12-column grid. |
| Plaintext DB password in the repo root | The password and connection string were removed from `SareeX Details.txt` (now a pointer file with only the public publishable key). The migration-grade direct URL moved to the gitignored `.env.local` as `DIRECT_DATABASE_URL`. `.gitignore` now blocks `*Details.txt` and `*credentials*.txt`. `SECURITY.md` documents what must be rotated — that part needs dashboard access and is the one action left for a human. |
| Cookie `Secure` flag derived from a public var | `secure: process.env.NODE_ENV === "production"`. The E2E suite logs in through the form because a Secure cookie is not stored by Playwright's raw API client over http. |
| Mojibake in three components | All fifteen strings re-saved as UTF-8 (em dash, middle dot, minus, ellipsis, en dash, rupee). The cart line label now matches the E2E assertion exactly. |

### 19.2 Security

- **Order privacy.** `/order/[number]` now requires an admin session, the signed-in owner, or an httpOnly cookie written at checkout (new `src/lib/orderAccess.ts`), so the guest confirmation flow still works while a bare URL no longer leaks name, email, phone and address.
- **Open redirect.** `safeNextPath()` in `src/lib/utils.ts` rejects anything that is not a rooted, non-protocol-relative path; login and register both use it and both carry `noindex`.
- **Rate limiting.** New `src/lib/rateLimit.ts` protects login (12 / 10 min), register, newsletter, coupon and review writes, plus the wishlist PUT per user. Documented as per-instance.
- **Admin input validation.** Hex colours are matched against `^#[0-9a-fA-F]{3,8}$` (CSS injection closed), images must be a local path or an https URL with count and length caps and at least one entry, compare-at price is preprocessed so an empty field stays NULL instead of 0, duplicate slugs are caught and redirected with an error, ids must be positive integers, and the category delete refuses while products still reference the slug.
- **Security headers** added in `next.config.ts` (nosniff, frame options, referrer policy, permissions policy, HSTS) with `poweredByHeader` off.
- **Seed administrator.** An unset or empty `SEED_ADMIN_PASSWORD` no longer silently means "admin123": the seed script fails loudly, and request-time seeding logs and skips instead of taking the storefront down.

### 19.3 Correctness, money and data

- **Shipping** is computed from the goods value in the cart, the checkout form and the API, so a coupon can no longer remove the free-shipping the site promises. All copy interpolates `SHIPPING_SUMMARY`.
- **Stock** is aggregated per product before validation (two colour lines can no longer oversell), and `finalizeOrder` claims the order with one conditional UPDATE so the webhook and the verify route cannot both decrement stock or double-count a coupon.
- **Cart**: the decrement button is disabled at quantity 1 instead of silently deleting the line, `add()` refuses sold-out pieces and never stores quantity 0, and one `cartKey()` replaces three key formats.
- **Admin image field** is keyed by product id, so navigating between products can no longer save one product's images onto another.
- **Wishlist sync**: the server list is now authoritative (no cross-account merge), the subscription cannot leak after unmount, and a local clear on logout is suppressed so it does not wipe the saved list server-side.
- **Async errors**: every fetch handler gained try/catch/finally, so a network blip can no longer leave a button stuck in a busy state with no message.
- **Aggregate rating** is only emitted when there is at least one real rating, and the PDP shows the facet display names ("Handloom Cotton") instead of capitalised slugs.

### 19.4 CSS, layout and consistency

- **Cascade fixed.** All hand-written component classes moved into `@layer components`, verified in the compiled sheet, so Tailwind utilities now win. The duplicate `.pat-soft` rule, the `!important` on the brand watermark, and the heading-italic rule that swallowed `.zari-text` are gone; `--color-sand` and `--color-maroon-deep` replaced the last off-token hexes.
- **One layout contract.** New `src/lib/layout.ts` replaced eleven container widths and five gutter systems across the storefront, the footer and every admin page. The six vertical-rhythm values collapsed to two, and the four top paddings to three.
- **Dead class names removed** (`woven-edge-left`, `collection-editorial`, `weave-story`) and every remaining custom class verified to have a rule.
- **Alignment defects fixed**: occasions grid hole, mega-menu/trigger misalignment, the lookbook parallax that outran its image bleed, the three-column stats row on narrow screens, the fixed-height caption box, the ribbon minimum width, the collections page ending on sand under an ivory divider, the two divergent size tables, the flex-on-a-table-cell, and the aspect-box padding in the journal hero.
- **Consistency**: one cart line key, one facet type, one media-query constant, one colour-swatch list (Marigold, Saffron and Lilac are now filterable), one delete guard shape, one admin content width, one money formatter, and derived counts where "Six"/"Nine" were hardcoded.

### 19.5 Accessibility

Labels for the roughly thirty controls that were placeholder-only (checkout, account, auth, review, newsletter and every admin form), a valid tab pattern with ids, aria-controls and arrow keys, real radio inputs for the rating, radiogroup semantics for the single-select facets, `aria-modal` plus focus move/trap/restore and Escape on both dialogs, an un-hidden "Scroll to discover" button (the timeline now uses `autoAlpha` so it leaves the tab order), a keyboard-reachable file input, `role="img"` on the star rating and Colour swatches, table headers with `scope="col"`, `aria-current` on navigation, live regions for status messages, and an alt text pass.

### 19.6 Assets, SEO and infrastructure

- The four missing images were repointed to files that exist **and** an idempotent repair was added to the seed — the additive seed had already written the dead paths into the live database, so a source-only fix would not have repaired a running store.
- Sitemap revalidates hourly instead of per request and carries lastModified; robots disallows the auth and order routes; the 404 page has a landmark and noindex; the raster logo replaces the SVG one for structured data; `metadataBase` is guarded against a scheme-less env value; Twitter cards carry an image.
- `package.json` renamed to `sareex`, test and script runners moved to devDependencies, unused `dotenv` and `@types/bcryptjs` dropped, and seed/test scripts added.
- A missing `playwright.config.ts` was added. README and PRD were corrected (the Draco claim, the sitemap list, the unused carts table, the seed password behaviour, the layer rule and the container contract).

### 19.7 Deliberately not changed

- **`noUncheckedIndexedAccess`** stays off. Turning it on would surface hundreds of array-index errors across components that already guard their data, for no behavioural gain. The genuinely nullable cases (images, colours) are now handled at the source instead.
- **tailwind-merge** was not adopted. The layer fix removes the reason it was suggested, and the package is not installable offline here.
- **`carts` table** left in place: unused, but removing a table is a migration decision for the owner. Documented as reserved.
- **CSP** left out: it needs nonces for the inline JSON-LD and the font stylesheet, which is its own task. Documented in SECURITY.md as a known gap.
- **Password rotation** cannot be done from here; SECURITY.md states exactly which two secrets need it.
