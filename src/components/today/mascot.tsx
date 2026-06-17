"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import type { MascotMood } from "./mascot-mood";

/* Black-and-rust Doberman palette — matches the Tamagotchi pet (pixel-doberman). */
const COAT = "#2b2622";
const COAT_HL = "#463d34";
const RUST = "#bd6a26";
const RUST_HL = "#d98c48";
const NOSE = "#121212";
const EYE = "#f3c98a"; // warm amber, reads on the dark coat
const PUPIL = "#1a1714";
const INNER_EAR = "#e98b9c";
const TONGUE = "#ef9bb0";

/** Per-mood idle animation for the head (reduced-motion drops them all). */
const MOOD_ANIM: Record<
  MascotMood,
  { animate: Record<string, number[]>; duration: number; repeatDelay: number }
> = {
  idle: {
    animate: { rotate: [0, -4, 0, 3, 0] },
    duration: 5,
    repeatDelay: 3.5,
  },
  happy: {
    animate: { rotate: [0, -3, 0, 3, 0], y: [0, -2.5, 0, -1, 0] },
    duration: 1.5,
    repeatDelay: 1.8,
  },
  sleepy: { animate: { y: [0, 1.5, 0] }, duration: 4, repeatDelay: 0.5 },
  alert: {
    animate: { rotate: [0, -7, 0, -7, 0] },
    duration: 0.9,
    repeatDelay: 3,
  },
};

/** Eyes recompose per mood; everything else (ears/head/muzzle/toque) is constant. */
function DobeEyes({ mood }: { mood: MascotMood }) {
  if (mood === "happy") {
    return (
      <>
        <path
          d="M24 29 Q26.5 25.5 29 29"
          stroke={EYE}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M35 29 Q37.5 25.5 40 29"
          stroke={EYE}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (mood === "sleepy") {
    return (
      <>
        <path
          d="M24 28 L29 28"
          stroke={EYE}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M35 28 L40 28"
          stroke={EYE}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    );
  }
  // idle + alert share almond eyes; alert opens them a touch wider.
  const ry = mood === "alert" ? 3.4 : 2.9;
  return (
    <>
      <ellipse cx="26.5" cy="28" rx="2.6" ry={ry} fill={EYE} />
      <ellipse cx="37.5" cy="28" rx="2.6" ry={ry} fill={EYE} />
      <circle cx="26.5" cy="28.4" r="1.4" fill={PUPIL} />
      <circle cx="37.5" cy="28.4" r="1.4" fill={PUPIL} />
      <circle cx="27.2" cy="27.2" r="0.6" fill="#fff" />
      <circle cx="38.2" cy="27.2" r="0.6" fill="#fff" />
    </>
  );
}

/**
 * DobermanAvatar — the Sous chef mascot in the Today header (replaces the owl).
 * A clean black-and-rust Doberman head with cropped ears, rust "eyebrow" dots,
 * a tan muzzle, and a tiny chef toque. Tappable (opens Profile & Settings); the
 * head idles with a gentle, MOOD-driven motion (W22).
 */
export function DobermanAvatar({
  onClick,
  ariaLabel = "Open profile and settings",
  mood = "idle",
}: {
  onClick: () => void;
  ariaLabel?: string;
  /** Bounded coach expression (W22). Defaults to the gentle idle tilt. */
  mood?: MascotMood;
}) {
  const reducedMotion = useReducedMotion();
  const m = MOOD_ANIM[mood];
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--nourish-green)]/15 bg-[var(--nourish-green)]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
      type="button"
      aria-label={ariaLabel}
    >
      <motion.svg
        animate={reducedMotion ? undefined : m.animate}
        transition={
          reducedMotion
            ? undefined
            : {
                duration: m.duration,
                repeat: Infinity,
                repeatDelay: m.repeatDelay,
                ease: "easeInOut",
              }
        }
        style={{ transformOrigin: "32px 30px" }}
        width="26"
        height="24"
        viewBox="0 0 64 58"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        {/* Cropped ears (the Doberman signature), standing tall */}
        <path d="M21 21 L24 3 L29 19 Z" fill={COAT} />
        <path d="M43 21 L40 3 L35 19 Z" fill={COAT} />
        <path d="M24 8 L25.5 16 L27.6 17 Z" fill={INNER_EAR} opacity="0.55" />
        <path d="M40 8 L38.5 16 L36.4 17 Z" fill={INNER_EAR} opacity="0.55" />

        {/* Head — broad crown tapering to the muzzle */}
        <path
          d="M20 23 C20 16 26 14 32 14 C38 14 44 16 44 23 L42 35 C40 45 36 49 32 50 C28 49 24 45 22 35 Z"
          fill={COAT}
        />
        {/* top-edge rim light */}
        <path
          d="M26 14 C38 14 44 16 44 23 L43.4 25 C43 17.6 38 16.4 32 16.4 C26 16.4 21 17.6 20.6 25 L20 23 C20 16 26 14 26 14 Z"
          fill={COAT_HL}
        />

        {/* Rust "eyebrow" dots */}
        <ellipse cx="26.5" cy="23.2" rx="2.4" ry="1.5" fill={RUST} />
        <ellipse cx="37.5" cy="23.2" rx="2.4" ry="1.5" fill={RUST} />

        {/* Eyes — recompose per mood */}
        <DobeEyes mood={mood} />

        {/* Tan muzzle — a sleek, narrow Doberman snout */}
        <path
          d="M28.5 34 C29.5 32.5 34.5 32.5 35.5 34 L34.2 41.5 C33.2 43.8 30.8 43.8 29.8 41.5 Z"
          fill={RUST}
        />
        <path
          d="M30 35.2 C30.9 34.2 33.1 34.2 34 35.2 L33.1 40 C32.4 41.6 31.6 41.6 30.9 40 Z"
          fill={RUST_HL}
        />

        {/* Nose + (happy) tongue */}
        <ellipse cx="32" cy="37.8" rx="2" ry="1.5" fill={NOSE} />
        <circle cx="31.2" cy="37.2" r="0.5" fill="#fff" opacity="0.5" />
        {mood === "happy" && (
          <path d="M30.6 41.5 Q32 44.5 33.4 41.5 Z" fill={TONGUE} />
        )}

        {/* Tiny puffy chef toque on the crown (Sous-chef brand) */}
        <ellipse cx="32" cy="13" rx="5.4" ry="1.9" fill="#fff" />
        <path
          d="M27.5 12.5 C26.5 7.5 30 6 32 6 C34 6 37.5 7.5 36.5 12.5 Z"
          fill="#fff"
        />
      </motion.svg>
    </motion.button>
  );
}

/**
 * CravingSearchBar  -  full-width search trigger.
 * The primary action on the Today page. Inviting and prominent.
 */
export function CravingSearchBar({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }}
    >
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
        className="group flex w-full items-center gap-3 rounded-2xl border border-[var(--nourish-border-strong)] bg-white px-4 py-3.5 text-left transition-colors duration-200
                   hover:border-[var(--nourish-green)]/45 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nourish-green)]/40"
        type="button"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--nourish-green)]/10">
          <Search size={15} className="text-[var(--nourish-green)]" />
        </div>
        <span className="text-sm font-medium text-[var(--nourish-subtext)] group-hover:text-[var(--nourish-dark)] transition-colors">
          What are you craving?
        </span>
        <span className="ml-auto text-xs text-[var(--nourish-green)] font-semibold">
          Go →
        </span>
      </motion.button>
    </motion.div>
  );
}
