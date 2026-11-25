import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db";
import {
  GOOGLE_REDIRECT_PATH,
  STATE_COOKIE,
  getOrigin,
} from "@/lib/google-oauth";

const SESSION_DAYS = 30;

export async function GET(req: Request) {
  const origin = getOrigin(req);
  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/login?error=${reason}`);

  const params = new URL(req.url).searchParams;
  const code = params.get("code");
  const state = params.get("state");
  const saved = new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([^;]+)`).exec(
    req.headers.get("cookie") ?? "",
  )?.[1];

  if (params.get("error")) return fail("cancelled");
  if (!code || !state || state !== saved) return fail("state");

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}${GOOGLE_REDIRECT_PATH}`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail("code");

  const { id_token } = await tokenRes.json();

  const infoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`,
  );
  const info = await infoRes.json();
  if (!infoRes.ok || info.aud !== clientId || !info.email) {
    return fail("token");
  }

  const user = upsertUser({
    id: info.sub,
    email: info.email,
    name: info.name ?? null,
    picture: info.picture ?? null,
  });

  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + maxAge,
    }),
  ).toString("base64url");
  const sig = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(payload)
    .digest("base64url");

  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set("session", `${payload}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  res.cookies.set(STATE_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
  return res;
}