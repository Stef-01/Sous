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

test.describe("Sous Everywhere touch targets", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("showcase controls stay finger-sized", async ({ page }) => {
    await page.goto("/everywhere", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Crave it on every screen" }),
    ).toBeVisible({ timeout: 10000 });

    for (const control of [
      page.getByRole("button", { name: "Back to Today" }),
      page.getByRole("link", { name: /Save wallpaper/i }),
      page.getByRole("button", { name: /Auto-set it daily/i }),
      page.getByRole("button", { name: /Craving gallery/i }),
      page.getByRole("button", { name: /The Today deck/i }),
      page.getByRole("button", { name: /Desktop gallery/i }),
      page.getByRole("button", { name: "Notify me" }).first(),
    ]) {
      await expectTouchTarget(control);
    }

    await page.getByRole("button", { name: /Auto-set it daily/i }).click();
    await expectTouchTarget(
      page.getByRole("button", { name: /Copy the daily link/i }),
    );
  });

  test("gallery controls stay finger-sized", async ({ page }) => {
    await page.goto("/everywhere/gallery", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("button", { name: /Cook /i })).toBeVisible({
      timeout: 10000,
    });

    await expectTouchTarget(page.getByRole("button", { name: "Back" }));
    await expectTouchTarget(page.getByRole("button", { name: "Next dish" }));
  });
});
