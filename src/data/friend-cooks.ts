/**
 * Friend-cooks seed — a small, honest, clearly-mock social feed.
 *
 * These are placeholders until a real social graph ships. Names are fictional,
 * time-ago values are recent so the feed feels alive without deception. Images
 * are all existing photos in `/public/food_images/` — no invented assets.
 *
 * When `useCookSessions().completedSessions` has data, we layer the user's
 * own cooks on top so their journey shows up in the same feed.
 */

export interface FriendCook {
  /** Stable synthetic ID. */
  id: string;
  /** Friend's short display name. First names only — feels personal. */
  friend: string;
  /** Single initial for the avatar circle when no photo is available. */
  initial: string;
  /** Dish name, matches an entry in meals.json / sides.json. */
  dish: string;
  /** Slug so taps can route into the craving search / cook flow. */
  dishSlug: string;
  /** Public food photo URL. */
  imageUrl: string;
  /** One-line reaction the friend left. */
  note?: string;
  /** Relative posted-at label ("3h", "yesterday"). Human-readable so we
   *  never leak a fake ISO timestamp into the DOM. */
  postedAgo: string;
  /** For the tiny warm glow on their avatar ring. */
  accent?: "rose" | "amber" | "green" | "sky" | "violet";
}

export const FRIEND_COOKS: FriendCook[] = [
  {
    id: "friend-1",
    friend: "Alex",
    initial: "A",
    dish: "Pasta Carbonara",
    dishSlug: "pasta-carbonara",
    imageUrl: "/food_images/pasta_carbonara.png",
    note: "Weeknight win, eggs were still glossy",
    postedAgo: "2h",
    accent: "amber",
  },
  {
    id: "friend-2",
    friend: "Priya",
    initial: "P",
    dish: "Butter Chicken",
    dishSlug: "butter-chicken",
    imageUrl: "/food_images/butter_chicken.png",
    note: "Finally nailed the sauce ratio",
    postedAgo: "5h",
    accent: "rose",
  },
  {
    id: "friend-3",
    friend: "Jordan",
    initial: "J",
    dish: "Pad Thai",
    dishSlug: "pad-thai",
    imageUrl: "/food_images/pad_thai.png",
    note: "Used the tamarind paste, worth it",
    postedAgo: "yesterday",
    accent: "green",
  },
  {
    id: "friend-4",
    friend: "Maya",
    initial: "M",
    dish: "Bibimbap",
    dishSlug: "bibimbap",
    imageUrl: "/food_images/bibimbap.png",
    note: "Crispy rice at the bottom is everything",
    postedAgo: "1d",
    accent: "sky",
  },
  {
    id: "friend-5",
    friend: "Sam",
    initial: "S",
    dish: "Tonkotsu Ramen",
    dishSlug: "tonkotsu-ramen",
    imageUrl: "/food_images/tonkotsu_ramen.png",
    note: "3-hour broth. Worth every minute.",
    postedAgo: "2d",
    accent: "amber",
  },
  {
    id: "friend-6",
    friend: "Nikhil",
    initial: "N",
    dish: "Chicken Tikka Masala",
    dishSlug: "chicken-tikka-masala",
    imageUrl: "/food_images/chicken_tikka_masala.png",
    note: "Marinate overnight, trust me",
    postedAgo: "2d",
    accent: "rose",
  },
  {
    id: "friend-7",
    friend: "Leah",
    initial: "L",
    dish: "Grilled Salmon",
    dishSlug: "grilled-salmon",
    imageUrl: "/food_images/grilled_salmon.png",
    note: "Lemon + dill, simple and clean",
    postedAgo: "3d",
    accent: "sky",
  },
  {
    id: "friend-8",
    friend: "Rafi",
    initial: "R",
    dish: "Pho",
    dishSlug: "pho",
    imageUrl: "/food_images/pho.png",
    note: "Saturday morning therapy",
    postedAgo: "3d",
    accent: "violet",
  },
];
