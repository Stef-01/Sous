export type CookStepShortcutIntent = "next" | "prev";

export interface CookStepShortcutInput {
  key: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  isEditableTarget?: boolean;
  isShortcutPaused?: boolean;
}

export function resolveCookStepShortcut(
  input: CookStepShortcutInput,
): CookStepShortcutIntent | null {
  if (input.isShortcutPaused || input.isEditableTarget) return null;
  if (input.altKey || input.ctrlKey || input.metaKey || input.shiftKey) {
    return null;
  }

  if (input.key === "ArrowRight" || input.key === "PageDown") return "next";
  if (input.key === "ArrowLeft" || input.key === "PageUp") return "prev";
  return null;
}
