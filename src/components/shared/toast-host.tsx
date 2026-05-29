"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  useActiveToast,
  toast as toastApi,
  type Toast,
} from "@/lib/hooks/use-toast";

const VARIANT_STYLES: Record<
  Toast["variant"],
  { bg: string; shadow: string; label: string }
> = {
  achievement: {
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    shadow: "shadow-amber-500/20",
    label: "Achievement Unlocked",
  },
  "level-up": {
    bg: "bg-gradient-to-br from-[var(--nourish-green)] to-[var(--nourish-dark-green)]",
    shadow: "shadow-[var(--nourish-green)]/20",
    label: "Level Up",
  },
  success: {
    bg: "bg-[#0d0d0d]",
    shadow: "shadow-black/20",
    label: "",
  },
  info: {
    bg: "bg-[#1a1a1a]",
    shadow: "shadow-black/15",
    label: "",
  },
};

/**
 * Global toast host. Mount once in the root layout.
 * Renders the head of the shared toast queue with auto-dismiss.
 */
export function ToastHost() {
  const active = useActiveToast();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!active) return;
    const duration = active.duration ?? 4200;
    if (duration <= 0) return;
    const timer = setTimeout(() => {
      toastApi.dismiss(active.id);
    }, duration);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] mx-auto flex max-w-sm px-4"
    >
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            // W22b: achievement + level-up toasts slide up further +
            // settle with a softer spring so they feel like a celebration
            // sheet rather than a notification chip. Other variants keep
            // the original tighter motion. Reduced-motion: collapses to
            // an opacity-only fade with no y-translate.
            initial={
              reducedMotion
                ? { opacity: 0 }
                : active.variant === "achievement" ||
                    active.variant === "level-up"
                  ? { opacity: 0, y: 80, scale: 0.86 }
                  : { opacity: 0, y: 40, scale: 0.92 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reducedMotion
                ? { opacity: 0 }
                : active.variant === "achievement" ||
                    active.variant === "level-up"
                  ? { opacity: 0, y: 60, scale: 0.9 }
                  : { opacity: 0, y: 40, scale: 0.92 }
            }
            transition={
              reducedMotion
                ? { duration: 0.12 }
                : active.variant === "achievement" ||
                    active.variant === "level-up"
                  ? { type: "spring", stiffness: 220, damping: 20, mass: 0.95 }
                  : { type: "spring", stiffness: 300, damping: 22 }
            }
            className="pointer-events-auto w-full"
          >
            <ToastCard toast={active} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast }: { toast: Toast }) {
  const style = VARIANT_STYLES[toast.variant];
  const label = style.label;
  const isDark =
    toast.variant === "achievement" || toast.variant === "level-up";
  return (
    <button
      type="button"
      onClick={() => toastApi.dismiss(toast.id)}
      className={cn(
        "w-full rounded-2xl p-5 text-left text-white shadow-xl transition-transform duration-200 active:scale-[0.98]",
        style.bg,
        style.shadow,
      )}
    >
      <div className="flex items-center gap-4">
        {(toast.emoji || isDark) && (
          <motion.span
            initial={{ rotate: -20, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.1,
            }}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl"
            aria-hidden
          >
            {toast.emoji ?? (toast.variant === "level-up" ? "⭐" : "✨")}
          </motion.span>
        )}
        <div className="min-w-0 flex-1">
          {label && (
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">
              {label}
            </p>
          )}
          <p className="truncate text-lg font-bold">{toast.title}</p>
          {toast.body && (
            <p className="mt-0.5 text-sm text-white/90">{toast.body}</p>
          )}
        </div>
        {toast.action && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              toast.action?.onClick();
              toastApi.dismiss(toast.id);
            }}
            className="shrink-0 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toast.action?.onClick();
                toastApi.dismiss(toast.id);
              }
            }}
          >
            {toast.action.label}
          </span>
        )}
      </div>
    </button>
  );
}
