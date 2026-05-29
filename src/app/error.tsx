"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { DeadEndShell } from "@/components/shared/dead-end-shell";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Sous] Global error:", error);
  }, [error]);

  const router = useRouter();

  return (
    <DeadEndShell
      title="Something went wrong"
      body="An unexpected error occurred. Try again or head back to Today."
      Icon={AlertCircle}
      primary={{ label: "Try again", onClick: reset }}
      secondary={{
        label: "Back to Today",
        onClick: () => router.push("/today"),
      }}
    />
  );
}
