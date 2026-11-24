import { NextResponse } from "next/server";
import { searchTitles } from "@/lib/search";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await searchTitles(query);

  return NextResponse.json(results);
}
