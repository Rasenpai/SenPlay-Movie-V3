import { NextResponse } from "next/server";
import { getLatestSeries } from "@/lib/series";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  try {
    return NextResponse.json(await getLatestSeries(page));
  } catch {
    return NextResponse.json([]);
  }
}