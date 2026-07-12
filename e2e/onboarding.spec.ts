import { expect, test, type Locator, type Page } from "@playwright/test";

async function resetOnboarding(page: Page): Promise<void> {
  await page.addInitScript(() => {
    for (const key of [
      "sous-coach-quiz-done",
      "sous-onboarding-v2",
      "sous-preferences",
      "sous-effort-tolerance",
      "sous-personal-profile-v1",
      "sous-pulse-ledger-v1",
      "sous-signal-flags-v1",
      "sous-parent-mode-v1",
      "sous-firstrun-seen",
    ]) {
      localStorage.removeItem(key);
    }
    localStorage.setItem("sous-path-tutorial-v1", "done");
  });
}

async function openOnboarding(page: Page): Promise<Locator> {
  await resetOnboarding(page);
  await page.goto("/today");
  await page.getByRole("button", { name: "Tune taste" }).click();
  const onboarding = page.getByRole("dialog", { name: "Taste onboarding" });
  await expect(onboarding).toBeVisible({ timeout: 10000 });
  await expect(onboarding).toBeFocused({ timeout: 10000 });
  await expect(
    onboarding.getByRole("heading", { name: "What are you cooking for?" }),
  ).toBeVisible();
  return onboarding;
}

async function expectTouchTarget(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible({ timeout: 10000 });
  const box = await locator.boundingBox();
  expect(Math.ceil(box?.height ?? 0)).toBeGreaterThanOrEqual(44);
  expect(Math.ceil(box?.width ?? 0)).toBeGreaterThanOrEqual(44);
}

async function answerBeliefCards(
  onboarding: Locator,
  verdict: "agree" | "disagree",
) {
  const label = verdict === "agree" ? /Agree:/i : /Disagree:/i;
  for (let i = 0; i < 3; i += 1) {
    const action = onboarding.getByRole("button", { name: label }).first();
    await expectTouchTarget(action);
    await action.click();
  }
  await expect(onboarding.getByText(/All set/i)).toBeVisible();
}

async function setActiveWheelValue(
  onboarding: Locator,
  value: number,
): Promise<void> {
  const slider = onboarding.getByRole("slider");
  await expect(slider).toBeVisible();
  const min = Number(await slider.getAttribute("aria-valuemin"));
  await slider.evaluate(
    (node, next) => {
      const rowHeight = 44;
      node.scrollTop = (next.value - next.min) * rowHeight;
      node.dispatchEvent(new Event("scroll", { bubbles: true }));
    },
    { value, min },
  );
  await expect(slider).toHaveAttribute("aria-valuenow", String(value), {
    timeout: 10000,
  });
}

