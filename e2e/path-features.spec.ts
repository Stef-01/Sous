import { test, expect } from "@playwright/test";

test.describe("Path Tab Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify({ spicy: 0.5, fresh: 0.3 }),
      );
    });
  });

  test("Path page shows skill tree and achievements section", async ({
    page,
  }) => {
    await page.goto("/path");
    await expect(page.locator("text=Achievements")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.locator("text=Scrapbook")).toBeVisible();
    await expect(page.locator("text=Favorites")).toBeVisible();
  });

  test("Path page shows weekly challenge card", async ({ page }) => {
    await page.goto("/path");
    // Weekly challenge should display one of the challenge types
    const challengeCard = page.locator("text=/Cook|Japanese|Italian|Variety|Rate|Streak|Indian|Mexican|Thai/i").first();
    await expect(challengeCard).toBeVisible({ timeout: 10000 });
  });

  test("Scrapbook page renders correctly with no sessions", async ({
    page,
  }) => {
    await page.goto("/path/scrapbook");
    await expect(
      page.locator("text=/scrapbook|no cooks|completed/i").first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Favorites page renders correctly", async ({ page }) => {
    await page.goto("/path/favorites");
    await expect(
      page.locator("text=/favorites|no favorites/i").first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
