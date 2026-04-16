import { test, expect } from "@playwright/test";

test.describe("Startup landing → demo", () => {
  test("home shows pitch and CTA enters Today demo", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: /From endless food media to meals you actually cook/i,
      }),
    ).toBeVisible({ timeout: 30000 });

    await expect(page.getByText(/Stanford clinicians/i)).toBeVisible();

    await page.getByRole("link", { name: /Open the live demo/i }).click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(page.locator("h1")).toContainText("Sous");
  });

  test("Try the demo in header navigates to Today", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page
      .getByRole("link", { name: /Try the demo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/today$/);
  });
});
