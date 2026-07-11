import { expect, test, type Locator } from "@playwright/test";
import { isoWeekKey } from "../src/types/meal-plan";

async function expectTouchTarget(control: Locator) {
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
}

async function seedCurrentWeekPlan(weekKey: string) {
  localStorage.setItem("sous-coach-quiz-done", "true");
  localStorage.setItem("sous-path-tutorial-v1", "done");
  localStorage.setItem(
    "sous-pulse-ledger-v1",
    JSON.stringify({
      shown: [],
      answered: [],
      dismissed: [],
      onboardingDoneAt: new Date().toISOString(),
    }),
  );

  const at = "2026-07-11T00:00:00.000Z";
  localStorage.setItem(
    `sous-meal-plan-${weekKey}`,
    JSON.stringify({
      schemaVersion: 1,
      weekKey,
      scheduled: [
        {
          slot: "mon-dinner",
          recipeSlug: "butter-chicken",
          source: "swipe-planned",
          scheduledAt: at,
        },
      ],
      updatedAt: at,
    }),
  );
}

test.describe("Path planning touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedCurrentWeekPlan, isoWeekKey(new Date()));
  });

  test("week review, manage sheet, and add sheet keep 44px geometry", async ({
    page,
  }) => {
    await page.goto("/path/plan/week");
    await expect(page.getByRole("heading", { name: "Meal Plan" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/Butter Chicken/i)).toBeVisible({
      timeout: 10000,
    });

    for (const control of [
      page.getByRole("link", { name: "Back to Path" }),
      page.getByRole("button", { name: "Clear this week's plan" }),
      page.getByRole("button", { name: "Previous week" }),
      page.getByRole("button", { name: "Next week" }),
      page.getByRole("button", { name: "Add a meal to Tuesday" }),
      page.getByRole("button", { name: /Butter Chicken/i }),
      page.getByRole("link", { name: "Add more cooks" }),
      page.getByRole("button", { name: "Shop this week" }),
      page.getByRole("button", { name: "Clear the week" }),
    ]) {
      await expectTouchTarget(control);
    }

    await page.getByRole("button", { name: /Butter Chicken/i }).click();
    await expect(
      page.getByRole("dialog", { name: "Manage planned meal" }),
    ).toBeVisible();
    for (const control of [
      page.getByRole("button", { name: "Move to mon breakfast" }),
      page.getByRole("button", { name: "Move to mon lunch" }),
      page.getByRole("button", { name: "Move to mon dinner" }),
      page.getByRole("button", { name: "Move to tue dinner" }),
      page.getByRole("button", { name: "Cook now" }),
      page.getByRole("button", { name: "Remove" }),
    ]) {
      await expectTouchTarget(control);
    }
    await page.getByRole("button", { name: "Close" }).click();

    await page.getByRole("button", { name: "Add a meal to Tuesday" }).click();
    for (const control of [
      page.getByRole("button", { name: "Breakfast", exact: true }),
      page.getByRole("button", { name: "Lunch", exact: true }),
      page.getByRole("button", { name: "Dinner", exact: true }),
    ]) {
      await expectTouchTarget(control);
    }
    await page.getByRole("button", { name: "Breakfast", exact: true }).click();

    const search = page.getByRole("textbox", {
      name: "Search dishes to add to the plan",
    });
    await expectTouchTarget(search);
    await expectTouchTarget(
      page.getByRole("button", { name: /Browse ideas instead/i }),
    );

    await search.fill("garlic");
    await expectTouchTarget(
      page.getByRole("button", { name: /Garlic Bread/i }).first(),
    );

    await search.fill("zz brunch");
    await expectTouchTarget(
      page.getByRole("button").filter({ hasText: "zz brunch" }).first(),
    );
  });

  test("swipe planner controls and completion actions keep 44px geometry", async ({
    page,
  }) => {
    await page.goto("/path/plan");
    await expect(
      page.getByRole("heading", { name: "Plan the week" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Skip" })).toBeVisible({
      timeout: 10000,
    });

    for (const control of [
      page.getByRole("link", { name: "Back to Path" }),
      page.getByRole("button", { name: "Skip" }),
      page.getByRole("button", { name: "Twist" }),
      page.getByRole("button", { name: "Schedule" }),
    ]) {
      await expectTouchTarget(control);
    }

    for (let i = 0; i < 7; i += 1) {
      await page.getByRole("button", { name: "Schedule" }).click();
    }

    await expect(page.getByText(/Week planned/i)).toBeVisible({
      timeout: 10000,
    });
    for (const control of [
      page.getByRole("link", { name: "Review the week" }),
      page.getByRole("link", { name: "Go to Today" }),
    ]) {
      await expectTouchTarget(control);
    }
  });

  test("swipe planner empty-pool action keeps 44px geometry", async ({
    page,
  }) => {
    await page.goto("/path/plan");
    await expect(
      page.getByRole("heading", { name: "Plan the week" }),
    ).toBeVisible({ timeout: 10000 });

    for (let i = 0; i < 20; i += 1) {
      const skip = page.getByRole("button", { name: "Skip" });
      if (!(await skip.isVisible())) break;
      await skip.click();
    }

    await expect(
      page.getByText(/Out of cards for now|Nothing matched your pantry/i),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(
      page.getByRole("button", { name: "Twist for a fresh batch" }),
    );
  });
});
