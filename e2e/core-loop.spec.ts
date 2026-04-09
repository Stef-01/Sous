import { test, expect } from "@playwright/test";

/**
 * E2E Smoke Test — Core Loop
 *
 * Covers the primary demo flow:
 * 1. Land on Today page
 * 2. Open search, type a craving
 * 3. See pairing results
 * 4. Tap "Cook this" on a side
 * 5. Complete guided cook flow (Mission → Grab → Cook → Win)
 * 6. See Win screen with celebration
 */
test.describe("Core Loop — Craving to Win", () => {
  test("type craving → see results → cook → win", async ({ page }) => {
    // 1. Navigate to Today page
    await page.goto("/");
    await expect(page.locator("h1").filter({ hasText: "Sous" })).toBeVisible();

    // 2. Open search popout by clicking the craving search bar
    await page.getByText("I'm craving").click();
    await expect(page.getByText("What are you craving?")).toBeVisible();

    // 3. Type a craving and submit
    const searchInput = page.getByPlaceholder(/chicken|craving|dish/i);
    await searchInput.fill("butter chicken");
    await searchInput.press("Enter");

    // 4. Wait for results (loading skeletons → result cards)
    await expect(page.getByText("Finding your sides")).toBeVisible({
      timeout: 5000,
    });

    // Wait for results to appear (side dish cards)
    await expect(page.getByText("For:")).toBeVisible({ timeout: 15000 });

    // 5. Click "Cook" on the first result — expand it first, then use the guided cook link
    const cookButton = page
      .getByRole("button")
      .filter({ hasText: /Start guided cook|Cook just this|Cook.*selected/i })
      .first();

    // If no guided cook button visible, try the main "Cook selected" CTA
    const mainCTA = page
      .getByRole("button")
      .filter({ hasText: /Cook.*selected|Cook.*side/i })
      .first();

    if (await cookButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cookButton.click();
    } else {
      await mainCTA.click();
    }

    // 6. Should be on guided cook page — see Mission screen
    await expect(
      page.getByText(/What you.*learn|Your mission|Start/i),
    ).toBeVisible({ timeout: 10000 });

    // 7. Start cooking (tap "Let's go" or similar CTA)
    const startButton = page
      .getByRole("button")
      .filter({ hasText: /Let.*go|Start|I.*ready|Begin/i })
      .first();
    await startButton.click();

    // 8. Should see either Grab phase (ingredients) or Cook phase (steps)
    // If grab phase: check all ingredients and proceed
    const grabReady = page
      .getByRole("button")
      .filter({ hasText: /I.*ready|Got.*all|Let.*cook/i });

    if (await grabReady.isVisible({ timeout: 3000 }).catch(() => false)) {
      await grabReady.click();
    }

    // 9. Now in Cook phase — navigate through steps
    // Click "Next" through all cook steps until Win screen
    let maxSteps = 10; // safety limit
    while (maxSteps > 0) {
      const nextButton = page
        .getByRole("button")
        .filter({ hasText: /Next|Done|Finish/i })
        .first();

      if (await nextButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await nextButton.click();
        maxSteps--;
      } else {
        // No more next buttons — should be at Win screen
        break;
      }
    }

    // 10. Win screen — should see celebration
    await expect(
      page.getByText(/You did it|Great job|Well done|Nicely done/i),
    ).toBeVisible({ timeout: 10000 });

    // Should see star rating
    await expect(page.getByRole("radiogroup")).toBeVisible();

    // Should see "Back to Today" button
    await expect(
      page.getByRole("button").filter({ hasText: /Back to Today/i }),
    ).toBeVisible();
  });
});
