/**
 * Parse pasted assistant output into a validated import payload.
 *
 * Real-world paste is messy: a ```json fence, a "Here's your JSON:" preamble, a
 * trailing "Let me know if…". This extracts the JSON object, parses it, and
 * validates it against the bridge schema — returning a Result with a friendly,
 * actionable error rather than a raw zod dump.
 */

import { ZodError } from "zod";
import {
  ImportPayloadSchema,
  importItemCount,
  type ImportPayload,
} from "@/types/import-bridge";

export type ParseImportResult =
  | { success: true; data: ImportPayload; itemCount: number }
  | { success: false; error: string };

/** Pull the JSON object out of arbitrary pasted text. Strips a markdown code
 *  fence if present, otherwise takes the first `{` … last `}` slice. */
export function extractJsonObject(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fence ? fence[1] : trimmed).trim();

  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  return body.slice(start, end + 1);
}

function friendlyZodError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "That JSON didn't match the expected format.";
  const path = issue.path.join(".");

  // Wrong / missing discriminator is the most common paste-into-wrong-tab case.
  if (
    issue.path[0] === "kind" ||
    issue.code === "invalid_union_discriminator"
  ) {
    return 'The JSON is missing a valid "kind" ("pantry", "groceries" or "nutrition"). Re-copy the assistant\'s full reply.';
  }
  if (issue.code === "too_small" && (path === "items" || path === "entries")) {
    return "The list was empty — there was nothing to import.";
  }
  // A missing required macro is now the most common content error.
  const lastKey = String(issue.path[issue.path.length - 1] ?? "");
  if (["calories", "protein_g", "carbs_g", "fat_g"].includes(lastKey)) {
    return "Each item needs calories + protein/carbs/fat — ask the assistant to estimate any it left out.";
  }
  return path
    ? `Something's off near "${path}": ${issue.message.toLowerCase()}.`
    : issue.message;
}

export function parseImportText(text: string): ParseImportResult {
  const raw = extractJsonObject(text);
  if (!raw) {
    return {
      success: false,
      error:
        "Couldn't find any JSON. Copy the assistant's whole reply, including the { … }.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      success: false,
      error:
        "That isn't valid JSON — make sure you copied the entire block without cutting it off.",
    };
  }

  const result = ImportPayloadSchema.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: friendlyZodError(result.error) };
  }

  return {
    success: true,
    data: result.data,
    itemCount: importItemCount(result.data),
  };
}
