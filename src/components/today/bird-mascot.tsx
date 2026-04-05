"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface BirdMascotProps {
  onCravingClick: () => void;
}

/**
 * Bird Mascot — compact inline bird with speech bubble.
 * Clicking the speech bubble opens the search popout.
 * Designed to sit alongside the StreakCounter in a row.
 */
export function BirdMascot({ onCravingClick }: BirdMascotProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      className="flex items-center gap-2.5"
    >
      {/* Speech bubble — primary trigger */}
      <button
        onClick={onCravingClick}
        className="relative flex items-center gap-2 rounded-2xl border border-[var(--nourish-green)]/15 bg-white px-4 py-2.5 shadow-sm
                   hover:shadow-md hover:border-[var(--nourish-green)]/30 hover:bg-[var(--nourish-green)]/3
                   transition-all duration-200 text-left group"
        type="button"
      >
        <Search size={15} className="text-[var(--nourish-subtext)] opacity-50 group-hover:text-[var(--nourish-green)] group-hover:opacity-100 transition-all shrink-0" />
        <span className="text-sm text-[var(--nourish-subtext)] group-hover:text-[var(--nourish-dark)] transition-colors">
          I&apos;m craving...
        </span>
        {/* Bubble tail pointing right toward bird */}
        <div
          className="absolute right-[-5px] top-1/2 -translate-y-1/2 h-2.5 w-2.5 rotate-45 border-r border-b
                     border-[var(--nourish-green)]/15 bg-white group-hover:border-[var(--nourish-green)]/30
                     transition-colors"
        />
      </button>

      {/* Bird mascot — smaller inline SVG */}
      <div className="shrink-0 ambient-float">
        <svg
          width="44"
          height="44"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Sous mascot bird"
          role="img"
        >
          {/* Body */}
          <ellipse cx="32" cy="36" rx="18" ry="16" fill="var(--nourish-green)" />
          <ellipse cx="32" cy="40" rx="12" ry="10" fill="var(--nourish-dark-green)" opacity="0.4" />
          {/* Head */}
          <circle cx="32" cy="22" r="12" fill="var(--nourish-green)" />
          {/* Eyes */}
          <circle cx="27" cy="20" r="3" fill="white" />
          <circle cx="37" cy="20" r="3" fill="white" />
          <circle cx="28" cy="19.5" r="1.5" fill="#0D0D0D" />
          <circle cx="38" cy="19.5" r="1.5" fill="#0D0D0D" />
          <circle cx="28.5" cy="18.5" r="0.5" fill="white" />
          <circle cx="38.5" cy="18.5" r="0.5" fill="white" />
          {/* Beak */}
          <path d="M30 24 L32 28 L34 24" fill="var(--nourish-gold)" />
          {/* Cheeks */}
          <circle cx="24" cy="24" r="2" fill="#E8A0A0" opacity="0.4" />
          <circle cx="40" cy="24" r="2" fill="#E8A0A0" opacity="0.4" />
          {/* Chef hat */}
          <ellipse cx="32" cy="12" rx="10" ry="4" fill="white" />
          <rect x="26" y="8" width="12" height="6" rx="2" fill="white" />
          <circle cx="32" cy="7" r="3" fill="white" />
          {/* Feet */}
          <path d="M26 51 L22 55 M26 51 L26 55 M26 51 L30 55" stroke="var(--nourish-gold)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M38 51 L34 55 M38 51 L38 55 M38 51 L42 55" stroke="var(--nourish-gold)" strokeWidth="1.5" strokeLinecap="round" />
          {/* Wings */}
          <path d="M14 34 Q10 38 14 42 Q16 40 16 36 Z" fill="var(--nourish-dark-green)" />
          <path d="M50 34 Q54 38 50 42 Q48 40 48 36 Z" fill="var(--nourish-dark-green)" />
        </svg>
      </div>
    </motion.div>
  );
}
