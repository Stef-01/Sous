import { expect, test, type Locator, type Page } from "@playwright/test";

async function seedPulseReadyDevice(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem("sous-coach-quiz-done", "true");
    localStorage.setItem("sous-firstrun-seen", "true");
    localStorage.setItem("sous-path-tutorial-v1", "done");
    localStorage.setItem("sous-device-id", "e2e-pulse-device");
    localStorage.setItem(
      "sous-pulse-ledger-v1",
      JSON.stringify({
        shown: [],
        answered: [],
        dismissed: [],
        onboardingDoneAt: new Date().toISOString(),
      }),
    );
  });
}

async function openProfileSheet(page: Page): Promise<Locator> {
  await page.goto("/today");
  await page.getByRole("button", { name: "Open profile and settings" }).click();
  const profile = page.getByRole("dialog", {
    name: "Profile & settings",
  });
  await expect(profile).toBeVisible({ timeout: 10000 });
  return profile;
}

test.describe("Pulse micro-surveys", () => {
  test("volunteered pulse opens from profile and Escape permanently dismisses it", async ({
    page,
  }) => {
    await seedPulseReadyDevice(page);
    const profile = await openProfileSheet(page);

    const tunePicks = profile.getByRole("button", { name: /Tune my picks/i });
    await tunePicks.scrollIntoViewIfNeeded();
    await expect(tunePicks).toBeVisible();
    await tunePicks.click();

    await expect(profile).toBeHidden({ timeout: 10000 });
    const pulse = page.getByRole("dialog", {
      name: "How the last cook felt",
    });
    await expect(pulse).toBeVisible({ timeout: 10000 });
    await expect(pulse).toBeFocused({ timeout: 10000 });
    await expect(
      pulse.getByRole("heading", { name: "Quick one" }),
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(pulse).toBeHidden({ timeout: 10000 });

    const ledger = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("sous-pulse-ledger-v1") ?? "null"),
    );
    expect(
      ledger.shown.map((entry: { pulseId: string }) => entry.pulseId),
    ).toContain("felt-easier");
    expect(ledger.dismissed).toContain("felt-easier");
    expect(ledger.answered).not.toContain("felt-easier");
  });
});
