import { NextRequest, NextResponse } from "next/server";
import { searchMeal, getSuggestions } from "@/lib/fuzzySearch";
import { selectSides } from "@/lib/pairingEngine";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const verifiedOnly = request.nextUrl.searchParams.get("verified") === "1";

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Please enter a meal name.", suggestions: getSuggestions(4, verifiedOnly) },
      { status: 400 }
    );
  }

  const meal = searchMeal(query, verifiedOnly);

  if (!meal) {
    return NextResponse.json(
      {
        error: `We couldn't find a match for "${query}".`,
        suggestions: getSuggestions(4, verifiedOnly),
      },
      { status: 404 }
    );
  }

  const { sides, nextOffset, isRanked } = selectSides(meal, 3, new Set(), 0, verifiedOnly);

  return NextResponse.json({ meal, sides, nextOffset, isRanked });
}
