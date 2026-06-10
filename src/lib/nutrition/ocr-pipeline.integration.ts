/**
 * OCR pipeline integration check — the exact path LogFood's "Read the label"
 * takes (tesseract.js recognize → extractFoodQuery), run in Node against a
 * CoreGraphics-rendered package-front fixture.
 *
 * NOT part of `pnpm test` (network: tesseract fetches eng.traineddata on first
 * run). Run on demand:  npx tsx src/lib/nutrition/ocr-pipeline.integration.ts
 */
import { createWorker } from "tesseract.js";
import { extractFoodQuery } from "./extract-food-query";

import path from "node:path";

async function main(): Promise<void> {
  const fixture = path.join(__dirname, "__fixtures__/greek-yogurt-label.png");
  const worker = await createWorker("eng");
  const {
    data: { text },
  } = await worker.recognize(fixture);
  await worker.terminate();

  console.log("OCR raw:", JSON.stringify(text.trim()));
  const { query, alternates } = extractFoodQuery(text);
  console.log("query:", query, "| alternates:", alternates);

  if (query?.toUpperCase() !== "GREEK YOGURT") {
    console.error("FAIL: expected GREEK YOGURT, got", query);
    process.exit(1);
  }
  console.log("PASS: camera-read → 'GREEK YOGURT' → searchable query");
}

void main();
