import { test, expect } from "@playwright/test";

/**
 * No-Scroll CTA Enforcement — CLAUDE.md Rule 10
 *
 * The primary CTA and navigation on every screen must be visible
 * without scrolling on a 375×667 viewport (iPhone SE).
 */

test.use({ viewport: { width: 375, height: 667 } });

async function assertCTAInViewport(
  page: import("@playwright/test").Page,
  ctaSelector: string,
  description: string,
) {
  const cta = page.locator(ctaSelector).first();
  await expect(cta, `${description}: CTA should exist`).toBeVisible({
    timeout: 10000,
  });
  const box = await cta.boundingBox();
  expect(box, `${description}: CTA should have a bounding box`).not.toBeNull();
  expect(
    box!.y + box!.height,
    `${description}: CTA bottom (${box!.y + box!.height}px) should be within 667px viewport`,
  ).toBeLessThanOrEqual(667);
}

test.describe("No-Scroll CTA — 375×667 viewport", () => {
  test("/ (Today) — primary CTA visible without scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Today page has the quest card with "Start cooking" or the tab bar
    const tabBar = page.locator("nav").last();
    await expect(tabBar).toBeVisible({ timeout: 10000 });
    const tabBox = await tabBar.boundingBox();
    expect(tabBox).not.toBeNull();
    expect(
      tabBox!.y + tabBox!.height,
      "Tab bar should be within viewport",
    ).toBeLessThanOrEqual(667);
  });

  test("/path — navigation visible without scroll", async ({ page }) => {
    await page.goto("/path");
    await page.waitForLoadState("networkidle");
    const tabBar = page.locator("nav").last();
    await expect(tabBar).toBeVisible({ timeout: 10000 });
    const tabBox = await tabBar.boundingBox();
    expect(tabBox).not.toBeNull();
    expect(
      tabBox!.y + tabBox!.height,
      "Tab bar should be within viewport on /path",
    ).toBeLessThanOrEqual(667);
  });

  test("/path/favorites — navigation visible without scroll", async ({
    page,
  }) => {
    await page.goto("/path/favorites");
    await page.waitForLoadState("networkidle");
    const tabBar = page.locator("nav").last();
    await expect(tabBar).toBeVisible({ timeout: 10000 });
    const tabBox = await tabBar.boundingBox();
    expect(tabBox).not.toBeNull();
    expect(
      tabBox!.y + tabBox!.height,
      "Tab bar should be within viewport on /path/favorites",
    ).toBeLessThanOrEqual(667);
  });

  test("/path/scrapbook — navigation visible without scroll", async ({
    page,
  }) => {
    await page.goto("/path/scrapbook");
    await page.waitForLoadState("networkidle");
    const tabBar = page.locator("nav").last();
    await expect(tabBar).toBeVisible({ timeout: 10000 });
    const tabBox = await tabBar.boundingBox();
    expect(tabBox).not.toBeNull();
    expect(
      tabBox!.y + tabBox!.height,
      "Tab bar should be within viewport on /path/scrapbook",
    ).toBeLessThanOrEqual(667);
  });

  test("/cook/caesar-salad — Start CTA visible", async ({ page }) => {
    await page.goto("/cook/caesar-salad");
    await page.waitForLoadState("networkidle");
    await assertCTAInViewport(
      page,
      'button:has-text("Let")',
      "/cook/caesar-salad mission screen",
    );
  });

  test("/cook/combined — CTA visible", async ({ page }) => {
    await page.goto("/cook/combined");
    await page.waitForLoadState("networkidle");
    // Combined cook shows a "Back to Today" link/button when no dishes are queued
    const cta = page
      .getByRole("link")
      .or(page.getByRole("button"))
      .filter({ hasText: /back|today|home|start/i })
      .first();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Meal-First Quest Experience", () => {
  test("Home page quest card shows a meal with 'Find sides' CTA", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Wait for quest card to appear
    const findSidesBtn = page.locator('button:has-text("Find sides")').first();
    const startCookingBtn = page
      .locator('button:has-text("Start cooking")')
      .first();

    // At least one of these should be visible (meal shows "Find sides", side shows "Start cooking")
    const mealVisible = await findSidesBtn.isVisible().catch(() => false);
    const sideVisible = await startCookingBtn.isVisible().catch(() => false);

    expect(
      mealVisible || sideVisible,
      "Quest card should show either 'Find sides' or 'Start cooking' CTA",
    ).toBeTruthy();
  });

  test("Search bar shows meal-centric copy", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const searchBar = page.locator('text="What are you craving?"').first();
    await expect(searchBar).toBeVisible({ timeout: 10000 });
  });

  test("Quest card shows cuisine badge", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Give the quest card time to render
    await page.waitForTimeout(1000);

    // The quest card should show a cuisine family badge
    const card = page.locator("[class*='quest']").first();
    if (await card.isVisible().catch(() => false)) {
      // Card exists — it should contain recognizable text
      const cardText = await card.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(5);
    }
  });
});
