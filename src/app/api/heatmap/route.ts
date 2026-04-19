import { NextResponse } from "next/server";
import { getHeatmapData } from "@/data/pairings";

// Heatmap data is static  -  revalidate once per day
export const revalidate = 86400;

export async function GET() {
  const data = getHeatmapData();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}
