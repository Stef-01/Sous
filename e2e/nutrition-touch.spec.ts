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

function seedNutritionState() {
  localStorage.setItem("sous-coach-quiz-done", "true");
  localStorage.setItem("sous-path-tutorial-v1", "done");

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const at = (hour: number, base = today) =>
    new Date(
      base.getFullYear(),
      base.getMonth(),
      base.getDate(),
      hour,
      15,
      0,
    ).toISOString();
  const localDayKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;

  localStorage.setItem(
    "sous-nutrition-diary-v1",
    JSON.stringify({
      [localDayKey(today)]: [
        {
          slug: "garlic-bread",
          name: "Garlic Bread",
          servings: 1,
          at: at(8),
          auto: true,
        },
        {
          slug: "masoor-dal",
          name: "Masoor Dal",
          servings: 1.5,
          at: at(13),
          auto: true,
        },
      ],
      [localDayKey(yesterday)]: [
        {
          slug: "garlic-bread",
          name: "Garlic Bread",
          servings: 2,
          at: at(19, yesterday),
          auto: true,
        },
      ],
      [localDayKey(twoDaysAgo)]: [
        {
          slug: "masoor-dal",
          name: "Masoor Dal",
          servings: 1,
          at: at(19, twoDaysAgo),
          auto: true,
        },
      ],
    }),
  );
}

test.describe("Nutrition diary controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedNutritionState);
  });

  test("day, macro, diary, serving, and hydration controls stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/nutrition", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Nutrition" })).toBeVisible({
      timeout: 10000,
    });

    for (const control of [
      page.getByRole("button", {
        name: "Visit Dobe, your kitchen companion",
      }),
      page.getByRole("button", { name: "Show remaining" }),
      page.getByRole("button", { name: "View all" }),
      page.getByRole("button", { name: /Breakfast/i }),
      page.getByRole("button", { name: /^Log$/ }).first(),
      page.getByRole("button", { name: /Set water to 1 glass/i }),
    ]) {
      await expectTouchTarget(control);
    }

    await page.getByRole("button", { name: "View all" }).click();

    for (const control of [
      page.getByRole("button", {
        name: /Adjust Garlic Bread servings/i,
      }),
      page.getByRole("button", { name: "Remove Garlic Bread" }),
    ]) {
      await expectTouchTarget(control);
    }

    await page
      .getByRole("button", { name: /Adjust Garlic Bread servings/i })
      .click();

    for (const control of [
      page.getByRole("button", { name: /Reduce Garlic Bread servings/i }),
      page.getByRole("button", { name: "Done adjusting servings" }),
      page.getByRole("button", { name: /Increase Garlic Bread servings/i }),
    ]) {
      await expectTouchTarget(control);
    }
  });

  test("log-food input, result rows, and staple chips stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/nutrition", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Nutrition" })).toBeVisible({
      timeout: 10000,
    });

    for (const control of [
      page.getByRole("textbox", { name: "Log food" }),
      page.getByRole("button", { name: "Read a label with the camera" }),
      page.getByRole("button", { name: /Import a day from ChatGPT/i }),
    ]) {
      await expectTouchTarget(control);
    }

    await expectTouchTarget(
      page.getByRole("button", { name: /^Garlic Bread$/ }),
    );

    const input = page.getByRole("textbox", { name: "Log food" });
    await input.fill("garlic");
    const result = page.getByRole("button", { name: /Garlic Bread/i }).first();
    await expect(result).toBeVisible({ timeout: 5000 });
    await expectTouchTarget(result);

    await input.fill("dal and garlic bread");
    await expectTouchTarget(page.getByRole("button", { name: /Log all/i }));
  });
});
