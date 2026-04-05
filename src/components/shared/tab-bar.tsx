"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useNavigation } from "@/lib/hooks/use-navigation";
import { cn } from "@/lib/utils/cn";

export function TabBar({
  user,
}: {
  user: { pathUnlocked: boolean; communityUnlocked: boolean } | null;
}) {
  const tabs = useNavigation(user);
  const pathname = usePathname();

  // Don't show tab bar if only one tab (new user)
  if (tabs.length <= 1) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-200 bg-white/95 backdrop-blur-sm safe-area-bottom">
      <LayoutGroup>
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-xs font-medium"
              >
                {/* Sliding active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-xl bg-[var(--nourish-green)]/8"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                <motion.div
                  className="relative z-10 flex flex-col items-center gap-0.5"
                  animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={isActive ? { duration: 0.3, ease: "easeInOut" } : {}}
                >
                  <TabIcon id={tab.id} active={isActive} />
                  <span className={cn(
                    "transition-colors duration-200",
                    isActive
                      ? "text-[var(--nourish-green)]"
                      : "text-[var(--nourish-subtext)] hover:text-[var(--nourish-dark)]"
                  )}>
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
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
