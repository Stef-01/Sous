import { test, expect, type Page } from "@playwright/test";

type StoredShoppingList = {
  items?: Array<{
    name?: string;
    quantity?: string;
    sourceRecipeSlug?: string;
    contributedBy?: string[];
    contributions?: Array<{
      sourceRecipeSlug?: string;
      quantity?: string;
    }>;
  }>;
};

async function skipFirstRun(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("sous-coach-quiz-done", "true");
    localStorage.setItem("sous-path-tutorial-v1", "done");
  });
}

test.describe("Shopping list recipe provenance", () => {
  test.beforeEach(async ({ page }) => {
    await skipFirstRun(page);
  });

  test("combined cook Add missing writes recipe-backed shopping rows", async ({
    page,
  }) => {
    test.slow();

    await page.goto(
      "/cook/combined?main=butter-chicken&sides=tabbouleh,pico-de-gallo",
      { waitUntil: "domcontentloaded" },
    );

    await expect(page.getByText("Butter Chicken").first()).toBeVisible({
      timeout: 30_000,
    });

    await expect(
      page.getByRole("button", { name: /Let.s gather/i }),
    ).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: /Let.s gather/i }).click();

    await expect(page.getByText("Gather these")).toBeVisible({
      timeout: 15_000,
    });

    const addMissing = page.getByRole("button", {
      name: /Add \d+ items? to shopping list/i,
    });
    await expect(addMissing).toBeVisible({ timeout: 10_000 });
    await addMissing.click();

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem("sous-shopping-list-v1");
      return raw ? (JSON.parse(raw) as StoredShoppingList) : null;
    });

    expect(stored?.items?.length ?? 0).toBeGreaterThan(10);
    const sourceSlugs = Array.from(
      new Set(
        (stored?.items ?? []).flatMap((item) => [
          item.sourceRecipeSlug,
          ...(item.contributedBy ?? []),
          ...(item.contributions ?? []).map(
            (source) => source.sourceRecipeSlug,
          ),
        ]),
      ),
    );
    expect(sourceSlugs).toEqual(
      expect.arrayContaining(["butter-chicken", "tabbouleh", "pico-de-gallo"]),
    );
    expect(
      (stored?.items ?? []).some(
        (item) =>
          typeof item.quantity === "string" &&
          item.quantity.trim().length > 0 &&
          (item.contributions?.length ?? 0) > 0,
      ),
    ).toBe(true);

    await page.goto("/path/shopping-list");

    await expect(
      page.getByRole("heading", { name: "Shopping list" }),
    ).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Recipes", { exact: true })).toBeVisible();
    await expect(page.getByText("Butter Chicken")).toBeVisible();
    await expect(page.getByText("Tabbouleh")).toBeVisible();
    await expect(page.getByText("Pico de Gallo")).toBeVisible();
    await expect(page.getByText("What these meals deliver")).toBeVisible();
    await expect(page.getByText("Calories", { exact: true })).toBeVisible();
    const chickenRow = page
      .getByRole("button", { name: /Mark Boneless chicken thighs bought/i })
      .first();
    await chickenRow.scrollIntoViewIfNeeded();
    await expect(chickenRow).toBeVisible();
  });
});
