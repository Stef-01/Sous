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
  const { pathUnlocked, communityUnlocked, isLoaded } = useUnlockStatus();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration guard
  useEffect(() => setMounted(true), []);

  // Enforce progressive unlock: redirect to Today if Path isn't unlocked.
  // Guard on isLoaded so we don't redirect before localStorage has been read —
  // the initial state is pathUnlocked=false, which would incorrectly kick out
  // users who have already earned the unlock.
  useEffect(() => {
    if (mounted && isLoaded && !pathUnlocked) {
      router.replace("/");
    }
  }, [mounted, isLoaded, pathUnlocked, router]);

  // Don't render until localStorage status is known (avoids flash before redirect)
  if (!mounted || !isLoaded || !pathUnlocked) {
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
