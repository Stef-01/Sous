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
    await expect(page.getByRole("heading", { name: "Your Path" })).toBeVisible({
      timeout: 30000,
    });
    await page.getByRole("button", { name: /Progression/i }).click();
    await expect(page.getByText("Knife Skills & Cuts").first()).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("link", { name: "Pantry" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Plan" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Groceries" })).toBeVisible();
    await page.getByRole("button", { name: /Your kitchen/i }).click();
    await expect(page.getByRole("link", { name: "Favorites" })).toBeVisible();
  });

  test("Path page shows weekly challenge card", async ({ page }) => {
    await page.goto("/path", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Your Path" })).toBeVisible({
      timeout: 30000,
    });
    await page.getByRole("button", { name: /Progression/i }).click();
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

test.describe("Path tutorial opt-in help", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.removeItem("sous-path-tutorial-v1");
    });
  });

  test("fresh Path visit lands on the real page without an interstitial", async ({
    page,
  }) => {
    await page.goto("/path", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Your Path" })).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByRole("link", { name: "Find something to cook" }),
    ).toBeVisible();
    await page.waitForTimeout(650);
    await expect(
      page.getByRole("dialog", { name: /welcome to your culinary campus/i }),
    ).toBeHidden();
  });

  test("optional help opens the tutorial with visible 44px exits", async ({
    page,
  }) => {
    await page.goto("/path", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "How Path works" }).click();

    const dialog = page.getByRole("dialog", {
      name: /welcome to your culinary campus/i,
    });
    await expect(dialog).toBeVisible({ timeout: 10000 });

    const skipIcon = dialog.getByRole("button", { name: /skip tutorial/i });
    const skipIntro = dialog.getByRole("button", { name: /skip intro/i });

    for (const control of [skipIcon, skipIntro]) {
      await expect(control).toBeVisible();
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }

    await skipIntro.click();
    await expect(dialog).toBeHidden({ timeout: 5000 });
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("sous-path-tutorial-v1")),
      )
      .toBe("done");
  });
});
