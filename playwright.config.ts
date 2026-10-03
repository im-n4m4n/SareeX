import { defineConfig } from "@playwright/test";

/**
 * The suite talks to a running server. Start it first with `npm run dev`,
 * or point TEST_BASE_URL at an https preview:
 *   npm run dev
 * then:  npx playwright test --workers=1
 * Override TEST_BASE_URL to point at a deployed preview.
 */
export default defineConfig({
  testDir: "./tests",
  // Generous: the storefront boots GSAP + Lenis + a WebGL scene per page.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  outputDir: "test-results",
});
