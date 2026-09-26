import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);

/**
 * End-to-end tests against a production build (`pnpm build` first) and a real
 * Postgres (DATABASE_URL, migrated and seeded). Set CHROMIUM_PATH to use a
 * preinstalled Chromium instead of Playwright's download.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    ...(process.env.CHROMIUM_PATH ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } } : {}),
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /smoke\.spec\.ts/ },
  ],
  webServer: {
    command: `pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    // All e2e requests come from 127.0.0.1, so lift the per-IP limit (it has its own unit tests).
    env: { RATE_LIMIT_MAX: "1000" },
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
