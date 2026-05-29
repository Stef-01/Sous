"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { DeadEndShell } from "@/components/shared/dead-end-shell";

export default function TodayError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    console.error("[Sous] Today error:", error);
  }, [error]);

  return (
    <DeadEndShell
      title="Something went wrong"
      body={error.message || "An unexpected error occurred."}
      Icon={AlertCircle}
      primary={{ label: "Try again", onClick: reset }}
      secondary={{
        label: "Back to Today",
        onClick: () => router.push("/today"),
      }}
    />
  );
}
