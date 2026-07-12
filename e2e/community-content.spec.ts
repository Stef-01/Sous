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

  test("detail pages keep reading and reply controls finger-sized", async ({
    page,
  }) => {
    await page.goto("/community/article/stanford-healthy-eating-habits", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", {
        name: "How to encourage healthy eating habits that actually stick",
      }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(page.getByRole("button", { name: "Back" }));
    await expectTouchTarget(
      page.getByRole("button", {
        name: /Save How to encourage healthy eating habits/i,
      }),
    );
    await expectTouchTarget(page.getByRole("link", { name: /Venus Kalami/i }));
    await expectTouchTarget(page.getByRole("link", { name: "#family-meals" }));

    await page.goto("/community/research/stanford-childrens-gut-health", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Source paper")).toBeVisible({
      timeout: 10000,
    });
    await expectTouchTarget(page.getByRole("button", { name: "Back" }));
    await expectTouchTarget(
      page.getByRole("button", { name: /^Save / }).first(),
    );

    await page.goto("/community/forum/forum-rice-gummy", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "Why is my rice always gummy?" }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(page.getByRole("button", { name: "Back" }));
    await expectTouchTarget(
      page.getByRole("button", { name: /Save Why is my rice/i }),
    );
    await expectTouchTarget(
      page.getByRole("button", { name: "Thank this reply" }).first(),
    );

    const replyButton = page
      .getByRole("button", { name: /Reply to @/ })
      .first();
    await expectTouchTarget(replyButton);
    await replyButton.click();
    await expectTouchTarget(
      page.getByRole("button", { name: "Cancel reply target" }),
    );
    await expectTouchTarget(page.getByRole("textbox", { name: "Reply" }));
    await expectTouchTarget(page.getByRole("button", { name: "Post reply" }));
  });

  test("immersive reels keep escape and cook actions finger-sized", async ({
    page,
  }) => {
    await page.goto("/community/reels?start=reel-tadka-101", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("region", { name: "Reel: Tadka in 30 seconds" }).first(),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(page.getByRole("button", { name: "Close reels" }));
    await expectTouchTarget(page.getByRole("link", { name: /Cook this/ }));
    await expectTouchTarget(page.getByRole("button", { name: "Like" }));
    await expectTouchTarget(page.getByRole("button", { name: "Save" }));
    await expectTouchTarget(page.getByRole("button", { name: "Share reel" }));
  });
});
