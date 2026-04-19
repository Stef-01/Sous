import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy handler  -  passthrough for now.
 * Clerk auth middleware will be enabled here once CLERK_SECRET_KEY
 * and NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY env vars are configured.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function proxy(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
