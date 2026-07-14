import { expect, type Locator, test } from "@playwright/test";

async function expectTouchTarget(locator: Locator, label: string) {
  const target = locator.first();
  await expect
    .poll(
      async () => {
        try {
          await target.scrollIntoViewIfNeeded({ timeout: 1000 });
          const box = await target.boundingBox();
          if (!box) return "missing";
          return Math.ceil(box.height) >= 44 && Math.ceil(box.width) >= 44
            ? "ready"
            : `${Math.ceil(box.width)}x${Math.ceil(box.height)}`;
        } catch {
          return "detached";
        }
      },
      { message: label, timeout: 10000 },
    )
    .toBe("ready");
}

function seedTodayNutrition() {
  localStorage.setItem("sous-coach-quiz-done", "true");
  localStorage.setItem("sous-path-tutorial-v1", "done");

  const today = new Date();
  const day = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;
  localStorage.setItem(
    "sous-nutrition-diary-v1",
    JSON.stringify({
      [day]: [
        {
          slug: "garlic-bread",
          name: "Garlic Bread",
          servings: 1,
          at: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            12,
          ).toISOString(),
          auto: true,
        },
      ],
    }),
  );
}

test.describe("Today nutrition doorway", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedTodayNutrition);
  });

  test("keeps the meal first and the flat metrics controls finger-sized", async ({
    page,
  }) => {
    await page.goto("/today", { waitUntil: "domcontentloaded" });

    const meal = page.getByRole("button", {
      name: /Browse meals, starting with/i,
    });
    const nutrition = page.getByRole("region", {
      name: "Today's nutrition",
    });
    await expect(meal).toBeVisible({ timeout: 10000 });
    await expect(nutrition).toBeVisible({ timeout: 10000 });

    const mealComesFirst = await page.evaluate(() => {
      const mealNode = document.querySelector(
        '[aria-label^="Browse meals, starting with"]',
      );
      const nutritionNode = document.querySelector(
        'section[aria-label="Today\'s nutrition"]',
      );
      return Boolean(
        mealNode &&
        nutritionNode &&
        mealNode.compareDocumentPosition(nutritionNode) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      );
    });
    expect(mealComesFirst).toBe(true);
    await expect(nutrition).toHaveCSS("box-shadow", "none");

    const nutritionLinks = nutrition.getByRole("link");
    const controls: Array<[string, Locator]> = [
      ["plate link", nutritionLinks.first()],
      ["energy", nutrition.getByRole("button", { name: "Energy detail" })],
      ["carbs", nutrition.getByRole("button", { name: "Carbs detail" })],
      ["fat", nutrition.getByRole("button", { name: "Fat detail" })],
      ["protein", nutrition.getByRole("button", { name: "Protein detail" })],
    ];
    for (const [label, control] of controls) {
      await expectTouchTarget(control, label);
    }

    const suggestion = nutritionLinks.nth(1);
    if ((await suggestion.count()) > 0) {
      await expectTouchTarget(suggestion, "nutrient suggestion");
      await suggestion.click();
      await expect(page).toHaveURL(/\/cook\/.+/);
      await expect(
        page.getByRole("button", { name: /Let’s gather|Let’s cook/ }),
      ).toBeVisible({ timeout: 10000 });
    }
  });
});
