import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const BASE = "http://localhost:3000";
const OUT = path.join(__dirname, "..", "audit-screenshots");

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
  });

  const page = await ctx.newPage();

  // Set localStorage to skip coach quiz
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.setItem("sous-coach-quiz-done", "true");
    localStorage.setItem(
      "sous-coach-quiz-result",
      JSON.stringify({
        preferences: { indian: 0.5, japanese: 0.3 },
        effortTolerance: "moderate",
      }),
    );
  });

  // Home page after quiz skip
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(OUT, "10-home-quest.png"),
    fullPage: false,
  });

  // Full home page with quest cards
  await page.screenshot({
    path: path.join(OUT, "11-home-quest-full.png"),
    fullPage: true,
  });

  // Scroll down to see more content
  await page.evaluate(() => window.scrollBy(0, 400));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(OUT, "12-home-scrolled-below-fold.png"),
    fullPage: false,
  });

  // Test a meal with an image - cook page
  await page.goto(`${BASE}/cook/caesar-salad`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT, "13-cook-caesar-with-image.png"),
    fullPage: false,
  });

  // Test a side without an image - cook page
  await page.goto(`${BASE}/cook/hummus`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT, "14-cook-hummus-no-image.png"),
    fullPage: false,
  });

  // Path skill tree
  await page.goto(`${BASE}/path`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT, "15-path-full.png"),
    fullPage: true,
  });

  // Test a meal image - navigate to cook with a meal that has heroImageUrl
  await page.goto(`${BASE}/cook/butter-chicken?main=Butter%20Chicken`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT, "16-cook-butter-chicken-meal.png"),
    fullPage: false,
  });

  // Test quest card with image
  await page.goto(`${BASE}/cook/garlic-naan`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(OUT, "17-cook-garlic-naan.png"),
    fullPage: false,
  });

  await browser.close();
  console.log(`Done! Screenshots saved to ${OUT}`);
}

main().catch(console.error);
