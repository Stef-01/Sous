import { test, expect, type Locator, type Page } from "@playwright/test";

async function openCravingSearch(page: Page, query: string) {
  await page
    .getByText(/what are you craving/i)
    .first()
    .click();
  const input = page.getByPlaceholder(/Roast chicken|pasta|curry/i).first();
  await expect(input).toBeVisible({ timeout: 5000 });
  await input.fill(query);
  await input.press("Enter");
}

async function expectTouchTarget(locator: Locator) {
  await expect
    .poll(
      async () => {
        try {
          await locator.scrollIntoViewIfNeeded({ timeout: 1000 });
          const box = await locator.boundingBox();
          if (!box) return "missing";
          const height = Math.ceil(box.height);
          const width = Math.ceil(box.width);
          return height >= 44 && width >= 44 ? "ready" : `${width}x${height}`;
        } catch {
          return "detached";
        }
      },
      { timeout: 10000 },
    )
    .toBe("ready");
}

test.describe("Today progressive onboarding", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.removeItem("sous-coach-quiz-done");
      localStorage.removeItem("sous-firstrun-seen");
      localStorage.setItem("sous-path-tutorial-v1", "done");
    });
  });

  test("fresh visit lands on the meal surface without an onboarding interstitial", async ({
    page,
  }) => {
    await page.goto("/today");

    await expect(page.locator("h1")).toContainText("Sous");
    await expect(page.getByText("Meal queue")).toBeVisible({
      timeout: 30000,
    });
    await expect(
      page.getByRole("button", { name: /search what you.re craving/i }),
    ).toBeVisible();

    const tune = page.getByRole("button", { name: "Tune taste" });
    await expect(tune).toBeVisible();
    const tuneBox = await tune.boundingBox();
    expect(Math.ceil(tuneBox?.height ?? 0)).toBeGreaterThanOrEqual(44);

    const dismiss = page.getByRole("button", { name: "Dismiss tip" });
    const dismissBox = await dismiss.boundingBox();
    expect(Math.ceil(dismissBox?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(dismissBox?.width ?? 0)).toBeGreaterThanOrEqual(44);

    await page.waitForTimeout(1200);
    await expect(
      page.getByRole("heading", { name: "What are you cooking for?" }),
    ).toBeHidden();
  });

  test("optional tune taste opens onboarding and can be skipped", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: "Tune taste" }).click();

    await expect(
      page.getByRole("heading", { name: "What are you cooking for?" }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: "Back" }).click();
    await expect(
      page.getByRole("heading", { name: "What are you cooking for?" }),
    ).toBeHidden({ timeout: 5000 });
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem("sous-coach-quiz-done")),
      )
      .toBe("true");
  });
});

