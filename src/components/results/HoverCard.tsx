"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { SideDish } from "@/types";

interface HoverCardProps {
  side: SideDish;
  onSwap: () => void;
}

interface Benefit {
  id: string;
  label: string;
  color: string; // Tailwind text color class
  bgColor: string; // Tailwind bg color class
  icon: string;
}

// 🧠 Fun Heuristic Mapping Logic
function getNutritionalBenefits(side: SideDish): Benefit[] {
  const benefits: Benefit[] = [];
  const tags = side.tags.map((t) => t.toLowerCase());
  const cat = side.nutritionCategory;

  // 1. Core Category Benefits
  if (cat === "vegetable") {
    benefits.push({
      id: "gut-health",
      label: "Gut Health",
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      icon: "🌱",
    });
  } else if (cat === "protein") {
    benefits.push({
      id: "muscle",
      label: "Muscle Repair",
      color: "text-rose-700",
      bgColor: "bg-rose-50",
      icon: "💪",
    });
    benefits.push({
      id: "fullness",
      label: "Fullness",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: "😌",
    });
  } else if (cat === "carb") {
    benefits.push({
      id: "energy",
      label: "Energy Boost",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: "⚡",
    });
  }

  // 2. Tag-based Specifics
  if (tags.some((t) => ["yogurt", "curd", "kimchi", "fermented", "probiotic"].includes(t))) {
    benefits.push({
      id: "probiotics",
      label: "Probiotics",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: "🦠",
    });
  }

  if (tags.some((t) => ["spinach", "kale", "leafy", "greens", "broccoli"].includes(t))) {
    benefits.push({
      id: "iron",
      label: "Iron Boost",
      color: "text-teal-700",
      bgColor: "bg-teal-50",
      icon: "🔩",
    });
  }

  if (tags.some((t) => ["orange", "citrus", "lemon", "lime", "tomato", "capsicum", "pepper"].includes(t))) {
    benefits.push({
      id: "immunity",
      label: "Immunity",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      icon: "🛡️",
    });
  }

  if (tags.some((t) => ["carrot", "pumpkin", "squash", "sweet potato"].includes(t))) {
    benefits.push({
      id: "vision",
      label: "Vision",
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      icon: "👁️",
    });
  }

  if (tags.some((t) => ["fats", "avocado", "nuts", "seeds", "olive"].includes(t))) {
    benefits.push({
      id: "brain",
      label: "Brain Power",
      color: "text-pink-700",
      bgColor: "bg-pink-50",
      icon: "🧠",
    });
  }

  // 3. Fallbacks to ensure at least 2 badges for fun factor
  if (benefits.length < 2) {
    if (cat === "vegetable") {
      benefits.push({
        id: "vitamins",
        label: "Vitamins",
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: "💊",
      });
    } else if (cat === "carb") {
      benefits.push({
        id: "comfort",
        label: "Mood Boost",
        color: "text-yellow-700",
        bgColor: "bg-yellow-50",
        icon: "☀️",
      });
    }
  }

  // Deduplicate just in case
  const seen = new Set();
  return benefits.filter(b => {
    const duplicate = seen.has(b.id);
    seen.add(b.id);
    return !duplicate;
  }).slice(0, 3); // Max 3 badges
}

export default function HoverCard({ side, onSwap }: HoverCardProps) {
  const benefits = useMemo(() => getNutritionalBenefits(side), [side]);

  return (
    <motion.div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-stone-100/50 p-4 w-52 flex flex-col gap-3">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-widest text-nourish-subtext/70">
            Power Up
          </span>
          <span className="text-[10px] text-stone-300">
            ✨
          </span>
        </div>

        {/* Benefits Grid */}
        <div className="flex flex-col gap-2">
          {benefits.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${b.bgColor} transition-colors`}
            >
              <span className="text-base leading-none filter drop-shadow-sm">{b.icon}</span>
              <span className={`text-xs font-semibold ${b.color}`}>
                + {b.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow tip (match blur/color) */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 backdrop-blur-md border-b border-r border-stone-100/50 rotate-45 -mt-1.5 rounded-sm" />
    </motion.div>
  );
}
