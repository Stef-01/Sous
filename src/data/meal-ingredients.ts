/**
 * Meal ingredient lists (Gap 1 — meal nutrition composition).
 *
 * Meals (unlike the guided-cook sides) carry no structured ingredient lines, so
 * they could only ever resolve food IDENTITY from their description. This file
 * adds quantified ingredient lists for meals so the composition engine can
 * derive real per-serving nutrition for them too.
 *
 * IMPORTANT (rule 7): these are NOT new recipes. The dishes already exist in
 * meals.json. Each entry is a *representative* ingredient list with standard
 * quantities for a typical preparation — for nutrition ESTIMATION, not an
 * authoritative recipe. Composition flags the result as an estimate. This is a
 * curated exemplar set; the remaining meals grow by adding rows here (the same
 * add-data-not-code pattern as the ingredient registry).
 */

import type { RawIngredientLine } from "@/lib/nutrition/resolve-dish-lines";

export interface MealIngredients {
  /** Representative servings for the quantities below. */
  servings: number;
  ingredients: RawIngredientLine[];
}

export const MEAL_INGREDIENTS: Record<string, MealIngredients> = {
  "grilled-salmon": {
    servings: 2,
    ingredients: [
      { name: "Salmon", quantity: "2 fillets" },
      { name: "Olive oil", quantity: "1 tbsp" },
      { name: "Lemon", quantity: "1" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Salt", quantity: "to taste" },
      { name: "Black pepper", quantity: "to taste" },
    ],
  },
  "teriyaki-salmon": {
    servings: 2,
    ingredients: [
      { name: "Salmon", quantity: "2 fillets" },
      { name: "Soy sauce", quantity: "3 tbsp" },
      { name: "Mirin", quantity: "2 tbsp" },
      { name: "Sugar", quantity: "1 tbsp" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Sesame oil", quantity: "1 tsp" },
    ],
  },
  "pad-thai": {
    servings: 2,
    ingredients: [
      { name: "Rice noodles", quantity: "200 g" },
      { name: "Shrimp", quantity: "150 g" },
      { name: "Tofu", quantity: "100 g" },
      { name: "Egg", quantity: "2" },
      { name: "Bean sprouts", quantity: "1 cup" },
      { name: "Roasted peanuts", quantity: "1/4 cup" },
      { name: "Fish sauce", quantity: "2 tbsp" },
      { name: "Sugar", quantity: "1 tbsp" },
      { name: "Lime", quantity: "1" },
      { name: "Vegetable oil", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Scallion", quantity: "2" },
    ],
  },
  "masoor-dal": {
    servings: 4,
    ingredients: [
      { name: "Red lentils", quantity: "1 cup" },
      { name: "Onion", quantity: "1" },
      { name: "Tomato", quantity: "2" },
      { name: "Garlic", quantity: "3 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Turmeric", quantity: "1 tsp" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Vegetable oil", quantity: "2 tbsp" },
      { name: "Salt", quantity: "to taste" },
      { name: "Cilantro", quantity: "1/4 cup" },
    ],
  },
  "butter-chicken": {
    servings: 4,
    ingredients: [
      { name: "Chicken breast", quantity: "500 g" },
      { name: "Butter", quantity: "3 tbsp" },
      { name: "Heavy cream", quantity: "1/2 cup" },
      { name: "Tomato paste", quantity: "2 tbsp" },
      { name: "Onion", quantity: "1" },
      { name: "Garlic", quantity: "4 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Turmeric", quantity: "1 tsp" },
      { name: "Salt", quantity: "to taste" },
    ],
  },
  "chicken-tikka-masala": {
    servings: 4,
    ingredients: [
      { name: "Chicken breast", quantity: "500 g" },
      { name: "Greek yogurt", quantity: "1/2 cup" },
      { name: "Tomato paste", quantity: "2 tbsp" },
      { name: "Heavy cream", quantity: "1/2 cup" },
      { name: "Onion", quantity: "1" },
      { name: "Garlic", quantity: "4 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Turmeric", quantity: "1 tsp" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Vegetable oil", quantity: "2 tbsp" },
    ],
  },
  "fish-tacos": {
    servings: 3,
    ingredients: [
      { name: "Cod", quantity: "400 g" },
      { name: "Green cabbage", quantity: "2 cups" },
      { name: "Lime", quantity: "2" },
      { name: "Cilantro", quantity: "1/4 cup" },
      { name: "Mayonnaise", quantity: "1/4 cup" },
      { name: "Vegetable oil", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "1 clove" },
      { name: "Cumin", quantity: "1 tsp" },
    ],
  },
  "falafel-wrap": {
    servings: 2,
    ingredients: [
      { name: "Chickpeas", quantity: "1 cup" },
      { name: "Garlic", quantity: "3 cloves" },
      { name: "Cilantro", quantity: "1/2 cup" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Coriander seeds", quantity: "1 tsp" },
      { name: "Tahini", quantity: "2 tbsp" },
      { name: "Lemon", quantity: "1" },
      { name: "Vegetable oil for frying", quantity: "2 cups" },
      { name: "Bread", quantity: "2" },
    ],
  },
  "pizza-margherita": {
    servings: 2,
    ingredients: [
      { name: "All-purpose flour", quantity: "2 cups" },
      { name: "Mozzarella", quantity: "150 g" },
      { name: "Tomato", quantity: "3" },
      { name: "Basil", quantity: "1/4 cup" },
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Salt", quantity: "1 tsp" },
    ],
  },
  "pasta-carbonara": {
    servings: 2,
    ingredients: [
      { name: "Pasta", quantity: "200 g" },
      { name: "Egg", quantity: "2" },
      { name: "Parmesan", quantity: "50 g" },
      { name: "Ground pork", quantity: "80 g" },
      { name: "Black pepper", quantity: "to taste" },
      { name: "Salt", quantity: "to taste" },
    ],
  },
  "beef-burger": {
    servings: 1,
    ingredients: [
      { name: "Ground beef", quantity: "150 g" },
      { name: "Bread", quantity: "1" },
      { name: "Onion", quantity: "1/4" },
      { name: "Tomato", quantity: "1" },
      { name: "Salt", quantity: "to taste" },
      { name: "Black pepper", quantity: "to taste" },
    ],
  },
  "chicken-shawarma": {
    servings: 3,
    ingredients: [
      { name: "Chicken breast", quantity: "400 g" },
      { name: "Garlic", quantity: "4 cloves" },
      { name: "Lemon", quantity: "1" },
      { name: "Olive oil", quantity: "2 tbsp" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Paprika", quantity: "1 tsp" },
      { name: "Tortilla", quantity: "3" },
    ],
  },
  pho: {
    servings: 2,
    ingredients: [
      { name: "Rice noodles", quantity: "200 g" },
      { name: "Beef steak", quantity: "200 g" },
      { name: "Onion", quantity: "1" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Fish sauce", quantity: "2 tbsp" },
      { name: "Cilantro", quantity: "1/4 cup" },
      { name: "Lime", quantity: "1" },
      { name: "Scallion", quantity: "2" },
    ],
  },
  steak: {
    servings: 1,
    ingredients: [
      { name: "Beef steak", quantity: "250 g" },
      { name: "Olive oil", quantity: "1 tbsp" },
      { name: "Garlic", quantity: "2 cloves" },
      { name: "Butter", quantity: "1 tbsp" },
      { name: "Salt", quantity: "to taste" },
      { name: "Black pepper", quantity: "to taste" },
    ],
  },
  "tacos-al-pastor": {
    servings: 3,
    ingredients: [
      { name: "Ground pork", quantity: "400 g" },
      { name: "Tortilla", quantity: "6" },
      { name: "Onion", quantity: "1" },
      { name: "Cilantro", quantity: "1/4 cup" },
      { name: "Lime", quantity: "2" },
      { name: "Garlic", quantity: "3 cloves" },
      { name: "Paprika", quantity: "1 tsp" },
    ],
  },
  "chicken-biryani": {
    servings: 4,
    ingredients: [
      { name: "White rice", quantity: "2 cups" },
      { name: "Chicken breast", quantity: "500 g" },
      { name: "Onion", quantity: "2" },
      { name: "Greek yogurt", quantity: "1/2 cup" },
      { name: "Garlic", quantity: "4 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Turmeric", quantity: "1 tsp" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Vegetable oil", quantity: "3 tbsp" },
      { name: "Cilantro", quantity: "1/4 cup" },
    ],
  },
  bibimbap: {
    servings: 2,
    ingredients: [
      { name: "White rice", quantity: "2 cups" },
      { name: "Ground beef", quantity: "150 g" },
      { name: "Spinach", quantity: "1 cup" },
      { name: "Carrot", quantity: "1" },
      { name: "Mushroom", quantity: "1 cup" },
      { name: "Egg", quantity: "2" },
      { name: "Sesame oil", quantity: "1 tbsp" },
      { name: "Soy sauce", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "2 cloves" },
    ],
  },
  bulgogi: {
    servings: 3,
    ingredients: [
      { name: "Beef steak", quantity: "400 g" },
      { name: "Soy sauce", quantity: "4 tbsp" },
      { name: "Sugar", quantity: "2 tbsp" },
      { name: "Sesame oil", quantity: "1 tbsp" },
      { name: "Garlic", quantity: "4 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Scallion", quantity: "2" },
      { name: "Sesame seeds", quantity: "1 tbsp" },
    ],
  },
  "green-curry": {
    servings: 3,
    ingredients: [
      { name: "Chicken breast", quantity: "400 g" },
      { name: "Coconut milk", quantity: "1 cup" },
      { name: "Bell pepper", quantity: "1" },
      { name: "Eggplant", quantity: "1" },
      { name: "Fish sauce", quantity: "2 tbsp" },
      { name: "Garlic", quantity: "3 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Basil", quantity: "1/4 cup" },
      { name: "Vegetable oil", quantity: "1 tbsp" },
    ],
  },
  "massaman-curry": {
    servings: 4,
    ingredients: [
      { name: "Chicken breast", quantity: "400 g" },
      { name: "Coconut milk", quantity: "1 cup" },
      { name: "Potato", quantity: "2" },
      { name: "Roasted peanuts", quantity: "1/4 cup" },
      { name: "Onion", quantity: "1" },
      { name: "Fish sauce", quantity: "2 tbsp" },
      { name: "Brown sugar", quantity: "1 tbsp" },
      { name: "Vegetable oil", quantity: "1 tbsp" },
    ],
  },
  "tom-kha-gai": {
    servings: 3,
    ingredients: [
      { name: "Chicken breast", quantity: "300 g" },
      { name: "Coconut milk", quantity: "1 cup" },
      { name: "Mushroom", quantity: "1 cup" },
      { name: "Ginger", quantity: "2 tbsp" },
      { name: "Lime", quantity: "2" },
      { name: "Fish sauce", quantity: "2 tbsp" },
      { name: "Cilantro", quantity: "1/4 cup" },
      { name: "Jalapeño", quantity: "2" },
    ],
  },
  "mattar-paneer": {
    servings: 3,
    ingredients: [
      { name: "Paneer", quantity: "200 g" },
      { name: "Onion", quantity: "1" },
      { name: "Tomato", quantity: "3" },
      { name: "Garlic", quantity: "3 cloves" },
      { name: "Ginger", quantity: "1 tbsp" },
      { name: "Turmeric", quantity: "1 tsp" },
      { name: "Cumin", quantity: "1 tsp" },
      { name: "Vegetable oil", quantity: "2 tbsp" },
      { name: "Cilantro", quantity: "1/4 cup" },
    ],
  },
  "miso-cod": {
    servings: 2,
    ingredients: [
      { name: "Cod", quantity: "300 g" },
      { name: "Sugar", quantity: "1 tbsp" },
      { name: "Mirin", quantity: "2 tbsp" },
      { name: "Soy sauce", quantity: "2 tbsp" },
      { name: "Sesame oil", quantity: "1 tsp" },
    ],
  },
};
