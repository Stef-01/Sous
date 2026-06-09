"use client";

import { TabBar } from "@/components/shared/tab-bar";
import { PageTransition } from "@/components/shared/page-transition";
import { useUnlockStatus } from "@/lib/hooks/use-unlock-status";

/** Nutrition route group layout — mirrors (today)/(path)/(community) so the
 *  bottom TabBar mounts on /nutrition. */
export default function NutritionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { communityUnlocked } = useUnlockStatus();

  return (
    <>
      <PageTransition>{children}</PageTransition>
      <TabBar user={{ pathUnlocked: true, communityUnlocked }} />
    </>
  );
}
