import { getImage } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const image = getImage(id, "avatar");
  if (!image) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}