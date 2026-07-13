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

function seedPathUtilityState() {
  localStorage.setItem("sous-coach-quiz-done", "true");
  localStorage.setItem("sous-path-tutorial-v1", "done");
  localStorage.setItem(
    "sous-household-members-v1",
    JSON.stringify([
      {
        schemaVersion: 1,
        id: "mem-alex",
        name: "Alex",
        ageBand: "adult",
        spiceTolerance: 3,
        dietaryFlags: ["vegetarian"],
        cuisinePreferences: ["italian"],
        avatar: "",
        createdAt: "2026-07-13T00:00:00.000Z",
      },
      {
        schemaVersion: 1,
        id: "mem-sam",
        name: "Sam",
        ageBand: "teen",
        spiceTolerance: 2,
        dietaryFlags: ["dairy-free"],
        cuisinePreferences: ["thai"],
        avatar: "",
        createdAt: "2026-07-13T00:00:00.000Z",
      },
    ]),
  );
  localStorage.setItem(
    "sous-eco-mode-v1",
    JSON.stringify({
      v: 1,
      profile: {
        enabled: false,
        comparisonBaseline: "delivery",
        enabledAt: "",
      },
    }),
  );
  localStorage.setItem(
    "sous-cook-sessions",
    JSON.stringify([
      {
        sessionId: "e2e-cook-2026-a",
        recipeSlug: "garlic-bread",
        dishName: "Garlic Bread",
        cuisineFamily: "Italian",
        startedAt: "2026-02-01T18:00:00.000Z",
        completedAt: "2026-02-01T18:20:00.000Z",
        rating: 5,
        favorite: true,
      },
      {
        sessionId: "e2e-cook-2026-b",
        recipeSlug: "masoor-dal",
        dishName: "Masoor Dal",
        cuisineFamily: "Indian",
        startedAt: "2026-03-01T18:00:00.000Z",
        completedAt: "2026-03-01T18:20:00.000Z",
        rating: 4,
        favorite: false,
      },
      {
        sessionId: "e2e-cook-2025",
        recipeSlug: "garlic-bread",
        dishName: "Garlic Bread",
        cuisineFamily: "Italian",
        startedAt: "2025-12-01T18:00:00.000Z",
        completedAt: "2025-12-01T18:20:00.000Z",
        rating: 5,
        favorite: false,
      },
    ]),
  );
}

test.describe("Path secondary utility controls", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedPathUtilityState);
  });

  test("household roster and form controls stay finger-sized", async ({
    page,
  }) => {
    await page.goto("/path/household", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Household" })).toBeVisible({
      timeout: 10000,
    });

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("button", { name: /^Add$/ }),
      page.getByRole("button", { name: "Edit Alex" }),
      page.getByRole("button", { name: "Remove Alex" }),
    ]) {
      await expectTouchTarget(control);
    }

    await page.getByRole("button", { name: "Edit Alex" }).click();

    for (const control of [
      page.getByLabel("Name"),
      page.getByLabel(/Avatar/i),
      page.getByRole("button", { name: "Age band" }),
      page.getByLabel(/Spice tolerance/i),
      page.getByRole("button", { name: "vegetarian" }),
      page.getByRole("button", { name: "italian" }),
      page.getByRole("button", { name: "Save changes" }),
      page.getByRole("button", { name: "Cancel" }),
    ]) {
      await expectTouchTarget(control);
    }
  });

  test("eco and recap controls stay finger-sized", async ({ page }) => {
    await page.goto("/path/eco", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Your at-home carbon win" }),
    ).toBeVisible({ timeout: 10000 });

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("button", { name: "Turn Eco Mode on" }),
      page.getByRole("button", { name: "Delivery" }),
      page.getByRole("button", { name: "Takeout" }),
      page.getByRole("button", { name: "Dine-out" }),
      page.getByRole("button", { name: "Beef-anchored meal" }),
    ]) {
      await expectTouchTarget(control);
    }

    await page.goto("/path/recap", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Your year of cooking" }),
    ).toBeVisible({ timeout: 10000 });

    for (const control of [
      page.getByRole("button", { name: "Back to Path" }),
      page.getByRole("radio", { name: "2026" }),
      page.getByRole("radio", { name: "2025" }),
      page.getByRole("button", { name: /Cook this year's signature again/i }),
    ]) {
      await expectTouchTarget(control);
    }
  });

  test("pantry scan controls stay finger-sized through confirmation", async ({
    page,
  }) => {
    await page.goto("/path/pantry/scan", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Scan to add" }),
    ).toBeVisible({ timeout: 10000 });

    await expectTouchTarget(page.getByRole("link", { name: "Back to pantry" }));
    await expectTouchTarget(page.getByRole("button", { name: /Camera/i }));
    await expectTouchTarget(
      page.getByRole("button", { name: "Run a demo scan" }),
    );

    await page.getByRole("button", { name: "Run a demo scan" }).click();
    await expect(page.getByText(/Found \d+ items?/)).toBeVisible({
      timeout: 5000,
    });

    await expectTouchTarget(page.getByRole("button", { name: /^Remove/i }));
    await expectTouchTarget(
      page.getByRole("button", { name: "Accept all + add to pantry" }),
    );

    await page
      .getByRole("button", { name: "Accept all + add to pantry" })
      .click();
    await expect(
      page.getByText(/Added \d+ new items?|Already in your pantry/),
    ).toBeVisible({
      timeout: 5000,
    });

    await expectTouchTarget(page.getByRole("link", { name: "Back to pantry" }));
    await expectTouchTarget(page.getByRole("button", { name: "Scan again" }));
  });
});