test.describe("Core Loop - Today meal queue to cook", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("sous-coach-quiz-done", "true");
      localStorage.setItem("sous-path-tutorial-v1", "done");
      localStorage.setItem(
        "sous-preferences",
        JSON.stringify({ spicy: 0.5, fresh: 0.3 }),
      );
      localStorage.setItem("sous-effort-tolerance", "moderate");
      localStorage.setItem(
        "sous-pulse-ledger-v1",
        JSON.stringify({
          shown: [{ pulseId: "e2e-quiet", at: new Date().toISOString() }],
          answered: [],
          dismissed: [],
          onboardingDoneAt: new Date().toISOString(),
        }),
      );
    });
  });

  test("Today page loads with meal queue, craving search, and content doorway", async ({
    page,
  }) => {
    await page.goto("/today");
    await expect(page.locator("h1")).toContainText("Sous");
    await expect(page.getByText("Meal queue")).toBeVisible();
    await expect(page.getByText(/what are you craving/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Read:/i })).toBeVisible();
  });

  test("Today craving search trigger keeps a single 44px affordance", async ({
    page,
  }) => {
    await page.goto("/today");

    const searchTrigger = page.getByRole("button", {
      name: /search what you.re craving/i,
    });
    await expect(searchTrigger).toBeVisible();

    const triggerBox = await searchTrigger.boundingBox();
    expect(triggerBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(triggerBox?.width ?? 0).toBeGreaterThanOrEqual(44);

    const arrowAffordance = searchTrigger.locator("span[aria-hidden='true']");
    const arrowBox = await arrowAffordance.boundingBox();
    expect(arrowBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(arrowBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("Today header and streak actions stay flat and finger-sized", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "sous-cook-stats",
        JSON.stringify({
          currentStreak: 4,
          completedCooks: 7,
          longestStreak: 6,
        }),
      );
    });
    await page.goto("/today");

    const header = page.locator("header").first();
    await expect(header).toHaveCSS("box-shadow", "none");
    await expectTouchTarget(
      page.getByRole("button", { name: "Open profile and settings" }),
    );

    const streak = page.getByRole("button", {
      name: /Streak: 4 days\. Streak options/i,
    });
    await expectTouchTarget(streak);
    await streak.click();

    const takeRestDay = page.getByRole("menuitem", {
      name: /Take a rest day/i,
    });
    await expectTouchTarget(takeRestDay);
    await takeRestDay.click();
    await expectTouchTarget(page.getByRole("button", { name: "Rest today" }));
    await expectTouchTarget(page.getByRole("button", { name: "Nevermind" }));
  });

  test("Craving helper icon actions keep 44px tap targets", async ({
    page,
  }) => {
    await page.goto("/today");
    await page
      .getByRole("button", { name: /search what you.re craving/i })
      .click();

    const helper = page.locator('[aria-label="Search for a dish"]').first();
    await expect(helper).toBeVisible({ timeout: 5000 });

    const actions = [
      helper.getByRole("button", { name: /take a photo/i }),
      helper.getByRole("button", { name: /^search$/i }),
      helper.getByRole("button", { name: /close search/i }),
    ];

    for (const action of actions) {
      const box = await action.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("Craving helper suggestions and result rows keep 44px tap targets", async ({
    page,
  }) => {
    await page.goto("/today");
    await page
      .getByRole("button", { name: /search what you.re craving/i })
      .click();

    const helper = page.locator('[aria-label="Search for a dish"]').first();
    await expect(helper).toBeVisible({ timeout: 5000 });

    for (const name of [
      /Chicken pasta/i,
      /^Tacos$/i,
      /Quick rice bowl/i,
      /Something cozy/i,
    ]) {
      const chip = helper.getByRole("button", { name });
      await expect(chip).toBeVisible({ timeout: 5000 });
      const box = await chip.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }

    await helper.getByPlaceholder(/Roast chicken|pasta|curry/i).fill("pasta");
    const resultRow = helper.getByRole("button", { name: /pasta/i }).first();
    await expect(resultRow).toBeVisible({ timeout: 5000 });
    const resultBox = await resultRow.boundingBox();
    expect(resultBox?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(resultBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("Search flow: type craving -> recommended sides", async ({ page }) => {
    await page.goto("/today");
    await openCravingSearch(page, "butter chicken");

    await expect(page.getByText("Recommended sides")).toBeVisible({
      timeout: 15000,
    });
    await expect(
      page.getByRole("button", { name: /Cook plate with 3 sides/i }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("Full core loop smoke: craving -> sides -> cook -> first step", async ({
    page,
  }) => {
    test.slow();

    await page.goto("/today");
    await openCravingSearch(page, "butter chicken");
    await page
      .getByRole("button", { name: /Cook plate with 3 sides/i })
      .click();

    await expect(page).toHaveURL(/\/cook\/combined/, { timeout: 10000 });
    await page.getByRole("button", { name: /Let.s gather/i }).click();

    await expect(page.getByText("Gather these")).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(/cook watch-outs/i)).toBeVisible();

    await page.getByRole("button", { name: /I have everything/i }).click();
    await expect(page.getByRole("img", { name: /Step 1 of \d+/ })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.locator('[data-visual-mode="true"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Go to step 2|Next/i }),
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 2 of \d+/ })).toBeVisible({
      timeout: 5000,
    });

    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("img", { name: /Step 1 of \d+/ })).toBeVisible({
      timeout: 5000,
    });
  });

  test("Grab step controls keep 44px touch geometry", async ({ page }) => {
    await page.goto(
      "/cook/combined?main=butter-chicken&sides=tabbouleh,pico-de-gallo",
    );
    await page.getByRole("button", { name: /Let.s gather/i }).click();

    await expect(page.getByText("Gather these")).toBeVisible({
      timeout: 10000,
    });

    const controls = [
      page.getByRole("button", { name: "Fewer servings" }).first(),
      page.getByRole("button", { name: "More servings" }).first(),
      page.getByRole("tab", { name: "By dish" }).first(),
      page.getByRole("tab", { name: "By station" }).first(),
      page.getByRole("button", { name: /Add .* to pantry/i }).first(),
      page.getByRole("button", { name: /Find substitute for/i }).first(),
      page.getByRole("button", { name: /I have everything/i }).first(),
      page
        .getByRole("button", { name: /Add \d+ items? to shopping list/i })
        .first(),
    ];

    for (const control of controls) {
      await expect(control).toBeVisible({ timeout: 10000 });
      const box = await control.boundingBox();
      expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
    }
  });

  test("Mission planner and Cook step helpers keep 44px touch geometry", async ({
    page,
  }) => {
    await page.goto("/cook/garlic-bread");

    const planningChip = page.getByRole("button", {
      name: /When do you want to eat/i,
    });
    await expect(planningChip).toBeVisible({ timeout: 10000 });
    let box = await planningChip.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);

    const biggerControls = page.getByRole("button", {
      name: /Bigger controls/i,
    });
    await expect(biggerControls).toBeVisible();
    box = await biggerControls.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);

    const voiceToggle = page.getByRole("button", {
      name: /Turn on voice control|Turn off voice control/i,
    });
    await expect(voiceToggle).toBeVisible();
    box = await voiceToggle.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);

    await planningChip.click();
    const cancelPlan = page.getByRole("button", { name: "Cancel" });
    await expect(cancelPlan).toBeVisible();
    box = await cancelPlan.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);

    await page.getByLabel("Eat by").fill("23:59");
    const changePlan = page.getByRole("button", {
      name: /Clear planned eat time/i,
    });
    await expect(changePlan).toBeVisible();
    box = await changePlan.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);

    await page.getByRole("button", { name: /Let.s gather/i }).click();
    await page.getByRole("button", { name: /I have everything/i }).click();
    await expect(page.getByRole("img", { name: /Step 1 of 3/i })).toBeVisible({
      timeout: 10000,
    });

    const helperControls = [
      page.getByRole("button", { name: "Common mistake" }),
      page.getByRole("button", { name: "Quick hack" }),
      page.getByRole("button", { name: "Cuisine fact" }),
      page.getByRole("button", { name: "Ask about this step" }),
    ];

    for (const control of helperControls) {
      await expect(control).toBeVisible();
      box = await control.boundingBox();
      expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole("button", { name: "Common mistake" }).click();
    const dismissMistake = page.getByRole("button", {
      name: /don't remind me on this dish/i,
    });
    await expect(dismissMistake).toBeVisible();
    box = await dismissMistake.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);

    const speechSupported = await page.evaluate(() => !!window.speechSynthesis);
    if (speechSupported) {
      const readAloud = page.getByRole("button", {
        name: /Read step aloud|Stop reading aloud/i,
      });
      await expect(readAloud).toBeVisible();
      box = await readAloud.boundingBox();
      expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
    }
  });

  test("Cook timer controls keep 44px touch geometry", async ({ page }) => {
    await page.goto("/cook/garlic-bread");
    await page.getByRole("button", { name: /Let.s gather/i }).click();
    await page.getByRole("button", { name: /I have everything/i }).click();

    await expect(page.getByRole("img", { name: /Step 1 of 3/i })).toBeVisible({
      timeout: 10000,
    });
    await page.getByRole("button", { name: /Go to step 2/i }).click();
    await expect(page.getByRole("img", { name: /Step 2 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole("button", { name: /Go to step 3/i }).click();
    await expect(page.getByRole("img", { name: /Step 3 of 3/i })).toBeVisible({
      timeout: 5000,
    });

    const setTimer = page.getByRole("button", { name: /Set 8 min timer/i });
    await expect(setTimer).toBeVisible();
    let box = await setTimer.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);

    await setTimer.click();
    const startTimer = page.getByRole("button", {
      name: /Start 8 min countdown timer/i,
    });
    await expect(startTimer).toBeVisible();
    box = await startTimer.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);

    await startTimer.click();
    const timerStop = page
      .getByRole("button", { name: /Stop Garlic Bread/i })
      .first();
    await expect(timerStop).toBeVisible();
    await expect
      .poll(async () => {
        const box = await timerStop.boundingBox();
        return Math.ceil(box?.height ?? 0);
      })
      .toBeGreaterThanOrEqual(44);
    await expect
      .poll(async () => {
        const box = await timerStop.boundingBox();
        return Math.ceil(box?.width ?? 0);
      })
      .toBeGreaterThanOrEqual(44);
  });

  test("Parent-mode spice dots keep 44px touch geometry", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "sous-parent-mode-v1",
        JSON.stringify({
          v: 1,
          profile: {
            enabled: true,
            ageBand: "4-8",
            spiceTolerance: 3,
            enabledAt: "2026-07-11T00:00:00.000Z",
          },
        }),
      );
    });

    await page.goto("/cook/butter-chicken");
    await page.getByRole("button", { name: /Let.s gather/i }).click();
    await page.getByRole("button", { name: /I have everything/i }).click();

    await expect(
      page.getByRole("radio", { name: "Spice level 1 of 5" }),
    ).toBeVisible({ timeout: 10000 });

    for (const level of [1, 2, 3, 4, 5]) {
      const dot = page.getByRole("radio", {
        name: `Spice level ${level} of 5`,
      });
      await expect(dot).toBeVisible();
      const box = await dot.boundingBox();
      expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
    }
  });

  test("Cook step keyboard can advance through final step to win", async ({
    page,
  }) => {
    await page.goto("/cook/garlic-bread");
    await page.getByRole("button", { name: /Let.s gather/i }).click();
    await page.getByRole("button", { name: /I have everything/i }).click();

    await expect(page.getByRole("img", { name: /Step 1 of 3/i })).toBeVisible({
      timeout: 10000,
    });
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 2 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(450);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 3 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(450);
    await page.keyboard.press("ArrowRight");

    await expect(
      page.getByRole("group", { name: /Rate this cook/i }),
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Logged to your diary/i)).toBeVisible();

    const backToday = page.getByRole("button", { name: /Back to Today/i });
    await expect(backToday).toBeVisible();
    const backBox = await backToday.boundingBox();
    expect(Math.ceil(backBox?.height ?? 0)).toBeGreaterThanOrEqual(44);

    const moreActions = page.getByRole("button", { name: /More actions/i });
    await expect(moreActions).toBeVisible();
    const moreBox = await moreActions.boundingBox();
    expect(Math.ceil(moreBox?.height ?? 0)).toBeGreaterThanOrEqual(44);

    const saveCook = page.getByRole("button", {
      name: /Save this cook to your scrapbook/i,
    });
    await expect(saveCook).toBeHidden();
    await moreActions.click();
    await expect(saveCook).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Add a photo of your dish/i }),
    ).toBeVisible();
    const noteToggle = page.getByRole("button", { name: /Add a cook note/i });
    await expect(noteToggle).toBeVisible();
    const noteToggleBox = await noteToggle.boundingBox();
    expect(Math.ceil(noteToggleBox?.height ?? 0)).toBeGreaterThanOrEqual(44);

    await noteToggle.click();
    await page
      .getByPlaceholder(/How did it taste/i)
      .fill("A keeper for weeknights.");
    const saveNote = page.getByRole("button", { name: "Save note" });
    await expect(saveNote).toBeVisible();
    const saveNoteBox = await saveNote.boundingBox();
    expect(Math.ceil(saveNoteBox?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(saveNoteBox?.width ?? 0)).toBeGreaterThanOrEqual(44);
  });

  test("Parent-mode win controls keep 44px touch geometry", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        "sous-parent-mode-v1",
        JSON.stringify({
          v: 1,
          profile: {
            enabled: true,
            ageBand: "4-8",
            spiceTolerance: 3,
            enabledAt: "2026-07-11T00:00:00.000Z",
          },
        }),
      );
    });

    await page.goto("/cook/garlic-bread");
    await page.getByRole("button", { name: /Let.s gather/i }).click();
    await page.getByRole("button", { name: /I have everything/i }).click();

    await expect(page.getByRole("img", { name: /Step 1 of 3/i })).toBeVisible({
      timeout: 10000,
    });
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 2 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(450);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 3 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(450);
    await page.keyboard.press("ArrowRight");

    await expect(
      page.getByRole("group", { name: /Rate this cook/i }),
    ).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: /More actions/i }).click();

    for (const choice of ["Yes", "Some", "No"]) {
      const kidsChoice = page
        .getByRole("radiogroup", { name: "Did the kids eat it?" })
        .getByRole("radio", { name: choice });
      await expect(kidsChoice).toBeVisible();
      const box = await kidsChoice.boundingBox();
      expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
    }

    const lunchbox = page.getByRole("button", {
      name: /Lunchbox tip for/i,
    });
    await expect(lunchbox).toBeVisible();
    let box = await lunchbox.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);

    await lunchbox.click();
    const sheet = page.getByRole("dialog", { name: /Lunchbox tip for/i });
    await expect(sheet).toBeVisible({ timeout: 5000 });
    const close = sheet.getByRole("button", { name: "Close" });
    await expect(close).toBeVisible();
    box = await close.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
  });

  test("Win reaction and invite controls keep 44px touch geometry", async ({
    page,
  }) => {
    await page.goto("/cook/garlic-bread");
    await page.getByRole("button", { name: /Let.s gather/i }).click();
    await page.getByRole("button", { name: /I have everything/i }).click();

    await expect(page.getByRole("img", { name: /Step 1 of 3/i })).toBeVisible({
      timeout: 10000,
    });
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 2 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(450);
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("img", { name: /Step 3 of 3/i })).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(450);
    await page.keyboard.press("ArrowRight");

    await expect(
      page.getByRole("group", { name: /Rate this cook/i }),
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole("radio", { name: "1 star" }).click();
    for (const name of [/too salty/i, /too dry/i, /instructions unclear/i]) {
      const chip = page.getByRole("button", { name });
      await expect(chip).toBeVisible();
      const box = await chip.boundingBox();
      expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
      expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
    }

    await page.getByRole("radio", { name: "5 stars" }).click();
    await expect(
      page.getByText(/Cook this with someone next week/i),
    ).toBeVisible({ timeout: 5000 });

    const friendName = page.getByLabel(
      "Friend's first name for the invite message",
    );
    await expect(friendName).toBeVisible();
    let box = await friendName.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);

    const sendInvite = page.getByRole("button", { name: "Send invite" });
    await expect(sendInvite).toBeVisible();
    box = await sendInvite.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);

    const dismissInvite = page.getByRole("button", { name: "Not this time" });
    await expect(dismissInvite).toBeVisible();
    box = await dismissInvite.boundingBox();
    expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
    expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
  });

  test("Meal queue opens and keyboard save state is visible", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /Browse meals/i }).click();

    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByRole("button", { name: /^Save\b|Save .+/i }).first(),
    ).toBeVisible();
    await page.keyboard.press("s");
    await expect(
      page
        .getByRole("button", { name: /Already saved|^Saved\b|Saved .+/i })
        .first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Meal queue stays photo-led with minimal visible actions", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /Browse meals/i }).click();

    const queueDialog = page.getByRole("dialog", {
      name: /Meal swipe queue/i,
    });
    await expect(queueDialog).toBeVisible({ timeout: 5000 });

    const activeCard = page.getByTestId("meal-swipe-card").first();
    await expect(activeCard).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(450);

    const viewport = page.viewportSize();
    const cardBox = await activeCard.boundingBox();
    expect(cardBox?.height ?? 0).toBeGreaterThanOrEqual(
      (viewport?.height ?? 0) * 0.68,
    );
    if ((viewport?.width ?? 0) <= 500) {
      expect(cardBox?.width ?? 0).toBeGreaterThanOrEqual(
        (viewport?.width ?? 0) * 0.94,
      );
    } else {
      expect(cardBox?.width ?? 0).toBeGreaterThanOrEqual(360);
      expect(cardBox?.width ?? 0).toBeLessThanOrEqual(450);
    }
    await expect(page.getByText(/^Info$/)).toHaveCount(0);
    await expect(activeCard).toHaveCSS("box-shadow", "none");

    const actionBar = page.getByTestId("meal-queue-action-bar");
    await expect(actionBar.getByRole("button")).toHaveCount(3);
    for (const action of await actionBar.getByRole("button").all()) {
      const box = await action.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
    }
  });

  test("Meal queue info sheet traps focus and closes before queue", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /Browse meals/i }).click();

    const queueDialog = page.getByRole("dialog", {
      name: /Meal swipe queue/i,
    });
    await expect(queueDialog).toBeVisible({ timeout: 5000 });

    await page.getByRole("button", { name: /Show info for/i }).click();
    const infoDialog = page.getByRole("dialog", { name: /Info for/i });
    await expect(infoDialog).toBeVisible({ timeout: 5000 });
    await expect(infoDialog).toBeFocused({ timeout: 5000 });
    await expect(infoDialog).toHaveCSS("box-shadow", "none");

    await page.keyboard.press("Tab");
    const closeInfo = page.getByRole("button", { name: /Close info/i });
    await expect(closeInfo).toBeFocused({ timeout: 5000 });
    await expectTouchTarget(closeInfo);

    const logMeal = infoDialog.getByRole("button", {
      name: /Log .* to today's diary/i,
    });
    const saveNutrition = infoDialog.getByRole("button", {
      name: /Save nutrition card/i,
    });
    await logMeal.scrollIntoViewIfNeeded();
    await expectTouchTarget(logMeal);
    await expectTouchTarget(saveNutrition);

    await page.keyboard.press("Shift+Tab");
    await expect(
      page.getByRole("button", { name: /Close meal queue/i }),
    ).not.toBeFocused();
    await expect
      .poll(() =>
        infoDialog.evaluate((dialog) =>
          dialog.contains(document.activeElement),
        ),
      )
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(infoDialog).toBeHidden({ timeout: 5000 });
    await expect(queueDialog).toBeVisible();
  });

  test("Profile settings sheet keeps core controls finger-sized", async ({
    page,
  }) => {
    await page.goto("/today");
    await page
      .getByRole("button", { name: "Open profile and settings" })
      .click();

    const profile = page.getByRole("dialog", { name: /Profile/i });
    await expect(profile).toBeVisible({ timeout: 10000 });

    await expectTouchTarget(profile.getByRole("button", { name: "Close" }));
    await expectTouchTarget(
      profile.getByRole("textbox", { name: "Display name" }),
    );
    await expectTouchTarget(profile.getByRole("textbox", { name: "Email" }));

    const switches = await profile.getByRole("switch").all();
    expect(switches.length).toBeGreaterThanOrEqual(4);
    for (const control of switches) {
      await expectTouchTarget(control);
    }

    await expectTouchTarget(
      profile.getByRole("button", { name: /Health focus/i }),
    );

    const tune = profile.getByRole("button", { name: /Tune my picks/i });
    await tune.scrollIntoViewIfNeeded();
    await expectTouchTarget(tune);

    const resetDemo = profile.getByRole("button", { name: /Reset demo data/i });
    await resetDemo.scrollIntoViewIfNeeded();
    await expectTouchTarget(resetDemo);
  });

  test("Fallback actions open the craving helper", async ({ page }) => {
    await page.goto("/today");
    await page.getByRole("button", { name: /More options/i }).click();

    const rescueBtn = page.getByText("Rescue my fridge");
    await expect(rescueBtn).toBeVisible();
    await rescueBtn.click();

    await expect(
      page.getByPlaceholder(/Roast chicken|pasta|curry/i).first(),
    ).toBeVisible({ timeout: 5000 });
  });

  test("Path tab is accessible from Today", async ({ page }) => {
    await page.goto("/today");
    const pathTab = page.getByRole("link", { name: /path/i });
    await expect(pathTab).toBeVisible({ timeout: 5000 });
    await pathTab.click();

    await expect(page).toHaveURL(/\/path/);
    await expect(page.getByText(/Your Path|Your journey/).first()).toBeVisible({
      timeout: 5000,
    });
  });
});
