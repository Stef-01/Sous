import { test, expect, type Page } from "@playwright/test";

/**
 * E2E coverage for the Today-deck features added in this cycle:
 *   - multi-select Role / Cuisine / Meal-type filters (mirror Source)
 *   - the minimalist "find a side" search at bare /sides
 *   - "Skip sides — cook the main on its own"
 *
 * Onboarding is bypassed via init-script localStorage (the core-loop
 * convention) so the deck renders immediately.
 */

async function bypassOnboarding(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("sous-coach-quiz-done", "true");
    localStorage.setItem("sous-path-tutorial-v1", "done");
    localStorage.setItem("sous-firstrun-seen", "true");
  });
}

test.describe("Today multi-select filters", () => {
  test("Role filter is multi-select — ticking Side keeps Main + adds Side", async ({
    page,
  }) => {
    await bypassOnboarding(page);
    await page.goto("/today");

    // Open the Filter menu, drill into Role, tick "Side".
    await page.getByRole("button", { name: /^Filter/ }).click();
    await page.getByRole("button", { name: /^Role/ }).click();
    await page.getByRole("button", { name: "Side", exact: true }).click();

    // The persisted state is the source of truth (UI-independent).
    const roles = await page.evaluate(
      () =>
        JSON.parse(sessionStorage.getItem("sous-quest-filters-v1") ?? "{}")
          .roles,
    );
    expect(roles).toContain("main");
    expect(roles).toContain("side");
  });

  test("Cuisine filter is multi-select with no 'Any' option", async ({
    page,
  }) => {
    await bypassOnboarding(page);
    await page.goto("/today");

    await page.getByRole("button", { name: /^Filter/ }).click();
    await page.getByRole("button", { name: /^Cuisine/ }).click();
    // "Pick any" header marks a multi-select row; no "Any cuisine" option.
    await expect(page.getByText("Pick any")).toBeVisible();
    await expect(page.getByText("Any cuisine")).toHaveCount(0);
  });
});

test.describe("Minimalist side search (/sides)", () => {
  test("searches sides and routes straight to a guided cook", async ({
    page,
  }) => {
    await bypassOnboarding(page);
    await page.goto("/sides");

    const input = page.getByLabel("Search sides");
    await expect(input).toBeVisible();
    await input.fill("naan");

    const row = page.getByRole("button", { name: /Naan/i }).first();
    await expect(row).toBeVisible();
    await row.click();
    await expect(page).toHaveURL(/\/cook\/naan-bread/);
  });
});

test.describe("Cook the main with no sides", () => {
  test("'Skip sides' routes to the main's own guided cook", async ({
    page,
  }) => {
    await bypassOnboarding(page);
    await page.goto(
      "/sides?main=" +
        encodeURIComponent("Honey Glazed Salmon with Mango Salsa"),
    );

    const skip = page.getByRole("button", { name: /Skip sides/i });
    await expect(skip).toBeVisible({ timeout: 20000 });
    await skip.click();
    await expect(page).toHaveURL(/\/cook\/honey-glazed-salmon-mango-salsa/);
  });
});
