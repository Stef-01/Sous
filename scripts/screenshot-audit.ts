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

  const routes = [
    { name: "01-home", url: "/" },
    { name: "02-home-scrolled", url: "/", scroll: true },
    { name: "03-path", url: "/path" },
    { name: "04-path-favorites", url: "/path/favorites" },
    { name: "05-path-scrapbook", url: "/path/scrapbook" },
    { name: "06-cook-caesar-salad", url: "/cook/caesar-salad" },
    { name: "07-cook-garlic-bread", url: "/cook/garlic-bread" },
    { name: "08-cook-combined", url: "/cook/combined" },
  ];

  for (const route of routes) {
    console.log(`Capturing ${route.name}...`);
    await page.goto(`${BASE}${route.url}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    if (route.scroll) {
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(500);
    }
    await page.screenshot({
      path: path.join(OUT, `${route.name}.png`),
      fullPage: !route.scroll,
    });
  }

  // Swipe through quest cards on home to see what's shown
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Take a full page screenshot to see the entire home page
  await page.screenshot({
    path: path.join(OUT, "09-home-full.png"),
    fullPage: true,
  });

  await browser.close();
  console.log(`Done! Screenshots saved to ${OUT}`);
}

main().catch(console.error);
