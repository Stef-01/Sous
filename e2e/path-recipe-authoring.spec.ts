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

function seedRecipeAuthoring() {
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

test.describe("Path recipe-authoring controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedRecipeAuthoring);
  });

  test("new recipe form controls stay finger-sized", async ({ page }) => {
    await page.goto("/path/recipes/new", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "New recipe" })).toBeVisible(
      { timeout: 10000 },
    );

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("button", { name: "Cuisine family" }),
      page.getByRole("button", { name: "Add" }).first(),
      page.getByRole("button", { name: "Add" }).last(),
      page.getByRole("button", { name: /Reorder step 1/i }),
      page.getByRole("button", { name: /Show details for step 1/i }),
      page.getByRole("button", { name: "Save recipe" }),
    ]) {
      await expectTouchTarget(control);
    }

    for (const field of [
      page.getByLabel("Title"),
      page.getByLabel("Description"),
      page.getByLabel("Prep (min)"),
      page.getByLabel("Cook (min)"),
      page.getByLabel("Serves"),
      page.getByPlaceholder("1 tbsp"),
      page.getByPlaceholder("cumin seeds"),
      page.getByPlaceholder(/Bloom the cumin seeds/i),
    ]) {
      await expectTouchTarget(field);
    }
  });

  test("quick-add and edit recipe actions stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/path/recipes/quick-add", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.getByRole("heading", { name: "Quick add" })).toBeVisible({
      timeout: 10000,
    });

    await expectTouchTarget(
      page.getByRole("link", { name: "Back to My recipes" }),
    );
    await expectTouchTarget(page.getByPlaceholder(/Chana masala/i));
    await expectTouchTarget(
      page.getByRole("button", { name: "Generate first draft" }),
    );

    await page.goto("/path/recipes/e2e-garden-toast/edit", {
      waitUntil: "domcontentloaded",
    });

    await expect(
      page.getByRole("heading", { name: "Edit recipe" }),
    ).toBeVisible({ timeout: 10000 });

    for (const control of [
      page.getByRole("button", { name: "Back to My recipes" }),
      page.getByRole("button", { name: "Add" }).first(),
      page.getByRole("button", { name: "Add" }).last(),
      page.getByRole("button", { name: /Remove ingredient 1/i }),
      page.getByRole("button", { name: /Reorder step 1/i }),
      page.getByRole("button", { name: /Show details for step 1/i }),
      page.getByRole("button", { name: "Save changes" }),
      page.getByRole("button", { name: "Publish to community" }),
    ]) {
      await expectTouchTarget(control);
    }

    await page.goto("/path/recipes/missing/edit", {
      waitUntil: "domcontentloaded",
    });
    await expect(page.getByText("Recipe not found")).toBeVisible({
      timeout: 10000,
    });
    await expectTouchTarget(
      page.getByRole("button", { name: "Back to My recipes" }),
    );
  });
});
