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

function seedAdminQueue() {
  localStorage.setItem("sous-is-admin", "true");
  localStorage.setItem(
    "sous-recipe-drafts-v1",
    JSON.stringify([
      {
        schemaVersion: 1,
        id: "community-admin-e2e",
        slug: "community-admin-e2e",
        title: "Community Lemon Rice",
        dishName: "Community Lemon Rice",
        cuisineFamily: "South Indian",
        flavorProfile: ["bright", "comforting"],
        dietaryFlags: ["vegetarian"],
        temperature: "hot",
        skillLevel: "beginner",
        prepTimeMinutes: 10,
        cookTimeMinutes: 15,
        serves: 2,
        heroImageUrl: null,
        description: "A simple community-submitted rice dish for review.",
        ingredients: [
          {
            id: "community-admin-e2e-i-1",
            name: "cooked rice",
            quantity: "2 cups",
            isOptional: false,
            substitution: null,
          },
          {
            id: "community-admin-e2e-i-2",
            name: "lemon juice",
            quantity: "2 tbsp",
            isOptional: false,
            substitution: null,
          },
        ],
        steps: [
          {
            stepNumber: 1,
            instruction: "Warm the rice gently in a pan.",
            timerSeconds: null,
            mistakeWarning: null,
            quickHack: null,
            cuisineFact: null,
            donenessCue: null,
            imageUrl: null,
            attentionPointers: null,
          },
          {
            stepNumber: 2,
            instruction: "Fold through lemon juice and taste for brightness.",
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
        source: "community",
        nourishApprovedAt: null,
        nourishApprovedBy: null,
        authorDisplayName: "Stefan",
        sourceTags: ["Family"],
      },
    ]),
  );
}

test.describe("Community admin queue controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedAdminQueue);
  });

  test("review actions stay finger-sized", async ({ page }) => {
    await page.goto("/community/admin", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("heading", { name: "Admin queue" }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Community Lemon Rice")).toBeVisible();

    for (const control of [
      page.getByRole("link", { name: "Back to Content" }),
      page.getByRole("button", { name: "Verify" }),
      page.getByRole("button", { name: "Reject" }),
      page.getByRole("link", { name: "Open" }),
    ]) {
      await expectTouchTarget(control);
    }
  });
});
