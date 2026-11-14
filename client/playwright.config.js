import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests that do not need a database or a wallet.
 * Start the whole app with `npm run dev` from the repository root, or let
 * Playwright start it with the webServer block below.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  // Default to the locally installed Google Chrome so the smoke tests run
  // without downloading a browser. Set PLAYWRIGHT_CHANNEL=bundled to use the
  // Playwright-managed Chromium instead (for example in CI).
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL === "bundled" ? undefined : process.env.PLAYWRIGHT_CHANNEL || "chrome",
    // A dedicated port avoids clashing with another local Vite project on 5173.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:5273",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: [
    {
      command: "npm run dev -w server",
      cwd: "..",
      url: "http://localhost:3001/api/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "npx vite --port 5273 --strictPort",
      url: "http://localhost:5273",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
