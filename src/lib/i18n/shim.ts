/**
 * i18n shim — Stage 2 W22a prep (autonomous-prep stub).
 *
 * Provides `t(key, defaultValue)` as a no-op pass-through today. When
 * the team picks an i18n framework (next-intl is the planned choice;
 * lingui or react-intl are the alternatives), the shim's body swaps
 * to delegate to the chosen library. Call sites remain stable.
 *
 * Why a shim now: extracting strings call-site-by-call-site is
 * mechanical work that compounds the longer it's deferred. Doing it
 * behind a contract today means W22a's i18n framework decision is a
 * one-file body swap, not a codebase-wide refactor.
 *
 * Convention for keys:
 *   - dot-separated namespaces matching the surface
 *   - examples:
 *       t("today.search.placeholder", "What are you craving?")
 *       t("today.quest.find_sides_cta", "Find sides →")
 *       t("cook.win.again_cta", "Again")
 *
 * The defaultValue is the canonical English source-of-truth string.
 * When the framework swap lands, the message catalog is keyed on the
 * same dot-separated strings. Until then the shim returns the default
 * so the UI ships English unchanged.
 */

export interface TranslationContext {
  /** Pluralisation count, when the key has plural variants. */
  count?: number;
  /** Inline interpolation values, e.g. {n} → 3. */
  values?: Record<string, string | number>;
}

/**
 * Returns the localised string for `key`, falling back to the
 * provided `defaultValue` when no translation is registered. Today
 * the shim always returns the default; once the framework is wired
 * the body swap lights up real translations.
 */
export function t(
  key: string,
  defaultValue: string,
  ctx?: TranslationContext,
): string {
  // W22a swap: replace the next 6 lines with framework delegation.
  let out = defaultValue;
  if (ctx?.values) {
    for (const [k, v] of Object.entries(ctx.values)) {
      out = out.replaceAll(`{${k}}`, String(v));
    }
  }
  // Pluralisation passthrough: if the default contains "{count}",
  // interpolate; the framework layer will apply ICU plural rules.
  if (typeof ctx?.count === "number") {
    out = out.replaceAll("{count}", String(ctx.count));
  }
  return out;
}

/**
 * Returns true when a real i18n framework is configured. Today this
 * is always false; tests + dashboards can branch on it.
 */
export function isI18nConfigured(): boolean {
  return false;
}

/**
 * Hook-style alias for component call sites that prefer a hook
 * pattern over a top-level function. Today both routes return the
 * same shim; once the framework lands, the hook can also subscribe
 * to locale changes.
 */
export function useT() {
  return t;
}
