import { getNetworkPage } from "@/lib/network";

const MAX_PAGE = 100;

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/network/[slug]">,
) {
  const { slug } = await ctx.params;
  const page = Number(new URL(request.url).searchParams.get("page"));

  if (!Number.isInteger(page) || page < 1) {
    return Response.json({ error: "Invalid page" }, { status: 400 });
  }

  const data = page > MAX_PAGE ? null : await getNetworkPage(slug, page);
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