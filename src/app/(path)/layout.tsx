"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TabBar } from "@/components/shared/tab-bar";
import { useUnlockStatus } from "@/lib/hooks/use-unlock-status";

export default function PathLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathUnlocked, communityUnlocked } = useUnlockStatus();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setMounted(true), []);

  // Enforce progressive unlock: redirect to Today if Path isn't unlocked
  useEffect(() => {
    if (mounted && !pathUnlocked) {
      router.replace("/");
    }
  }, [mounted, pathUnlocked, router]);

  // Don't render until mounted (avoids flash of content before redirect)
  if (!mounted || !pathUnlocked) {
    return (
      <div className="min-h-full flex items-center justify-center bg-[var(--nourish-cream)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-[var(--nourish-green)]" />
      </div>
    );
  }

  return (
    <>
      {children}
      <TabBar user={{ pathUnlocked, communityUnlocked }} />
    </>
  );
}
