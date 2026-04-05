"use client";

import { TabBar } from "@/components/shared/tab-bar";
import { useUnlockStatus } from "@/lib/hooks/use-unlock-status";

export default function PathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathUnlocked, communityUnlocked } = useUnlockStatus();

  return (
    <>
      {children}
      <TabBar user={{ pathUnlocked, communityUnlocked }} />
    </>
  );
}
