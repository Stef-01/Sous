import { ClerkProvider } from "@clerk/nextjs";

/**
 * Auth provider that wraps Clerk.
 * Gracefully handles missing Clerk keys during development/build.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // If Clerk keys are not configured, render children without auth
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>;
  }

  return <ClerkProvider>{children}</ClerkProvider>;
}
