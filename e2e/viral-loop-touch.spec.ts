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

test.describe("viral loop shell touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("gift recipient page keeps the single CTA easy to tap", async ({
    page,
  }) => {
    await page.goto("/gift/tabbouleh?from=Alex&stars=5&src=friends");

    await expect(
      page.getByRole("heading", { name: /Alex cooked/i }),
    ).toBeVisible();
    await expectTouchTarget(
      page.getByRole("link", { name: /Cook this too/i }),
      "gift cook CTA",
    );
  });

  test("Doge shell back control preserves 44px geometry", async ({ page }) => {
    await page.goto("/doge");

    await expectTouchTarget(
      page.getByRole("button", { name: "Back to Today" }),
      "Doge back",
    );
    await expect(page.locator("iframe[title*='Doge']")).toBeVisible();
  });
});
