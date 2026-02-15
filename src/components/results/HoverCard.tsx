"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export interface HoverContextProps {
  name: string;
  tags: string[];
  nutritionCategory?: "protein" | "carb" | "vegetable";
  onSwap?: () => void;
}

interface Benefit {
  id: string;
  label: string;
  color: string; // Tailwind text color class
  bgColor: string; // Tailwind bg color class
  icon: string;
}

// 🧠 Fun Heuristic Mapping Logic
function getNutritionalBenefits(tags: string[], cat?: string): Benefit[] {
  const benefits: Benefit[] = [];
  const lowerTags = tags.map((t) => t.toLowerCase());

  // 0. Red Flags / Warnings (High Priority)
  if (lowerTags.some((t) => ["rice", "naan", "bread", "pasta", "potato", "fried", "deep-fried", "sugar", "sweet"].includes(t))) {
    benefits.push({
      id: "high-carb",
      label: "Heavy / High Carb",
      color: "text-red-700",
      bgColor: "bg-red-50",
      icon: "⚠️",
    });
  }

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
      label: "High Satiety",
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      icon: "😌",
    });
  } else if (cat === "carb" && !lowerTags.includes("sugar")) {
    benefits.push({
      id: "energy",
      label: "Quick Energy",
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      icon: "⚡",
    });
  }

  // 2. Tag-based Evidence
  if (lowerTags.some((t) => ["yogurt", "curd", "kimchi", "fermented", "probiotic"].includes(t))) {
    benefits.push({
      id: "probiotics",
      label: "Probiotics",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      icon: "🦠",
    });
  }

  // Diabetes Friendly Check (Green Flag)
  // Logic: Veggie OR specific healthy tags, AND no bad tags.
  const isDiabetesFriendly = (
    (cat === "vegetable" || lowerTags.some((t) => ["lentil", "dal", "bean", "fish", "salmon", "nuts", "seeds", "chicken", "turkey"].includes(t))) &&
    !lowerTags.some((t) => ["potato", "alco", "fried", "deep-fried", "sugar", "sweet", "rice", "bread", "naan", "pasta", "fruit"].includes(t))
  );

  if (isDiabetesFriendly) {
    benefits.push({
      id: "diabetes",
      label: "Diabetes Friendly",
      color: "text-sky-700",
      bgColor: "bg-sky-50",
      icon: "💙",
    });
  }

  if (lowerTags.some((t) => ["spinach", "kale", "leafy", "greens", "broccoli", "lentil", "dal"].includes(t))) {
    benefits.push({
      id: "iron",
      label: "Iron Boost",
      color: "text-teal-700",
      bgColor: "bg-teal-50",
      icon: "🔩",
    });
  }

  if (lowerTags.some((t) => ["orange", "citrus", "lemon", "lime", "tomato", "capsicum", "pepper"].includes(t))) {
    benefits.push({
      id: "immunity",
      label: "Vit C / Immunity",
      color: "text-orange-700",
      bgColor: "bg-orange-50",
      icon: "🛡️",
    });
  }

  if (lowerTags.some((t) => ["fish", "salmon", "omega", "seeds", "flax", "walnut"].includes(t))) {
    benefits.push({
      id: "brain",
      label: "Omega-3 / Brain",
      color: "text-pink-700",
      bgColor: "bg-pink-50",
      icon: "🧠",
    });
  }

  if (lowerTags.some((t) => ["chicken", "turkey", "lean"].includes(t))) {
    benefits.push({
      id: "lean-protein",
      label: "Lean Protein",
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      icon: "🏋️",
    });
  }

  // 3. Fallbacks (but strictly evidence based)
  if (benefits.length < 2) {
    if (cat === "vegetable") {
      benefits.push({
        id: "fiber",
        label: "Fiber Rich",
        color: "text-green-700",
        bgColor: "bg-green-50",
        icon: "🌾",
      });
    }
  }

  // Deduplicate
  const seen = new Set();
  return benefits.filter(b => {
    const duplicate = seen.has(b.id);
    seen.add(b.id);
    return !duplicate;
  }).slice(0, 3); // Max 3 badges
}

export default function HoverCard({ name, tags, nutritionCategory, onSwap }: HoverContextProps) {
  const benefits = useMemo(() => getNutritionalBenefits(tags, nutritionCategory), [tags, nutritionCategory]);

  return (
    <motion.div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none"
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-stone-100/50 p-3 w-48 flex flex-col gap-2">
        {/* Name Header - specific to item */}
        <div className="flex items-center justify-center border-b border-stone-100 pb-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wide text-nourish-dark/80 text-center leading-tight">
            {name}
          </span>
        </div>

        {/* Benefits Grid */}
        <div className="flex flex-col gap-1.5">
          {benefits.length > 0 ? benefits.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${b.bgColor} transition-colors`}
            >
              <span className="text-sm leading-none filter drop-shadow-sm">{b.icon}</span>
              <span className={`text-[11px] font-semibold ${b.color}`}>
                {b.label}
              </span>
            </div>
          )) : (
            <div className="px-2 py-1 text-center">
              <span className="text-[10px] text-stone-400 italic">No specific badges found</span>
            </div>
          )}
        </div>
      </div>

      {/* Arrow tip (match blur/color) */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 backdrop-blur-md border-b border-r border-stone-100/50 rotate-45 -mt-1.5 rounded-sm" />
    </motion.div>
  );
}
