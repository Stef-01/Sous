import { test, expect } from "@playwright/test";

function seedStatsAndAchievements() {
  localStorage.setItem("sous-coach-quiz-done", "true");
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(
    "sous-cook-stats",
    JSON.stringify({
      completedCooks: 1,
      currentStreak: 1,
      lastCookDate: today,
      cuisinesCovered: ["Italian"],
    }),
  );
  localStorage.setItem(
    "sous-achievements",
    JSON.stringify({
      unlocked: [],
      lastCheckedStats: {
        cooksCompleted: 0,
        cuisinesExplored: 0,
        streakDays: 0,
        skillsCompleted: 0,
        dishesRated: 0,
        photosAdded: 0,
        xpEarned: 0,
        level: 1,
      },
    }),
  );
}

test.describe("Path — achievement toast", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
    });
  });

  test("shows First Flame toast when cook stats cross threshold", async ({
    page,
  }) => {
    await page.goto("/");
    await page.evaluate(seedStatsAndAchievements);
    await page.goto("/path", { waitUntil: "domcontentloaded" });
    await expect(page.getByText("Your journey")).toBeVisible({
      timeout: 30000,
    });
    const toast = page.getByRole("button", { name: /Achievement Unlocked/i });
    await expect(toast).toBeVisible({ timeout: 15000 });
    await expect(toast.getByText("First Flame")).toBeVisible();
    await toast.click();
    await expect(toast).toBeHidden({ timeout: 5000 });
  });
});
