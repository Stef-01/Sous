import { useMemo } from "react";

type Tab = {
  id: "today" | "path" | "nutrition" | "community";
  label: string;
  href: string;
  visible: boolean;
};

/**
 * Tab navigation  -  Today, Path, Nutrition, Content — always visible.
 * Nutrition (founder-directed, 2026-06-09) is the diary + insights home,
 * placed left of Content. The Content tab is a Flo-style magazine, NOT a
 * social graph — the route id stays `community` for URL/back-compat; only
 * the user-facing label is "Content".
 *
 * The `pathUnlocked` / `communityUnlocked` props are retained
 * for call-site backwards compatibility but no longer gate
 * visibility.
 */
export function useNavigation(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- prop kept for call-site backwards compatibility (Stage 3 dropped the unlock gate)
  user: {
    pathUnlocked: boolean;
    communityUnlocked: boolean;
  } | null,
) {
  return useMemo<Tab[]>(() => {
    const tabs: Tab[] = [
      { id: "today", label: "Today", href: "/today", visible: true },
      { id: "path", label: "Path", href: "/path", visible: true },
      {
        id: "nutrition",
        label: "Nutrition",
        href: "/nutrition",
        visible: true,
      },
      {
        id: "community",
        label: "Content",
        href: "/community",
        visible: true,
      },
    ];
    return tabs.filter((t) => t.visible);
  }, []);
}
