import { expect, test } from "@playwright/test";

test.describe("Offline guided cook shell", () => {
  test("reopens a previously visited Mission screen without a network", async ({
    context,
    page,
  }) => {
    await page.goto("/cook/garlic-bread", { waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "Garlic Bread" }),
    ).toBeVisible({ timeout: 10000 });

    await page.waitForFunction(
      () =>
        "serviceWorker" in navigator && !!navigator.serviceWorker.controller,
      undefined,
      { timeout: 15000 },
    );

    // Reload once under service-worker control so the exact route and all of
    // its versioned Next.js assets are available to the offline fallback.
    await page.reload({ waitUntil: "load" });
    await expect(
      page.getByRole("heading", { name: "Garlic Bread" }),
    ).toBeVisible({ timeout: 10000 });

    await context.setOffline(true);
    try {
      const recipeHeading = page.getByRole("heading", {
        name: "Garlic Bread",
      });
      try {
        await page.reload({ waitUntil: "domcontentloaded" });
      } catch (navigationError) {
        // Playwright WebKit can report an internal reload error after a
        // service worker has already fulfilled an offline navigation.
        if (!(await recipeHeading.isVisible().catch(() => false))) {
          throw navigationError;
        }
      }
      await expect(recipeHeading).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole("img", { name: "Garlic Bread" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: /Let.s gather/i }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "You're offline" }),
      ).toBeHidden();
    } finally {
      await context.setOffline(false);
    }
  });

  test("reopens a previously visited combined Mission without a network", async ({
    context,
    page,
  }) => {
    await page.goto(
      "/cook/combined?main=butter-chicken&sides=tabbouleh,pico-de-gallo",
      { waitUntil: "load" },
    );
    const gather = page.getByRole("button", { name: /Let.s gather/i });
    await expect(gather).toBeVisible({ timeout: 10000 });

    await page.waitForFunction(
      () =>
        "serviceWorker" in navigator && !!navigator.serviceWorker.controller,
      undefined,
      { timeout: 15000 },
    );
    await page.reload({ waitUntil: "load" });
    await expect(gather).toBeVisible({ timeout: 10000 });

    await context.setOffline(true);
    try {
      try {
        await page.reload({ waitUntil: "domcontentloaded" });
      } catch (navigationError) {
        if (!(await gather.isVisible().catch(() => false))) {
          throw navigationError;
        }
      }
      await expect(gather).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByRole("heading", { name: "You're offline" }),
      ).toBeHidden();
    } finally {
      await context.setOffline(false);
    }
  });
});
