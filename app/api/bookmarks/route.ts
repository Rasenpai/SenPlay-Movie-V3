import { NextResponse } from "next/server";
import {
  addBookmark,
  hasBookmark,
  removeBookmark,
  type BookmarkType,
} from "@/lib/db";
import { getMovie } from "@/lib/movie";
import { getSeries } from "@/lib/seriesDetail";
import { getCurrentUser } from "@/lib/session";

const noStore = { headers: { "Cache-Control": "no-store" } };

const asType = (v: unknown): BookmarkType =>
  v === "series" ? "series" : "movie";

async function readBody(req: Request) {
  const body = await req.json().catch(() => null);
  return {
    slug: typeof body?.slug === "string" ? (body.slug as string) : null,
    type: asType(body?.type),
  };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const slug = params.get("slug");
  const type = asType(params.get("type"));
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ loggedIn: false, bookmarked: false }, noStore);
  }

  return NextResponse.json(
    {
      loggedIn: true,
      bookmarked: slug ? hasBookmark(user.id, type, slug) : false,
    },
    noStore,
  );
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug, type } = await readBody(req);
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  if (type === "series") {
    const series = await getSeries(slug);
    if (!series) return NextResponse.json({ error: "not found" }, { status: 404 });

    addBookmark({
      user_id: user.id,
      type,
      movie_slug: series.slug,
      title: series.title,
      poster: series.poster ?? null,
      year: series.year || null,
      rating: series.rating ?? null,
      quality: null,
    });
  } else {
    const movie = await getMovie(slug);
    if (!movie) return NextResponse.json({ error: "not found" }, { status: 404 });

    addBookmark({
      user_id: user.id,
      type,
      movie_slug: movie.slug,
      title: movie.title,
      poster: movie.poster ?? null,
      year: movie.year || null,
      rating: movie.rating ?? null,
      quality: movie.quality || null,
    });
  }

  return NextResponse.json({ ok: true, bookmarked: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { slug, type } = await readBody(req);
  if (!slug) return NextResponse.json({ error: "missing slug" }, { status: 400 });

  removeBookmark(user.id, type, slug);
  return NextResponse.json({ ok: true, bookmarked: false });
}