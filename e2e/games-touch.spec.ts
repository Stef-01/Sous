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

test.describe("games touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("arcade doorway controls preserve 44px geometry", async ({ page }) => {
    await page.goto("/games");

    await expectTouchTarget(
      page.getByRole("button", { name: "Back to Today" }),
      "Back to Today",
    );
    for (const name of [
      "Open Cuisine Compass",
      "Open What's Cooking?",
      "Open Flavor Pairs",
      "Open Speed Chop",
    ]) {
      await expectTouchTarget(page.getByRole("button", { name }), name);
    }
  });

  test("What Cooking controls preserve 44px geometry", async ({ page }) => {
    await page.goto("/games/whats-cooking");

    await expectTouchTarget(
      page.getByRole("button", { name: "Back to Arcade" }),
      "Back to Arcade",
    );
    await expectTouchTarget(
      page.getByPlaceholder("Type your guess..."),
      "guess input",
    );
    await expectTouchTarget(page.getByRole("button", { name: "Guess" }));
  });

  test("Flavor Pairs controls preserve 44px geometry", async ({ page }) => {
    await page.goto("/games/flavor-pairs");

    await expectTouchTarget(page.getByRole("button", { name: "Back" }));
    for (const difficulty of ["easy", "medium", "hard"]) {
      await expectTouchTarget(page.getByRole("button", { name: difficulty }));
    }

    await page.getByRole("button", { name: "easy" }).click();
    await expectTouchTarget(
      page.getByRole("button", { name: "Back to Arcade" }),
    );
    await expectTouchTarget(
      page.locator('button[aria-label="Hidden card"]').first(),
      "memory card",
    );
  });

  test("Speed Chop controls preserve 44px geometry", async ({ page }) => {
    await page.goto("/games/speed-chop");

    await expectTouchTarget(page.getByRole("button", { name: "Back" }));
    await expectTouchTarget(
      page.getByRole("button", { name: "Start Chopping!" }),
    );

    await page.getByRole("button", { name: "Start Chopping!" }).click();
    await expectTouchTarget(
      page.getByRole("button", { name: "Back to Arcade" }),
    );
    const actionButtons = page.locator("main button");
    await expectTouchTarget(actionButtons.nth(0), "left sort action");
    await expectTouchTarget(actionButtons.nth(1), "right sort action");
  });

  test("Cuisine Compass controls preserve 44px geometry", async ({ page }) => {
    await page.goto("/games/cuisine-compass");

    await expectTouchTarget(
      page.getByRole("link", { name: "Back to Arcade" }),
      "Back to Arcade",
    );
    await expectTouchTarget(
      page.getByRole("application", {
        name: "Cuisine Compass world map. Tap to place your guess.",
      }),
      "world map",
    );
    await expectTouchTarget(
      page.getByRole("button", { name: "Tap the map to place a pin" }),
      "submit guess",
    );
  });
});
