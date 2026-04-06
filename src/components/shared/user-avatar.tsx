"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface UserAvatarProps {
  size?: number;
  className?: string;
}

/**
 * Small circular avatar for the header.
 * Shows user's Clerk profile image when auth is configured,
 * or a generic User icon placeholder when it isn't.
 */
export function UserAvatar({ size = 32, className }: UserAvatarProps) {
  if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <ClerkAvatar size={size} className={className} />;
  }
  return <FallbackAvatar size={size} className={className} />;
}

function ClerkAvatar({ size = 32, className }: UserAvatarProps) {
  // Safe to call useUser here — this component only renders
  // when ClerkProvider is in the tree (env var is set).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useUser } = require("@clerk/nextjs") as {
    useUser: () => {
      user: { imageUrl?: string; firstName?: string } | null | undefined;
      isLoaded: boolean;
    };
  };
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user?.imageUrl) {
    return <FallbackAvatar size={size} className={className} />;
  }

  return (
    <img
      src={user.imageUrl}
      alt={user.firstName ?? "Profile"}
      width={size}
      height={size}
      className={cn(
        "rounded-full object-cover border border-neutral-200",
        className,
      )}
    />
  );
}

function FallbackAvatar({ size = 32, className }: UserAvatarProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        "flex items-center justify-center rounded-full bg-[var(--nourish-input-bg)] border border-neutral-200",
        className,
      )}
    >
      <User
        size={Math.round((size ?? 32) * 0.5)}
        className="text-[var(--nourish-subtext)]"
      />
    </div>
  );
}
