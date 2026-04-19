import { useMemo } from "react";

type Tab = {
  id: "today" | "path" | "community";
  label: string;
  href: string;
  visible: boolean;
};

/**
 * Tab navigation  -  Today and Path are always visible.
 * Community is gated by communityUnlocked (deferred for prototype).
 */
export function useNavigation(
  user: {
    pathUnlocked: boolean;
    communityUnlocked: boolean;
  } | null,
) {
  return useMemo<Tab[]>(() => {
    const tabs: Tab[] = [
      { id: "today", label: "Today", href: "/today", visible: true },
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
