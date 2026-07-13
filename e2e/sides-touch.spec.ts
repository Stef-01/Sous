import { expect, type Locator, test } from "@playwright/test";

async function expectTouchTarget(locator: Locator, label?: string) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(
    box,
    `${label ?? "control"} should have a bounding box`,
  ).not.toBeNull();
  expect(box!.width, `${label ?? "control"} width`).toBeGreaterThanOrEqual(44);
  expect(box!.height, `${label ?? "control"} height`).toBeGreaterThanOrEqual(
    44,
  );
}

test.describe("sides touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("standalone side search controls preserve 44px geometry", async ({
    page,
  }) => {
    await page.goto("/sides");

    await expectTouchTarget(page.getByRole("button", { name: "Go back" }));
    const search = page.getByRole("textbox", { name: "Search sides" });
    await expectTouchTarget(search, "Search sides");

    await search.fill("tabbouleh");
    await expectTouchTarget(
      page.getByRole("button", { name: "Clear search" }),
      "Clear search",
    );
    await expectTouchTarget(
      page.getByRole("button", { name: /tabbouleh/i }).first(),
      "Tabbouleh result",
    );
  });

  test("paired side recommendations preserve 44px geometry", async ({
    page,
  }) => {
    await page.goto("/sides?main=Butter%20Chicken");

    await expectTouchTarget(page.getByRole("button", { name: "Go back" }));
    await expect(page.getByText("Recommended sides")).toBeVisible();

    await expectTouchTarget(
      page.getByRole("button", { name: "Reroll all sides" }),
      "Reroll all sides",
    );
    await expectTouchTarget(
      page.getByRole("checkbox", { name: /^Deselect/i }).first(),
      "side selection",
    );
    await expectTouchTarget(
      page.getByRole("button", { name: /^Swap/i }).first(),
      "swap side",
    );

    const firstCard = page.locator("[data-result-card]").first();
    const expandCard = firstCard.locator('button[aria-expanded="false"]');
    await expectTouchTarget(expandCard, "side card");
    await expandCard.click();
    await expectTouchTarget(
      firstCard.getByRole("button", { name: /guided cook|cook just/i }),
      "single-side cook",
    );
    await expectTouchTarget(
      page.getByRole("button", { name: /^Cook plate|^Cook / }),
      "cook selected",
    );
  });
});
