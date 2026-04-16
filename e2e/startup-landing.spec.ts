import { test, expect } from "@playwright/test";

test.describe("Startup landing → demo", () => {
  test("home shows pitch and primary CTA enters Today demo", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", {
        name: /Healthy cooking made easy with AI/i,
      }),
    ).toBeVisible({ timeout: 30000 });

    await expect(page.getByText(/Meet Sous/i)).toBeVisible();

    await page
      .getByRole("link", { name: /Try Sous demo/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/today$/);
    await expect(page.locator("h1")).toContainText("Sous");
  });

  test("header Try demo navigates to Today", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /^Try demo$/i }).click();
    await expect(page).toHaveURL(/\/today$/);
  });

  test("secondary CTA scrolls to platform section", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /Why this is different/i }).click();
    await expect(page.locator("#systems")).toBeInViewport();
    await expect(
      page.getByRole("heading", {
        name: /Not a chatbot wrapper/i,
      }),
    ).toBeVisible();
  });

  test("partnership CTA opens GitHub issue composer", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const link = page.getByRole("link", {
      name: /Start partnership thread/i,
    });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute(
      "href",
      /github\.com\/Stef-01\/Sous\/issues\/new/,
    );
  });
});
