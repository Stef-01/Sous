/**
 * Speed Chop  -  ingredient categorization data.
 * Each round has a question and items to sort left or right.
 */

export interface SpeedChopRound {
  question: string;
  leftLabel: string;
  rightLabel: string;
  items: SpeedChopItem[];
}

export interface SpeedChopItem {
  name: string;
  emoji: string;
  correctSide: "left" | "right";
  funFact?: string;
}

export const speedChopRounds: SpeedChopRound[] = [
  {
    question: "Fruit or Vegetable?",
    leftLabel: "Fruit",
    rightLabel: "Vegetable",
    items: [
      {
        name: "Tomato",
        emoji: "🍅",
        correctSide: "left",
        funFact: "Botanically a berry!",
      },
      { name: "Carrot", emoji: "🥕", correctSide: "right" },
      {
        name: "Avocado",
        emoji: "🥑",
        correctSide: "left",
        funFact: "Actually a large berry",
      },
      { name: "Broccoli", emoji: "🥦", correctSide: "right" },
      {
        name: "Pepper",
        emoji: "🫑",
        correctSide: "left",
        funFact: "Peppers are berries",
      },
      { name: "Celery", emoji: "🥬", correctSide: "right" },
      {
        name: "Cucumber",
        emoji: "🥒",
        correctSide: "left",
        funFact: "A pepo berry",
      },
      {
        name: "Eggplant",
        emoji: "🍆",
        correctSide: "left",
        funFact: "A berry!",
      },
      { name: "Onion", emoji: "🧅", correctSide: "right" },
      { name: "Strawberry", emoji: "🍓", correctSide: "left" },
    ],
  },
  {
    question: "Protein or Carb?",
    leftLabel: "Protein",
    rightLabel: "Carb",
    items: [
      { name: "Chicken", emoji: "🍗", correctSide: "left" },
      { name: "Rice", emoji: "🍚", correctSide: "right" },
      { name: "Egg", emoji: "🥚", correctSide: "left" },
      { name: "Bread", emoji: "🍞", correctSide: "right" },
      { name: "Salmon", emoji: "🐟", correctSide: "left" },
      { name: "Pasta", emoji: "🍝", correctSide: "right" },
      { name: "Tofu", emoji: "🧊", correctSide: "left" },
      { name: "Potato", emoji: "🥔", correctSide: "right" },
      {
        name: "Lentils",
        emoji: "🫘",
        correctSide: "left",
        funFact: "High in both!",
      },
      { name: "Corn", emoji: "🌽", correctSide: "right" },
    ],
  },
  {
    question: "Grows Above or Below Ground?",
    leftLabel: "Above",
    rightLabel: "Below",
    items: [
      { name: "Tomato", emoji: "🍅", correctSide: "left" },
      { name: "Potato", emoji: "🥔", correctSide: "right" },
      { name: "Pepper", emoji: "🫑", correctSide: "left" },
      { name: "Carrot", emoji: "🥕", correctSide: "right" },
      { name: "Broccoli", emoji: "🥦", correctSide: "left" },
      { name: "Onion", emoji: "🧅", correctSide: "right" },
      { name: "Eggplant", emoji: "🍆", correctSide: "left" },
      { name: "Beet", emoji: "🫒", correctSide: "right" },
      { name: "Pea", emoji: "🫛", correctSide: "left" },
      { name: "Ginger", emoji: "🫚", correctSide: "right" },
    ],
  },
  {
    question: "Needs Fridge or Pantry?",
    leftLabel: "Fridge",
    rightLabel: "Pantry",
    items: [
      { name: "Milk", emoji: "🥛", correctSide: "left" },
      { name: "Rice", emoji: "🍚", correctSide: "right" },
      { name: "Yogurt", emoji: "🫙", correctSide: "left" },
      { name: "Canned Beans", emoji: "🫘", correctSide: "right" },
      { name: "Cheese", emoji: "🧀", correctSide: "left" },
      { name: "Honey", emoji: "🍯", correctSide: "right" },
      { name: "Butter", emoji: "🧈", correctSide: "left" },
      { name: "Olive Oil", emoji: "🫒", correctSide: "right" },
      { name: "Eggs", emoji: "🥚", correctSide: "left" },
      { name: "Salt", emoji: "🧂", correctSide: "right" },
    ],
  },
];

export function getRandomRound(): SpeedChopRound {
  return speedChopRounds[Math.floor(Math.random() * speedChopRounds.length)];
}
