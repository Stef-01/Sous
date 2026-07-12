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

test.describe("Community pod challenge surfaces", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.removeItem("sous-pod-state-v1");
    });
  });

  test("pod home and demo picker controls stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/community/pod", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Pod challenge" }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(
      page.getByRole("button", { name: "Back to Content" }),
    );
    await expectTouchTarget(page.getByRole("link", { name: /Create a pod/i }));
    await expectTouchTarget(
      page.getByRole("link", { name: /Join with code/i }),
    );

    const sample = page.getByRole("button", {
      name: /Try a sample challenge/i,
    });
    await expectTouchTarget(sample);
    await sample.click();
    await expect(
      page.getByRole("dialog", { name: "Pick a challenge" }),
    ).toBeVisible({
      timeout: 10000,
    });
    await expectTouchTarget(page.getByRole("button", { name: "Close" }));
    await expectTouchTarget(
      page.getByRole("button", { name: /Spring Greens/i }),
    );
  });

  test("create, join, and leaderboard controls stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/community/pod/create", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Create a pod" }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(
      page.getByRole("link", { name: "Back to Pod challenge" }),
    );
    await expectTouchTarget(page.getByRole("textbox", { name: "Pod name" }));
    await expectTouchTarget(page.getByRole("button", { name: "Add" }));

    await page.getByRole("button", { name: "Add" }).click();
    await expectTouchTarget(
      page.getByRole("button", { name: "Remove member 2" }),
    );
    await expectTouchTarget(
      page.getByRole("button", { name: "child" }).first(),
    );
    await expectTouchTarget(
      page.getByRole("button", { name: "adult" }).first(),
    );
    await expectTouchTarget(page.getByRole("button", { name: "Create pod" }));

    await page.goto("/community/pod/join", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Join with code" }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(
      page.getByRole("link", { name: "Back to Pod challenge" }),
    );
    await expectTouchTarget(page.getByRole("textbox"));
    await expectTouchTarget(
      page.getByRole("link", { name: "Create a pod instead" }),
    );

    await page.goto("/community/leaderboard", {
      waitUntil: "domcontentloaded",
    });
    await expect(
      page.getByRole("heading", { name: "How pods stack up" }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(
      page.getByRole("link", { name: "Back to Community" }),
    );
  });
});
