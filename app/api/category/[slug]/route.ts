import { NextResponse } from "next/server";
import { getCategory } from "@/lib/category";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const data = await getCategory(slug);

  if (!data) {
    return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json(data);
}