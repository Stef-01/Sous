/**
 * Validate guided cook data integrity against sides.json and meals.json.
 * Reports orphans (entries with no matching side/meal) and coverage gaps.
 * Exit 1 if any orphans exist.
 */

import sidesData from "../../data/sides.json";
import mealsData from "../../data/meals.json";

// Dynamic import to avoid circular dependency issues with tsx
async function main() {
  const { guidedCookData, guidedCookMeals } =
    await import("../../data/guided-cook-steps");

  const sideIds = new Set(sidesData.map((s: { id: string }) => s.id));
  const mealIds = new Set(mealsData.map((m: { id: string }) => m.id));

  const guidedSideKeys = Object.keys(guidedCookData);
  const guidedMealKeys = Object.keys(guidedCookMeals);

  // Find orphan side cook entries (in guided cook but not in sides.json)
  const sideOrphans = guidedSideKeys.filter((key) => !sideIds.has(key));

  // Find orphan meal cook entries (in guided cook but not in meals.json)
  const mealOrphans = guidedMealKeys.filter((key) => !mealIds.has(key));

  // Coverage stats
  const sidesWithCook = guidedSideKeys.filter((key) => sideIds.has(key));
  const mealsWithCook = guidedMealKeys.filter((key) => mealIds.has(key));

  console.log("=== Guided Cook Data Integrity Report ===\n");
  console.log(
    `Sides: ${sidesData.length} total, ${sidesWithCook.length} with guided cook (${Math.round((sidesWithCook.length / sidesData.length) * 100)}% coverage)`,
  );
  console.log(
    `Meals: ${mealsData.length} total, ${mealsWithCook.length} with guided cook (${Math.round((mealsWithCook.length / mealsData.length) * 100)}% coverage)`,
  );
  console.log(
    `Guided cook entries: ${guidedSideKeys.length} sides + ${guidedMealKeys.length} meals = ${guidedSideKeys.length + guidedMealKeys.length} total\n`,
  );

  if (sideOrphans.length > 0) {
    console.log(`❌ ${sideOrphans.length} ORPHAN side cook entries:`);
    for (const orphan of sideOrphans) {
      const data = guidedCookData[orphan];
      console.log(`  - "${orphan}" (name: "${data.name}")`);
    }
    console.log();
  }

  if (mealOrphans.length > 0) {
    console.log(`❌ ${mealOrphans.length} ORPHAN meal cook entries:`);
    for (const orphan of mealOrphans) {
      const data = guidedCookMeals[orphan];
      console.log(`  - "${orphan}" (name: "${data.name}")`);
    }
    console.log();
  }

  const totalOrphans = sideOrphans.length + mealOrphans.length;
  if (totalOrphans > 0) {
    console.log(
      `\n❌ FAILED: ${totalOrphans} orphan entries found. Fix by matching to existing side/meal IDs or removing.`,
    );
    process.exit(1);
  } else {
    console.log("✅ PASSED: Zero orphan guided cook entries.");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Validation script failed:", err);
  process.exit(1);
});
