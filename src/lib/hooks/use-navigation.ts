import { useMemo } from "react";

type Tab = {
  id: "today" | "path" | "community";
  label: string;
  href: string;
  visible: boolean;
};

/**
 * Progressive navigation — tabs unlock based on user behavior.
 * Today is always visible. Path unlocks after 3 cooks. Community after 30 days.
 */
export function useNavigation(
  user: {
    pathUnlocked: boolean;
    communityUnlocked: boolean;
  } | null,
) {
  return useMemo<Tab[]>(() => {
    const tabs: Tab[] = [
      { id: "today", label: "Today", href: "/", visible: true },
      {
        id: "path",
        label: "Path",
        href: "/path",
        visible: true,
      },
      {
        id: "community",
        label: "Community",
        href: "/community",
        visible: user?.communityUnlocked ?? false,
      },
    ];
    return tabs.filter((t) => t.visible);
  }, [user?.communityUnlocked]);
}
