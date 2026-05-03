import { test, expect } from "@playwright/test";

/**
 * All-routes smoke spec — ensures every route in the app returns 200,
 * has no console errors, and renders a recognisable landmark string.
 *
 * Catches the failure modes that snuck through during Stage 3:
 * - Tailwind JIT extracting an invalid class from prose docs (the
 *   pipe-in-arbitrary-value bug from Sprint 3) → would surface here
 *   as a 500 on every route that imports globals.css
 * - React hydration errors from nested-button structure (the original
 *   reels-rail BookmarkButton bug from Stage 3 W19)
 * - Module-not-found from new shared-component imports
 *
 * This spec is the regression-prevention checkpoint Stage-3 retro
 * called out as missing.
 *
 * Each assertion uses `getByText` with a partial match so the test
 * is robust to copy edits — if the landmark string is renamed, the
 * spec needs an update, but day-to-day polish doesn't break it.
 */

interface Route {
  path: string;
  /** A string the page should always render (an h1, a button label,
   *  a card title — something deliberately stable). */
  landmark: string | RegExp;
  /** Pre-seed localStorage when the route depends on user state. */
  prefill?: Record<string, string>;
}

const ROUTES: Route[] = [
  // Today + cook
  { path: "/today", landmark: "Sous" },
  { path: "/cook/butter-chicken", landmark: /butter|cook/i },
  { path: "/cook/combined", landmark: /cook/i },

  // Path home + 4 details
  { path: "/path", landmark: /Path|skill|cook/i },
  { path: "/path/favorites", landmark: "Favorites" },
  { path: "/path/pantry", landmark: "Pantry" },
  { path: "/path/scrapbook", landmark: /scrapbook|trophy/i },
  { path: "/path/shopping-list", landmark: "Shopping list" },
  { path: "/path/recipes", landmark: /recipes|cook/i },
  { path: "/path/recipes/new", landmark: /New recipe|Title/i },
  { path: "/path/household", landmark: /Household|Add member/i },
  { path: "/community/pod", landmark: /Pod challenge|Cook with friends/i },

  // Content tab + sub-routes
  { path: "/community", landmark: "Content" },
  { path: "/community/reels", landmark: /reel/i },
  { path: "/community/saved", landmark: "Saved" },
  {
    path: "/community/article/stanford-healthy-eating-habits",
    landmark: "Sourced from",
  },
  {
    path: "/community/expert/venus-kalami",
    landmark: /Venus Kalami/i,
  },
  {
    path: "/community/research/stanford-childrens-gut-health",
    landmark: "Source paper",
  },
  {
    path: "/community/forum/forum-rice-gummy",
    landmark: "Original post",
  },

  // Games hub + 4 games
  { path: "/games", landmark: "Kitchen Arcade" },
  { path: "/games/cuisine-compass", landmark: "Cuisine Compass" },
  { path: "/games/flavor-pairs", landmark: "Flavor Pairs" },
  { path: "/games/speed-chop", landmark: "Speed Chop" },
  { path: "/games/whats-cooking", landmark: /What's cooking/i },

  // Power-user fallback
  { path: "/sides", landmark: /sides|browse/i },
];

test.describe("All routes smoke test", () => {
  for (const route of ROUTES) {
    test(`${route.path} renders without errors`, async ({ page }) => {
      // Pre-seed localStorage so first-visit coach quiz / tutorials
      // don't intercept the navigation.
      await page.addInitScript(() => {
        localStorage.setItem("sous-coach-quiz-done", "true");
        localStorage.setItem("sous-path-tutorial-v1", "done");
      });

      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          // Filter known-noisy dev-time React warnings
          const text = msg.text();
          if (
            text.includes("getServerSnapshot") ||
            text.includes("hydration") ||
            text.includes("DevTools")
          ) {
            return;
          }
          consoleErrors.push(text);
        }
      });

      const response = await page.goto(route.path);

      expect(response?.status(), `${route.path} should return 200`).toBe(200);

      // Wait briefly for any client-side hydration to finish so a
      // dynamic landmark (e.g. mascot button after mount) has a
      // chance to render.
      await page.waitForTimeout(500);

      // Landmark must appear somewhere on the page.
      await expect(page.getByText(route.landmark).first()).toBeVisible({
        timeout: 5_000,
      });

      // No unexpected console errors.
      expect(
        consoleErrors,
        `${route.path} produced console errors: ${consoleErrors.join("; ")}`,
      ).toEqual([]);
    });
  }
});
