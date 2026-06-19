import { NextResponse } from "next/server";
import webpush from "web-push";
import { allSubscriptions, removeSubscription } from "@/lib/notify/push-store";
import { cravingForNow } from "@/lib/engine/craving-for-now";
import { isPushNotifyEnabled, readPushNotifyEnv } from "@/lib/notify/push-flag";

/**
 * POST /api/push/test — dispatch today's craving as a Web Push to every stored
 * subscription (the manual stand-in for the future hunger-window cron). Returns
 * 503 when VAPID keys are absent (stub mode), so it's safe to ship dormant. If
 * `CRON_SECRET` is set, require it via `?secret=` (so the eventual cron + a
 * curious caller share one guard); absent, it's open for the trusted cohort.
 */

function dateSeed(d: Date): number {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export async function POST(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && url.searchParams.get("secret") !== cronSecret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const env = readPushNotifyEnv();
  if (!isPushNotifyEnabled(env)) {
    return NextResponse.json(
      { error: "push disabled — set VAPID keys (stub mode)" },
      { status: 503 },
    );
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hello@sous.app",
    env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    env.VAPID_PRIVATE_KEY!,
  );

  const now = new Date();
  const result = cravingForNow({
    hour: now.getHours(),
    month: now.getMonth(),
    seed: dateSeed(now),
  });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 503 });
  }
  const dish = result.data;

  const payload = JSON.stringify({
    title: `Tonight: ${dish.name}`,
    body: "Tap to gather — you're one tap from dinner.",
    image: dish.imageUrl ? `${url.origin}${dish.imageUrl}` : undefined,
    url: dish.deepLink,
  });

  const subs = allSubscriptions();
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub, payload);
        sent += 1;
      } catch (err) {
        failed += 1;
        // Prune dead subscriptions (gone/expired) so the store self-heals.
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) removeSubscription(sub.endpoint);
      }
    }),
  );

  return NextResponse.json({
    ok: true,
    dish: dish.name,
    sent,
    failed,
    total: subs.length,
  });
}
