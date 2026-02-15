export interface Meal {
  id: string;
  name: string;
  aliases: string[];
  heroImageUrl: string;
  sidePool: string[];
  cuisine: string;
  description: string;
  nourishVerified?: boolean;
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
