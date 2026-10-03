import { test, expect } from "@playwright/test";

test.use({ baseURL: process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000", viewport: { width: 1440, height: 960 } });

test("Elite Weavers identity and live woven scroll rail", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page).toHaveTitle(/Elite Weavers/);
  await expect(page.getByRole("link", { name: "Elite Weavers home" })).toBeVisible();
  await page.waitForTimeout(3200);
  await page.screenshot({ path: "test-results/elite-weavers-desktop.png" });
  const bar = page.locator(".weave-scroll-rail [role=progressbar]");
  await expect(bar).toHaveAttribute("aria-valuenow", "0");
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.32));
  await expect.poll(async () => Number(await bar.getAttribute("aria-valuenow"))).toBeGreaterThan(25);
  await expect.poll(async () => Number(await bar.getAttribute("aria-valuenow"))).toBeLessThan(40);
  await expect(page.locator(".woven-edge")).toBeVisible();
  await page.locator(".weave-scroll-rail").getByRole("button", { name: "Scroll back to top" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  expect(errors).toEqual([]);
});

test("All categories and collection filters lead to shoppable pieces", async ({ page }) => {
  await page.goto("/categories");
  await expect(page.locator("#wardrobe-categories > div.grid > a")).toHaveCount(6);
  await page.goto("/collections");
  // Counts follow the seeded catalogue: the Diwali expansion added the
  // "Shubh Deepavali" collection (9 → 10) and two evening drapes to
  // Moonlit Drapes (3 → 5). Updated alongside seed-data, not to mask a bug.
  await expect(page.locator("#collection-stories h3")).toHaveCount(10);
  await page.getByRole("button", { name: "Evening", exact: true }).click();
  await expect(page.locator("#collection-stories h3")).toHaveCount(2);
  await page.locator("#collection-stories").getByRole("link", { name: /Moonlit Drapes/ }).click();
  await expect(page).toHaveURL(/collection=moonlit-drapes/);
  await expect(page.locator("#shop-pieces").getByRole("heading", { name: "Moonlit Drapes", exact: true })).toBeVisible();
  await expect(page.locator("#shop-pieces article")).toHaveCount(5);
  await page.goto("/shop?category=dupattas");
  await expect(page.locator("#shop-pieces article")).toHaveCount(2);
  await page.screenshot({ path: "test-results/elite-weavers-dupattas.png", fullPage: true });
});

test("New kurta sets support sizes and the cart drawer", async ({ page }) => {
  await page.goto("/product/vasant-ivory-chanderi-kurta-set");
  await page.getByRole("button", { name: "L", exact: true }).click();
  await page.getByRole("button", { name: "Add to Cart", exact: true }).click();
  const bag = page.getByRole("dialog", { name: "Shopping bag", exact: true });
  await expect(bag).toBeVisible();
  await expect(bag.getByText("Ivory · Size L", { exact: true })).toBeVisible();
  await expect(bag.getByText("Vasant Ivory Chanderi Set", { exact: true })).toBeVisible();
});

test("Mobile and reduced-motion remain navigable without pinned scenes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".pin-spacer")).toHaveCount(0);
  await expect(page.locator(".weave-mobile")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: "test-results/elite-weavers-mobile.png" });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  const menu = page.getByRole("dialog", { name: "Navigation menu", exact: true });
  await expect(menu.getByRole("link", { name: /Kurta Sets/ })).toBeVisible();
  await menu.getByRole("link", { name: /Kurta Sets/ }).click();
  await expect(page).toHaveURL(/category=kurta-sets/);
  await expect(page.locator("#shop-pieces article")).toHaveCount(2);
});

test("New brand coupon and role-protected collection admin", async ({ page }) => {
  const coupon = await page.request.post("/api/misc/coupon", { data: { code: "ELITE10", subtotal: 10000 } });
  expect(coupon.ok()).toBeTruthy();
  expect((await coupon.json()).discount).toBe(1000);

  // Sign in through the form so the browser's own cookie jar is used. With
  // NODE_ENV=production the session cookie is Secure, and Playwright's raw API
  // client refuses to store a Secure cookie over http:// — the browser does not.
  await page.goto("/login");
  await page.fill("#auth-email", "admin@eliteweavers.in");
  await page.fill("#auth-password", process.env.SEED_ADMIN_PASSWORD || "admin123");
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin/, { timeout: 30000 });

  // Navigate (rather than page.request) so the browser's cookie jar is used;
  // Playwright's API context keeps its own store and drops the Secure cookie.
  const admin = await page.goto("/admin/collections");
  expect(admin!.status()).toBe(200);
  expect(await page.content()).toContain("The Bridal Vows");
});

