import { PageTransition } from "@/components/shared/page-transition";
import type { ReactNode } from "react";

export default function CookLayout({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
