import { STANFORD_VENUES } from "@/data/eat-out/stanford-demo";

export interface EatOutDeepLinkSelection {
  venueSlug: string;
  dishSlug: string;
}

export function eatOutDishHref(venueSlug: string, dishSlug: string): string {
  const params = new URLSearchParams({ venue: venueSlug, dish: dishSlug });
  return `/eat-out?${params.toString()}`;
}

export function resolveEatOutDeepLink(
  venueSlug: string | null,
  dishSlug: string | null,
): EatOutDeepLinkSelection | null {
  if (!venueSlug || !dishSlug) return null;

  const venue = STANFORD_VENUES.find((item) => item.slug === venueSlug);
  if (!venue?.dishes.some((dish) => dish.slug === dishSlug)) return null;

  return { venueSlug, dishSlug };
}
