import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";

const digest = (value: string) => createHash("sha256").update(value).digest();

export function isValidTrakteerToken(received: string | null) {
  const expected = process.env.WEB_HOOK_TOKEN_TRAKTEER;

  if (!expected) {
    console.error("[trakteer] WEB_HOOK_TOKEN_TRAKTEER belum diatur");
    return false;
  }
  if (!received) return false;

  return timingSafeEqual(digest(received), digest(expected));
}