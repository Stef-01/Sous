"use client";

import { getSupabaseBrowser } from "@/lib/supabase/browser";
import { isAllowedContentType } from "./photo-pipeline";

/**
 * Upload a user cook photo to Supabase Storage (Stage H) and return its
 * public URL. Best-effort: returns null on any failure (no client, bad
 * type/size, network), so the caller falls back to the local placeholder
 * and the win is never blocked.
 *
 * Path is `${ownerId}/${uuid}.ext` — folder-scoped so Stage I can tighten
 * the RLS policy to per-user without a data move.
 */
const BUCKET = "cook-photos";
const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadCookPhoto(
  file: File,
  ownerId: string,
): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!isAllowedContentType(file.type)) return null;
  if (file.size > MAX_BYTES) return null;

  const sb = getSupabaseBrowser();
  if (!sb) return null;

  try {
    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const path = `${ownerId || "anon"}/${id}.${ext}`;

    const { error } = await sb.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) return null;

    const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl ?? null;
  } catch {
    return null;
  }
}
