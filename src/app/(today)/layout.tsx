"use client";

import { TabBar } from "@/components/shared/tab-bar";
import { PageTransition } from "@/components/shared/page-transition";
import { useUnlockStatus } from "@/lib/hooks/use-unlock-status";

export default function TodayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathUnlocked, communityUnlocked } = useUnlockStatus();

  return (
    <>
      <PageTransition>{children}</PageTransition>
      <TabBar user={{ pathUnlocked, communityUnlocked }} />
    </>
  );
}
