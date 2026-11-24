import { getImage } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ kind: string }> },
) {
  const { kind } = await ctx.params;
  if (kind !== "avatar" && kind !== "banner") {
    return new Response(null, { status: 404 });
  }

  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401 });

  const image = getImage(user.id, kind);
  if (!image) return new Response(null, { status: 404 });

  return new Response(new Uint8Array(image.data), {
    headers: {
      "Content-Type": image.mime,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}