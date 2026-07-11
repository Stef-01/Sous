const DEFAULT_ORIGIN = "https://sous.app";

export interface ReelSharePayload {
  url: string;
}

export interface ReelShareDeps {
  writeText?: (text: string) => Promise<void>;
}

export type ReelShareResult = "copied" | "copy-failed" | "unsupported";

export function buildReelSharePayload(opts: {
  id: string;
  origin?: string;
}): ReelSharePayload | null {
  const id = opts.id.trim();
  if (!id) return null;
  const origin = (opts.origin ?? DEFAULT_ORIGIN).replace(/\/+$/, "");
  const params = new URLSearchParams({ start: id });
  const url = `${origin}/community/reels?${params.toString()}`;
  return { url };
}

export function browserReelShareDeps(): ReelShareDeps {
  if (typeof navigator === "undefined") return {};
  return {
    writeText: navigator.clipboard?.writeText?.bind(navigator.clipboard),
  };
}

export async function copyReelSharePayload(
  payload: ReelSharePayload,
  deps: ReelShareDeps = browserReelShareDeps(),
): Promise<ReelShareResult> {
  if (deps.writeText) {
    try {
      await deps.writeText(payload.url);
      return "copied";
    } catch {
      return "copy-failed";
    }
  }

  return "unsupported";
}
