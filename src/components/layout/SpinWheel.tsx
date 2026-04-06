"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { meals } from "@/data";

interface SpinWheelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (mealName: string) => void;
  verifiedOnly?: boolean;
}

const WHEEL_COLORS = [
  "#2D5A3D", "#8C1515", "#D4A847", "#4A7C6F", "#B85C38",
  "#5B8C5A", "#C4956A", "#3D6B5E", "#A0522D", "#6B8E6B",
  "#D4886B", "#4E8975", "#C17F59", "#7BA37B", "#B07048",
  "#5A9E7A",
];

export default function SpinWheel({ open, onClose, onSelect, verifiedOnly = false }: SpinWheelProps) {
  const pool = useMemo(
    () => (verifiedOnly ? meals.filter((m) => m.nourishVerified) : meals),
    [verifiedOnly]
  );

  // Pick 12 random meals for the wheel on each open
  const [wheelMeals, setWheelMeals] = useState<string[]>([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [landed, setLanded] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const SEGMENT_COUNT = 12;
  const SEGMENT_ANGLE = 360 / SEGMENT_COUNT;

  /* eslint-disable react-hooks/set-state-in-effect -- reset wheel state when dialog opens */
  useEffect(() => {
    if (open) {
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setWheelMeals(shuffled.slice(0, SEGMENT_COUNT).map((m) => m.name));
      setSpinning(false);
      setRotation(0);
      setLanded(null);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [open, pool]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Esc to close (when not spinning)
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !spinning) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, spinning, onClose]);

  const handleSpin = useCallback(() => {
    if (spinning || wheelMeals.length === 0) return;
    setSpinning(true);
    setLanded(null);

    // Pick a random winning index
    const winnerIndex = Math.floor(Math.random() * SEGMENT_COUNT);

    // Calculate rotation: multiple full spins + offset to land winner at top (needle)
    // Needle is at top (0°). Segment i is centered at i * SEGMENT_ANGLE.
    // We rotate clockwise, so to land segment winnerIndex at the top:
    const fullSpins = 5 + Math.floor(Math.random() * 3); // 5-7 full spins
    const targetAngle = winnerIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    // We need the wheel to rotate so that targetAngle aligns with 0° (top)
    // Since CSS rotates clockwise: finalRotation = fullSpins * 360 + (360 - targetAngle)
    const finalRotation = rotation + fullSpins * 360 + (360 - targetAngle);

    setRotation(finalRotation);

    // After spin animation completes, show the result
    timeoutRef.current = setTimeout(() => {
      setLanded(wheelMeals[winnerIndex]);
      setSpinning(false);
    }, 4200); // match CSS transition duration
  }, [spinning, wheelMeals, rotation, SEGMENT_ANGLE, SEGMENT_COUNT]);

  const handleChoose = useCallback(() => {
    if (landed) {
      onSelect(landed);
      onClose();
    }
  }, [landed, onSelect, onClose]);

  // Truncate meal name to fit in segment
  const truncate = (name: string, max: number) =>
    name.length > max ? name.slice(0, max - 1) + "\u2026" : name;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={!spinning ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Wheel container */}
          <motion.div
            className="relative z-10 flex flex-col items-center gap-6"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Title */}
            <motion.p
              className="text-white font-serif text-xl md:text-2xl tracking-wide"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              Spin the Wheel
            </motion.p>

            {/* Wheel + needle */}
            <div className="relative">
              {/* Needle / pointer at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                  <path
                    d="M14 32 L2 4 Q0 0 4 0 L24 0 Q28 0 26 4 Z"
                    fill="#fff"
                    stroke="#d6d3d1"
                    strokeWidth="1"
                  />
                </svg>
              </div>

              {/* Wheel */}
              <div
                className="w-72 h-72 md:w-80 md:h-80 rounded-full relative overflow-hidden shadow-2xl ring-4 ring-white/30"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning
                    ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                    : "none",
                }}
              >
                <svg viewBox="0 0 300 300" className="w-full h-full">
                  {wheelMeals.map((name, i) => {
                    const startAngle = i * SEGMENT_ANGLE - 90; // -90 so first segment starts at top
                    const endAngle = startAngle + SEGMENT_ANGLE;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const cx = 150;
                    const cy = 150;
                    const r = 150;

                    const x1 = cx + r * Math.cos(startRad);
                    const y1 = cy + r * Math.sin(startRad);
                    const x2 = cx + r * Math.cos(endRad);
                    const y2 = cy + r * Math.sin(endRad);

                    const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;
                    const pathD = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2} Z`;

                    // Text angle: center of segment
                    const midAngle = startAngle + SEGMENT_ANGLE / 2;
                    const textR = r * 0.62;
                    const textRad = (midAngle * Math.PI) / 180;
                    const tx = cx + textR * Math.cos(textRad);
                    const ty = cy + textR * Math.sin(textRad);

                    return (
                      <g key={i}>
                        <path
                          d={pathD}
                          fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="1"
                        />
                        <text
                          x={tx}
                          y={ty}
                          fill="white"
                          fontSize="9"
                          fontFamily="Inter, sans-serif"
                          fontWeight="500"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                        >
                          {truncate(name, 16)}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center circle */}
                  <circle cx="150" cy="150" r="22" fill="white" stroke="#d6d3d1" strokeWidth="1.5" />
                  <text
                    x="150"
                    y="150"
                    fill="#2D5A3D"
                    fontSize="8"
                    fontFamily="Inter, sans-serif"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                    letterSpacing="0.05em"
                  >
                    N
                  </text>
                </svg>
              </div>
            </div>

            {/* Action area */}
            <div className="flex flex-col items-center gap-3">
              <AnimatePresence mode="wait">
                {landed ? (
                  <motion.div
                    key="result"
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-white/80 text-sm">It landed on...</p>
                    <p className="text-white font-serif text-lg md:text-xl">{landed}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleChoose}
                        className="px-6 py-2.5 bg-nourish-button hover:bg-nourish-button-hover text-white text-sm font-medium rounded-full transition-colors"
                      >
                        Let&apos;s go!
                      </button>
                      <button
                        onClick={handleSpin}
                        className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/20 transition-colors"
                      >
                        Spin again
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="spin-btn"
                    onClick={handleSpin}
                    disabled={spinning}
                    className="px-8 py-3 bg-white text-nourish-dark text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    whileHover={!spinning ? { scale: 1.05 } : {}}
                    whileTap={!spinning ? { scale: 0.95 } : {}}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {spinning ? "Spinning..." : "SPIN!"}
                  </motion.button>
                )}
              </AnimatePresence>

              {!spinning && !landed && (
                <button
                  onClick={onClose}
                  className="text-white/50 text-xs hover:text-white/80 transition-colors mt-1"
                >
                  or press Esc to close
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
