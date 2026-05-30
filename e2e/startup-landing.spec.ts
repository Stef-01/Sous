import { test, expect } from "@playwright/test";

test.describe("Startup landing → demo", () => {
  test("home shows pitch and primary CTA enters Today demo", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: /You don.t need more recipes/i,
      }),
    ).toBeVisible({ timeout: 30000 });

    await expect(page.getByText(/One main, three pairings/i)).toBeVisible();

    await page
      .getByRole("link", { name: /Try it tonight/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(page.locator("h1")).toContainText("Sous");
  });

  test("header Try demo navigates to Today", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", { name: /^Open the demo$/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/today$/);
  });

  test("secondary CTA scrolls to product section", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Why Sous/i }).click();
    await expect(page.locator("#idea")).toBeInViewport();
    await expect(
      page.getByRole("heading", {
        name: /Saved six/i,
      }),
    ).toBeVisible();
  });

  test("practice path CTA opens Path", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const link = page.getByRole("link", { name: /See the practice path/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/path$/);
  });
});
