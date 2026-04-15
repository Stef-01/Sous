import { test, expect } from "@playwright/test";

test.describe("Games Arcade", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
    });
  });

  test("renders arcade menu with 4 games", async ({ page }) => {
    await page.goto("/games");
    await expect(page.locator("text=Kitchen Arcade")).toBeVisible();
    await expect(page.locator("text=What's Cooking?")).toBeVisible();
    await expect(page.locator("text=Flavor Pairs")).toBeVisible();
    await expect(page.locator("text=Speed Chop")).toBeVisible();
    await expect(page.locator("text=Cuisine Compass")).toBeVisible();
  });

  test("What's Cooking game shows clues and accepts input", async ({
    page,
  }) => {
    await page.goto("/games/whats-cooking");
    await expect(page.locator("text=Round 1")).toBeVisible();
    const firstClue = page.locator("text=/\u201C.*\u201D/").first();
    await expect(firstClue).toBeVisible();
    const input = page.locator('input[placeholder="Type your guess..."]');
    await expect(input).toBeVisible();
  });

  test("Flavor Pairs game shows difficulty selection", async ({ page }) => {
    await page.goto("/games/flavor-pairs");
    await expect(page.locator("text=Flavor Pairs")).toBeVisible();
    await expect(page.locator("text=easy")).toBeVisible();
    await expect(page.locator("text=medium")).toBeVisible();
    await expect(page.locator("text=hard")).toBeVisible();
  });

  test("Speed Chop game shows start screen", async ({ page }) => {
    await page.goto("/games/speed-chop");
    await expect(page.locator("text=Speed Chop")).toBeVisible();
    await expect(page.locator("text=Start Chopping!")).toBeVisible();
  });

  test("Cuisine Compass game shows dishes and regions", async ({ page }) => {
    await page.goto("/games/cuisine-compass");
    await expect(
      page.locator("text=Where does this dish come from?"),
    ).toBeVisible();
    await expect(page.locator("text=Europe")).toBeVisible();
    await expect(page.locator("text=Asia")).toBeVisible();
  });
});
