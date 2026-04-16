"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useNavigation } from "@/lib/hooks/use-navigation";
import { useHaptic } from "@/lib/hooks/use-haptic";
import { cn } from "@/lib/utils/cn";

export function TabBar({
  user,
}: {
  user: { pathUnlocked: boolean; communityUnlocked: boolean } | null;
}) {
  const tabs = useNavigation(user);
  const pathname = usePathname();
  const haptic = useHaptic();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--nourish-border)] bg-white safe-area-bottom"
      style={{
        boxShadow:
          "0 -1px 0 rgba(0,0,0,0.02), 0 -8px 24px -12px rgba(13,13,13,0.08)",
      }}
      aria-label="Main navigation"
    >
      <LayoutGroup>
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/today"
                ? pathname === "/today"
                : pathname.startsWith(tab.href);

            return (
              <motion.div
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                style={{ WebkitTapHighlightColor: "transparent" }}
                onTapStart={haptic}
              >
                <Link
                  href={tab.href}
                  className="relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-medium"
                  aria-current={isActive ? "page" : undefined}
                  aria-label={tab.label}
                >
                  {/* Sliding active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-0 rounded-xl bg-[var(--nourish-green)]/10"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                        mass: 0.8,
                      }}
                    />
                  )}
                  <motion.div
                    className="relative z-10 flex flex-col items-center gap-0.5"
                    animate={
                      isActive ? { scale: 1, y: 0 } : { scale: 0.95, y: 0 }
                    }
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 20,
                    }}
                  >
                    <TabIcon id={tab.id} active={isActive} />
                    <span
                      className={cn(
                        "transition-colors duration-200",
                        isActive
                          ? "text-[var(--nourish-green)]"
                          : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]",
                      )}
                    >
                      {tab.label}
                    </span>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}

function TabIcon({
  id,
  active,
}: {
  id: "today" | "path" | "community";
  active: boolean;
}) {
  const strokeColor = active
    ? "var(--nourish-green)"
    : "var(--nourish-subtext)";
  const size = 22;

  switch (id) {
    case "today":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case "path":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 20V10" />
          <path d="M12 20V4" />
          <path d="M6 20v-6" />
        </svg>
      );
    case "community":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}
