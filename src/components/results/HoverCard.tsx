"use client";

import { motion } from "framer-motion";
import type { SideDish } from "@/types";
import SparkleEffect from "@/components/ui/SparkleEffect";

interface HoverCardProps {
  side: SideDish;
  onSwap: () => void;
}

export default function HoverCard({ side, onSwap }: HoverCardProps) {
  return (
    <motion.div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-auto"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.15 }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-stone-100 p-3 w-52">
        {/* Description */}
        <p className="text-xs text-nourish-subtext leading-relaxed line-clamp-2 mb-2">
          {side.description}
        </p>

        {/* Tags */}
        {side.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {side.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[10px] font-medium bg-stone-100 text-nourish-subtext rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Swap action */}
        <SparkleEffect count={8}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSwap();
            }}
            className="flex items-center gap-1.5 text-xs text-nourish-subtext hover:text-nourish-button transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Swap this side
          </button>
        </SparkleEffect>
      </div>

      {/* Arrow tip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b border-r border-stone-100 rotate-45 -mt-1" />
    </motion.div>
  );
}
