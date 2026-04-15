/**
 * Clue data for the "What's Cooking?" food guessing game.
 * Each dish has 5 clues from most abstract to most obvious.
 */

export interface DishClue {
  dishName: string;
  acceptedAnswers: string[];
  emoji: string;
  clues: [string, string, string, string, string];
}

export const dishClues: DishClue[] = [
  {
    dishName: "Pizza",
    acceptedAnswers: ["pizza", "pizza margherita", "margherita"],
    emoji: "🍕",
    clues: [
      "I was born in fire and cooled by the sea.",
      "Fishermen in Naples made me famous 200 years ago.",
      "My foundation is flour, water, and patience.",
      "I come in thin crust and deep dish varieties.",
      "Mozzarella is my best friend.",
    ],
  },
  {
    dishName: "Sushi",
    acceptedAnswers: ["sushi", "sushi roll", "maki"],
    emoji: "🍣",
    clues: [
      "I began as a method of preservation, not a delicacy.",
      "My homeland reveres me as an art form requiring years of training.",
      "Vinegar is the secret that makes me who I am.",
      "I am often wrapped in dark green sheets from the ocean.",
      "Raw fish sits atop seasoned rice.",
    ],
  },
  {
    dishName: "Tacos",
    acceptedAnswers: ["taco", "tacos"],
    emoji: "🌮",
    clues: [
      "I am older than the civilization that colonized my homeland.",
      "Street vendors are my truest ambassadors.",
      "Corn is my canvas, and everything else is art.",
      "I come soft or crunchy, never in between.",
      "Salsa, cilantro, and lime complete me.",
    ],
  },
  {
    dishName: "Ramen",
    acceptedAnswers: ["ramen", "ramen noodle", "ramen noodles"],
    emoji: "🍜",
    clues: [
      "I crossed an ocean to find my true identity in a new land.",
      "Hours of slow heat create the liquid gold I swim in.",
      "Wheat and alkaline water give me my distinctive bounce.",
      "A soft-boiled egg often crowns my surface.",
      "Japanese noodle soup served with rich broth and toppings.",
    ],
  },
  {
    dishName: "Pad Thai",
    acceptedAnswers: ["pad thai", "padthai"],
    emoji: "🍝",
    clues: [
      "A prime minister helped make me a symbol of national pride.",
      "Sweet, sour, and salty dance in perfect balance on my stage.",
      "Tamarind gives me my distinctive tangy personality.",
      "Rice noodles are stir-fried in a blazing hot wok.",
      "Peanuts and lime are my finishing touch from Thailand.",
    ],
  },
  {
    dishName: "Croissant",
    acceptedAnswers: ["croissant", "croissants"],
    emoji: "🥐",
    clues: [
      "My shape tells the story of a military victory centuries ago.",
      "I require extreme patience — fold, chill, repeat.",
      "Butter accounts for over a quarter of my weight.",
      "Paris adopted me, though Vienna claims to have invented me.",
      "A flaky, crescent-shaped pastry best enjoyed warm.",
    ],
  },
  {
    dishName: "Hummus",
    acceptedAnswers: ["hummus", "humous", "houmous"],
    emoji: "🫘",
    clues: [
      "I am one of the oldest prepared foods in human history.",
      "The fertile crescent was my birthplace thousands of years ago.",
      "Tahini gives me my silky, nutty undertone.",
      "I'm made by blending cooked chickpeas with lemon and garlic.",
      "A creamy Middle Eastern dip served with warm pita.",
    ],
  },
  {
    dishName: "Fish and Chips",
    acceptedAnswers: ["fish and chips", "fish & chips", "fish n chips"],
    emoji: "🐟",
    clues: [
      "I was working-class fuel during the industrial revolution.",
      "Newspaper was once my most common plate.",
      "Malt vinegar and salt are my best companions.",
      "Battered white fish fried to golden perfection.",
      "Britain's most famous takeaway, served with thick-cut fries.",
    ],
  },
  {
    dishName: "Biryani",
    acceptedAnswers: ["biryani", "biriyani", "briyani"],
    emoji: "🍚",
    clues: [
      "Mughal emperors demanded I be served at every royal feast.",
      "Saffron paints me gold, and rose water perfumes my soul.",
      "I am layered, not mixed — each stratum tells a different story.",
      "Basmati rice and aromatic spices are slow-cooked together.",
      "India's beloved layered rice dish with meat or vegetables.",
    ],
  },
  {
    dishName: "Caesar Salad",
    acceptedAnswers: ["caesar salad", "caesar", "cesaer salad"],
    emoji: "🥗",
    clues: [
      "I was invented on a busy Fourth of July weekend.",
      "A restaurant in Tijuana, Mexico is where I first appeared.",
      "Anchovies hide in my dressing, surprising many who love me.",
      "Romaine lettuce and croutons are my essential companions.",
      "A creamy, garlicky salad topped with parmesan shavings.",
    ],
  },
  {
    dishName: "Chocolate Chip Cookies",
    acceptedAnswers: [
      "chocolate chip cookie",
      "chocolate chip cookies",
      "cookies",
      "cookie",
    ],
    emoji: "🍪",
    clues: [
      "I was a happy accident at a Massachusetts inn in the 1930s.",
      "Ruth Wakefield expected me to melt completely — I didn't.",
      "Brown sugar gives me my chewy center and crispy edges.",
      "Nestlé bought the recipe for a lifetime supply of chocolate.",
      "America's favorite cookie with melty chocolate pieces.",
    ],
  },
  {
    dishName: "Pho",
    acceptedAnswers: ["pho", "pho bo", "pho ga"],
    emoji: "🍲",
    clues: [
      "French colonialism accidentally contributed to my creation.",
      "Star anise and cinnamon make my broth hauntingly aromatic.",
      "My broth simmers for up to 24 hours to reach perfection.",
      "Rice noodles float in a deeply savory, clear broth.",
      "Vietnam's national soup, served with herbs, lime, and sriracha.",
    ],
  },
  {
    dishName: "Guacamole",
    acceptedAnswers: ["guacamole", "guac"],
    emoji: "🥑",
    clues: [
      "The Aztecs called my main ingredient 'ahuacatl' — a fertility symbol.",
      "I am best when my base is perfectly ripe — too early or late ruins me.",
      "A stone mortar called a molcajete is my traditional birthplace.",
      "Lime juice, cilantro, and onion join mashed green fruit.",
      "Mexico's famous avocado dip, essential for chips and tacos.",
    ],
  },
  {
    dishName: "Tiramisu",
    acceptedAnswers: ["tiramisu", "tiramisù"],
    emoji: "🍰",
    clues: [
      "My name translates to 'pick me up' or 'lift me up.'",
      "I was born in the Veneto region of northeastern Italy.",
      "Espresso-soaked ladyfingers form my foundation layers.",
      "Mascarpone cream and cocoa dust crown my top.",
      "Italy's beloved coffee-flavored layered dessert.",
    ],
  },
  {
    dishName: "Falafel",
    acceptedAnswers: ["falafel", "falafels"],
    emoji: "🧆",
    clues: [
      "I may be one of the oldest street foods still eaten today.",
      "Egypt and Lebanon both claim me as their own creation.",
      "I am made from raw, soaked legumes — never cooked before frying.",
      "Deep-fried balls or patties made from ground chickpeas.",
      "A Middle Eastern classic often served in pita with tahini.",
    ],
  },
];
