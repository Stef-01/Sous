import { test, expect } from "@playwright/test";

/**
 * E2E Smoke Test — Core Loop
 *
 * Covers the primary demo flow:
 * 1. Land on Today page
 * 2. Open search, type a craving
 * 3. See pairing results
 * 4. Tap "Cook" on a side
 * 5. Complete guided cook flow (Mission → Grab → Cook → Win)
 * 6. See Win screen with celebration
 */
test.describe("Core Loop — Craving to Win", () => {
  test("type craving → see results → cook → win", async ({ page }) => {
    // 1. Navigate to Today page — pre-set localStorage to bypass coach quiz
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
    });
    await page.reload();

    await expect(
      page.getByRole("heading", { name: "Sous", exact: true }),
    ).toBeVisible();

    // 2. Open search popout by clicking the craving search bar
    await page
      .getByRole("button", { name: /craving|dinner|Find sides/i })
      .first()
      .click();
    await expect(
      page.getByRole("heading", { name: "What are you craving?" }),
    ).toBeVisible();

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

    // 5. Click the "Cook" CTA (may navigate to /cook/combined or /cook/[slug])
    const cookCTA = page
      .getByRole("button")
      .filter({ hasText: /Cook.*selected|Cook\s/i })
      .first();

    await expect(cookCTA).toBeVisible({ timeout: 5000 });
    await cookCTA.click({ force: true });

    // 6. Should navigate to a /cook/ route
    await page.waitForURL(/\/cook\//, { timeout: 10000 });

    // Should see Mission screen CTA
    await expect(
      page
        .getByRole("button")
        .filter({ hasText: /gather|cook/i })
        .first(),
    ).toBeVisible({ timeout: 10000 });

    // 7. Start cooking (tap "Let's gather" / "Let's cook" CTA)
    await page
      .getByRole("button")
      .filter({ hasText: /gather|cook/i })
      .first()
      .click({ force: true });

    // 8. Should see either Grab phase (ingredients) or Cook phase (steps)
    const grabReady = page
      .getByRole("button")
      .filter({ hasText: /I have everything|Let.*cook/i });

    if (await grabReady.isVisible({ timeout: 3000 }).catch(() => false)) {
      await grabReady.click({ force: true });
    }

    // 9. Now in Cook phase — navigate through steps (handles multi-dish combined cook)
    let maxAttempts = 40;
    while (maxAttempts > 0) {
      maxAttempts--;
      await page.waitForTimeout(400);

      // Check for "Back to Today" (win screen) first
      const backToToday = page
        .getByRole("button")
        .filter({ hasText: /Back to Today/i });
      if (await backToToday.isVisible({ timeout: 500 }).catch(() => false)) {
        break;
      }

      // Handle transition cards between dishes ("Continue cooking")
      const continueBtn = page
        .getByRole("button")
        .filter({ hasText: /Continue cooking/i });
      if (await continueBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await continueBtn.click({ force: true });
        continue;
      }

      // "Done!" last step of a dish
      const doneButton = page
        .getByRole("button")
        .filter({ hasText: /Done!/i })
        .first();
      if (await doneButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await doneButton.click({ force: true });
        continue;
      }

      // "Next" step
      const nextButton = page
        .getByRole("button")
        .filter({ hasText: /^Next$/i })
        .first();
      if (await nextButton.isVisible({ timeout: 500 }).catch(() => false)) {
        await nextButton.click({ force: true });
        continue;
      }

      // "Let's gather" / "Let's cook" / "I have everything" — mission or grab phase
      const missionBtn = page
        .getByRole("button")
        .filter({ hasText: /gather|I have everything/i })
        .first();
      if (await missionBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await missionBtn.click({ force: true });
        continue;
      }
    }

    // 10. Win screen — verify we're past all cook steps
    await page.waitForTimeout(1000);

    // Debug: capture what's on screen
    await page.screenshot({ path: "test-results/debug-win.png" });

    await expect(
      page.getByRole("button").filter({ hasText: /Back to Today/i }),
    ).toBeVisible({ timeout: 15000 });

    // Should see star rating
    await expect(page.getByRole("radiogroup")).toBeVisible();

    // Should see "Back to Today" button
    await expect(
      page.getByRole("button").filter({ hasText: /Back to Today/i }),
    ).toBeVisible();
  });
});
