/**
 * Push notification key registry (Y4 W14).
 *
 * Pure helpers for the three-channel push-key contract that
 * Sprint D + Sprint E (iOS / Android) + Sprint F (delivery)
 * compose against:
 *
 *   - VAPID (web push) — public key shipped to the browser;
 *     private key signs JWTs server-side.
 *   - APNs (Apple Push) — team id + key id + p8 private key.
 *   - FCM (Firebase) — server key.
 *
 * Each channel has a "configured?" flag so the dispatcher can
 * pick the right transport at runtime. None of the keys are
 * read here; this module is a contract + presence-check only.
 *
 * Real-mode wire-up: env vars land per-channel; the existing
 * Y2 W22 notification queue calls `selectPushChannel(...)` to
 * route the payload.
 *
 * Pure / dependency-free.
 */

export type PushChannel = "web-vapid" | "ios-apns" | "android-fcm";

export interface PushKeyEnv {
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  APNS_TEAM_ID?: string;
  APNS_KEY_ID?: string;
  APNS_PRIVATE_KEY?: string;
  FCM_SERVER_KEY?: string;
}

export interface PushChannelStatus {
  channel: PushChannel;
  configured: boolean;
  missingKeys: ReadonlyArray<string>;
}

/** Pure: presence-check the env keys for a single channel. */
export function inspectPushChannel(
  channel: PushChannel,
  env: PushKeyEnv,
): PushChannelStatus {
  const required: Record<PushChannel, ReadonlyArray<keyof PushKeyEnv>> = {
    "web-vapid": ["VAPID_PUBLIC_KEY", "VAPID_PRIVATE_KEY"],
    "ios-apns": ["APNS_TEAM_ID", "APNS_KEY_ID", "APNS_PRIVATE_KEY"],
    "android-fcm": ["FCM_SERVER_KEY"],
  };
  const missing = required[channel].filter(
    (k) => !env[k] || env[k]!.length === 0,
  );
  return {
    channel,
    configured: missing.length === 0,
    missingKeys: missing,
  };
}

/** Pure: full report across all three channels. */
export function inspectAllPushChannels(
  env: PushKeyEnv,
): ReadonlyArray<PushChannelStatus> {
  return (["web-vapid", "ios-apns", "android-fcm"] as const).map((c) =>
    inspectPushChannel(c, env),
  );
}

export interface SelectPushChannelInput {
  /** Caller's runtime platform (Y4 W13 detector). */
  platform: "web" | "ios" | "android";
  env: PushKeyEnv;
}

export interface SelectedChannel {
  channel: PushChannel;
  ready: boolean;
  /** Why this channel was picked. Surfaces in the W22
   *  internal-monitoring dashboard. */
  rationale: string;
}

/** Pure: pick the right channel for the platform + env. Always
 *  returns a channel; `ready=false` means the caller should
 *  swallow the publish (no-op) until the keys land. */
export function selectPushChannel(
  input: SelectPushChannelInput,
): SelectedChannel {
  const channelByPlatform: Record<
    SelectPushChannelInput["platform"],
    PushChannel
  > = {
    web: "web-vapid",
    ios: "ios-apns",
    android: "android-fcm",
  };
  const channel = channelByPlatform[input.platform];
  const status = inspectPushChannel(channel, input.env);
  if (status.configured) {
    return {
      channel,
      ready: true,
      rationale: `Channel '${channel}' fully configured.`,
    };
  }
  return {
    channel,
    ready: false,
    rationale: `Channel '${channel}' missing keys: ${status.missingKeys.join(", ")}.`,
  };
}