test("Chapter navigation unfolds cloth, draws zari, and loads 3D only nearby", async ({ page }) => {
  // Pinned scroll scenes plus a WebGL texture upload need more than the default budget.
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForTimeout(3000);
  await expect(page.locator("#silk-in-motion canvas")).toHaveCount(0);
  const firstThread = page.locator("#thread-story [data-thread-path]").first();
  const initial = await firstThread.evaluate((el) => parseFloat((el as SVGPathElement).style.strokeDashoffset));
  expect(initial).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Jump to Thread to Heirloom", exact: true }).click();
  await page.waitForTimeout(1700);
  await page.evaluate(() => {
    const scene = document.getElementById("thread-story")!;
    const spacer = scene.closest(".pin-spacer")!;
    const start = spacer.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, start + innerHeight * 0.9);
  });
  await expect.poll(() => firstThread.evaluate((el) => parseFloat((el as SVGPathElement).style.strokeDashoffset)), { timeout: 7000 }).toBeLessThan(initial * 0.8);
  await expect.poll(() => page.locator("[data-story-word]").first().evaluate((el) => Number(getComputedStyle(el).opacity)), { timeout: 7000 }).toBeGreaterThan(0.85);
  await page.screenshot({ path: "test-results/elite-weavers-thread-story.png" });
  await page.getByRole("button", { name: "Jump to Silk in Motion", exact: true }).click();
  await expect(page.locator("#silk-in-motion canvas")).toHaveCount(1, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: "test-results/elite-weavers-silk-scene.png" });
  expect(errors).toEqual([]);
});

test("Every catalogue image resolves and the occasions grid renders", async ({ page, request }) => {
  // The seed referenced four image files that did not exist, so /categories
  // showed broken cards and the navbar mega menu was entirely broken.
  await page.goto("/categories");
  const covers = page.locator("#wardrobe-categories img");
  const count = await covers.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const src = await covers.nth(i).getAttribute("src");
    expect(src, "category cover " + i + " has no src").toBeTruthy();
    const res = await request.get(src!);
    expect(res.status(), src + " should resolve").toBe(200);
  }

  // <Card> was never defined in Sections.tsx, which failed the production build.
  await page.goto("/");
  const occasions = page.locator("#occasions a[href^='/shop?occasion=']");
  await expect(occasions).toHaveCount(5);
});

test("Diwali Special page renders festival theme, banner and festive grid", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/diwali");
  await expect(page.locator(".theme-diwali")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Deepavali/i);
  await expect(page.getByText("DIWALI15", { exact: false }).first()).toBeVisible();
  await expect(page.locator("#festival-edit article").first()).toBeVisible();

  // Homepage entry: the festival banner card links through to the special page.
  await page.goto("/");
  const banner = page.getByRole("link", { name: /Let's have a look/i });
  await expect(banner).toBeVisible();
  // force: the homepage runs infinite ambient animations, so Playwright's
  // stability heuristic can stall; the assertion below is the real check.
  await banner.click({ force: true });
  await expect(page).toHaveURL(/\/diwali/);
  expect(errors).toEqual([]);
});

test("DIWALI15 festival coupon applies 15% above the minimum order", async ({ request }) => {
  const coupon = await request.post("/api/misc/coupon", { data: { code: "DIWALI15", subtotal: 10000 } });
  expect(coupon.ok()).toBeTruthy();
  expect((await coupon.json()).discount).toBe(1500);
});

test("Protected routes reject anonymous access and security headers are set", async ({ request }) => {
  const admin = await request.get("/admin", { maxRedirects: 0 });
  expect([307, 302, 303]).toContain(admin.status());

  const home = await request.get("/");
  expect(home.headers()["x-content-type-options"]).toBe("nosniff");
  expect(home.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");

  // An order number alone must not expose buyer PII.
  const order = await request.get("/order/EW-000000AAAAAA", { maxRedirects: 0 });
  expect([404, 307, 302, 303]).toContain(order.status());
});
