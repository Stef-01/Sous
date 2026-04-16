import { test } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

/**
 * Full-page screenshots for manual QA and release notes.
 * Output: test-results/visual-docs/ (gitignored; regenerate anytime).
 *
 * Run: pnpm test:e2e -- e2e/visual-documentation.spec.ts
 */
const OUT_DIR = path.join(process.cwd(), "test-results", "visual-docs");

const ROUTES: { name: string; url: string }[] = [
  { name: "01-today", url: "/" },
  { name: "02-path", url: "/path" },
  { name: "03-path-scrapbook", url: "/path/scrapbook" },
  { name: "04-path-favorites", url: "/path/favorites" },
  { name: "05-games-arcade", url: "/games" },
  { name: "06-games-whats-cooking", url: "/games/whats-cooking" },
  { name: "07-games-flavor-pairs", url: "/games/flavor-pairs" },
  { name: "08-games-speed-chop", url: "/games/speed-chop" },
  { name: "09-games-cuisine-compass", url: "/games/cuisine-compass" },
  {
    name: "10-cook-combined-two-sides",
    url: "/cook/combined?sides=caesar-salad,garlic-bread",
  },
  { name: "11-cook-single-caesar", url: "/cook/caesar-salad" },
  { name: "12-community-stub", url: "/community" },
];

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
});

test.describe("Visual documentation captures", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify({ spicy: 0.5, fresh: 0.3 }),
      );
      localStorage.setItem("sous-effort-tolerance", "moderate");
    });
  });

  for (const route of ROUTES) {
    test(`screenshot ${route.name}`, async ({ page }) => {
      await page.goto(route.url, { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(800);
      const filePath = path.join(OUT_DIR, `${route.name}.png`);
      await page.screenshot({ path: filePath, fullPage: true });
    });
  }
});
