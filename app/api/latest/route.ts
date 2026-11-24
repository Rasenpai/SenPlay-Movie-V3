import { NextResponse } from "next/server";
import { getLatestItems } from "@/lib/latest";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  try {
    return NextResponse.json(await getLatestItems(page));
  } catch {
    return NextResponse.json([]);
  }
}