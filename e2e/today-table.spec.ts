import { expect, type Locator, test } from "@playwright/test";

async function expectTouchTarget(locator: Locator) {
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
      { timeout: 10000 },
    )
    .toBe("ready");
}

function seedTonightTable() {
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
        createdAt: "2026-07-14T00:00:00.000Z",
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
        createdAt: "2026-07-14T00:00:00.000Z",
      },
    ]),
  );
  localStorage.setItem(
    "sous-tonight-table-v1",
    JSON.stringify({ schemaVersion: 1, selectedIds: ["mem-alex"] }),
  );
}

test.describe("Today table picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(seedTonightTable);
  });

  test("keeps household selection flat, finger-sized, and persisted", async ({
    page,
  }) => {
    await page.goto("/today", { waitUntil: "domcontentloaded" });

    const picker = page.getByRole("region", { name: "Who's at the table" });
    await expect(picker).toBeVisible({ timeout: 10000 });
    await expect(picker).toHaveCSS("box-shadow", "none");

    const alex = picker.getByRole("button", { name: /Alex/i });
    const sam = picker.getByRole("button", { name: /Sam/i });
    await expectTouchTarget(alex);
    await expectTouchTarget(sam);
    await expect(alex).toHaveAttribute("aria-pressed", "true");
    await expect(sam).toHaveAttribute("aria-pressed", "false");

    await sam.click();
    await expect(sam).toHaveAttribute("aria-pressed", "true");
    await expect(picker.getByText("2 of 2")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          JSON.parse(
            localStorage.getItem("sous-tonight-table-v1") ?? "{}",
          ).selectedIds?.sort(),
        ),
      )
      .toEqual(["mem-alex", "mem-sam"]);
  });
});
