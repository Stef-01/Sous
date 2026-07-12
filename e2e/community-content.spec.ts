import { expect, type Locator, test } from "@playwright/test";

async function expectTouchTarget(locator: Locator) {
  const target = locator.last();
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

test.describe("Community content surface", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("home navigation and content actions stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/community?tag=fiber", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Content" })).toBeVisible({
      timeout: 10000,
    });

    await expectTouchTarget(page.getByRole("link", { name: "Saved content" }));
    await expectTouchTarget(page.getByRole("button", { name: "Watch" }));
    await expectTouchTarget(page.getByRole("button", { name: "Learn" }));
    await expectTouchTarget(page.getByRole("button", { name: "Experts" }));
    await expectTouchTarget(page.getByRole("button", { name: "Ask" }));
    await expectTouchTarget(page.getByRole("button", { name: "See all" }));
    await expectTouchTarget(
      page.getByRole("link", { name: /Group Challenge/i }),
    );
    await expectTouchTarget(
      page.getByRole("link", { name: /This week.s leaderboard/i }),
    );
    await expectTouchTarget(
      page.getByRole("button", { name: "Clear the #fiber filter" }),
    );
  });
});
