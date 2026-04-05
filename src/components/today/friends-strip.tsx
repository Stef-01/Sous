"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { sides } from "@/data";

interface FriendCook {
  name: string;
  dishName: string;
  dishImage: string;
}

// Fixed friend names — rotated against real side dish data
const FRIEND_NAMES = [
  "Zainab", "Hieu", "Kenji", "Beatriz", "Priya",
  "Carlos", "Mei", "Omar", "Sofia", "Jin",
];

/**
 * Build a deterministic daily rotation of "friends cooked" entries
 * using real side dish images from the data layer.
 */
function buildFriendCooks(count: number): FriendCook[] {
  // Use day-of-year as rotation seed for deterministic daily variety
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );

  // Filter sides that have usable images
  const pool = sides.filter((s) => s.imageUrl);

  const friends: FriendCook[] = [];
  for (let i = 0; i < count; i++) {
    const sideIdx = (dayOfYear * 7 + i * 13) % pool.length;
    const nameIdx = (dayOfYear + i) % FRIEND_NAMES.length;
    const side = pool[sideIdx];

    friends.push({
      name: FRIEND_NAMES[nameIdx],
      dishName: side.name,
      dishImage: side.imageUrl,
    });
  }

  return friends;
}

/**
 * Friends Strip — shows what "friends" recently cooked.
 * Uses real side dish images with deterministic daily rotation.
 */
export function FriendsStrip() {
  const friends = useMemo(() => buildFriendCooks(4), []);

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

      <div className="flex justify-between pb-2">
        {friends.map((friend, idx) => (
          <motion.div
            key={friend.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.35 + idx * 0.08 }}
            className="flex flex-col items-center gap-1 group cursor-pointer"
          >
            {/* Food image circle */}
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-neutral-100 group-hover:border-[var(--nourish-green)]/40 bg-neutral-50 transition-colors">
              {/* Fallback emoji — visible when image fails */}
              <span className="absolute inset-0 flex items-center justify-center text-lg">🍽️</span>
              <img
                src={friend.dishImage}
                alt={friend.dishName}
                className="relative h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Dish name */}
            <span className="text-[10px] font-medium text-[var(--nourish-dark)] text-center max-w-[64px] truncate">
              {friend.dishName}
            </span>

            {/* Friend name */}
            <span className="text-[10px] text-[var(--nourish-subtext)]">
              {friend.name}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
