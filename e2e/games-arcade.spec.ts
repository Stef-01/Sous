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

    await expect(page.getByText("Tap to try")).toHaveCount(0);

    const feature = page.getByRole("button", { name: "Open Cuisine Compass" });
    const featureBox = await feature.boundingBox();
    expect(featureBox?.height ?? 0).toBeGreaterThanOrEqual(200);

    for (const name of [
      "Open What's Cooking?",
      "Open Flavor Pairs",
      "Open Speed Chop",
    ]) {
      const rowBox = await page.getByRole("button", { name }).boundingBox();
      expect(rowBox?.height ?? 0).toBeGreaterThanOrEqual(92);
      expect(rowBox?.width ?? 0).toBeGreaterThanOrEqual(260);
    }

    const localFoodImages = await page.evaluate(
      () =>
        Array.from(document.images).filter(
          (img) =>
            img.currentSrc.includes("/food_images/") ||
            img.currentSrc.includes("%2Ffood_images"),
        ).length,
    );
    expect(localFoodImages).toBeGreaterThanOrEqual(4);
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
    await expect(page.getByText(/Where was .* first cooked/i)).toBeVisible();
    await expect(page.getByText(/Tap the map/i).first()).toBeVisible();
  });
});
