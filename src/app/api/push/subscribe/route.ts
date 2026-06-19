import { NextResponse } from "next/server";
import {
  parseSubscription,
  saveSubscription,
  subscriptionCount,
} from "@/lib/notify/push-store";

/**
 * POST /api/push/subscribe — store a browser PushSubscription so the dispatcher
 * can send it the hunger-window craving nudge. No auth (trusted-cohort phase);
 * the store is the in-memory dev singleton today, a Supabase write-through swap
 * later (see push-store.ts).
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const sub = parseSubscription(await req.json());
    if (!sub) {
      return NextResponse.json(
        { error: "invalid subscription" },
        { status: 400 },
      );
    }
    saveSubscription(sub);
    return NextResponse.json({ ok: true, count: subscriptionCount() });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
