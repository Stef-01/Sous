import { defineConfig, devices } from "@playwright/test";

/** True when running in a strict CI environment (not e.g. CI=false). */
const isCi =
  process.env.CI === "true" || process.env.CI === "1" || process.env.CI === "2";

/** Dedicated port so E2E never attaches to a stale or foreign process on :3000. */
const e2ePort = process.env.E2E_PORT ?? "3333";
const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 2 : 0,
  workers: isCi ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: e2eBaseUrl,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone SE"] },
    },
  ],
  webServer: {
    // Production server avoids `.next/dev/lock` conflict with a separate `pnpm dev` on :3000.
    command: `pnpm build && pnpm exec next start -p ${e2ePort} -H 127.0.0.1`,
    url: e2eBaseUrl,
    // Treat only strict CI flags as "do not reuse"; CI=false must still reuse.
    reuseExistingServer: !isCi,
    timeout: 300000,
  },
});
