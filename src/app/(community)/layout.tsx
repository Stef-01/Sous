"use client";

import { TabBar } from "@/components/shared/tab-bar";
import { PageTransition } from "@/components/shared/page-transition";
import { useUnlockStatus } from "@/lib/hooks/use-unlock-status";

/**
 * Content route group layout — mirrors the (today) and (path) layouts so
 * the bottom TabBar mounts on /community and every sub-route. Without this,
 * a parent navigating into a Content article/research/expert/forum/saved
 * page got stranded with no way back to Today or Path (the "stuck on
 * Content" navigation bug).
 */
export default function CommunityLayout({
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
