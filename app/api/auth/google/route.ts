import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import {
  GOOGLE_REDIRECT_PATH,
  STATE_COOKIE,
  getOrigin,
} from "@/lib/google-oauth";

export async function GET(req: Request) {
  const state = randomBytes(16).toString("base64url");

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    redirect_uri: `${getOrigin(req)}${GOOGLE_REDIRECT_PATH}`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  }).toString();

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/google",
    maxAge: 600,
  });
  return res;
}
