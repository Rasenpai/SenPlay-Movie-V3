import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db";


const SESSION_DAYS = 30;

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: "postmessage",
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    return NextResponse.json({ error: "invalid code" }, { status: 401 });
  }

  const { id_token } = await tokenRes.json();

  const infoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`,
  );
  const info = await infoRes.json();
  if (!infoRes.ok || info.aud !== clientId || !info.email) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
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

  const res = NextResponse.json({ ok: true });
  res.cookies.set("session", `${payload}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return res;
}