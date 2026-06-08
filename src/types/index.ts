/** Dayparts a meal suits — drives the Today "Meal type" filter. Optional for
 *  back-compat; a meal with none defaults to lunch + dinner. */
export type Daypart = "breakfast" | "lunch" | "dinner";

/** A non-main dish role — drives the Today "Dish role" filter. Mains live in
 *  meals.json (implicitly role "main"); these classify sides.json entries.
 *  Optional for back-compat; an unclassified side defaults to "side". */
export type SideRole = "side" | "drink" | "snack";

export interface Meal {
  id: string;
  name: string;
  aliases: string[];
  heroImageUrl: string | null;
  sidePool: string[];
  cuisine: string;
  description: string;
  nourishVerified?: boolean;
  dayparts?: Daypart[];
}

export interface SideDish {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  description: string;
  pairingReason: string;
  nutritionCategory: "protein" | "carb" | "vegetable";
  nourishVerified?: boolean;
  role?: SideRole;
}

export interface PairingState {
  status: "idle" | "loading" | "success" | "error";
  meal: Meal | null;
  selectedSides: SideDish[];
  usedSideIds: Set<string>;
  errorMessage: string | null;
  suggestions: string[];
}

export interface SearchResult {
  meal: Meal;
  sides: SideDish[];
}

export interface SearchErrorResponse {
  error: string;
  suggestions: string[];
}

export interface PairingScore {
  sideId: string;
  score: number;
  tier: "excellent" | "strong" | "good" | "experimental" | "low";
  reasons: string[];
}
