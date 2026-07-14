import { expect, test } from "@playwright/test";

test.describe("frontend modernization", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test("Today reaches the meal before optional personalization", async ({
    page,
  }) => {
    await page.goto("/today");

    const meal = page.locator('button[aria-label^="Browse meals"]');
    const personalization = page.getByText("Tune meals to your taste");
    await expect(meal).toBeVisible();
    await expect(personalization).toBeVisible();

    const mealBox = await meal.boundingBox();
    const personalizationBox = await personalization.boundingBox();
    expect(mealBox).not.toBeNull();
    expect(personalizationBox).not.toBeNull();
    expect(mealBox!.y).toBeLessThan(personalizationBox!.y);
  });

  test("meal queue keeps food, title, and actions in separate regions", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.locator('button[aria-label^="Browse meals"]').click();

    const card = page.getByTestId("meal-swipe-card").first();
    const actionBar = page.getByTestId("meal-queue-action-bar");
    const title = page
      .getByRole("dialog", { name: "Meal swipe queue" })
      .locator("h3")
      .first();
    await expect(card).toBeVisible();
    await expect(actionBar).toBeVisible();
    await expect(title).toBeVisible();

    const cardBox = await card.boundingBox();
    const titleBox = await title.boundingBox();
    const actionBox = await actionBar.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(titleBox).not.toBeNull();
    expect(actionBox).not.toBeNull();
    expect(cardBox!.y + cardBox!.height).toBeLessThanOrEqual(titleBox!.y);
    expect(titleBox!.y + titleBox!.height).toBeLessThanOrEqual(actionBox!.y);
  });

  test("saved meals reopen through the same pairing decision", async ({
    page,
  }) => {
    await page.goto("/today");
    await page.locator('button[aria-label^="Browse meals"]').click();

    const queue = page.getByRole("dialog", { name: "Meal swipe queue" });
    const titleText = (await queue.locator("h3").first().textContent())?.trim();
    if (!titleText) throw new Error("Meal queue title did not render");
    const title = titleText;

    const buildPlate = queue.getByRole("button", {
      name: `Build a plate around ${title}`,
    });
    const shouldPair = (await buildPlate.count()) > 0;

    await page.keyboard.press("s");
    await expect(queue.getByRole("status")).toHaveText("Saved for later");
    await page.keyboard.press("Escape");

    await page.evaluate(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      for (const element of document.querySelectorAll<HTMLElement>("*")) {
        const overflowY = getComputedStyle(element).overflowY;
        if (
          element.scrollHeight > element.clientHeight + 8 &&
          (overflowY === "auto" || overflowY === "scroll")
        ) {
          element.scrollTop = element.scrollHeight;
        }
      }
    });
    await expect(
      page.getByRole("heading", { name: "Saved for later" }),
    ).toBeVisible({ timeout: 10000 });
    await page
      .getByRole("button", { name: `Open saved ${title}` })
      .evaluate((button) => (button as HTMLButtonElement).click());

    await expect(page).toHaveURL(
      shouldPair ? /\/sides\?main=/ : new RegExp(`/cook/`),
    );
  });

  test("Path presents kitchen tools as one compact workflow", async ({
    page,
  }) => {
    await page.goto("/path");

    const workflow = page.getByRole("navigation", {
      name: "Kitchen workflow",
    });
    await expect(workflow).toBeVisible();
    await expect(workflow.getByRole("link")).toHaveCount(3);

    const box = await workflow.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(60);
  });

  test("Community starts curated and reveals archives on demand", async ({
    page,
  }) => {
    await page.goto("/community");

    const learn = page.getByRole("region", { name: "Learn" });
    await expect(learn.locator('a[href^="/community/article/"]')).toHaveCount(
      4,
    );
    await expect(learn.locator('a[href^="/community/research/"]')).toHaveCount(
      2,
    );

    await learn.getByRole("button", { name: "Show all reads" }).click();
    await expect
      .poll(() => learn.locator('a[href^="/community/article/"]').count())
      .toBeGreaterThan(4);
  });

  test("Cook keeps food dominant and optional controls flat", async ({
    page,
  }) => {
    await page.goto("/cook/garlic-bread");

    const hero = page.getByTestId("cook-mission-hero");
    const planner = page.getByRole("button", {
      name: "When do you want to eat?",
    });
    await expect(hero).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Save recipe" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Let’s gather" }),
    ).toBeVisible();
    await expect(planner).toBeVisible();

    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(heroBox!.height).toBeGreaterThan(330);
    expect(
      await planner.evaluate((node) => getComputedStyle(node).borderStyle),
    ).toBe("solid");
  });
});
