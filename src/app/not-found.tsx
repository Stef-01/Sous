"use client";

import { useRouter } from "next/navigation";
import { UtensilsCrossed } from "lucide-react";
import { DeadEndShell } from "@/components/shared/dead-end-shell";

export default function NotFound() {
  const router = useRouter();
  return (
    <DeadEndShell
      title="Page not found"
      body="That page doesn’t exist. Head back to Today to keep cooking."
      Icon={UtensilsCrossed}
      primary={{
        label: "Back to Today",
        onClick: () => router.push("/today"),
      }}
    />
  );
}
