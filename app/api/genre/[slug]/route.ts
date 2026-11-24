import { getGenrePage } from "@/lib/genre";

const MAX_PAGE = 100;

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/genre/[slug]">,
) {
  const { slug } = await ctx.params;
  const page = Number(new URL(request.url).searchParams.get("page"));

  if (!Number.isInteger(page) || page < 1) {
    return Response.json({ error: "Invalid page" }, { status: 400 });
  }

  const data = page > MAX_PAGE ? null : await getGenrePage(slug, page);
  const results = data?.results ?? [];

  return Response.json(results, {
    headers: {
      "Cache-Control":
        results.length > 0
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "public, s-maxage=60",
    },
  });
}