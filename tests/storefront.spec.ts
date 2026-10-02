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
  await expect(page.locator(".woven-edge-left")).toBeVisible();
  await page.locator(".weave-scroll-rail").getByRole("button", { name: "Scroll back to top" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(10);
  expect(errors).toEqual([]);
});

test("All categories and collection filters lead to shoppable pieces", async ({ page }) => {
  await page.goto("/categories");
  await expect(page.locator("#wardrobe-categories > div.grid > a")).toHaveCount(6);
  await page.goto("/collections");
  await expect(page.locator("#collection-stories h3")).toHaveCount(9);
  await page.getByRole("button", { name: "Evening", exact: true }).click();
  await expect(page.locator("#collection-stories h3")).toHaveCount(2);
  await page.locator("#collection-stories").getByRole("link", { name: /Moonlit Drapes/ }).click();
  await expect(page).toHaveURL(/collection=moonlit-drapes/);
  await expect(page.locator("#shop-pieces").getByRole("heading", { name: "Moonlit Drapes", exact: true })).toBeVisible();
  await expect(page.locator("#shop-pieces article")).toHaveCount(3);
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

test("New brand coupon and role-protected collection admin", async ({ request }) => {
  const coupon = await request.post("/api/misc/coupon", { data: { code: "ELITE10", subtotal: 10000 } });
  expect(coupon.ok()).toBeTruthy();
  expect((await coupon.json()).discount).toBe(1000);
  const login = await request.post("/api/auth/login", { data: { email: "admin@eliteweavers.in", password: process.env.SEED_ADMIN_PASSWORD || "admin123" } });
  expect(login.ok()).toBeTruthy();
  const admin = await request.get("/admin/collections");
  expect(admin.ok()).toBeTruthy();
  expect(await admin.text()).toContain("The Bridal Vows");
});

test("Chapter navigation unfolds cloth, draws zari, and loads 3D only nearby", async ({ page }) => {
  test.setTimeout(45000);
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
