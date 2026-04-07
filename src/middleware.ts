// TODO: Re-enable Clerk auth for V1 launch
// Auth is bypassed so the app runs without Clerk env vars during development.
// To re-enable: restore the clerkMiddleware import and handler below.
//
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/api/trpc(.*)", "/api/(.*)"]);
// export default clerkMiddleware(async (auth, request) => {
//   if (!isPublicRoute(request)) { await auth.protect(); }
// });

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(_request: NextRequest) {
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
