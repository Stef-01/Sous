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
