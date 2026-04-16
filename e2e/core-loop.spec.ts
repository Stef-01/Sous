import { test, expect, type Page } from "@playwright/test";

/**
 * Dismiss the coach quiz overlay that appears for first-time users.
 * Clicks the close button if visible, otherwise proceeds.
 */
async function dismissCoachQuiz(page: Page) {
  const closeBtn = page.locator('button[aria-label="Close"]').first();
  try {
    await closeBtn.waitFor({ state: "visible", timeout: 3000 });
    await closeBtn.click();
  } catch {
    // Quiz didn't appear — already dismissed or localStorage pre-set
  }
  // Short settle for AnimatePresence exit
  await page.waitForTimeout(500);
}

test.describe("Core Loop — craving to cook to win", () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed localStorage to skip the coach onboarding quiz
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify({ spicy: 0.5, fresh: 0.3 }),
      );
      localStorage.setItem("sous-effort-tolerance", "moderate");
    });
  });

  test("Today page loads with quest cards and search bar", async ({ page }) => {
    await page.goto("/today");
    await expect(page.locator("h1")).toContainText("Sous");

    // Quest cards section visible
    await expect(page.getByText("Today's Quest")).toBeVisible();

    // Search bar / craving trigger visible
    await expect(
      page.getByText(/what are you craving|I'm craving/i),
    ).toBeVisible();
  });

  test("Search flow: type craving → see paired sides", async ({ page }) => {
    await page.goto("/today");
    await dismissCoachQuiz(page);

    // Click the search bar to open the search popout
    const searchTrigger = page
      .getByText(/what are you craving|I'm craving/i)
      .first();
    await searchTrigger.click();

    // Type a craving into the text prompt
    const input = page.getByPlaceholder(/Roast chicken|pasta|curry/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("chicken tikka masala");
    await input.press("Enter");

    // Should show loading skeletons then results
    await expect(page.locator(".shimmer").first()).toBeVisible({
      timeout: 3000,
    });

    // Wait for results to appear (side dish cards)
    const resultCard = page
      .locator('[role="article"], [data-testid="side-card"]')
      .first();
    await expect(resultCard).toBeVisible({ timeout: 15000 });
  });

  test("Full core loop smoke: craving → results → cook → first step", async ({
    page,
  }) => {
    test.slow();

    await page.goto("/today");
    await dismissCoachQuiz(page);

    // Open search
    const searchTrigger = page
      .getByText(/what are you craving|I'm craving/i)
      .first();
    await searchTrigger.click();

    // Type craving
    const input = page.getByPlaceholder(/Roast chicken|pasta|curry/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });
    await input.fill("butter chicken");
    await input.press("Enter");

    // Wait for results
    await page.waitForTimeout(1000);
    // Result stack primary CTA: "Cook {side}" or "Cook N selected sides" (not "Cook just this one")
    const cookButton = page.getByRole("button", { name: /^Cook (?!just)/ });
    await expect(cookButton.first()).toBeVisible({ timeout: 20000 });
    await cookButton.first().click({ force: true });

    // Should navigate to /cook/... route
    await expect(page).toHaveURL(/\/cook\//, { timeout: 10000 });

    // Mission screen: "Let's cook" or "Start" button
    // Mission CTA uses a typographic apostrophe (U+2019) in "Let's gather" / "Let's cook"
    const startCookBtn = page.getByRole("button", {
      name: /Let.s (gather|cook)|start cooking|begin|next/i,
    });
    await expect(startCookBtn).toBeVisible({ timeout: 10000 });
    await startCookBtn.click();

    // Ingredient list phase: "I've got everything" or "Next" button
    const gotEverythingBtn = page.getByRole("button", {
      name: /I have everything|Let.s cook|got everything|ready|start|next/i,
    });
    await expect(gotEverythingBtn).toBeVisible({ timeout: 10000 });
    await gotEverythingBtn.click();

    // Guided cook can be combined (many dishes/steps) with timer steps — full win is
    // covered elsewhere. Here we prove the cook shell loads and advances one step.
    await expect(page.getByText(/Step \d+ of \d+/)).toBeVisible({
      timeout: 15000,
    });
    await page
      .getByRole("button", { name: /go to step/i })
      .first()
      .click();
    await expect(page.getByText(/Step 2 of/)).toBeVisible({ timeout: 15000 });
  });

  test("Quest card swipe and navigation", async ({ page }) => {
    await page.goto("/today");
    await dismissCoachQuiz(page);

    // Quest cards should be visible
    const questSection = page.getByText("Today's Quest");
    await expect(questSection).toBeVisible();

    // Find the primary CTA button on the quest card
    const questCta = page
      .getByRole("button", { name: /find sides|start cooking/i })
      .first();
    await expect(questCta).toBeVisible({ timeout: 5000 });

    // Save button (heart) should be present
    const heartBtn = page
      .getByRole("button", { name: /save for later|already saved/i })
      .first();
    await expect(heartBtn).toBeVisible();

    // Fixed tab bar overlaps the quest row on short viewports — force click on all engines.
    await heartBtn.scrollIntoViewIfNeeded();
    // Force clicks can skip React handlers; use DOM click so save + toast reliably fire.
    await heartBtn.evaluate((el) => (el as HTMLButtonElement).click());
    await expect(
      page.getByRole("button", { name: /already saved/i }),
    ).toBeVisible({ timeout: 8000 });
  });

  test("Fallback actions work", async ({ page }) => {
    await page.goto("/today");
    await dismissCoachQuiz(page);

    // "Rescue my fridge" chip
    const rescueBtn = page.getByText("Rescue my fridge");
    await expect(rescueBtn).toBeVisible();
    await rescueBtn.click();

    // Should open search popout with a query pre-filled
    const input = page.getByPlaceholder(/Roast chicken|pasta|curry/i).first();
    await expect(input).toBeVisible({ timeout: 5000 });

    // Close the popout by pressing Escape or clicking backdrop
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
  });

  test("Path tab accessible after 3 cooks", async ({ page }) => {
    // Pre-seed 3 completed cook sessions so Path unlocks
    await page.addInitScript(() => {
      const sessions = Array.from({ length: 3 }, (_, i) => ({
        id: `test-${i}`,
        dishSlug: `test-dish-${i}`,
        dishName: `Test Dish ${i}`,
        cuisine: "Indian",
        startedAt: new Date(Date.now() - (3 - i) * 86400000).toISOString(),
        completedAt: new Date(Date.now() - (3 - i) * 86400000).toISOString(),
        rating: 4,
        notes: "",
        photoUri: null,
        isFavorite: false,
      }));
      localStorage.setItem("sous-cook-sessions", JSON.stringify(sessions));
    });

    await page.goto("/today");
    await dismissCoachQuiz(page);

    // Path tab should be visible in the tab bar
    const pathTab = page.getByRole("link", { name: /path/i });
    await expect(pathTab).toBeVisible({ timeout: 5000 });
    await pathTab.click();

    // Should navigate to the Path page
    await expect(page).toHaveURL(/\/path/);
    await expect(
      page.getByRole("heading", { name: "Your journey" }),
    ).toBeVisible({ timeout: 5000 });
  });
});
