"use client";

import { motion } from "framer-motion";

interface FriendCook {
  name: string;
  dishName: string;
  dishImage: string;
}

// Hardcoded mock data — will connect to real social features later
const MOCK_FRIENDS: FriendCook[] = [
  {
    name: "Zainab",
    dishName: "Jollof Rice",
    dishImage:
      "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Hieu",
    dishName: "Pho Ga",
    dishImage:
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Kenji",
    dishName: "Sushi",
    dishImage:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&auto=format&fit=crop&q=80",
  },
  {
    name: "Beatriz",
    dishName: "Feijoada",
    dishImage:
      "https://images.unsplash.com/photo-1547592180-85f173990554?w=300&auto=format&fit=crop&q=80",
  },
];

interface FriendsStripProps {
  friends?: FriendCook[];
}

/**
 * Friends Strip — horizontal scroll of friends' recent cooks.
 * Creates social proof and community feel.
 * Hardcoded placeholder data for now.
 */
export function FriendsStrip({
  friends = MOCK_FRIENDS,
}: FriendsStripProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-2"
    >
      <h3 className="text-xs font-semibold text-[var(--nourish-subtext)] uppercase tracking-wide">
        Friends cooked recently
      </h3>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {friends.map((friend, idx) => (
          <motion.div
            key={friend.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + idx * 0.08, duration: 0.3 }}
            className="flex flex-col items-center gap-1 shrink-0 group cursor-pointer"
          >
            {/* Food image circle */}
            <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-neutral-100 group-hover:border-[var(--nourish-green)]/40 bg-neutral-50 transition-colors">
              <img
                src={friend.dishImage}
                alt={friend.dishName}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Dish name */}
            <span className="text-[10px] font-medium text-[var(--nourish-dark)] text-center max-w-[64px] truncate">
              {friend.dishName}
            </span>

            {/* Friend name */}
            <span className="text-[9px] text-[var(--nourish-subtext)]">
              {friend.name}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
