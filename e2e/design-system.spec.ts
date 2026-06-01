import { test, expect } from "@playwright/test";

/**
 * Design-system guards — locks in the reference-driven overhaul
 * (planning.md "Design Polish Overhaul") so the gutter/touch discipline
 * can't silently drift back.
 *
 * Runs under mobile emulation (375px viewport + touch), which trips
 * DeviceFrame's `isRealMobile` branch (matchMedia ≤768px + maxTouchPoints>0) so
 * the app renders FULLSCREEN (no phone bezel). Content then sits at the true
 * viewport edge and the 20px rail is measurable directly — no mockup offset to
 * subtract. `hasTouch` (not `isMobile`, which is Chromium-only) keeps this
 * cross-browser so it runs under both config projects.
 *
 * Two deterministic invariants (the two most prone to drift):
 *   1. Every screen's content rail uses the 20px `--gutter` (acceptance G1).
 *   2. No interactive control is below the 44px touch floor (acceptance G7).
 */

test.use({
  viewport: { width: 375, height: 667 },
  hasTouch: true,
});

/** --gutter, in px. Keep in sync with globals.css `--space-5`. */
const GUTTER_PX = 20;

const MAIN_ROUTES = [
  { path: "/today", name: "Today" },
  { path: "/path", name: "Path" },
  { path: "/community", name: "Content" },
  { path: "/sides?main=Masoor%20Dal", name: "Pairing" },
  { path: "/cook/garlic-bread", name: "Cook (Mission)" },
];

// Secondary routes — the whole app is on the 20px rail, not just the 6 hubs.
const SECONDARY_ROUTES = [
  { path: "/path/scrapbook", name: "Scrapbook" },
  { path: "/path/favorites", name: "Favorites" },
  { path: "/path/pantry", name: "Pantry" },
  { path: "/path/shopping-list", name: "Shopping list" },
  { path: "/path/recipes", name: "My recipes" },
  { path: "/path/household", name: "Household" },
  { path: "/path/eco", name: "Eco" },
  { path: "/path/recap", name: "Recap" },
  { path: "/path/cuisines", name: "Cuisines" },
  { path: "/eat-out", name: "Eat out" },
  { path: "/games", name: "Games" },
  { path: "/community/saved", name: "Saved content" },
  // NB: /community/reels is intentionally a full-bleed immersive feed (no rail)
  // and so is deliberately excluded from the gutter guard.
];

test.beforeEach(async ({ page }) => {
  // Dismiss first-run modals so the real screen composition is under test.
  await page.addInitScript(() => {
    localStorage.setItem("sous-coach-quiz-done", "true");
    localStorage.setItem("sous-path-tutorial-v1", "done");
    localStorage.setItem(
      "sous-cook-stats",
      JSON.stringify({
        currentStreak: 4,
        completedCooks: 7,
        longestStreak: 6,
      }),
    );
  });
});

test.describe("Gutter — every content rail is 20px", () => {
  for (const route of [...MAIN_ROUTES, ...SECONDARY_ROUTES]) {
    test(`${route.name} uses the --gutter rail`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      // Every guttered surface composes `.page-x`. Its resolved inline padding
      // must equal the token; if a screen drifts back to px-4 (16px) this fails.
      const rail = page.locator(".page-x").first();
      await expect(
        rail,
        `${route.name}: a .page-x rail should exist`,
      ).toBeAttached({
        timeout: 10000,
      });
      const pad = await rail.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { left: cs.paddingLeft, right: cs.paddingRight };
      });
      expect(pad.left, `${route.name} rail left padding`).toBe(
        `${GUTTER_PX}px`,
      );
      expect(pad.right, `${route.name} rail right padding`).toBe(
        `${GUTTER_PX}px`,
      );
    });
  }
});

test.describe("Touch targets — no control below 44px", () => {
  // Intentionally-compact secondary chips that 44px would unbalance. Documented
  // in DESIGN-OPTIMIZATION-SPRINT.md "Intentionally NOT changed".
  const ALLOW = /Streak|Swipe/i;

  for (const route of MAIN_ROUTES) {
    test(`${route.name} interactive controls meet 44px`, async ({ page }) => {
      await page.goto(route.path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(800);
      const violations = await page.evaluate(() => {
        const out: { label: string; w: number; h: number }[] = [];
        document
          .querySelectorAll(
            'button, a[href], [role="button"], [role="checkbox"]',
          )
          .forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            const label = (
              el.getAttribute("aria-label") ||
              el.textContent ||
              ""
            )
              .trim()
              .slice(0, 24);
            // Flag only when BOTH dimensions are sub-44 (a wide short text link
            // is still a comfortable tap target).
            if (r.height < 44 && r.width < 44) {
              out.push({
                label,
                w: Math.round(r.width),
                h: Math.round(r.height),
              });
            }
          });
        return out;
      });
      const real = violations.filter((v) => !ALLOW.test(v.label));
      expect(
        real,
        `${route.name} sub-44 controls: ${JSON.stringify(real)}`,
      ).toHaveLength(0);
    });
  }
});
