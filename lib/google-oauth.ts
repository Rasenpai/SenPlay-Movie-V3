export const GOOGLE_REDIRECT_PATH = "/api/auth/google/callback";
export const STATE_COOKIE = "g_state";

/** Origin publik situs (aman di balik proxy). Opsional: set SITE_URL di env. */
export function getOrigin(req: Request) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = req.headers;
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}