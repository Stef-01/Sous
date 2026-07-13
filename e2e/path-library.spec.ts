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

function seedRecipeLibrary() {
  localStorage.setItem("sous-coach-quiz-done", "true");
  localStorage.setItem("sous-path-tutorial-v1", "done");
  localStorage.setItem(
    "sous-recipe-drafts-v1",
    JSON.stringify([
      {
        schemaVersion: 1,
        id: "e2e-garden-toast",
        slug: "garden-toast",
        title: "Garden Toast",
        dishName: "Garden Toast",
        cuisineFamily: "california",
        flavorProfile: ["fresh"],
        dietaryFlags: ["vegetarian"],
        temperature: "hot",
        skillLevel: "beginner",
        prepTimeMinutes: 5,
        cookTimeMinutes: 6,
        serves: 1,
        heroImageUrl: null,
        description: "A crisp toast with greens and yogurt.",
        ingredients: [
          {
            id: "garden-toast-i-1",
            name: "sourdough",
            quantity: "1 slice",
            isOptional: false,
            substitution: null,
          },
          {
            id: "garden-toast-i-2",
            name: "greek yogurt",
            quantity: "2 tbsp",
            isOptional: false,
            substitution: null,
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: "Toast the bread until crisp.",
            timerSeconds: null,
            mistakeWarning: null,
            quickHack: null,
            cuisineFact: null,
            donenessCue: null,
            imageUrl: null,
            attentionPointers: null,
          },
        ],
        createdAt: "2026-07-13T00:00:00.000Z",
        updatedAt: "2026-07-13T00:00:00.000Z",
        source: "user",
        nourishApprovedAt: null,
        nourishApprovedBy: null,
        authorDisplayName: "Stefan",
        sourceTags: ["Improvised"],
      },
    ]),
  );
}

test.describe("Path saved-library surfaces", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedRecipeLibrary);
  });

  test("recipe library controls stay finger-sized", async ({ page }) => {
    await page.goto("/path/recipes", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "My recipes" })).toBeVisible(
      { timeout: 10000 },
    );

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("link", { name: "Quick" }),
      page.getByRole("button", { name: "Paste" }),
      page.getByRole("link", { name: "New" }),
      page.getByRole("tab", { name: "All" }),
      page.getByRole("tab", { name: "Mine" }),
      page.getByRole("link", { name: /^Cook$/ }),
      page.getByRole("link", { name: /^Edit$/ }),
      page.getByRole("button", { name: /Share Garden Toast/i }),
    ]) {
      await expectTouchTarget(control, String(control));
    }

    await page.getByRole("tab", { name: "Mine" }).click();
    await expect(page.getByRole("tab", { name: "Mine" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("empty favorites and scrapbook actions stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/path/favorites", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible({
      timeout: 10000,
    });
    await expectTouchTarget(page.getByRole("button", { name: "Back to Path" }));
    await expectTouchTarget(
      page.getByRole("button", { name: /Find something to cook/i }),
    );

    await page.goto("/path/scrapbook", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Your teeny-tiny trophy case" }),
    ).toBeVisible({ timeout: 10000 });
    await expectTouchTarget(page.getByRole("button", { name: "Back to Path" }));
    await expectTouchTarget(
      page.getByRole("button", { name: /Cook something now/i }),
    );
  });
});
