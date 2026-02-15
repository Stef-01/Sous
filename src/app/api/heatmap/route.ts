import { NextResponse } from "next/server";
import { getHeatmapData } from "@/data/pairings";

export async function GET() {
  const data = getHeatmapData();
  return NextResponse.json(data);
}
