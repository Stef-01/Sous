/**
 * ContentDisclaimer — small print at the bottom of the Content surface.
 *
 * Reiterates that all content is sample/placeholder for the prototype.
 * Stays small and quiet but unambiguous — the prototype must not be
 * confused with a clinician-verified content product.
 */
export function ContentDisclaimer({
  variant = "page",
}: {
  variant?: "page" | "inline";
}) {
  return (
    <p
      className={
        variant === "page"
          ? "px-1 pt-2 pb-1 text-[10px] leading-snug text-[var(--nourish-subtext)]/80"
          : "mt-3 text-[10px] leading-snug text-[var(--nourish-subtext)]/80"
      }
    >
      Sample editorial content for prototype. Authors and affiliations are
      placeholders. Not medical advice — always consult your clinician.
    </p>
  );
}
