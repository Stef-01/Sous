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

function seedTodayState() {
  localStorage.setItem("sous-coach-quiz-done", "true");
  localStorage.setItem("sous-path-tutorial-v1", "done");
  localStorage.setItem(
    "sous-pulse-ledger-v1",
    JSON.stringify({
      shown: [{ pulseId: "e2e-quiet", at: new Date().toISOString() }],
      answered: [],
      dismissed: [],
      onboardingDoneAt: new Date().toISOString(),
    }),
  );
}

test.describe("Today tonight commitment controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedTodayState);
  });

  test("More Options tonight commit flow keeps 44px geometry", async ({
    page,
  }) => {
    await page.goto("/today", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Open more options" }).click();
    const sheet = page.getByRole("dialog", { name: "More options" });
    await expect(sheet).toBeVisible({ timeout: 10000 });

    await expectTouchTarget(sheet.getByRole("button", { name: "Close" }));
    await expectTouchTarget(
      sheet.getByRole("button", { name: "Commit to tonight's cook" }),
    );

    await sheet
      .getByRole("button", { name: "Commit to tonight's cook" })
      .click();

    const input = sheet.getByRole("textbox", { name: "Tonight's cook" });
    await expectTouchTarget(input);
    await expectTouchTarget(
      sheet.getByRole("button", { name: "Commit to tonight's cook" }),
    );
    await expectTouchTarget(sheet.getByRole("button", { name: "Cancel" }));

    await input.fill("Lemon rice");
    await sheet
      .getByRole("button", { name: "Commit to tonight's cook" })
      .click();

    await sheet.getByRole("button", { name: "Close" }).click();
    await expect(sheet).toBeHidden({ timeout: 5000 });
    await expect(page.getByText("Tonight:")).toBeVisible({ timeout: 5000 });
    await expectTouchTarget(
      page.getByRole("button", { name: "Clear tonight's cook" }),
    );
  });
});
