"use client";

import { useMemo, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface FriendCook {
  name: string;
  dishName: string;
  emoji: string;
  timeAgo: string;
}

// Real dish names from sides.json paired with appropriate emojis
const DISH_POOL: Array<{ name: string; emoji: string }> = [
  { name: "Caesar Salad", emoji: "🥗" },
  { name: "Garlic Bread", emoji: "🍞" },
  { name: "Roasted Broccoli", emoji: "🥦" },
  { name: "Miso Soup", emoji: "🍜" },
  { name: "Steamed Jasmine Rice", emoji: "🍚" },
  { name: "Bruschetta", emoji: "🍅" },
  { name: "Corn on the Cob", emoji: "🌽" },
  { name: "Guacamole", emoji: "🥑" },
  { name: "Cucumber Raita", emoji: "🥒" },
  { name: "Sautéed Mushrooms", emoji: "🍄" },
  { name: "Coleslaw", emoji: "🥬" },
  { name: "Tzatziki", emoji: "🫙" },
  { name: "Tomato Soup", emoji: "🍲" },
  { name: "Roasted Sweet Potatoes", emoji: "🍠" },
  { name: "Edamame", emoji: "🫛" },
  { name: "Pickled Vegetables", emoji: "🥒" },
  { name: "Naan Bread", emoji: "🫓" },
  { name: "Steamed Bok Choy", emoji: "🥬" },
];

const FRIEND_NAMES = [
  "Zainab",
  "Hieu",
  "Kenji",
  "Beatriz",
  "Priya",
  "Carlos",
  "Mei",
  "Omar",
  "Sofia",
  "Jin",
];

const TIME_AGO_OPTIONS = [
  "just now",
  "5m ago",
  "12m ago",
  "23m ago",
  "1h ago",
  "2h ago",
  "3h ago",
  "yesterday",
];

/**
 * Build deterministic daily rotation of "friends cooked" entries.
 */
function buildFriendCooks(count: number): FriendCook[] {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000,
  );

  const friends: FriendCook[] = [];
  const usedDishes = new Set<number>();

  for (let i = 0; i < count; i++) {
    const nameIdx = (dayOfYear + i * 3) % FRIEND_NAMES.length;
    const timeIdx = (dayOfYear + i * 5) % TIME_AGO_OPTIONS.length;

    let dishIdx = (dayOfYear * 7 + i * 13) % DISH_POOL.length;
    // Avoid repeating dishes
    while (usedDishes.has(dishIdx)) {
      dishIdx = (dishIdx + 1) % DISH_POOL.length;
    }
    usedDishes.add(dishIdx);

    friends.push({
      name: FRIEND_NAMES[nameIdx],
      dishName: DISH_POOL[dishIdx].name,
      emoji: DISH_POOL[dishIdx].emoji,
      timeAgo: TIME_AGO_OPTIONS[timeIdx],
    });
  }

  return friends;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24,
      delay: i * 0.07,
    },
  }),
};

/**
 * Friends Strip — social proof section below the fold on Today page.
 * Shows what "friends" recently cooked as a horizontal scrollable card row.
 * Uses deterministic daily rotation against real dish names.
 */
export function FriendsStrip({
  onDishSelect,
}: {
  onDishSelect?: (dishName: string) => void;
}) {
  const friends = useMemo(() => buildFriendCooks(6), []);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="space-y-2.5">
      <h3 className="text-[10px] font-bold tracking-[0.12em] text-[var(--nourish-subtext)] uppercase px-1">
        Friends cooked recently
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {friends.map((friend, idx) => (
          <motion.button
            key={`${friend.name}-${friend.dishName}`}
            type="button"
            custom={idx}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            variants={cardVariants}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDishSelect?.(friend.dishName)}
            className="flex flex-col items-center justify-between gap-1.5 rounded-xl bg-white shadow-sm border border-neutral-100/80 p-3 shrink-0 snap-start cursor-pointer transition-shadow hover:shadow-md"
            style={{ width: 136, height: 152 }}
          >
            {/* Emoji */}
            <div className="flex items-center justify-center w-full flex-1">
              <span
                style={{ fontSize: 44, lineHeight: 1 }}
                role="img"
                aria-label={friend.dishName}
              >
                {friend.emoji}
              </span>
            </div>

            {/* Dish name */}
            <span className="text-[11px] font-semibold text-[var(--nourish-dark)] text-center leading-tight line-clamp-2 w-full">
              {friend.dishName}
            </span>

            {/* Friend + time */}
            <div className="flex items-center justify-between w-full gap-1">
              <span className="text-[10px] text-[var(--nourish-subtext)] font-medium truncate">
                {friend.name}
              </span>
              <span className="text-[9px] text-[var(--nourish-subtext)]/60 shrink-0">
                {friend.timeAgo}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
