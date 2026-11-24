import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getUser } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";

export type PublicUser = {
  id: string;
  name: string | null;
  email: string;
  picture: string | null;
  googlePicture: string | null;
  hasCustomAvatar: boolean;
  banner: string | null;
  bio: string | null;
  isAdmin: boolean;
};

export async function getCurrentUser(): Promise<PublicUser | null> {
  await connection();

  const token = (await cookies()).get("session")?.value;
  if (!token) return null;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(payload)
    .digest();
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }

  try {
    const { sub, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString(),
    );
    if (!sub || exp < Math.floor(Date.now() / 1000)) return null;

    const user = getUser(sub);
    if (!user) return null;

    return {
      id: user.id,
      name: user.display_name ?? user.name,
      email: user.email,
      picture: user.avatar_ver
        ? `/api/profile/image/avatar?v=${user.avatar_ver}`
        : user.picture,
      googlePicture: user.picture,
      hasCustomAvatar: user.avatar_ver > 0,
      banner: user.banner_ver
        ? `/api/profile/image/banner?v=${user.banner_ver}`
        : null,
      bio: user.bio,
      isAdmin: isAdminEmail(user.email),
    };
  } catch {
    return null;
  }
}