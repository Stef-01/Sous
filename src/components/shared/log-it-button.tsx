"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useNutritionDiary } from "@/lib/hooks/use-nutrition-diary";
import { toast } from "@/lib/hooks/use-toast";
import { haptic } from "@/lib/motion/haptics";
import { cn } from "@/lib/utils/cn";

/**
 * LogItButton (W2) — the one-tap "I ate this". Writes a cooked-dish diary entry
 * with smart defaults (today, 1 serving), a commit haptic, and a confirm toast.
 * No form, no modal. Remove/adjust lives in the diary day view.
 */
export function LogItButton({
  slug,
  name,
  servings = 1,
  className,
}: {
  slug: string;
  name: string;
  servings?: number;
  className?: string;
}) {
  const { logCook } = useNutritionDiary();
  const [justLogged, setJustLogged] = useState(false);

  const onLog = () => {
    logCook(slug, name, servings);
    haptic("commit");
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 1800);
    toast.push({
      variant: "success",
      emoji: "🍽️",
      title: `Logged ${name}`,
      body: "Added to today's diary.",
      dedupKey: `log-${slug}`,
    });
  };

  return (
    <button
      type="button"
      onClick={onLog}
      aria-label={`Log ${name} to today's diary`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
        justLogged
          ? "bg-[var(--nourish-green)]/12 text-[var(--nourish-green)]"
          : "bg-[var(--nourish-green)] text-white hover:opacity-90",
        className,
      )}
    >
      {justLogged ? <Check size={13} /> : <Plus size={13} />}
      {justLogged ? "Logged" : "Log it"}
    </button>
  );
}
