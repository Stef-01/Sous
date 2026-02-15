import type { Meal, SideDish } from "@/types";
import mealsData from "./meals.json";
import sidesData from "./sides.json";

export const meals: Meal[] = mealsData;
export const sides: SideDish[] = sidesData as SideDish[];

const sidesMap = new Map<string, SideDish>();
for (const side of sides) {
  sidesMap.set(side.id, side);
}

export function getSideById(id: string): SideDish | undefined {
  return sidesMap.get(id);
}

export function getSidesByIds(ids: string[]): SideDish[] {
  return ids
    .map((id) => sidesMap.get(id))
    .filter((s): s is SideDish => s !== undefined);
}
