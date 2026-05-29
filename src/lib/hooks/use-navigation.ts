import { useMemo } from "react";

type Tab = {
  id: "today" | "path" | "community";
  label: string;
  href: string;
  visible: boolean;
};

/**
 * Tab navigation  -  Today, Path, Community are always visible.
 * Community is the social-first surface (pods + challenges +
 * friend activity) with editorial content as a quiet shelf
 * below. The route id `community` matches the label.
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
        id: "community",
        label: "Community",
        href: "/community",
        visible: true,
      },
    ];
    return tabs.filter((t) => t.visible);
  }, []);
}
