import { expect, type Locator, test } from "@playwright/test";

async function expectTouchTarget(locator: Locator, label?: string) {
  const target = locator.first();
  await expect
    .poll(
      async () => {
        try {
          await target.scrollIntoViewIfNeeded({ timeout: 1000 });
          const box = await target.boundingBox();
          if (!box) return "missing";
          const height = Math.ceil(box.height);
          const width = Math.ceil(box.width);
          return height >= 44 && width >= 44 ? "ready" : `${width}x${height}`;
        } catch {
          return "detached";
        }
      },
      { message: label, timeout: 10000 },
    )
    .toBe("ready");
}

test.describe("Eat Out touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.setItem(
        "sous-nutrient-goals-v1",
        JSON.stringify({ starred: ["iron_mg"], planId: null }),
      );
    });
  });

  test("featured, filter, venue, dish, and log controls stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/eat-out", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Eat out" })).toBeVisible({
      timeout: 10000,
    });

    for (const control of [
      page.getByRole("button", { name: "Back to Today" }),
      page.getByRole("button", { name: /Chicken Biryani/i }).first(),
      page.getByRole("button", { name: "Fits goals" }),
      page.getByRole("button", { name: "All" }),
      page.getByRole("button", { name: "Pakistani-Indian" }),
      page.getByRole("button", { name: /Zareen's/i }).last(),
    ]) {
      await expectTouchTarget(control);
    }

    await page
      .getByRole("button", { name: /Zareen's/i })
      .last()
      .click();
    await expectTouchTarget(
      page.getByRole("button", { name: /Chicken Biryani/i }).last(),
    );

    await page
      .getByRole("button", { name: /Chicken Biryani/i })
      .last()
      .click();
    await expectTouchTarget(
      page.getByRole("button", { name: "Log this dish" }),
    );
  });
});
