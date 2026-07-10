import { test, expect, type Page } from "@playwright/test";

async function openCravingSearch(page: Page, query: string) {
  await page
    .getByText(/what are you craving/i)
    .first()
    .click();
  const input = page.getByPlaceholder(/Roast chicken|pasta|curry/i).first();
  await expect(input).toBeVisible({ timeout: 5000 });
  await input.fill(query);
  await input.press("Enter");
}

test.describe("Core Loop - Today meal queue to cook", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify({ spicy: 0.5, fresh: 0.3 }),
      );
      localStorage.setItem("sous-effort-tolerance", "moderate");
      localStorage.setItem(
        "sous-pulse-ledger-v1",
        JSON.stringify({
          shown: [{ pulseId: "e2e-quiet", at: new Date().toISOString() }],
          answered: [],
          dismissed: [],
          onboardingDoneAt: new Date().toISOString(),
        }),
      );
    });
  });

  test("Today page loads with meal queue, craving search, and content doorway", async ({
    page,
  }) => {
    await page.goto("/today");
    await expect(page.locator("h1")).toContainText("Sous");
    await expect(page.getByText("Meal queue")).toBeVisible();
    await expect(page.getByText(/what are you craving/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Read:/i })).toBeVisible();
  });

  test("Search flow: type craving -> recommended sides", async ({ page }) => {
    await page.goto("/today");
    await openCravingSearch(page, "butter chicken");

    await expect(page.getByText("Recommended sides")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("button", { name: /Cook plate with 3 sides/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("Full core loop smoke: craving -> sides -> cook -> first step", async ({
    page,
  }) => {
    test.slow();

    await page.goto("/today");
    await openCravingSearch(page, "butter chicken");
    await page
      .getByRole("button", { name: /Cook plate with 3 sides/i })
      .click();

    await expect(page).toHaveURL(/\/cook\/combined/, { timeout: 10000 });
    await page.getByRole("button", { name: /Let.s gather/i }).click();

    await expect(page.getByText("Gather these")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/cook watch-outs/i)).toBeVisible();

    await page.getByRole("button", { name: /I have everything/i }).click();
    await expect(page.getByRole("img", { name: /Step 1 of \d+/ })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('[data-visual-mode="true"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Go to step 2|Next/i }),
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 2 of \d+/ })).toBeVisible({
      timeout: 5000,
    });

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("img", { name: /Step 1 of \d+/ })).toBeVisible({
      timeout: 5000,
    });
  });

  test("Meal queue opens and keyboard save state is visible", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /Browse meals/i }).click();

    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole("button", { name: /^Save\b|Save .+/i }).first(),
    ).toBeVisible();
    await page.keyboard.press("s");
    await expect(
      page
        .getByRole("button", { name: /Already saved|^Saved\b|Saved .+/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Meal queue info sheet traps focus and closes before queue", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /Browse meals/i }).click();

    const queueDialog = page.getByRole("dialog", {
      name: /Meal swipe queue/i,
    });
    await expect(queueDialog).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: /Show info for/i }).click();
    const infoDialog = page.getByRole("dialog", { name: /Info for/i });
    await expect(infoDialog).toBeVisible({ timeout: 5000 });
    await expect(infoDialog).toBeFocused({ timeout: 5000 });

    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: /Close info/i })).toBeFocused(
      {
        timeout: 5000,
      },
    );

    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("button", { name: /Close meal queue/i }),
    ).not.toBeFocused();
    await expect
      .poll(() =>
        infoDialog.evaluate((dialog) =>
          dialog.contains(document.activeElement),
        ),
      )
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(infoDialog).toBeHidden({ timeout: 5000 });
    await expect(queueDialog).toBeVisible();
  });

  test("Fallback actions open the craving helper", async ({ page }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /More options/i }).click();

    const rescueBtn = page.getByText("Rescue my fridge");
    await expect(rescueBtn).toBeVisible();
    await rescueBtn.click();

    await expect(
      page.getByPlaceholder(/Roast chicken|pasta|curry/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Path tab is accessible from Today", async ({ page }) => {
    await page.goto("/today");
    const pathTab = page.getByRole("link", { name: /path/i });
    await expect(pathTab).toBeVisible({ timeout: 5000 });
    await pathTab.click();

    await expect(page).toHaveURL(/\/path/);
    await expect(page.getByText(/Your Path|Your journey/).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
