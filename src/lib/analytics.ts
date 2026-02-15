type AnalyticsEvent =
  | "pairSubmit"
  | "pairSuccess"
  | "pairNotFound"
  | "reroll"
  | "swapSide"
  | "aboutOpened"
  | "suggestionChipClicked";

export function trackEvent(event: AnalyticsEvent, data?: Record<string, string>) {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, data ?? "");
  }
}
