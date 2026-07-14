"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  Apple,
  BookOpenText,
  ChartNoAxesColumnIncreasing,
  Clock3,
} from "lucide-react";
import { useNavigation } from "@/lib/hooks/use-navigation";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { cn } from "@/lib/utils/cn";

export function TabBar({
  user,
}: {
  user: { pathUnlocked: boolean; communityUnlocked: boolean } | null;
}) {
  const reducedMotion = useReducedMotion();
  const tabs = useNavigation(user);
  const pathname = usePathname();
  const haptic = useHaptic();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nourish-border)] bg-white/95 backdrop-blur-xl safe-area-bottom"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/today"
              ? pathname === "/today"
              : pathname.startsWith(tab.href);

          return (
            <motion.div
              key={tab.id}
              className="flex flex-1"
              whileTap={reducedMotion ? undefined : { scale: 0.94 }}
              transition={{ duration: 0.15 }}
              style={{ WebkitTapHighlightColor: "transparent" }}
              onTapStart={haptic}
            >
              <Link
                href={tab.href}
                className="relative flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 text-[11px] font-medium"
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
              >
                <div className="relative flex flex-col items-center gap-1">
                  <TabIcon id={tab.id} active={isActive} />
                  <span
                    className={cn(
                      "transition-colors duration-150",
                      isActive
                        ? "text-[var(--nourish-green)]"
                        : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
                    )}
                  >
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.span
                      layoutId="tab-indicator"
                      className="absolute -bottom-1.5 h-0.5 w-4 rounded-full bg-[var(--nourish-green)]"
                      transition={
                        reducedMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 420, damping: 34 }
                      }
                    />
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

function TabIcon({
  id,
  active,
}: {
  id: "today" | "path" | "nutrition" | "community";
  active: boolean;
}) {
  const Icon = {
    today: Clock3,
    path: ChartNoAxesColumnIncreasing,
    nutrition: Apple,
    community: BookOpenText,
  }[id];

  return (
    <Icon
      size={21}
      strokeWidth={active ? 2.25 : 1.8}
      className={
        active ? "text-[var(--nourish-green)]" : "text-[var(--nourish-subtext)]"
      }
      aria-hidden="true"
    />
  );
}
