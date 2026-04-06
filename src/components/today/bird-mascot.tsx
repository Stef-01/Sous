"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

/**
 * OwlAvatar — small 28x28 owl head for the header profile position.
 * Simplified SVG: head + eyes + chef hat + beak + cheeks only.
 * Tappable with a Duolingo-style spring bounce.
 */
export function OwlAvatar({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--nourish-green)]/10 border border-[var(--nourish-green)]/15 ambient-float"
      type="button"
      aria-label="Open search"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 64 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sous mascot"
        role="img"
      >
        {/* Head */}
        <circle cx="32" cy="26" r="14" fill="var(--nourish-green)" />
        {/* Eyes */}
        <circle cx="26" cy="24" r="3.5" fill="white" />
        <circle cx="38" cy="24" r="3.5" fill="white" />
        <circle cx="27" cy="23.5" r="1.8" fill="#0D0D0D" />
        <circle cx="39" cy="23.5" r="1.8" fill="#0D0D0D" />
        <circle cx="27.5" cy="22.5" r="0.6" fill="white" />
        <circle cx="39.5" cy="22.5" r="0.6" fill="white" />
        {/* Beak */}
        <path d="M30 29 L32 33 L34 29" fill="var(--nourish-gold)" />
        {/* Cheeks */}
        <circle cx="22" cy="28" r="2.5" fill="#E8A0A0" opacity="0.4" />
        <circle cx="42" cy="28" r="2.5" fill="#E8A0A0" opacity="0.4" />
        {/* Chef hat */}
        <ellipse cx="32" cy="14" rx="11" ry="4.5" fill="white" />
        <rect x="25" y="9" width="14" height="7" rx="2" fill="white" />
        <circle cx="32" cy="8" r="3.5" fill="white" />
      </svg>
    </motion.button>
  );
}

/**
 * CravingSearchBar — standalone centered search trigger.
 * "I'm craving..." speech bubble without the bird mascot attached.
 */
export function CravingSearchBar({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }}
      className="flex justify-center"
    >
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="flex items-center gap-2 rounded-2xl border border-[var(--nourish-green)]/15 bg-white px-5 py-2.5 shadow-sm
                   hover:shadow-md hover:border-[var(--nourish-green)]/30 hover:bg-[var(--nourish-green)]/3
                   transition-all duration-200 text-left group"
        type="button"
      >
        <Search
          size={15}
          className="text-[var(--nourish-subtext)] opacity-50 group-hover:text-[var(--nourish-green)] group-hover:opacity-100 transition-all shrink-0"
        />
        <span className="text-sm text-[var(--nourish-subtext)] group-hover:text-[var(--nourish-dark)] transition-colors">
          I&apos;m craving...
        </span>
      </motion.button>
    </motion.div>
  );
}
