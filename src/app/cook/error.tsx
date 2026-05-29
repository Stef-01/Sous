"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChefHat } from "lucide-react";
import { DeadEndShell } from "@/components/shared/dead-end-shell";

export default function CookError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Sous] Cook error:", error);
  }, [error]);

  const router = useRouter();

  return (
    <DeadEndShell
      title="Couldn’t load recipe"
      body="Something went wrong loading this recipe. Try again or pick a different dish."
      Icon={ChefHat}
      primary={{ label: "Try again", onClick: reset }}
      secondary={{
        label: "Back to Today",
        onClick: () => router.push("/today"),
      }}
    />
  );
}
