import { expect, test, type Locator } from "@playwright/test";

async function expectTouchTarget(control: Locator) {
  const box = await control.boundingBox();
  expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
}

test.describe("Path pantry", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.setItem("sous-pantry-v1", JSON.stringify(["rice", "eggs"]));
      localStorage.setItem(
        "sous-pantry-inventory-v1",
        JSON.stringify([
          {
            key: "rice",
            name: "Rice",
            quantity: 500,
            unit: "g",
            nutrition: {
              calories: 650,
              protein_g: 13.5,
              carbs_g: 140,
              fat_g: 1.5,
            },
            addedAt: "2026-07-11T00:00:00.000Z",
          },
        ]),
      );
    });
  });

  test("pantry controls keep 44px touch geometry", async ({ page }) => {
    await page.goto("/path/pantry");
    await expect(page.getByRole("heading", { name: "Pantry" })).toBeVisible({
      timeout: 10000,
    });

    const search = page.getByRole("textbox", {
      name: "Search ingredients to add to your pantry",
    });
    const quantity = page.getByRole("textbox", {
      name: /Quantity \(optional/i,
    });

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("button", { name: "Import" }),
      search,
      quantity,
      page.getByRole("button", { name: /Pantry Mode/i }),
      page.getByRole("button", { name: "Remove rice from pantry" }),
      page.getByRole("button", { name: "Clear pantry" }),
    ]) {
      await expect(control).toBeVisible();
      await expectTouchTarget(control);
    }

    await search.fill("tomat");
    const registryRow = page.getByRole("button", { name: /tomat/i }).first();
    await expect(registryRow).toBeVisible({ timeout: 5000 });
    await expectTouchTarget(registryRow);

    await search.fill("zz pantry herb");
    const customRow = page
      .getByRole("button")
      .filter({ hasText: "zz pantry herb" })
      .first();
    await expect(customRow).toBeVisible({ timeout: 5000 });
    await expectTouchTarget(customRow);

    await page.getByRole("button", { name: "Clear pantry" }).click();
    const emptyCta = page.getByRole("link", {
      name: "Find something to cook",
    });
    await expect(emptyCta).toBeVisible({ timeout: 5000 });
    await expectTouchTarget(emptyCta);
  });
});
