"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Win-screen celebration animation layers, extracted verbatim from win-screen
 * so that 1163-line file stays focused on the win flow. Both are pure,
 * self-contained, props-less overlays (pointer-events disabled, aria-hidden)
 * that fire once on mount; they hold no win-screen state.
 */

// ── CSS confetti particles ────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  "#2D6A4F", // nourish-green
  "#D4A84B", // nourish-gold
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
];

interface ConfettiParticle {
  id: number;
  x: number;
  xEnd: number;
  color: string;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
  isCircle: boolean;
  isSquare: boolean;
}

function generateConfetti(): ConfettiParticle[] {
  return Array.from({ length: 50 }, (_, i) => {
    const startX = 40 + (Math.random() - 0.5) * 60;
    const drift = (i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 15);
    return {
      id: i,
      x: startX,
      xEnd: startX + drift,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 0.5,
      duration: 1.8 + Math.random() * 1.2,
      size: 5 + Math.random() * 8,
      rotation: Math.random() * 360,
      isCircle: i % 4 === 0,
      isSquare: i % 3 !== 0,
    };
  });
}

export function ConfettiLayer({ accent }: { accent?: string | null }) {
  const reducedMotion = useReducedMotion();
  const [particles] = useState(generateConfetti);
  // Celebratory motion → skip entirely for reduced-motion users (the win
  // headline + chips still convey the moment). Normal users are unaffected.
  if (reducedMotion) return null;
  // W22b — the celebration respects the dish's accent: two palette slots take
  // the cuisine colour so the rain reads dish-tinted, brand anchors kept.
  const tint = (c: string, i: number) =>
    accent &&
    (i % CONFETTI_COLORS.length === 2 || i % CONFETTI_COLORS.length === 5)
      ? accent
      : c;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: `${p.x}vw`,
            y: -20,
            rotate: p.rotation,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: `${p.xEnd}vw`,
            y: "110vh",
            rotate: p.rotation + 360 * 3,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.isSquare ? p.size * 0.5 : p.size,
            backgroundColor: tint(p.color, p.id),
            borderRadius: p.isCircle ? "50%" : 2,
          }}
        />
      ))}
    </div>
  );
}

/**
 * SparkleBurst — W22b animation #7. Spring-physics burst of small
 * sparkles from the center of the screen, fired once on mount.
 * Complements (does NOT replace) the existing falling-confetti layer;
 * sparkle gives the cook a sharper "earned" moment alongside the
 * background party. Pointer-events disabled. Respects reduced-motion
 * via Framer's useReducedMotion default.
 */
export function SparkleBurst({ accent }: { accent?: string | null }) {
  // Stable per-mount sparkle layout. Math.random() is impure under
  // the repo's react-compiler rule; useState lazy-init runs the
  // generator exactly once and never re-runs on re-render.
  const reducedMotion = useReducedMotion();
  const [sparkles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2;
      const distance = 110 + Math.random() * 60;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        delay: i * 0.022,
        even: i % 2 === 0,
      };
    }),
  );
  // W22b — white + the dish's accent (warm gold when no cuisine palette).
  const altColor = accent ?? "#FFD466";
  // Already gated at the win-screen call site too; self-gating keeps the
  // reduced-motion contract with the component regardless of caller.
  if (reducedMotion) return null;
  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/3 z-[5]"
      aria-hidden
      style={{ transform: "translate(-50%, -50%)" }}
    >
      {sparkles.map((s) => (
        <motion.span
          key={s.id}
          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
          animate={{
            x: s.x,
            y: s.y,
            scale: [0, 1.2, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.9,
            delay: s.delay,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute block rounded-full"
          style={{
            width: 8,
            height: 8,
            background: s.even ? "#FFFFFF" : altColor,
            boxShadow: `0 0 12px ${s.even ? "#FFFFFF" : altColor}aa`,
          }}
        />
      ))}
    </div>
  );
}
