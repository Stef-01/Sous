import { expect, test, type Locator } from "@playwright/test";

async function expectTouchTarget(control: Locator) {
  const box = await control.boundingBox();
  expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
}

async function expectAllTouchTargets(controls: Locator, expectedCount: number) {
  const count = await controls.count();
  expect(count).toBe(expectedCount);
  for (let i = 0; i < count; i += 1) {
    const control = controls.nth(i);
    await expect(control).toBeVisible();
    await expectTouchTarget(control);
  }
}

test.describe("Path shopping list", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.setItem(
        "sous-shopping-list-v1",
        JSON.stringify({
          items: [
            {
              key: "rice",
              name: "rice",
              addedAt: "2026-07-11T00:00:00.000Z",
              bought: false,
              quantity: "200 g",
              sourceRecipeSlug: "butter-chicken",
              sourceRecipeName: "Butter Chicken",
              contributedBy: ["butter-chicken"],
              contributions: [
                {
                  sourceRecipeSlug: "butter-chicken",
                  sourceRecipeName: "Butter Chicken",
                  quantity: "200 g",
                },
              ],
            },
            {
              key: "eggs",
              name: "eggs",
              addedAt: "2026-07-11T00:00:00.000Z",
              bought: false,
              quantity: "6",
            },
            {
              key: "milk",
              name: "milk",
              addedAt: "2026-07-11T00:00:00.000Z",
              bought: true,
              quantity: "1 l",
            },
          ],
        }),
      );
    });
  });

  test("shopping-list controls keep 44px touch geometry", async ({ page }) => {
    await page.goto("/path/shopping-list");
    await expect(
      page.getByRole("heading", { name: "Shopping list" }),
    ).toBeVisible({ timeout: 10000 });

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("button", { name: "Remove Butter Chicken items" }),
      page.getByRole("link", { name: "View recipe" }).first(),
      page.getByRole("button", { name: "Remove rice" }),
      page.getByRole("button", { name: "Remove milk" }),
      page.getByRole("button", { name: /Move bought \(1\) into pantry/i }),
      page.getByRole("button", { name: "Clear list" }),
    ]) {
      await expect(control).toBeVisible();
      await expectTouchTarget(control);
    }

    await expectAllTouchTargets(
      page.getByRole("button", { name: "Mark rice bought" }),
      2,
    );
    await expectAllTouchTargets(
      page.getByRole("button", { name: "Mark milk not bought" }),
      2,
    );

    await page.getByRole("button", { name: "Clear list" }).click();
    const emptyCta = page.getByRole("link", {
      name: "Find something to cook",
    });
    await expect(emptyCta).toBeVisible({ timeout: 5000 });
    await expectTouchTarget(emptyCta);
  });
});
