import { expect, type Locator, test } from "@playwright/test";

async function expectTouchTarget(locator: Locator) {
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
      { timeout: 10000 },
    )
    .toBe("ready");
}

test.describe("Today standalone search", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("search page controls stay finger-sized while showing results", async ({
    page,
  }) => {
    await page.goto("/today/search", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Search" })).toBeVisible({
      timeout: 10000,
    });

    await expectTouchTarget(page.getByRole("link", { name: "Back to Today" }));

    const searchBox = page.getByRole("searchbox", {
      name: "Search recipes",
    });
    await expectTouchTarget(searchBox);

    const italian = page.getByRole("button", { name: "Italian" });
    await expectTouchTarget(italian);
    await italian.click();
    await expect(italian).toHaveAttribute("aria-pressed", "true");

    await searchBox.fill("pasta");
    await expect(
      page.getByRole("heading", {
        name: /Viral pasta recipe/i,
      }),
    ).toBeVisible({ timeout: 10000 });

    await expectTouchTarget(
      page.getByRole("link", { name: /View original/i }).first(),
    );
  });
});
