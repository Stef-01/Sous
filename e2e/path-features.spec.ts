import { test, expect } from "@playwright/test";

test.describe("Path Tab Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify({ spicy: 0.5, fresh: 0.3 }),
      );
    });
  });

  test("Path page shows skill tree and achievements section", async ({
    page,
  }) => {
    await page.goto("/path", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Your journey")).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByRole("button", { name: /View badges and achievements/i }),
    ).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator("text=Scrapbook")).toBeVisible();
    await expect(page.locator("text=Favorites")).toBeVisible();
  });

  test("Path page shows weekly challenge card", async ({ page }) => {
    await page.goto("/path", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Your journey")).toBeVisible({
      timeout: 30000,
    });
    // Weekly challenge title rotates by calendar week — match known pool titles only
    const challengeCard = page.locator(
      "text=/Cook 3 Times|Japanese Week|Italian Week|Try Something New|Food Critic Week|5-Day Streak|Indian Spice Week|High Five|Mexican Fiesta|Thai Taste/i",
    );
    await expect(challengeCard).toBeVisible({ timeout: 15000 });
  });

  test("Scrapbook page renders correctly with no sessions", async ({
    page,
  }) => {
    await page.goto("/path/scrapbook");
    await expect(
      page.getByRole("heading", { name: /teeny-tiny trophy case/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/polaroids yet/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("Favorites page renders correctly", async ({ page }) => {
    await page.goto("/path/favorites");
    await expect(
      page.locator("text=/favorites|no favorites/i").first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
