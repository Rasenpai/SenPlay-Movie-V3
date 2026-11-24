import { NextResponse } from "next/server";
import { getCategory } from "@/lib/category";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  try {
    const data = await getCategory(slug, page);
    return NextResponse.json(data?.results ?? []);
  } catch {
    return NextResponse.json([]);
  }
}