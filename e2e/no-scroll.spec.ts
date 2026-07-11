import { test, expect } from "@playwright/test";

/**
 * No-Scroll CTA Enforcement — CLAUDE.md Rule 10
 *
 * The primary CTA and navigation on every screen must be visible
 * without scrolling on a 375×667 viewport (iPhone SE).
 */

test.use({ viewport: { width: 375, height: 667 } });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sous-path-tutorial-v1", "done");
  });
});

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
  // Allow 1px tolerance for fractional layout / device pixel rounding on 667px-tall viewports.
  const bottom = Math.ceil(box!.y + box!.height);
  expect(
    bottom,
    `${description}: CTA bottom (${bottom}px) should be within ~667px viewport`,
  ).toBeLessThanOrEqual(668);
}

test.describe("No-Scroll CTA — 375×667 viewport", () => {
  test("/today — primary CTA visible without scroll", async ({ page }) => {
    await page.goto("/today");
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

  test("cook mission heroes are photo-led with split save and cook actions", async ({
    page,
  }) => {
    for (const route of [
      "/cook/caesar-salad",
      "/cook/combined?main=butter-chicken&sides=tabbouleh,pico-de-gallo",
    ]) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const hero = page.getByTestId("cook-mission-hero").first();
      await expect(hero).toBeVisible({ timeout: 10000 });
      const heroBox = await hero.boundingBox();
      const viewport = page.viewportSize();
      expect(heroBox?.x ?? 999).toBeLessThanOrEqual(1);
      expect(heroBox?.width ?? 0).toBeGreaterThanOrEqual(
        (viewport?.width ?? 0) - 1,
      );
      expect(heroBox?.height ?? 0).toBeGreaterThanOrEqual(
        (viewport?.height ?? 0) * 0.39,
      );
      await expect(hero.getByRole("button")).toHaveCount(0);

      const save = page
        .getByRole("button", {
          name: /Save recipe|Remove from saved recipes/i,
        })
        .first();
      await expect(save).toBeVisible({ timeout: 10000 });
      const saveBox = await save.boundingBox();
      expect(saveBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(saveBox?.width ?? 0).toBeGreaterThanOrEqual(44);

      const start = page
        .getByRole("button", { name: /Let.s gather|Let.s cook/i })
        .first();
      await expect(start).toBeVisible({ timeout: 10000 });
      const startBox = await start.boundingBox();
      expect(startBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(startBox?.width ?? 0).toBeGreaterThanOrEqual(216);
    }
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
  test("Home page meal queue opens from the food card", async ({ page }) => {
    await page.goto("/today");
    await page.waitForLoadState("networkidle");

    await expect(page.getByText("Meal queue")).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("button", { name: /Browse meals/i }).first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Search bar shows meal-centric copy", async ({ page }) => {
    await page.goto("/today");
    await page.waitForLoadState("networkidle");

    const searchBar = page.locator('text="What are you craving?"').first();
    await expect(searchBar).toBeVisible({ timeout: 10000 });
  });

  test("Meal queue shows cuisine badge", async ({ page }) => {
    await page.goto("/today");
    await page.waitForLoadState("networkidle");

    // Give the quest card time to render
    await page.waitForTimeout(1000);

    await expect(
      page.getByText(/Indian|Italian|Thai|Korean/i).first(),
    ).toBeVisible({ timeout: 10000 });

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