test.describe("Onboarding journey", () => {
  test("dismissed onboarding marks the intro seen without persisting answers", async ({
    page,
  }) => {
    await openOnboarding(page);

    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("dialog", { name: "Taste onboarding" }),
    ).toBeHidden({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Sous");

    const stored = await page.evaluate(() => ({
      done: localStorage.getItem("sous-coach-quiz-done"),
      profile: localStorage.getItem("sous-onboarding-v2"),
      preferences: localStorage.getItem("sous-preferences"),
      effort: localStorage.getItem("sous-effort-tolerance"),
      personalProfile: localStorage.getItem("sous-personal-profile-v1"),
      pulseLedger: localStorage.getItem("sous-pulse-ledger-v1"),
      parentMode: localStorage.getItem("sous-parent-mode-v1"),
    }));

    expect(stored.done).toBe("true");
    expect(stored.profile).toBeNull();
    expect(stored.preferences).toBeNull();
    expect(stored.effort).toBeNull();
    expect(stored.personalProfile).toBeNull();
    expect(stored.pulseLedger).toBeNull();
    expect(stored.parentMode).toBeNull();
  });

  test("happy path warms preferences and keeps survey controls finger-sized", async ({
    page,
  }) => {
    const onboarding = await openOnboarding(page);

    await expectTouchTarget(onboarding.getByRole("button", { name: "Back" }));
    await expectTouchTarget(
      onboarding.getByRole("button", { name: "Continue" }),
    );
    await onboarding
      .getByRole("radio", { name: /Keep it super simple/i })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding
      .getByRole("checkbox", { name: "Never enough time" })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await answerBeliefCards(onboarding, "agree");
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding.getByRole("checkbox", { name: "Everything" }).click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    const likeItalian = onboarding.getByRole("button", {
      name: "Like Italian",
      exact: true,
    });
    const dislikeKorean = onboarding.getByRole("button", {
      name: "Dislike Korean",
      exact: true,
    });
    await expectTouchTarget(likeItalian);
    await expectTouchTarget(dislikeKorean);
    await likeItalian.click();
    await dislikeKorean.click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding
      .getByRole("radio", { name: /I can follow a recipe/i })
      .click();
    await expectTouchTarget(onboarding.getByRole("button", { name: "Finish" }));
    await onboarding.getByRole("button", { name: "Finish" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Here's your plan" }),
    ).toBeVisible({ timeout: 10000 });
    const pickRecipes = onboarding.getByRole("button", {
      name: "Pick my first recipes",
    });
    await expectTouchTarget(pickRecipes);
    await pickRecipes.click();

    await expect(
      page.getByRole("dialog", { name: "Taste onboarding" }),
    ).toBeHidden({ timeout: 10000 });
    await expect(page.locator("h1")).toContainText("Sous");

    const stored = await page.evaluate(() => ({
      done: localStorage.getItem("sous-coach-quiz-done"),
      profile: JSON.parse(localStorage.getItem("sous-onboarding-v2") ?? "null"),
      preferences: JSON.parse(localStorage.getItem("sous-preferences") ?? "{}"),
      effort: localStorage.getItem("sous-effort-tolerance"),
      pulseLedger: JSON.parse(
        localStorage.getItem("sous-pulse-ledger-v1") ?? "null",
      ),
    }));

    expect(stored.done).toBe("true");
    expect(stored.profile.goalKey).toBe("simple");
    expect(stored.profile.frictions).toContain("time");
    expect(stored.profile.cuisineLikes).toContain("italian");
    expect(stored.profile.cuisineDislikes).toContain("korean");
    expect(stored.preferences.italian).toBeGreaterThan(0);
    expect(stored.preferences.korean).toBeLessThan(0);
    expect(stored.effort).toBe("minimal");
    expect(stored.pulseLedger.onboardingDoneAt).toEqual(expect.any(String));
  });

  test("macro branch preserves numeric defaults and touch-safe thumb/unit controls", async ({
    page,
  }) => {
    test.slow();

    const onboarding = await openOnboarding(page);

    await onboarding
      .getByRole("radio", { name: "Hit my nutrition goals" })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding
      .getByRole("checkbox", { name: "None of these, honestly" })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await answerBeliefCards(onboarding, "disagree");
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding.getByRole("checkbox", { name: "Everything" }).click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expectTouchTarget(
      onboarding.getByRole("button", { name: "Continue" }),
    );
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding
      .getByRole("radio", { name: /I can follow a recipe/i })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(onboarding.getByText("A couple quick numbers")).toBeVisible();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding.getByRole("radio", { name: "Female" }).click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Your age" }),
    ).toBeVisible();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Your height" }),
    ).toBeVisible();
    await expectTouchTarget(
      onboarding.getByRole("button", { name: "cm", exact: true }),
    );
    await expectTouchTarget(
      onboarding.getByRole("button", { name: "ft/in", exact: true }),
    );
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Your weight" }),
    ).toBeVisible();
    await expectTouchTarget(
      onboarding.getByRole("button", { name: "kg", exact: true }),
    );
    await expectTouchTarget(
      onboarding.getByRole("button", { name: "lb", exact: true }),
    );
    await onboarding.getByRole("button", { name: "Finish" }).click();

    await expect(
      onboarding.getByText(/Your day is sized to about/i),
    ).toBeVisible({
      timeout: 10000,
    });
    await onboarding
      .getByRole("button", { name: "Pick my first recipes" })
      .click();

    const stored = await page.evaluate(() => ({
      profile: JSON.parse(localStorage.getItem("sous-onboarding-v2") ?? "null"),
      personalProfile: JSON.parse(
        localStorage.getItem("sous-personal-profile-v1") ?? "null",
      ),
      pulseLedger: JSON.parse(
        localStorage.getItem("sous-pulse-ledger-v1") ?? "null",
      ),
    }));

    expect(stored.profile.goalKey).toBe("macros");
    expect(stored.profile.numeric).toMatchObject({
      sex: "female",
      age: 30,
      heightCm: 170,
      weightKg: 70,
    });
    expect(stored.personalProfile).toMatchObject({
      sex: "female",
      age: 30,
      heightCm: 170,
      weightKg: 70,
      activity: "light",
      goal: "maintain",
    });
    expect(stored.pulseLedger.onboardingDoneAt).toEqual(expect.any(String));
  });

  test("macro branch persists male non-default numeric wheel values canonically", async ({
    page,
  }) => {
    test.slow();

    const onboarding = await openOnboarding(page);

    await onboarding
      .getByRole("radio", { name: "Hit my nutrition goals" })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding
      .getByRole("checkbox", { name: "None of these, honestly" })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await answerBeliefCards(onboarding, "disagree");
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding.getByRole("checkbox", { name: "Everything" }).click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding
      .getByRole("radio", { name: /I can follow a recipe/i })
      .click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(onboarding.getByText("A couple quick numbers")).toBeVisible();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await onboarding.getByRole("radio", { name: "Male", exact: true }).click();
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Your age" }),
    ).toBeVisible();
    await setActiveWheelValue(onboarding, 42);
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Your height" }),
    ).toBeVisible();
    await onboarding
      .getByRole("button", { name: "ft/in", exact: true })
      .click();
    await setActiveWheelValue(onboarding, 183);
    await onboarding.getByRole("button", { name: "Continue" }).click();

    await expect(
      onboarding.getByRole("heading", { name: "Your weight" }),
    ).toBeVisible();
    await onboarding.getByRole("button", { name: "lb", exact: true }).click();
    await setActiveWheelValue(onboarding, 82);
    await onboarding.getByRole("button", { name: "Finish" }).click();

    await expect(
      onboarding.getByText(/Your day is sized to about/i),
    ).toBeVisible({
      timeout: 10000,
    });
    await onboarding
      .getByRole("button", { name: "Pick my first recipes" })
      .click();

    const stored = await page.evaluate(() => ({
      profile: JSON.parse(localStorage.getItem("sous-onboarding-v2") ?? "null"),
      personalProfile: JSON.parse(
        localStorage.getItem("sous-personal-profile-v1") ?? "null",
      ),
    }));

    expect(stored.profile.goalKey).toBe("macros");
    expect(stored.profile.numeric).toMatchObject({
      sex: "male",
      age: 42,
      heightCm: 183,
      weightKg: 82,
    });
    expect(stored.personalProfile).toMatchObject({
      sex: "male",
      age: 42,
      heightCm: 183,
      weightKg: 82,
      activity: "light",
      goal: "maintain",
    });
  });
});
